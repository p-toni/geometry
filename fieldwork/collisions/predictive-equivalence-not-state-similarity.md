# collision — predictive equivalence is not state similarity

Status: **open**

## Independent inputs

- `shalizi-crutchfield-2001-computational-mechanics` — histories are equivalent when they induce the same conditional distribution over futures; causal states are predictive equivalence classes.
- `tishby-pereira-bialek-2000-information-bottleneck` — a representation should preserve information relevant to a chosen downstream variable rather than reconstruct all input detail.
- `kalman-1960-observability-controllability` — what can be reconstructed from outputs depends on the measurement model and is distinct from what can be controlled.

## Why this is a collision rather than an agreement

All three permit aggressive collapse of underlying detail, but they license the collapse differently: identical predictive futures, retained information about a selected target, or recoverability through a specified measurement channel. Treating these as one generic “compression” operation would erase the criterion that makes each cut valid.

## New distinction / contradiction

At least four equivalence relations must remain separate:

1. **observational equivalence** — current measurements cannot distinguish states;
2. **predictive equivalence** — states/history imply the same future distribution;
3. **task equivalence** — differences do not alter the selected downstream variable or loss;
4. **interventional equivalence** — states respond the same way under relevant interventions.

None follows automatically from another.

## Pressure on the seed

The phrase “searches for invariants” may be too static. A useful cut can instead be defined by **what differences fail to change future consequences under a specified class of questions**.

That turns an invariant from a property simply noticed in the present into a relation indexed by prediction, task, measurement or intervention.

## What remains unresolved

Whether there is a privileged equivalence relation for learning, or whether useful geometry is irreducibly objective-relative: predictive for one horizon, causal for another, actionable for another.

## Candidate discriminating probe

Construct a small stochastic process with hidden states that are observationally identical at one time step but predictively distinct over longer horizons. Compare the partition produced by observation-only grouping, a one-step information bottleneck, causal-state reconstruction and an intervention-sensitive partition.

The probe succeeds if the partitions demonstrably differ and each is optimal for a different declared objective.
