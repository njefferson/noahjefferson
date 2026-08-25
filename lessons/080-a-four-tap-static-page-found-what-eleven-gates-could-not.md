## 80 · A four-tap static page found what eleven gates could not

**Enforced by:** CHECKLIST probe-before-gate — when a question is about the WORLD rather than the code, build the cheapest instrument that touches the world before encoding an assumption into a gate. The probe carries a control and labels every outcome in advance.

A platform question had been open for a day: does a link open into an installed
home-screen web app, or only in a browser? It had produced a warning in the app,
a new capability in the test server, an assertion in a browser walk, and a
research write-up — all of it inference.

**The owner asked for the shortest possible test instead.** An unlisted static
page, four tappable links, each labelled with what its result would mean. It
answered in minutes: the scheme is not recognised at all. Question closed.

**And the CONTROL — a link included only to prove the baseline — hit a live
production defect that eleven gates and two browser walks had never seen.** The
capture entrance was broken for every ordinary link, on the deployed build, and
nothing in the repo knew.

**Three things made the probe trustworthy, and they are the reusable part:**

- **It was hosted where nothing could interfere.** A repo with no service worker,
  so no cache and no interception could dress up the answer. Putting it inside
  the app under test would have measured the app under test.
- **Every outcome was labelled in advance**, so the result could not be
  reinterpreted after the fact to suit whatever was hoped for.
- **It included a control** — the case whose answer was already known. That is
  what caught the real bug, and it is the part most likely to be skipped as
  redundant.

**The general shape:** when a question is about the world rather than the code,
the cheapest instrument that touches the world beats any amount of local
machinery. Building a gate to answer it encodes the assumption into the repo,
where it becomes furniture; a probe just asks. Reach for the probe first, and
keep the gate for what the probe proves.

---
