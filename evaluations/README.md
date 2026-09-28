# Evaluate the rules

These artifacts map every bullet in the two rule files to a concrete, repeatable decision test. They do not alter or load extra instructions into normal coding sessions.

## What exists

- [Coverage map](coverage.md): every source bullet, its section and test IDs.
- [Inventory](inventory.json): exact instruction text, source lines and hashes. There are 134 bullet entries, including the approval-list introduction; this is not a count of atomic requirements.
- [Scenarios](cases.mjs): 134 primary scenarios plus 18 boundary cases that check when a rule should *not* cause extra work or another approval request.
- [Runner](suite.mjs): validates coverage, presents shuffled choices, runs the same cases with and without both rule files, and records raw results and usage.
- [Runner checks](suite.test.mjs): check source coverage, golden-answer mapping and result parsing.
- [Behavioural replay guide](behavioural-replay.md): how to test actual agent actions instead of just stated decisions.

## Evidence levels

1. **Mapped:** a scenario exists for a source bullet.
2. **Decision-tested:** the model chose an action from supplied alternatives in a fictional situation.
3. **Behaviour-tested:** an isolated agent actually acted, with tool traces and independent outcome checks.
4. **Compared repeatedly:** equivalent outcomes and costs were measured across repeated baseline/rules runs and representative models.

Do not describe level 1 or 2 as proof that every instruction works. Bullets contain multiple clauses and conditions. One representative scenario cannot exhaust every clause, exception, platform or interaction. A correct multiple-choice answer can coexist with wrong behaviour during development. The distractors are deliberately clear; this is an interpretation screen, not a difficult coding benchmark.

## Local validation (no model calls)

Requires an existing Node.js installation with ES modules and `node:test`; the current run used Node 24. No package installation is needed.

```sh
node evaluations/suite.mjs validate
node --test evaluations/suite.test.mjs
node evaluations/suite.mjs catalog
```

Source hashes deliberately stop the suite when either rule file changes. Review the scenario-to-rule bindings and reference answers before updating the hashes in `cases.mjs` and regenerating the catalog. Do not automatically bless changed instructions just to make validation pass.

## Run the paired decision tests

The supplied adapter uses an **already installed and authenticated Claude Code CLI**. Other agents can use the same scenarios and scoring contract through another adapter; this does not make the rule files Claude-specific. The CLI must support the flags used in `suite.mjs`; verify local help before using it on another installation. No software is installed by the runner.

```sh
node evaluations/suite.mjs run \
  --claude /absolute/path/to/claude \
  --model sonnet \
  --out evaluations/runs/first-pass
```

This makes 26 sequential model calls for 152 cases in batches of up to 12, two calls per batch. It consumes the configured account's model allowance; the runner does not enable extra usage or fall back to another provider. Start small with `--max-cases 12` if desired. Default timeout is 90 seconds per call. Execution or malformed-output failures stop the run; wrong decisions are retained and do not stop it. An existing output directory is never overwritten.

Both arms retain the coding harness's built-in instructions. Custom instructions, skills, hooks, MCP and tools are disabled for this decision-only adapter. Only the rules arm receives the two full source files. Each call starts fresh; baseline/rules order alternates between batches. Cases within a batch share context, so these are not 152 independent coding sessions. The reference answer is not supplied to the model; choice positions are shuffled deterministically and identically between arms.

```sh
node evaluations/suite.mjs score evaluations/runs/first-pass
node evaluations/suite.mjs report evaluations/runs/first-pass
```

`summary.json` separates pass, fail, invalid and not-run results. `REPORT.md` lists the result of every case and explicitly labels actual tool-use behaviour as untested by this screen. Model identity, source hashes, exact prompts, raw CLI responses, timings and usage remain in the run directory. Input counts include cached input and do not equal a bill or subscription quota. Failed, timed-out or malformed runs are not passes. A full report must also disclose untested real-world behaviour.

Raw run files are ignored by Git because harness responses can include local metadata. Review and redact anything before deliberately publishing it. Keep useful shareable summaries separate from raw records. No real installs, deletes, pushes, migrations or account changes are executed by these decision cases.
