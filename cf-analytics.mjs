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

// Non-fatal variant for the calibration battery: one bad query must not kill
// the run, and the error text itself is diagnostic (GraphQL errors name the
// fields that DO exist).
async function gqlSoft(query, variables = {}) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = await res.json().catch(() => null);
    if (!body) return { data: null, errors: [{ message: `HTTP ${res.status}, body not JSON` }] };
    return { data: body.data ?? null, errors: body.errors ?? [] };
  } catch (err) {
    return { data: null, errors: [{ message: `fetch failed: ${err.message}` }] };
  }
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

// ------------------------------------------------------------- sampling

// VERIFIED 2026-08-01, by calibrate, against two independent sources: in
// these adaptive datasets `count` already IS the estimated request count —
// the sampling adjustment is baked in. With requestSource=eyeball over
// complete UTC days, raw counts matched the dashboard's per-country CSV
// export request-for-request on seven countries (DE 2,732, KR 559, GB 336,
// AU 233, CH 164, JP 133, SG 393) and within 0.1% on FR, and
// httpRequestsOverviewAdaptiveGroups sum.requests returned the identical
// total (27,807). Exact equality is impossible if `count` were sample
// records.
//
// Therefore: DO NOT multiply by avg(sampleInterval). An earlier "fix" here
// did, double-applying the adjustment, and produced totals 3-12x too high.
// Run `calibrate` to re-derive all of this from the live account if in doubt.
const SAMPLE_SELECTION = 'count';

function totalNote(rows) {
  const total = rows.reduce((a, r) => a + r.count, 0);
  return `${total.toLocaleString()} requests. Counts are sampling-adjusted by Cloudflare (verified via calibrate).`;
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
// Memoized: calibrate introspects several datasets and only needs the walk once.
let _accountsType = null;
async function findAccountsType() {
  if (_accountsType) return _accountsType;
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
  _accountsType = current;
  return current;
}

// Full shape of one dataset: its top-level fields plus the subfields of
// dimensions/sum/avg, all read from the schema rather than assumed.
async function datasetShape(fieldName) {
  const accounts = await findAccountsType();
  const f = accounts?.fields?.find((x) => x.name === fieldName);
  if (!f) return null;
  const typeName = namedType(f.type);
  const info = await typeInfo(typeName);
  const sub = async (n) => {
    const fld = info?.fields?.find((x) => x.name === n);
    if (!fld) return null;
    return (await typeInfo(namedType(fld.type)))?.fields ?? null;
  };
  return {
    typeName,
    top: info?.fields?.map((x) => x.name) ?? [],
    dims: await sub('dimensions'),
    sums: await sub('sum'),
    avgs: await sub('avg'),
  };
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
  const { host, country, days, excludeIps, source } = opts;
  if (!dataset || !host || !country) {
    console.error('Usage: node cf-analytics.mjs report <dataset> --host <field> --country <field> [--days 7] [--exclude-ip a,b]');
    console.error('Run `fields <dataset>` first to get the real field names.');
    process.exit(1);
  }
  // Complete UTC days, not a rolling window. Rolling windows made identical
  // queries drift between runs (a burst falling off the trailing edge looks
  // like resampling noise); fixed day boundaries make runs reproducible.
  const dayMs = 86400_000;
  const nowD = new Date();
  const end = new Date(Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth(), nowD.getUTCDate()));
  const start = new Date(end.getTime() - days * dayMs);

  // Scanners and crawlers are most of the traffic to a public static site, so a
  // report that silently includes them reads as usage when it is not. Excluding
  // them is only honest if the report also says what it dropped — hence the
  // second, unfiltered query and the delta printed below (LESSONS.md §9).
  const fetchRows = async (excluded) => {
    const useFilter = excluded.length > 0;
    const decls = ['$account: String!', '$start: Time!', '$end: Time!'];
    const filters = ['datetime_geq: $start', 'datetime_leq: $end'];
    const vars = { account: ACCOUNT, start: start.toISOString(), end: end.toISOString() };
    if (useFilter) {
      decls.push('$excludeIps: [String!]');
      filters.push('clientIP_notin: $excludeIps');
      vars.excludeIps = excluded;
    }
    // requestSource separates end-user traffic from Worker subrequests and
    // other internal request classes — run `calibrate` to see which values
    // exist on this account and how much each contributes.
    if (source) {
      decls.push('$source: String!');
      filters.push('requestSource: $source');
      vars.source = source;
    }
    const data = await gql(
      `query(${decls.join(', ')}) {
        viewer {
          accounts(filter: { accountTag: $account }) {
            rows: ${dataset}(
              limit: 10000
              filter: { ${filters.join(', ')} }
              orderBy: [count_DESC]
            ) {
              ${SAMPLE_SELECTION}
              dimensions { ${host} ${country} }
            }
          }
        }
      }`,
      vars
    );
    return data?.viewer?.accounts?.[0]?.rows ?? [];
  };

  const rows = await fetchRows(excludeIps);
  console.log(`Window: ${start.toISOString().slice(0, 10)} .. ${end.toISOString().slice(0, 10)} (complete UTC days).`);
  if (source) {
    console.log(`requestSource = ${source}: end-user traffic, the same population the`);
    console.log(`dashboard counts. Pass --source all to include Worker/cache machinery.\n`);
  } else {
    console.log(`ALL request sources — includes Worker subrequests and cache-API traffic,`);
    console.log(`which on this account is roughly half the total and is not visitors.\n`);
  }
  if (rows.length) console.log(totalNote(rows) + '\n');

  if (excludeIps.length) {
    const unfiltered = await fetchRows([]);
    const before = unfiltered.reduce((a, r) => a + r.count, 0);
    const after = rows.reduce((a, r) => a + r.count, 0);
    const dropped = before - after;
    const pct = before ? ((dropped / before) * 100).toFixed(1) : '0.0';
    console.log(`Excluding ${excludeIps.length} IP(s): ${excludeIps.join(', ')}`);
    console.log(`Dropped ${dropped.toLocaleString()} of ${before.toLocaleString()} requests (${pct}%).`);
    console.log(`Reporting the remaining ${after.toLocaleString()}.\n`);
  }

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
    const n = r.count;
    if (!table.has(app)) table.set(app, new Map());
    const row = table.get(app);
    row.set(cc, (row.get(cc) ?? 0) + n);
    countries.set(cc, (countries.get(cc) ?? 0) + n);
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

  console.log(
    excludeIps.length
      ? '\nThese are requests, not visits. Excluded IPs are named above; other bots remain.'
      : '\nThese are requests, not visits, and they include bots.'
  );
  console.log('CSV of the same data:\n');
  console.log('app,country,requests');
  for (const [app, , row] of apps)
    for (const [cc, n] of [...row.entries()].sort((a, b) => b[1] - a[1]))
      console.log(`${app},${cc},${n}`);
}

