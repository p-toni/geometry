# probe — equivalence partitions diverge

Status: **answered**  
Tests: `predictive-equivalence-not-state-similarity`

## Verification contract

```yaml
claim: >
  Observational equivalence does not imply predictive equivalence, and a
  task-specific equivalence can differ from both even in one small finite system.
scope: >
  A four-state Markov process constructed only as a formal counterexample to
  universal identification of these equivalence relations.
claim_type: formal / computational

alternatives:
  A: >
    The observational, predictive, and selected task partitions coincide in
    the test process, giving no concrete reason to separate them here.
  B: >
    At least two partitions differ under exact calculation.

discriminator: >
  Enumerate exact future-output distributions and a predeclared task statistic
  for all hidden states, then compare the induced equivalence classes.
expected_if_A: >
  Same state partition under current observation, full future distribution,
  and the declared task.
expected_if_B: >
  Different partitions despite operating on the same underlying process.

independent_verifier: >
  Exact finite enumeration using rational probabilities; every value is small
  enough to check by hand independently of the prose interpretation.
independence_rationale: >
  The result is fixed by the transition matrix and output map rather than by a
  model judging semantic similarity.

result: B
would_change_if_wrong: >
  If A held for the constructed process, this example would fail to certify the
  distinction and the collision would need a different discriminator.
status: answered
```

## Process

Hidden states and visible outputs:

```text
A → 0
B → 0
C → 1
D → 2
```

Transition matrix:

```text
A → C 4/5, D 1/5
B → C 1/5, D 4/5
C → A 1/2, B 1/2
D → A 1/2, B 1/2
```

Three equivalence criteria were fixed before evaluating them:

1. **current observational equivalence** — same visible output now;
2. **predictive equivalence** — same probability distribution over every future visible-output sequence;
3. **task equivalence** — same probability that the *next* visible output is `0`.

## Observation

### Current observation

```text
{A, B} | {C} | {D}
```

A and B are indistinguishable now because both emit `0`; C and D are visibly different.

### Future distribution

One-step future outputs are:

```text
A: P(1)=4/5, P(2)=1/5
B: P(1)=1/5, P(2)=4/5
C: P(0)=1
D: P(0)=1
```

C and D also have identical transition distributions into A/B, so their visible-future distributions remain identical at every horizon. A and B remain predictively distinct.

Predictive partition:

```text
{A} | {B} | {C, D}
```

This is almost the inverse of the observational cut: the pair that looked identical is split, while two states that looked different are merged.

### Declared task

For the binary task “will the next visible output be `0`?”

```text
A: 0
B: 0
C: 1
D: 1
```

Task partition:

```text
{A, B} | {C, D}
```

This differs from both observation and full predictive equivalence.

## What changed

The collision now has a formal certificate for the narrow claim that there is **no representation-independent equivalence relation even in a tiny process**. The same physical states admit different justified cuts depending on whether the verifier asks about present observation, the full future, or a selected downstream task.

This does **not** establish that all useful representations are subjective, nor that one criterion cannot be privileged for a particular science or agent. It blocks only the silent move from “these states are equivalent” to an unindexed notion of sameness.

No seed revision is earned yet. A general claim would need heterogeneous survival beyond this constructed counterexample.
