## 15. `[hidden]` stops hiding the moment you give the element a `display`

**Enforced by:** CHECKLIST hidden-vs-display — any CSS rule that sets `display` on an element the code toggles with `hidden` must restore the hiding, and the toggle is exercised once in the browser before it is believed.

`.thing { display: flex }` in an author stylesheet outranks the user agent's
`[hidden] { display: none }`. The element then stays on screen whatever the
code sets `.hidden` to. Here it was a "FOLLOWING <aircraft>" banner that
appeared, with an empty label, on every page that was not following anything.

**Any rule that sets `display` on an element the code toggles with `hidden`
needs a `[hidden]` companion.** It is one line and it is invisible until
somebody looks at the page in the state where the element should be gone —
which is exactly the state nobody screenshots.

*(fauxplane, 2026-08-02.)*
