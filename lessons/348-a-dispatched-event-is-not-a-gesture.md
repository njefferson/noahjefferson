## 348 · A dispatched event is not a gesture, and a harness that cannot tell its own instrument's output from the app's will report the app

**Enforced by:** CHECKLIST drive-it-like-a-hand — a walk that drives a control
which changes a MODE (an armed tool, an overlay, a drag-adjust state) uses a
real pointer, not `el.dispatchEvent(new Event("input"))`. Dispatching is fine
for a control whose only effect is its value.
**Enforced by:** CHECKLIST can-it-see-itself — a harness that reads pixels to
measure something the app draws asserts, every frame, that what it is reading
IS that drawing. If it cannot tell the app's own picture from the overlay it
means to measure, every number it produces is unfalsifiable.

**The measurement was of a mask's coverage, read off the app's own matte.** In
matte mode the shader draws `mix(mono, YELLOW, cov)` with a neutral grey and one
fixed yellow, so coverage solves exactly out of one read: `cov = (r - b) / 0.75`.

**Three runs produced numbers that were not coverage at all.** They were the
photograph's own red minus its blue, which in an infrared frame is a large,
structured, plausible-looking quantity. It reported a tone curve moving a colour
mask — which that app's pipeline forbids by construction, the mask key being
taken with the steering tools off — and it reported two very different picked
colours selecting byte-identical populations, which no key can do.

**The cause was one line of the harness: it neutralised the mask's own
saturation slider first, with a dispatched `input` event.** With no pointerdown
and no pointerup behind it, the app was left in the state it uses while a
slider is being dragged — in which the coverage overlay deliberately steps
aside so the adjustment shows on the real photograph. The overlay then never
came back, and both controls went on reading pressed. **A real drag on the same
slider does not do it**: pointer down, ten moves, pointer up, then the matte
comes on and 98.99% of the coloured pixels sit on the matte's own line.

## Why it took three rounds

Because the harness could not tell the two pictures apart, every wrong run came
back as a *finding about the app*, in the app's own vocabulary, with plausible
magnitudes. The first version wrote them up. The second version added the check
that settled it in one run: the matte's output lies on a known line —
`(g - b) / (r - b) = 0.8933` wherever `r > b` — and a photograph does not. That
is a yes/no property of the drawing, not a threshold to tune, and it is what
turned "the tone curve moves the mask" into "the canvas is not a matte".

**The self-check also caught the SECOND version of the same mistake.** Pressing
the matte control blind alternates it, so the second frame of each run turned
it back off — §324 in this same file, reproduced by the session that had just
read it.

## What to do instead

**Ask what the control DOES before choosing how to drive it.** A slider whose
only job is its value can be dispatched at. A control that arms a tool, opens
an overlay, or puts the app into a transient mode has a state machine behind it
that a bare `input` event walks into halfway.

**And build the "am I looking at the right thing" check before the first
number, not after the first absurd one.** It is usually one algebraic property
of whatever the app draws — a fixed ratio, a known palette, a colour that only
the overlay uses. Without it a harness cannot fail; it can only mislead.

## The converse that was claimed here four days later, and was FALSE

**This section first said the opposite of the sentence below, and stated it as
a measurement.** It read: a harness drove six plain value sliders — Saturation,
Contrast, Hue, Exposure, Clarity, Dehaze — with a pointer drag, a click on the
track and a focused ArrowRight; all six were unmoved by all three; therefore
"the synthetic pointer in that container does not move a range input".

**A controlled run the same day found all three routes working.** A bare
`<input type=range>` on a blank page went 50 to 81 on a pointer drag. The app's
own Dehaze slider went 0 to 0.64 on the same gesture, with `elementFromPoint`
at the drop coordinate returning the slider itself — nothing over it. Focused,
ArrowRight moved it 0 to 0.01. **Six for six did not reproduce at all**, and
what was actually wrong that first time is still not known.

## Why a wrong diagnosis survived being written down

**Because the workaround worked.** Switching those sliders to a dispatched
`input` + `change` pair fixed the harness, the arms rendered, the pictures came
out, and every number after it was correct. A fix that works reads as a
diagnosis confirmed. It is not one: it only shows that the new route works, and
says nothing whatever about why the old one did not.

**And the inference was good.** "Six controls failing three ways is the
interaction, not six broken controls" is sound reasoning — it just has more than
one conclusion, and the one that got written was the one that had already been
acted on. Three causes fit that evidence equally: the container, something over
the control eating the pointer, or coordinates that never landed on it. The
keyboard arm has a fourth of its own, since that app binds arrow keys for its
own navigation. Naming one of four and calling it measured is the whole failure.

**The control that settles it is small and was never built**: the same gesture
on a bare range input, on a blank page, in the same browser. Two minutes. It
would have refused the sentence before it reached a permanent cross-app file,
where the next session would have read it as established and reached for the
workaround without ever asking what was broken.

## What to do instead

**A workaround that works is not a diagnosis.** When something starts working
after a change, that is evidence about the new path only. If the old path's
failure is going to be written down as a cause, it needs its own control — the
simplest possible case of the same operation, in the same environment, with a
known answer.

**And the practice that survives from all of this**, which does not depend on
why the drag failed: the mode question is decided PER CONTROL. A control with a
state machine behind it takes a real gesture; a control whose only effect is its
value can be dispatched at. **Neither route is trusted on its own — the helper
reads the value back and throws when it did not land.**
`tools/walk-input.mjs` in Jefferson-Photography-Studio is that helper:
`setValue`, `getValue`, `dragSlider`. The reading-back is the part that would
have made the original six-for-six finding legible in the first place.
