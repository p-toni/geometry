# probe — accessibility bucket vacuity

Status: **bad discriminator**  
Tests: working-backbone clause `Interfaces, constraints, dynamics, and history shape what becomes accessible.`

## Verification contract

```yaml
claim: >
  Naming interfaces, constraints, dynamics, and history places a substantive
  restriction on explanations of accessibility.
scope: abstract finite state spaces before mechanisms are independently specified
claim_type: formal / conceptual

alternatives:
  A: Some accessibility patterns cannot be represented by any of the named buckets,
     so the clause rules out candidate explanations.
  B: Any desired reachable subset can be encoded post hoc as a constraint or dynamics,
     making the clause non-discriminating unless the mechanism is independently fixed.

discriminator: >
  For an arbitrary state set X and target accessible subset A, construct either
  a constraint C=A or a transition relation whose reachable set is exactly A.
expected_if_A: There exists an A for which no such encoding is possible.
expected_if_B: The construction works for every A.

verification_target: whether the four-bucket sentence excludes any abstract accessibility pattern
independent_verifier: finite-set / transition-system construction
independence_rationale: direct construction independent of the research narrative
trusted_base: elementary set and graph definitions

result: bad discriminator
status: bad_discriminator
```

## Construction

Let `X` be any finite state set and let `A ⊆ X` be any subset we want to call accessible.

Two trivial post-hoc encodings exist:

1. **Constraint encoding**: define admissible states to be exactly `C = A`.
2. **Dynamics encoding**: choose an initial state in `A` and a transition graph whose reachable vertices are exactly the elements of `A`.

Therefore every arbitrary accessible subset can be redescribed as having been shaped by a `constraint` or `dynamics` if those terms are allowed to be fitted after the fact.

## What this means

The clause is not false. It is too permissive to verify as written.

The explanatory burden is not satisfied by assigning a case to one of four words. A mechanism must be specified independently enough that alternative reachability patterns would count against it.

Candidate sharpening:

> Accessibility should be explained by independently specified mechanisms that constrain which states, transitions, observations, or coordinates become available; the mechanism must rule out alternatives before the outcome is known.

This parallels the earlier equivalence-indexing result: post-hoc redescriptions are not explanations.

## Current disposition

Record as `bad discriminator`. Do not add more buckets. The repair should be stronger independence / counterfactual requirements, not a longer taxonomy.
