## 467 · The figures a plan rested on were counts of words in reports and prompts, and not of events

**Enforced by:** JUDGEMENT — a refusal, a prompt or a failure is counted from the entry that carries it, once for each entry, and a figure that goes into a plan is read that way; a count of a phrase over whole lines of a transcript counts every report, prompt and printed file that quotes the phrase

**Smell:** a figure in a plan's Looked up that no one can point to an entry for; a count of some phrase made with a match-only search over whole JSON lines; a number that is round or that matches the number of mentions in the plan itself

**Recorded 2026-11-02.** Measured on 1 November at 20:10 California time. The plan approved at 20:20 rested on forty-six stop refusals, twenty-six answers of no task found, fifteen permission prompts for the status page, six first-call refusals and seventeen status refusals. Read from the entries that carry them, the record held twenty-four stop refusals (each is written twice, as a user entry carrying the hook's message and as a system entry summing it up), no answer of no task found, no such prompt, one first-call refusal and thirteen status refusals. The search had counted every mention, in reports, step prompts and quoted gate code, as an event. Rule 15 of the doctrine says a statement of state is read; it was read, by an instrument that could not tell a mention from an event.

**The test.** A refusal is counted from a user entry that opens with the stop hook's message, or from a tool result marked as an error that opens with a hook's refusal, once for each entry. A figure is written with the instrument that counted it.

**What is queued.** An instrument in `report.mjs` that prints these counts by shape is queued for a later plan.

**The general form.** A count made over the text of a record counts the record's talk about events, which grows with every report that mentions them.
