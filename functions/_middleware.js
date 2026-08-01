// Block abusive source IPs at the edge.
//
// WHY A FUNCTION AND NOT A FIREWALL RULE: WAF custom rules and IP Access rules
// are ZONE features, and *.pages.dev is Cloudflare's zone, not ours. Nothing in
// the dashboard can block an IP for these hosts. A Pages Function is the only
// in-band option until an app moves to a custom domain on a zone we own.
//
// WHAT THIS COSTS: every request to this project now invokes a Worker, where
// before it was pure static asset serving. That is a real change to what these
// apps are, so keep this file tiny, keep it fail-open, and delete it when the
// list is empty.
//
// WHAT THIS DOES NOT BUY: the scanned paths (/.env, /.aws/secret_access_key.txt
// and friends) already return 4xx — there is no server and nothing to leak, so
// this is not closing a hole. It stops the noise from distorting the analytics
// and stops us serving the traffic. Treat it as hygiene, not as a fix.
//
// Copy this file verbatim into any sibling app that needs it, at the repo root
// as functions/_middleware.js.

// One entry per source, with the evidence for why it is here. An IP with no
// recorded reason is an IP nobody can safely remove later.
const BLOCKED = new Map([
  [
    '185.177.72.22',
    'Secrets scanner. 2.7k requests in 24h against quietkeep walking a wordlist ' +
      '(/deploy/.env.smtp, /.aws/secret_access_key.txt, /nuxt/secrets.env), all 4xx. ' +
      'Seen 2026-08-01.',
  ],
]);

export async function onRequest(context) {
  const { request, next } = context;

  // Fail open. A bug in this file must never take the site down — if the header
  // is missing or anything throws, the request proceeds as it did before.
  try {
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip && BLOCKED.has(ip)) {
      return new Response('Forbidden', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          // Do not tell a scanner which rule caught it.
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch {
    // fall through to next()
  }

  return next();
}
