#!/usr/bin/env node
// cf-analytics.mjs — which app, from which country, counted at Cloudflare's
// edge. No beacon, no tracking code, nothing added to any app: this reads the
// requests Cloudflare already serves. Doctrine §1's "no analytics" stays true.
//
// The dashboard shows Top Hosts and Requests by Country as separate cards. This
// is the cross-tab of the two.
//
// Nothing here is guessed: `datasets` and `fields` introspect the live schema,
// so the report is built from what the account really exposes rather than from
// someone's memory of the API (LESSONS.md §9).
//
// Needs Node 18+ (global fetch). No dependencies.
//
//   export CLOUDFLARE_ANALYTICS_TOKEN=...   # needs Account Analytics: Read
//   export CLOUDFLARE_ACCOUNT_ID=...
//
//   node cf-analytics.mjs datasets
//   node cf-analytics.mjs fields <datasetName>
//   node cf-analytics.mjs report <datasetName> --host <field> --country <field> [--days 7]
//
// Or run it from CI without a local token: Actions → "Cloudflare analytics" →
// Run workflow. See .github/workflows/cf-analytics.yml.
//
// The Pages deploy token is scoped Pages:Edit and will NOT work here — this
// needs its own token with Account Analytics: Read.

const API = 'https://api.cloudflare.com/client/v4/graphql';
const TOKEN = process.env.CLOUDFLARE_ANALYTICS_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!TOKEN || !ACCOUNT) {
  console.error('Set CLOUDFLARE_ANALYTICS_TOKEN and CLOUDFLARE_ACCOUNT_ID first.');
  process.exit(1);
}

async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) {
    console.error(`HTTP ${res.status} from the API.`);
    process.exit(1);
  }
  if (body.errors?.length) {
    // Print the real error rather than dressing it up — a 'not authorized'
    // here almost always means the token lacks Account Analytics: Read.
    console.error('GraphQL returned errors:');
    for (const e of body.errors) console.error('  -', e.message);
    process.exit(1);
  }
  return body.data;
}

// --------------------------------------------------------------- preflight

// ADVISORY ONLY — never fatal. /user/tokens/verify checks USER-owned tokens
// and answers 1000 "Invalid API Token" for one it cannot find there, even when
// that token works: the hub's deploy token, which ships the live site on every
// push, fails this exact call. Gating on it blocked good credentials for five
// runs and sent Noah re-creating a token that was fine. The authoritative test
// is the GraphQL query itself, so this only prints what it saw.
async function preflight() {
  let res;
  try {
    res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
  } catch (err) {
    // Connectivity, not credentials. Still advisory — the query below will
    // fail on its own and report the real reason.
    console.error(`note: could not reach api.cloudflare.com (${err.message})`);
    return;
  }

  const raw = await res.text();
  let body = null;
  try {
    body = JSON.parse(raw);
  } catch {
    console.error(`note: /user/tokens/verify returned HTTP ${res.status}, not JSON.`);
    return;
  }

  if (body?.success) {
    console.error('note: token verifies as a user-owned token.');
    return;
  }

  const codes = (body?.errors ?? []).map((e) => e.code).join(', ');
  console.error(`note: /user/tokens/verify says no (${codes}).`);
  console.error('That is expected for an account-owned token and does not mean');
  console.error('the token is bad — continuing to the query, which is the real test.');
}

// ------------------------------------------------------------ schema walk

// A GraphQL type reference nests through NON_NULL and LIST wrappers, which
// carry no name. Unwrap until the named type appears.
function namedType(t) {
  while (t && !t.name) t = t.ofType;
  return t?.name ?? null;
}

const TYPE_QUERY = (name) => `{
  __type(name: "${name}") {
    name
    fields {
      name
      description
      type { name kind ofType { name kind ofType { name kind ofType { name } } } }
    }
  }
}`;

async function typeInfo(name) {
  const d = await gql(TYPE_QUERY(name));
  return d?.__type ?? null;
}

// Follow Query -> viewer -> accounts by reading the schema, never by assuming
// a type is called "Account". That assumption burned a run; the walk cannot.
async function findAccountsType() {
  const root =
    (await gql(`{ __schema { queryType { name } } }`))?.__schema?.queryType?.name;
  if (!root) throw new Error('schema exposes no query root');

  const chain = [root];
  let current = await typeInfo(root);

  for (const step of ['viewer', 'accounts']) {
    const field = current?.fields?.find((f) => f.name === step);
    if (!field) {
      console.error(`No "${step}" field on type ${current?.name}. It has:`);
      console.error(`  ${(current?.fields ?? []).map((f) => f.name).join(', ')}`);
      process.exit(1);
    }
    const next = namedType(field.type);
    chain.push(`${step}: ${next}`);
    current = await typeInfo(next);
  }

  console.log(`schema path: ${chain.join(' -> ')}\n`);
  return current;
}

// ---------------------------------------------------------------- datasets

async function datasets() {
  const accounts = await findAccountsType();
  const fields = accounts?.fields ?? [];
  if (!fields.length) {
    console.error(`Type ${accounts?.name} exposes no fields.`);
    process.exit(1);
  }
  console.log(`${fields.length} account-scoped datasets on ${accounts.name}:\n`);
  for (const f of fields) {
    console.log(`  ${f.name}`);
    if (f.description) console.log(`      ${f.description.split('\n')[0]}`);
  }
  console.log('\nThe one you want counts HTTP requests and has both a host and a');
  console.log('country dimension. Run `fields <name>` on the likely candidates.');
}

