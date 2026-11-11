Q-HUB-490: the plan fence passes an agent's shell line that writes a file in the scratchpad by a redirect, though the rules every plan carries forbid a redirect, met in the landing of 10 November (found in the landing of the plan of 10 November, filed in step 202).

Fix in: `plan-fence.mjs`. The fence refuses a redirect in an agent's shell line wherever the target lies, with a case on a line that redirects into the scratchpad.
