## 293 · A computed style is not the declaration you wrote, and a check that reads one while meaning the other passes against the defect

**Enforced by:** CHECKLIST measure-what-is-rendered — a check on appearance reads
the RESOLVED value and composites it against what is behind it, or it measures
the rendered pixels; never the declared string. · JUDGEMENT — when a visual check
passes against a build the eye says is wrong, the check is wrong.

**Smell:** `getComputedStyle(el).backgroundColor` compared between two elements.
Any assertion that greps a declaration for a number the author typed. A colour
token read with a regex.

**Measured 2026-09-14, Jefferson-Photography-Studio, three times in one hour.**

- A pressed button filled with the accent at 15% looked switched OFF, and the
  check comparing it to its neighbour PASSED, because `getComputedStyle` hands
  back the rgba as written. Composited over its ancestors the pressed button was
  rgb(30,34,42) against an unpressed rgb(65,65,65) — darker than the control it
  was meant to stand out from.
- Composited, the check passed again, because it asked whether the two DIFFERED
  rather than whether the pressed one was filled. In the light theme they
  differed by 167: a 12% accent over cream lands on a mid-grey, which is
  different from everything and reads as on nothing. The claim had to become
  "its colour IS the accent".
- Resolving the accent token itself with a digit regex turned `#9fc2f5` into
  `rgb(9,2,5)`. A token is a string until a browser parses it; set it on a probe
  element and read the computed colour back.
- And a grid check looking for `calc(100% / 12)` found nothing: the browser had
  already resolved it to `8.33333%`. Counted from the percentage it reads twelve.

Four different ways to read CSS and measure something other than what is on the
screen. The reliable ones are the resolved value composited against its
background, or the rendered pixels.
