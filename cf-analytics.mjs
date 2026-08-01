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

// ---------------------------------------------------------------- datasets

async function datasets() {
  const data = await gql(`{
    __type(name: "Account") {
      fields { name description }
    }
  }`);
  const fields = data?.__type?.fields;
  if (!fields) {
    console.error('No "Account" type in the schema — the API shape has changed.');
    process.exit(1);
  }
  console.log(`${fields.length} account-scoped datasets:\n`);
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
  // A *Groups dataset exposes its dimensions under a "dimensions" sub-object.
  const data = await gql(`{
    __type(name: "${dataset}") { fields { name } }
  }`);
  if (!data?.__type) {
    console.error(`No type named "${dataset}". Run \`datasets\` and copy a name exactly.`);
    process.exit(1);
  }
  const top = data.__type.fields.map((f) => f.name);
  console.log(`${dataset} top-level fields:\n  ${top.join(', ')}\n`);

  if (top.includes('dimensions')) {
    const dimType = `${dataset}Dimensions`;
    const d = await gql(`{ __type(name: "${dimType}") { fields { name } } }`);
    const dims = d?.__type?.fields?.map((f) => f.name) ?? [];
    if (dims.length) {
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
