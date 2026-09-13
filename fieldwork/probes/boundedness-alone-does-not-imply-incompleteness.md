# probe — boundedness alone does not imply incompleteness

Status: **failed claim**  
Tests: working-backbone clause `A bounded system cannot realize, observe, or represent every possibility.`

## Verification contract

```yaml
claim: >
  Boundedness alone is sufficient to imply that a system cannot realize,
  observe, or represent every possibility in its environment.
scope: universal claim over bounded systems and bounded environments
claim_type: formal / conceptual

alternatives:
  A: Every bounded system necessarily has incomplete coverage of its possibility space.
  B: A bounded system can completely cover a finite possibility space when the space
     fits within the system's representational / observational / realizational capacity.

discriminator: >
  Construct a finite environment with four states and a finite learner with enough
  capacity to represent, distinguish, and visit all four states.
expected_if_A: No such bounded pair exists.
expected_if_B: A finite counterexample exists.

verification_target: whether boundedness by itself entails incompleteness
independent_verifier: finite-state construction
independence_rationale: the counterexample is checked by enumeration, not interpretation
trusted_base: elementary finite-state reasoning

result: failed
status: failed
```

## Counterexample

Let the environment have exactly four possible states:

```text
X = {00, 01, 10, 11}
```

Let the learner contain:

- a two-bit register that can represent each state injectively;
- a perfect two-bit sensor, so each environment state is observationally distinguishable;
- a finite transition controller capable of visiting the four states in sequence.

Both environment and learner are bounded. Yet the learner can:

- represent every state in `X`;
- observe every state in `X`;
- realize / visit every state in `X` over time.

Therefore boundedness alone does **not** imply incomplete coverage.

## What failed

The intended intuition concerns **relative capacity**, not boundedness in isolation.

A stronger candidate is:

> When the relevant possibility space exceeds a system's capacity for realization, observation, or representation, selectivity is unavoidable.

Or even more cautiously:

> Boundedness matters through a capacity relation between system and task/environment; it does not by itself imply ignorance.

## Why this matters

This is the first direct failure of a working-backbone clause rather than a terminology ambiguity or bad discriminator.

It also pressures the frozen seed's opening move. `A bounded learner cannot carry the whole world` remains plausible when `whole world` is larger than the learner, but that conclusion does not follow from boundedness alone without the relative-size premise.

No seed edit is made here. The failure is preserved for reconstruction.
