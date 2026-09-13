# suppression audit 001 — ecological resilience

Status: **answered — suppression justified**

## Why this audit exists

Human-facing compression and active-branch rotation can hide a branch that looked low-yield too early. The protocol therefore periodically reopens one paused branch using a mechanical selection rule rather than choosing the most promising candidate.

## Selection rule

Take the current PR head SHA at audit design time, hash it, and use the result modulo the ordered list of paused branches. The selected branch was `ecological-resilience`.

The choice was made before re-reading the branch.

## What the branch had already contributed

Holling's distinction between stability-as-return and resilience-as-persistence under disturbance forced an important split:

```text
state stability ≠ regime resilience
```

That distinction survived source closure and is already represented in the round's collision map.

## Reopen test

Question: does another pass through this branch currently expose a material distinction, contradiction, or probe that the active map is missing?

Result: **no material new displacement found**.

The branch remains useful as a native control, but deeper exploration at this moment mostly expands the already-known family of resilience definitions rather than changing the working backbone or producing a cheaper discriminator than the current probe set.

## Audit result

Pausing this branch was justified **for the current phase**. The audit therefore supports, but does not prove, that branch rotation is not simply deleting value.

This is one sample only. Future audits must be allowed to overturn suppression decisions.
