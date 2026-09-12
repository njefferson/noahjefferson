## 279 · A shader is a string to the type checker, and a shader that will not compile reports itself as an unsupported browser

**Enforced by:** CHECKLIST embedded-language-compiles — any app that embeds a
second language in a string (GLSL, SQL, a regex built at runtime, a worker body,
CSS in a template) needs one cheap check that the embedded thing actually
compiles in the real runtime, run BEFORE any feature test. A build that
typechecks says nothing about it. · JUDGEMENT — the diagnostic distance between
the cause and the symptom is what makes this expensive.

**Smell:** every browser test suddenly failing on "element intercepts pointer
events" or a timeout waiting for a control, right after a change that had
nothing to do with the UI. Also: any backtick, `${`, or unescaped brace inside a
template literal that holds another language.

**Infrared Photography Studio, 2026-09-12.** A numeric bound was moved out of the
CPU pipeline into a shared constant and interpolated into the fragment shader, so
the GPU and the CPU could not be given two different bounds. The constant was the
integer 2. GLSL will not convert an int literal to a float, so the shader failed
to compile with "cannot convert from const int to const highp float".

`tsc --noEmit` was green. `vite build` was green. The shader is a template
literal — a string. **Nothing in the build pipeline reads it.**

What happened in the browser was not an error at the edit. The renderer failed to
initialise, the app concluded the browser lacked WebGL2, an overlay saying so
covered the page, and the next harness run failed with sixty retries of "element
intercepts pointer events" while clicking a button. That reads like a layout
change. The fix was a decimal point.

**Two minutes of diagnosis, and it could have been thirty.** What shortened it
was asking the page directly: is WebGL2 available in this browser (yes), is the
unsupported overlay showing (yes), and what reached `pageerror`. The shader
compile error was sitting in the console the whole time, and no harness listened
for it. One now does, it runs first because it is the cheapest, and it asserts
four things: the app answers, no shader error reached the page, the app does not
declare itself unsupported, and nothing else threw at startup.

**AND THE COMMENTS IN THAT STRING ARE CODE TOO.** A later edit put the old
expression into a shader comment in backticks, to explain what had been replaced.
The backtick ended the template literal and the remaining shader was parsed as
TypeScript. **A comment inside an embedded language cannot contain the host
language's string terminator** — which is obvious, and is not obvious at all
while writing a paragraph about numerical bounds.