// --------------------------------------------------------------- calibrate

// One run, four sources, no favourites. Three totals were produced for the
// same window (raw 64,012 / weighted 684,433 / dashboard 27,424) and calling
// that "unverified" was giving up one step early: the account exposes
// httpRequests1dGroups, an UNSAMPLED daily rollup, plus an "end users"
// overview dataset and a requestSource dimension. This queries all of them
// over the same complete UTC days and prints the reconciliation, so the
// estimator is chosen by evidence instead of by whichever number was computed
// most recently.
async function calibrate(opts) {
  const days = opts.days || 7;
  const dayMs = 86400_000;
  const now = new Date();
  const endDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startDay = new Date(endDay.getTime() - days * dayMs);
  const d0 = startDay.toISOString().slice(0, 10);
  const d1 = new Date(endDay.getTime() - dayMs).toISOString().slice(0, 10);
  const t0 = startDay.toISOString();
  const t1 = endDay.toISOString();

  console.log(`Calibration window: ${d0} .. ${d1} inclusive (complete UTC days, so`);
  console.log(`every dataset below covers the identical wall-clock span).\n`);

  // Values are generated locally and inlined as literals, so the filter types
  // (Date vs Time) never have to be guessed at via variable declarations.
  const acct = `viewer { accounts(filter: { accountTag: "${ACCOUNT}" })`;
  const run = async (label, body) => {
    const { data, errors } = await gqlSoft(`{ ${acct} { rows: ${body} } } }`);
    if (errors.length) {
      console.log(`[${label}] FAILED:`);
      for (const e of errors) console.log(`    ${e.message}`);
      return null;
    }
    return data?.viewer?.accounts?.[0]?.rows ?? [];
  };
  const has = (fields, name) => !!fields?.some((x) => x.name === name);
  const fmt = (n) => (n == null ? 'n/a' : Math.round(n).toLocaleString());

  // ---- 1. The unsampled rollup: ground truth if it exists here -----------
  console.log('== httpRequests1dGroups (daily rollup — not adaptive, not sampled) ==');
  let rollupTotal = null;
  const rollupCountries = new Map();
  const shape1d = await datasetShape('httpRequests1dGroups');
  if (!shape1d) {
    console.log('not present on this account.\n');
  } else {
    console.log(`sum fields: ${shape1d.sums?.map((x) => x.name).join(', ') || '(none)'}`);
    const sel = [];
    if (has(shape1d.sums, 'requests')) sel.push('requests');
    const cm = shape1d.sums?.find((x) => x.name === 'countryMap');
    let cmFields = null;
    if (cm) cmFields = (await typeInfo(namedType(cm.type)))?.fields?.map((x) => x.name) ?? null;
    if (cmFields?.includes('clientCountryName') && cmFields?.includes('requests')) {
      sel.push('countryMap { clientCountryName requests }');
    }
    if (!sel.length) {
      console.log('no usable sum fields — cannot use as ground truth.\n');
    } else {
      const rows = await run(
        '1dGroups',
        `httpRequests1dGroups(limit: 1000, filter: { date_geq: "${d0}", date_leq: "${d1}" }) {
          dimensions { date }
          sum { ${sel.join(' ')} }
        }`
      );
      if (rows) {
        rollupTotal = 0;
        for (const r of rows) {
          const req = r.sum?.requests ?? 0;
          rollupTotal += req;
          console.log(`  ${r.dimensions?.date}  ${fmt(req)} requests`);
          for (const c of r.sum?.countryMap ?? []) {
            rollupCountries.set(
              c.clientCountryName,
              (rollupCountries.get(c.clientCountryName) ?? 0) + (c.requests ?? 0)
            );
          }
        }
        console.log(`  TOTAL ${fmt(rollupTotal)} requests (unsampled)`);
        if (rollupCountries.size) {
          const top = [...rollupCountries.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
          console.log(`  top countries: ${top.map(([c, n]) => `${c} ${fmt(n)}`).join(', ')}`);
        }
      }
      console.log('');
    }
  }

  // ---- 2. The "end users" overview dataset -------------------------------
  console.log('== httpRequestsOverviewAdaptiveGroups ("requests made by end users") ==');
  let overviewRaw = null;
  let overviewWeighted = null;
  let overviewSumRequests = null;
  const shapeOv = await datasetShape('httpRequestsOverviewAdaptiveGroups');
  if (!shapeOv) {
    console.log('not present on this account.\n');
  } else {
    console.log(`fields: ${shapeOv.top.join(', ')}`);
    // Built from what the schema says exists. The first pass hardcoded
    // `count` and the API answered "unknown field" — the same assumption bug
    // this entire exercise is about, one layer further down.
    const parts = [];
    if (shapeOv.top.includes('count')) parts.push('count');
    if (has(shapeOv.avgs, 'sampleInterval')) parts.push('avg { sampleInterval }');
    if (has(shapeOv.sums, 'requests')) parts.push('sum { requests }');
    if (!parts.length) {
      console.log('no usable fields — skipping.\n');
    } else {
      const rows = await run(
        'overview',
        `httpRequestsOverviewAdaptiveGroups(limit: 10, filter: { datetime_geq: "${t0}", datetime_leq: "${t1}" }) {
          ${parts.join('\n          ')}
        }`
      );
      if (rows) {
        if (shapeOv.top.includes('count')) {
          overviewRaw = rows.reduce((a, r) => a + r.count, 0);
          overviewWeighted = rows.reduce((a, r) => a + r.count * (r.avg?.sampleInterval ?? 1), 0);
        }
        if (has(shapeOv.sums, 'requests')) {
          overviewSumRequests = rows.reduce((a, r) => a + (r.sum?.requests ?? 0), 0);
        }
        console.log(`  raw: ${fmt(overviewRaw)} | weighted: ${fmt(overviewWeighted)} | sum.requests: ${fmt(overviewSumRequests)}`);
      }
      console.log('');
    }
  }

  // ---- 3. Decompose the main dataset by requestSource --------------------
  console.log('== httpRequestsAdaptiveGroups split by requestSource ==');
  const bySource = new Map();
  {
    const rows = await run(
      'requestSource',
      `httpRequestsAdaptiveGroups(limit: 50, filter: { datetime_geq: "${t0}", datetime_leq: "${t1}" }) {
        count
        avg { sampleInterval }
        dimensions { requestSource }
      }`
    );
    for (const r of rows ?? []) {
      const src = r.dimensions?.requestSource || '(empty)';
      const e = bySource.get(src) ?? { raw: 0, weighted: 0 };
      e.raw += r.count;
      e.weighted += r.count * (r.avg?.sampleInterval ?? 1);
      bySource.set(src, e);
    }
    for (const [src, e] of [...bySource.entries()].sort((a, b) => b[1].raw - a[1].raw)) {
      console.log(`  ${src.padEnd(24)} raw ${fmt(e.raw).padStart(10)}   weighted ${fmt(e.weighted).padStart(12)}`);
    }
    console.log('');
  }

  // ---- 3b. Eyeball-only per-country: lines up against the dashboard's own
  // CSV export, which is per-country — if these agree, the identification of
  // "dashboard = eyeball" holds at the row level, not just in the total.
  console.log('== eyeball-only, per country ==');
  {
    const rows = await run(
      'eyeball-countries',
      `httpRequestsAdaptiveGroups(limit: 300, filter: { datetime_geq: "${t0}", datetime_leq: "${t1}", requestSource: "eyeball" }) {
        count
        avg { sampleInterval }
        dimensions { clientCountryName }
      }`
    );
    if (rows) {
      const agg = new Map();
      for (const r of rows) {
        const c = r.dimensions?.clientCountryName || '??';
        const e = agg.get(c) ?? { raw: 0, weighted: 0 };
        e.raw += r.count;
        e.weighted += r.count * (r.avg?.sampleInterval ?? 1);
        agg.set(c, e);
      }
      for (const [c, e] of [...agg.entries()].sort((a, b) => b[1].raw - a[1].raw).slice(0, 12)) {
        console.log(`  ${c.padEnd(4)} raw ${fmt(e.raw).padStart(9)}   weighted ${fmt(e.weighted).padStart(11)}`);
      }
    }
    console.log('');
  }

  // ---- 4. Same adaptive query twice: which estimator is stable? ----------
  console.log('== stability: identical adaptive query, run twice back-to-back ==');
  console.log('(a matching pair may just be a server-side cache hit — a MISMATCH');
  console.log('is the informative outcome, and says which estimator to distrust)');
  const twice = [];
  for (let i = 0; i < 2; i++) {
    const rows = await run(
      `stability-${i + 1}`,
      `httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: "${t0}", datetime_leq: "${t1}" }) {
        count
        avg { sampleInterval }
        dimensions { clientRequestHTTPHost }
      }`
    );
    if (!rows) break;
    const hosts = new Map();
    let raw = 0;
    let weighted = 0;
    for (const r of rows) {
      const h = r.dimensions?.clientRequestHTTPHost || '(none)';
      const w = r.count * (r.avg?.sampleInterval ?? 1);
      raw += r.count;
      weighted += w;
      const e = hosts.get(h) ?? { raw: 0, weighted: 0 };
      e.raw += r.count;
      e.weighted += w;
      hosts.set(h, e);
    }
    twice.push({ raw, weighted, hosts });
  }
  if (twice.length === 2) {
    const [a, b] = twice;
    const pct = (x, y) => (x ? (((y - x) / x) * 100).toFixed(1) + '%' : 'n/a');
    console.log(`  total raw:      ${fmt(a.raw)} vs ${fmt(b.raw)}  (delta ${pct(a.raw, b.raw)})`);
    console.log(`  total weighted: ${fmt(a.weighted)} vs ${fmt(b.weighted)}  (delta ${pct(a.weighted, b.weighted)})`);
    const top = [...a.hosts.entries()].sort((x, y) => y[1].raw - x[1].raw).slice(0, 5);
    for (const [h, e] of top) {
      const e2 = b.hosts.get(h) ?? { raw: 0, weighted: 0 };
      console.log(
        `  ${h.padEnd(44)} raw ${fmt(e.raw)}/${fmt(e2.raw)}  weighted ${fmt(e.weighted)}/${fmt(e2.weighted)}`
      );
    }
  }
  console.log('');

  // ---- 5. Verdict --------------------------------------------------------
  console.log('== reconciliation ==');
  const adaptiveAllRaw = twice[0]?.raw ?? null;
  const adaptiveAllWeighted = twice[0]?.weighted ?? null;
  const eyeballKey = [...bySource.keys()].find((k) => /eyeball/i.test(k));
  const eyeball = eyeballKey ? bySource.get(eyeballKey) : null;
  console.log(`  1dGroups (unsampled):              ${fmt(rollupTotal)}`);
  console.log(`  overview raw / weighted:           ${fmt(overviewRaw)} / ${fmt(overviewWeighted)}`);
  if (eyeball)
    console.log(`  adaptive ${eyeballKey} raw / wtd:   ${fmt(eyeball.raw)} / ${fmt(eyeball.weighted)}`);
  console.log(`  adaptive ALL raw / weighted:       ${fmt(adaptiveAllRaw)} / ${fmt(adaptiveAllWeighted)}`);
  if (rollupTotal != null) {
    const candidates = [
      ['overview raw', overviewRaw],
      ['overview weighted', overviewWeighted],
      ['overview sum.requests', overviewSumRequests],
      eyeball ? [`adaptive ${eyeballKey} raw`, eyeball.raw] : null,
      eyeball ? [`adaptive ${eyeballKey} weighted`, eyeball.weighted] : null,
      ['adaptive all raw', adaptiveAllRaw],
      ['adaptive all weighted', adaptiveAllWeighted],
    ].filter((c) => c && c[1] != null);
    candidates.sort(
      (a, b) => Math.abs(a[1] - rollupTotal) - Math.abs(b[1] - rollupTotal)
    );
    if (candidates.length) {
      const [name, val] = candidates[0];
      console.log(`\n  closest to the unsampled rollup: ${name} (${fmt(val)} vs ${fmt(rollupTotal)},`);
      console.log(`  off by ${(Math.abs(val - rollupTotal) / rollupTotal * 100).toFixed(1)}%). That is the estimator to use.`);
    }
  } else {
    console.log('\n  no unsampled rollup available — compare against the dashboard by hand.');
  }
}

// ---------------------------------------------------------------- top-ips

// This repo is PUBLIC, so whatever this prints ends up in a publicly readable
// Actions log. A visitor's IP is personal data and publishing it there would
// contradict Doctrine §9 for the sake of a debugging convenience. So: an IP is
// shown in full only above a volume no person browsing a static site produces,
// which is exactly the set worth adding to --exclude-ip. Everything else is
// masked to its network, which still shows a scanner range without naming
// anyone. --full-ips overrides, for a local run where nothing is published.
const FULL_IP_THRESHOLD = 500;

function maskIp(ip) {
  if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':') + ':…'; // IPv6 /48
  const p = ip.split('.');
  return p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.x` : 'unknown';
}

async function topIps(dataset, opts) {
  const { ip, country, ua, status, hostField, host, days, limit, fullIps } = opts;
  // Complete UTC days, not a rolling window. Rolling windows made identical
  // queries drift between runs (a burst falling off the trailing edge looks
  // like resampling noise); fixed day boundaries make runs reproducible.
  const dayMs = 86400_000;
  const nowD = new Date();
  const end = new Date(Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth(), nowD.getUTCDate()));
  const start = new Date(end.getTime() - days * dayMs);

  const decls = ['$account: String!', '$start: Time!', '$end: Time!'];
  const filters = ['datetime_geq: $start', 'datetime_leq: $end'];
  const vars = { account: ACCOUNT, start: start.toISOString(), end: end.toISOString() };
  if (host) {
    decls.push('$host: String!');
    filters.push(`${hostField}: $host`);
    vars.host = host;
  }

  const data = await gql(
    `query(${decls.join(', ')}) {
      viewer {
        accounts(filter: { accountTag: $account }) {
          rows: ${dataset}(
            limit: 5000
            filter: { ${filters.join(', ')} }
            orderBy: [count_DESC]
          ) {
            ${SAMPLE_SELECTION}
            dimensions { ${ip} ${country} ${ua} ${status} }
          }
        }
      }
    }`,
    vars
  );

  const rows = data?.viewer?.accounts?.[0]?.rows ?? [];
  if (!rows.length) {
    console.log('No rows returned for that window.');
    return;
  }

  // Fold the status dimension away, keeping the 4xx share — a client walking a
  // wordlist is nearly all 4xx, a person loading the app is nearly all 2xx.
  // That ratio separates them without anyone having to eyeball user agents.
  console.log('\n' + totalNote(rows));

  const agg = new Map();
  for (const r of rows) {
    const addr = r.dimensions[ip];
    const n = r.count;
    const e = agg.get(addr) ?? {
      total: 0,
      errors: 0,
      country: r.dimensions[country],
      uas: new Map(),
    };
    e.total += n;
    const code = Number(r.dimensions[status]);
    if (code >= 400 && code < 500) e.errors += n;
    const agent = r.dimensions[ua] || '(none)';
    e.uas.set(agent, (e.uas.get(agent) ?? 0) + n);
    agg.set(addr, e);
  }

  const ranked = [...agg.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, limit);
  const scope = host ? `host=${host}` : 'all hosts';
  console.log(`\nTop IPs — last ${days} day(s), ${scope}\n`);
  console.log(
    `${'ip'.padEnd(24)}${'cc'.padEnd(5)}${'requests'.padStart(9)}${'4xx'.padStart(7)}   user agent`
  );
  console.log('-'.repeat(100));
  for (const [addr, e] of ranked) {
    const shown = fullIps || e.total >= FULL_IP_THRESHOLD ? addr : maskIp(addr);
    const pct = e.total ? `${((e.errors / e.total) * 100).toFixed(0)}%` : '';
    const topUa = [...e.uas.entries()].sort((a, b) => b[1] - a[1])[0][0].slice(0, 44);
    console.log(
      `${shown.padEnd(24)}${(e.country || '??').padEnd(5)}${e.total.toLocaleString().padStart(9)}${pct.padStart(7)}   ${topUa}`
    );
  }

  if (!fullIps) {
    console.log(
      `\nIPs under ${FULL_IP_THRESHOLD} requests are masked to their network — this log is public.`
    );
  }
  console.log('A high 4xx share with a non-browser agent is a scanner, not a visitor.');
  console.log('Feed the ones you want gone to `report --exclude-ip`.');
}

// -------------------------------------------------------------------- main

const [cmd, arg, ...rest] = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? fallback : rest[i + 1];
};

if (['datasets', 'fields', 'report', 'top-ips', 'calibrate'].includes(cmd)) await preflight();

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
      excludeIps: (flag('exclude-ip', '') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      // Default to end-user traffic: "who is using my apps" means people, and
      // eyeball is the population the dashboard counts (verified by calibrate).
      // --source all drops the filter; any other value passes through.
      source: (() => {
        const s = flag('source', 'eyeball');
        return s === 'all' ? '' : s;
      })(),
    });
    break;
  case 'calibrate':
    await calibrate({ days: Number(flag('days', 7)) });
    break;
  case 'top-ips':
    // These four dimension names are not assumed — they came back from
    // `fields httpRequestsAdaptiveGroups` against this account. Overridable
    // anyway, in case a different dataset names them differently.
    await topIps(arg || 'httpRequestsAdaptiveGroups', {
      ip: flag('ip', 'clientIP'),
      country: flag('country', 'clientCountryName'),
      ua: flag('ua', 'userAgent'),
      status: flag('status', 'edgeResponseStatus'),
      hostField: flag('host-field', 'clientRequestHTTPHost'),
      host: flag('host', ''),
      days: Number(flag('days', 7)),
      limit: Number(flag('limit', 25)),
      fullIps: rest.includes('--full-ips'),
    });
    break;
  default:
    console.log('Commands:');
    console.log('  datasets');
    console.log('  fields <dataset>');
    console.log('  report <dataset> --host <f> --country <f> [--days 7] [--exclude-ip a,b] [--source eyeball]');
    console.log('  top-ips [dataset] [--host <hostname>] [--days 7] [--limit 25] [--full-ips]');
    console.log('  calibrate [--days 7]   — reconcile the estimators against the unsampled rollup');
}
