# collision — learning may not require explicit error

Status: **probing**

## Inputs

- working backbone clause: learning requires consequential error to survive a channel and reach something that can revise;
- Oja-style unsupervised learning;
- broader distinction between explicit error, implicit objective, correlation-driven update, and generic feedback.

## Collision

The backbone uses `error` as if it were a necessary causal ingredient. Oja's rule provides a technically standard learning process with no teacher target or externally supplied mismatch signal.

Three possibilities remain live:

1. the backbone is too strong and `error` should be replaced by a broader concept such as consequential difference / evidence / feedback;
2. Oja's local dynamics contain an implicit error-like quantity, so the clause survives after operational clarification;
3. `learning` is too heterogeneous for one universal update requirement.

## New distinction

Do not conflate:

- explicit target error;
- reward / scalar performance error;
- prediction error;
- local state discrepancy;
- correlation-driven plasticity;
- any causal input that changes an adaptive state.

If the last category is allowed to count as `error`, the claim risks becoming tautological.

## Candidate discriminator

Take a learning rule whose implementation receives only local activity variables and no explicit target/reward. Ask whether an operational error variable is necessary to state or execute the update. Then separately ask whether an optimization interpretation can be imposed mathematically afterward.

The implementation-level and interpretation-level questions must not be collapsed.
