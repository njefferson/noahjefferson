## 228 · An explanation is not a route, and the build that swapped one for the other was the environment built for testing

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — the staging build's
console handling is asserted: the console's address is one constant, the staging
build must REPOINT it at the live console rather than delete the links, and the
app must still say on screen why they leave. · CHECKLIST a-variant-build-removes
-a-route-or-repoints-it-never-explains-it — when a build variant cannot ship a
surface, send the reader to the copy that exists; a sentence saying why is the
second half, never the whole answer. · JUDGEMENT — a heading with no
destination under it reads as naming the page it is on.

**Smell:** any build-time transform whose replacement text begins "this is not
available here". Also: a heading, tab or section that survives a feature's
removal, in the environment nobody browses because it is the one they test in.

**The unlisted app, 2026-09-03.** The admin console is not published to the
staging origin, and the reason is sound: its door is a Cloudflare Access
application scoped to the production hostname, so a copy at the staging address
would be an admin surface with nothing in front of it. The staging build
therefore deleted the console's directory and replaced the three links to it in
the app with a sentence — the console is not published here, use the live app.

Every word of that is true, and what it left on the screen was a section headed
with the console’s name and no console behind it. The section then reads as naming the
page it is on, and there is no route to the real console from anywhere in the
app.

Two things made it worse than a missing link. The console was reachable from
exactly one place — a fieldset most of the way down a settings page, which is a
page somebody opens to do something else — so removing it in one build removed
it entirely. And an installed app has no address bar, so "use the live app" is
not an instruction anybody can follow from inside the app it is printed in;
the address it declines to give is the only thing that would have worked.

The fix was smaller than the explanation had been. The console's address became
ONE constant. Production keeps `crew/`; the staging build rewrites it to the
live console's absolute URL. The links stay, they go somewhere, and the sentence
underneath them now says why they leave staging rather than why they cannot.
The route came back and the honesty was kept.

**The general shape.** A variant build that strips a feature has three options
and only two of them are answers: ship it, point at the copy that exists, or
remove the whole affordance — heading included. Leaving the label and replacing
the destination with prose is the fourth option, it looks like candour, and it
is the one that produces a page claiming to be the thing it cannot reach.
