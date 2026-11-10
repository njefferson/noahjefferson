Q-HUB-235: an agent's parallel first calls before the read of the rules file cost a send, because the plan fence's first refusal sets no latch and the second latches; the fence could pass the rules read beside a refused call, or treat every refusal of one parallel batch as one (found in step 63 of the plan of 3 November, filed in the same step).

Fix in: `plan-fence.mjs`. The fence passes the rules read beside a refused first call, or counts every refusal of one parallel batch as one.
