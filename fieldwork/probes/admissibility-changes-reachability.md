# probe — admissibility changes reachability

Status: **answered**  
Tests: `constraints-shape-reachability`

## Verification contract

```yaml
claim: >
  A representational partition that labels states does not in general have the
  same causal effect as an admissibility constraint that removes a transition;
  the latter can change reachability while the former leaves it unchanged.
scope: >
  One four-state directed transition system used only as a formal counterexample
  to identifying epistemic cuts with causal admissibility constraints.
claim_type: formal / computational

alternatives:
  A: >
    Applying the observational safe/unsafe partition is sufficient to make the
    failure state unreachable from the start state in the test system.
  B: >
    The observational partition leaves failure reachable, while an explicit
    admissibility restriction changes the reachable set and removes failure.

discriminator: >
  Enumerate graph reachability from the same start state before and after the
  admissibility restriction. The observational partition is held fixed and has
  no transition semantics.
expected_if_A: >
  Failure F is unreachable after mere labeling/grouping of states.
expected_if_B: >
  F remains reachable under observation alone but is unreachable after the
  transition S→X is made inadmissible.

independent_verifier: >
  Exact finite graph reachability; every path can be enumerated by hand.
independence_rationale: >
  The result is fixed by the edge set, not by semantic interpretation or model
  confidence.

result: B
would_change_if_wrong: >
  If A held, this constructed example would fail to distinguish epistemic
  partition from causal admissibility and the collision would require another
  verifier.
status: answered
```

## System fixed before evaluation

States:

```text
S  start
X  intermediate
Y  intermediate
F  failure
```

Underlying transitions:

```text
S → X
S → Y
X → F
Y → Y
F → F
```

The observational partition is:

```text
safe-ish: {S, X, Y}
failure:  {F}
```

It is only a map from states to labels. It removes no edge.

## Observation-only condition

Reachable from `S`:

```text
step 0: {S}
step 1: {X, Y}
step 2: {F, Y}
```

Therefore `F` is reachable by the path:

```text
S → X → F
```

Knowing which state is failure does not prevent the transition.

## Admissibility condition

Now hold the states and observational labels fixed but make the transition `S → X` inadmissible.

Permitted transitions from the reachable component are:

```text
S → Y
Y → Y
```

Reachable from `S` is therefore exactly:

```text
{S, Y}
```

`F` is unreachable.

## What changed

This gives a formal certificate for a narrow distinction:

> **partitioning a state space and changing its reachable subgraph are different operations.**

The result supports keeping at least these terms separate in fieldwork:

- epistemic / representational cut;
- admissibility constraint;
- dynamical accessibility.

It does not establish that real constraints are always explicit edge deletions, nor that representations cannot become causal when embedded in a feedback system.

No seed revision is earned. The distinction still needs heterogeneous survival outside this toy graph before it can move the corpus.
