# Writing agent instructions and workflows

Apply when creating or changing rules, skills, subagents, or agent-tool workflows.

  * Keep always-loaded instructions only for durable constraints or project facts the agent cannot reliably infer. Put specialised procedures in the narrowest supported scope; reference one authoritative shared source instead of competing copies. Keep temporary task state out of permanent policy.
  * Write direct instructions in plain language. Use consistent terms. State when required actions apply so loading a rule does not itself start unrelated work. Keep conditions and exceptions close to the actions they qualify. Preserve technical precision and safety limits.
  * Give references verified paths or authoritative URLs and explicit reading conditions. Keep essential safety and approval boundaries in the applicable entry point, not solely optional links. Do not require unrelated references together.
  * Keep skill and subagent descriptions short: purpose and when to use them. Put required inputs, outputs, completion conditions, and procedures in the body. Check the target agent's format and loading behaviour; do not assume inherited context or capabilities.
  * For workflows that repeat or delegate work, define stop conditions and task-appropriate limits on total iterations or agent runs, not just how many run at once. Enforce limits with available workflow controls; report unfinished work when a limit is reached.
  * For changes to activation, permissions, or workflows, verify representative affected cases. Where relevant, also check cases where the rule or workflow should not apply. Review wording-only changes for clarity, consistency, and unchanged meaning.
