## 131 · Three releases were spent making one wrong object quieter, and each fix was a smaller version of the same mistake

**Enforced by:** JUDGEMENT — nothing can measure this. The signal is in the shape of
the commit history, and only a person reading it back notices.

**Smell:** the second fix to the same object is smaller than the first. Stop and ask
what the reader was reaching for, and whether this object can ever be it.

print-tracker's undo lived in a strip across the page: a standing band that appeared
after any change and described it. It was too loud, so it lost its raised
background. Still too loud, so its rails went from 2px to 1px. Still there, so it
got a ✕ to dismiss — which cost the reader that one undo, and had to say so. Each
step was a real improvement, measured, and shipped.

**The band was never the thing a reader wanted.** They know what they just did; what
they want is somewhere to take it back. That is a button in the app's chrome, where
every other program on the device keeps it — and no amount of tuning a band arrives
at a button. The whole line of work was refinement of an object that should not have
existed.

**The signal is repetition at decreasing size.** One fix is a fix. A second fix to
the same object, smaller, is a hint. A third is the answer: the object is wrong, and
each iteration is buying a smaller share of the same defect while looking like
progress, because every individual step measures better than the one before it.

**It is invisible from inside a release** and obvious across three, which is why it
belongs here rather than in a gate. The question to ask at the second fix — not the
third — is what the reader was actually reaching for, and whether this object can
ever be it.

Two side benefits, both signals in themselves. The replacement is available BEFORE
the first change rather than appearing after it, so the app answers "can this undo"
before the answer is needed; and it deleted a piece of focus management that existed
only because the old control removed itself from under the reader's finger. **Code
that exists to manage a thing's disappearance is evidence the thing should not
disappear.**

---
