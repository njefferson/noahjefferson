// The run of an approved page, as a script the harness runs: the Workflow tool is given this file by its path.
// It reads no file and it judges nothing. Each step goes to the role the page names, in the page's order, and the run stops at the first
// step that does not end as it should. A step that hands back FAILED is sent once more with nothing changed.
// args: { page: the page's full path, steps: [{ n: 1, role: 'worker' }, ...], from: the first step to send, 1 where it is absent }
// It returns { ended: 'done' or 'stopped', stopped: the step, its word and its whole answer, steps: each step's first line, found: every line an answer opened with Found }.
export const meta = {
  name: 'run-page',
  description: 'Runs the steps of an approved page in order, each by the role the page names, and stops at the first step that does not end as it should',
  phases: [{ title: 'Run' }],
}
phase('Run')
const firstLine = (t) => String(t ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? ''
const wordOf = (t) => { const m = /^(DONE|FAILED|REFUSED|EJECT|CHECK PASS|CHECK FAIL)(?![A-Za-z])/.exec(firstLine(t)); return m ? m[1] : 'NO WORD' }
// The model is always named: an agent of a workflow that names none takes the model of the thread that launched it.
const send = (s, again) => agent(args.page + ' step ' + s.n, { label: 'step ' + s.n + ', ' + s.role + (again ? ', again' : ''), agentType: s.role, model: 'sonnet' })
const steps = []
const found = []
let stopped = null
for (const s of args.steps) {
  if (s.n < (args.from || 1)) continue
  let text = await send(s, false)
  let word = text == null ? 'NO ANSWER' : wordOf(text)
  if (word === 'FAILED') { text = await send(s, true); word = text == null ? 'NO ANSWER' : wordOf(text) }
  steps.push({ step: s.n, role: s.role, word, first: firstLine(text) })
  for (const l of String(text ?? '').split('\n')) if (/^\s*Found:/.test(l)) found.push('step ' + s.n + ': ' + l.trim())
  if (!(word === 'DONE' || (word === 'CHECK PASS' && s.role === 'checker'))) { stopped = { step: s.n, role: s.role, word, answer: String(text ?? '') }; break }
}
return { ended: stopped ? 'stopped' : 'done', stopped, steps, found }
