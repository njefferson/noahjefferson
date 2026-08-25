## 65 · A check with a FLOOR and no ceiling cannot see "too big", and every property can be individually fine while the product is unusable

**Enforced by:** CHECKLIST outcome-check — for each surface, name the thing the reader actually wants from it and measure THAT, not only the properties that ought to add up to it. A gate built entirely from minimums will go greener as a surface gets worse in the other direction.

fauxplane published one defect in its own in-app "Still not right" list for
twenty consecutive releases: at 200% text on a small phone, the radar scope — the
app's main instrument — began 707px down a 640px screen. Not clipped, not small.
Simply not there until the reader scrolled. Each release described it as needing
every page redesigned.

**It was one token.** The touch-target floor was `2.75rem` rather than 44 CSS
pixels, so every button in the app doubled when the reader turned the type up.
The tab strip went to four rows of 88px and took 386 of the 406px of chrome.
Changing it to `44px` moved the scope from 0px visible to 216px of 276.

**No standard asked for the rem.** SC 2.5.5 and SC 2.5.8 are both written in CSS
PIXELS, and so was the repo's own gate — `w < 44 || h < 44`. A finger does not
get bigger when a reader increases the text size. The two preferences are
independent, and the app was paying for a benefit nobody asked for with its
primary instrument.

**THE PART THAT GENERALISES IS WHY TWENTY RELEASES OF CHECKS MISSED IT.** The
accessibility gate ran axe, contrast, accessible names and target size over three
viewports and two palettes including that exact 200% one, and was green every
time. The target-size check was green **because the defect made it happier** — 88
is further above a floor of 44 than 44 is. Every individual property was fine,
several were better than required, and the sum of them was a page with no
instrument on it.

A floor-only gate has a direction it is blind in, and it is the direction where
"more compliant" and "less usable" are the same move. Generosity beyond a
minimum is not free; it is spent out of a fixed screen.

**The fix is an OUTCOME check.** Not "is the target big enough", not "does the
chrome fit a budget" — *is the instrument on the glass*, asserted as the weakest
useful form of that (some of it, not all, because on a genuinely tiny screen
scrolling is the honest answer). It goes red about the reader's experience rather
than about a property, so it stays true through redesigns that change every
number it would otherwise have been written against.

**Ask it of a surface before writing any of its other checks:** what does the
reader want here, and is there a check that fails when they do not get it? If
every check on a surface is a minimum, nothing there is measuring the product.
