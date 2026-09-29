# Writing agent instructions and workflows

Apply when creating or changing rules, skills, subagents, or agent-tool workflows.

  * Keep always-loaded instructions only for durable constraints or project facts the agent cannot reliably infer. Put specialised procedures in the narrowest supported scope; reference one authoritative shared source instead of competing copies. Keep temporary task state out of permanent policy.
  * Give references verified paths or authoritative URLs and explicit reading conditions. Keep essential safety and approval boundaries in the applicable entry point, not solely optional links. Do not require unrelated references together.
  * Keep skill and subagent descriptions short: purpose and when to use them. Put required inputs, outputs, completion conditions, and procedures in the body. Check the target agent's format and loading behaviour; do not assume inherited context or capabilities.
  * For workflows that repeat or delegate work, define stop conditions and task-appropriate limits on total iterations or agent runs, not just how many run at once. Enforce limits with available workflow controls; report unfinished work when a limit is reached.
  * For activation, permission, or workflow changes, verify representative affected and non-activating cases where relevant. Review behaviour-preserving wording changes for clarity and consistency.