// ------------------------------------------------------------------ fields

async function fields(dataset) {
  if (!dataset) {
    console.error('Usage: node cf-analytics.mjs fields <datasetName>');
    process.exit(1);
  }
  // `dataset` may be either a field name on the accounts type or a type name.
  // Resolve it through the accounts type first so the caller can paste either.
  const accounts = await findAccountsType();
  const asField = accounts?.fields?.find((f) => f.name === dataset);
  const typeName = asField ? namedType(asField.type) : dataset;
  if (asField) console.log(`${dataset} resolves to type ${typeName}\n`);

  const info = await typeInfo(typeName);
  if (!info) {
    console.error(`No type named "${typeName}". Run \`datasets\` and copy a name exactly.`);
    process.exit(1);
  }
  const top = info.fields.map((f) => f.name);
  console.log(`${typeName} top-level fields:\n  ${top.join(', ')}\n`);

  const dimField = info.fields.find((f) => f.name === 'dimensions');
  if (dimField) {
    // Read the dimensions type off the field rather than guessing at a
    // "<dataset>Dimensions" naming convention.
    const dimType = namedType(dimField.type);
    const d = await typeInfo(dimType);
    const dims = d?.fields?.map((f) => f.name) ?? [];
    if (dims.length) {
      console.log(`dimensions type: ${dimType}`);
      console.log(`dimensions (${dims.length}):\n  ${dims.join(', ')}\n`);
      const host = dims.filter((n) => /host|domain|site/i.test(n));
      const country = dims.filter((n) => /countr|geo/i.test(n));
      if (host.length) console.log(`  host-ish:    ${host.join(', ')}`);
      if (country.length) console.log(`  country-ish: ${country.join(', ')}`);
      console.log('\nPass those two to `report` with --host and --country.');
    }
  }
}

// ------------------------------------------------------------------ report

async function report(dataset, opts) {
  const { host, country, days } = opts;
  if (!dataset || !host || !country) {
    console.error('Usage: node cf-analytics.mjs report <dataset> --host <field> --country <field> [--days 7]');
    console.error('Run `fields <dataset>` first to get the real field names.');
    process.exit(1);
  }
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400_000);

  const data = await gql(
    `query($account: String!, $start: Time!, $end: Time!) {
      viewer {
        accounts(filter: { accountTag: $account }) {
          rows: ${dataset}(
            limit: 10000
            filter: { datetime_geq: $start, datetime_leq: $end }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { ${host} ${country} }
          }
        }
      }
    }`,
    { account: ACCOUNT, start: start.toISOString(), end: end.toISOString() }
  );

  const rows = data?.viewer?.accounts?.[0]?.rows ?? [];
  if (!rows.length) {
    console.log('No rows returned for that window.');
    return;
  }

  // app -> country -> count
  const table = new Map();
  const countries = new Map();
  for (const r of rows) {
    const app = r.dimensions[host] || '(none)';
    const cc = r.dimensions[country] || '??';
    if (!table.has(app)) table.set(app, new Map());
    const row = table.get(app);
    row.set(cc, (row.get(cc) ?? 0) + r.count);
    countries.set(cc, (countries.get(cc) ?? 0) + r.count);
  }

  const topCountries = [...countries.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cc]) => cc);

  const apps = [...table.entries()]
    .map(([app, row]) => [app, [...row.values()].reduce((a, b) => a + b, 0), row])
    .sort((a, b) => b[1] - a[1]);

  const pad = (s, n) => String(s).padEnd(n);
  const num = (s, n) => String(s).padStart(n);
  const w = Math.max(24, ...apps.map(([a]) => a.length));

  console.log(`\nRequests by app × country — last ${days} day(s)\n`);
  console.log(pad('app', w), num('total', 8), topCountries.map((c) => num(c, 7)).join(''));
  console.log('-'.repeat(w + 8 + topCountries.length * 7));
  for (const [app, total, row] of apps) {
    console.log(
      pad(app, w),
      num(total.toLocaleString(), 8),
      topCountries.map((c) => num(row.get(c) ?? '', 7)).join('')
    );
  }

  console.log('\nThese are requests, not visits, and they include bots.');
  console.log('CSV of the same data:\n');
  console.log('app,country,requests');
  for (const [app, , row] of apps)
    for (const [cc, n] of [...row.entries()].sort((a, b) => b[1] - a[1]))
      console.log(`${app},${cc},${n}`);
}

// -------------------------------------------------------------------- main

const [cmd, arg, ...rest] = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? fallback : rest[i + 1];
};

if (cmd === 'datasets' || cmd === 'fields' || cmd === 'report') await preflight();

switch (cmd) {
  case 'datasets':
    await datasets();
    break;
  case 'fields':
    await fields(arg);
    break;
  case 'report':
    await report(arg, {
      host: flag('host'),
      country: flag('country'),
      days: Number(flag('days', 7)),
    });
    break;
  default:
    console.log('Commands: datasets | fields <dataset> | report <dataset> --host <f> --country <f> [--days 7]');
}
