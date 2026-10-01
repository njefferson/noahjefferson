## 375 · A subagent the safety classifier stops returns less, and the workflow counts it as done

**Enforced by:** CHECKLIST workflow-stops — after every workflow, search its transcript directory for the stop sentence (`grep -l "Your response above was stopped by a safety classifier" <transcript dir>/agent-*.jsonl`), and re-run each stopped item on the session's model before reporting the work complete. An audit whose agents read and quote request strings, user-agents and refusal pages runs on the session's model, not a cheaper one chosen for cost.

**Smell:** an audit that reports every item done while one item's fields are empty "because the findings were withheld"; a result that is shorter than its siblings and arrived after a pause; a failure explained by a guess rather than by the agent's own transcript.

**Recorded 2026-10-01.** Two audits of this session's own web requests (LESSONS §374) gave every site its own subagent and chose `model: 'sonnet'` for cost. On those agents, the harness stopped a response with this message: "Your response above was stopped by a safety classifier — this is not a tool or API error. The rest of it was withheld, and tool calls in it that had not finished did not run. Do not produce that content again, even reworded." One agent instead ended in an API error naming the safeguards and the category `[reasoning_extraction]`.

- **Counted across every workflow agent of the session:**
  - Claude Sonnet 5.5: 133 agents, 8 stopped.
  - Claude Opus 5.5: 129 agents, none stopped.
- **What the stops cost.** Two site audits, cloudynights.com and pixinsight.com, came back with no findings. Five came back after the stop with whatever survived it, and nothing marked which parts were missing. The workflows finished green, and the session reported the audit done with one site listed as unaudited.
- **The cause was then reported wrongly twice.** First, the PixInsight agent was said to have "failed the same way", when it ended in an API error, not a stop. Then the stops were put down to agents reading other models' reasoning in the transcripts. The stopped agents' own transcripts refuted that: none of the eight had read any.

**What is not known.** The classifier's reasons are not visible from the session, and the stop message names no category. The model split is a count, not an explanation: it says where the stops happened, not why.

**The remedy.** Re-run each stopped item on the session's model with its original prompt and a skeptic, reading the records from the branch that carries them. A withheld result is never reported as "found nothing".
