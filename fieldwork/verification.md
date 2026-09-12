# verification fabric

This is the promotion discipline for fieldwork.

The search system is intentionally permissive upstream and increasingly strict downstream.

> Exploration expands possibility. Verification eliminates possibility.

Discovery and justification are separate jobs. A candidate can come from analogy, intuition, brute force, a blind scout, a model, or an accident. Promotion depends on whether it survives a constraint that does not care how persuasive its origin story is.

There is no universal verifier across mathematics, biology, cognition, institutions, software, and philosophy. Instead, each promoted claim carries a **verification contract** appropriate to its type.

## Promotion ladder

### Scout → branch: fertility

Question: **is there a real native problem here worth spending depth on?**

Promote when there is at least one native distinction, competing mechanism, anomaly, intervention, unresolved empirical program, falsification opportunity, or sufficiently alien case that can test search independence.

False positives are acceptable here. Admission should be cheap.

### Branch → collision: displacement

Question: **did independently developed branches force a distinction or contradiction we did not already have?**

A collision certificate must name the displacement. Shared terminology or thematic resemblance is not enough.

### Collision → probe: discriminability

Question: **can live alternatives be made to differ under an independent constraint?**

At minimum:

```text
A predicts / permits / requires X
B predicts / permits / requires Y
constraint C can distinguish X from Y
```

If this cannot be written, the collision may remain conceptually important but is not yet an experiment.

### Probe → seed revision: survival

Question: **did the result survive the verifier, and would we now honestly say or do something different?**

Require:

1. the probe was genuinely discriminating before the result was known;
2. the verifier was sufficiently independent of the claim-generation mechanism;
3. the result survived checking appropriate to the claim type;
4. the displacement can be reconstructed source-closed;
5. the result changes a prediction, decision, distinction, or statement in the seed.

A useful test is:

> Without this result I would still say / predict / do X. Because of it, I can no longer honestly do so.

### Seed revision → canon: heterogeneous survival

Cross-domain claims should not become canon merely because several neighboring literatures use similar language.

A strong general claim should survive multiple **different kinds of contact**. Heterogeneous verification is stronger than citation count.

## Verification contracts

Every promoted probe should record:

```yaml
claim:
scope:
claim_type:

alternatives:
  A:
  B:

discriminator:
expected_if_A:
expected_if_B:

independent_verifier:
independence_rationale:

result:
would_change_if_wrong:
status: proposed | running | answered | ambiguous | failed
```

Write expectations before observing the result. Do not repair the prediction afterward.

## Verifier families

These are defaults, not an exhaustive ontology.

| Claim type | Candidate verifier |
|---|---|
| mathematical / formal | proof assistant, derivation, counterexample search, independent proof check |
| computational | executable implementation, tests, reproducibility, differential testing |
| empirical | prediction, experiment, intervention, replication |
| causal | intervention, natural experiment, causal identification with explicit assumptions |
| historical | primary-source triangulation, independent records, chronology constraints |
| distributed-system | trace analysis, fault injection, invariant checking, failure/recovery behavior |
| conceptual / philosophical | explicit premises, rival account, countermodel, consequence on which accounts diverge |
| design / product | build, deploy, observe behavior and consequence |
| personal / epistemic | source-closed reconstruction plus changed prediction, decision, or action |

The verifier should be as independent as the domain permits. A system grading its own fluent explanation is not independent verification.

## Independence

Independence is a gradient, not a binary.

Prefer, in order:

1. a mechanically enforced constraint the generator cannot negotiate with;
2. a separately implemented checker or formal system;
3. independent data or intervention;
4. independent expert reconstruction or adversarial review;
5. self-checking only when nothing stronger exists, clearly marked weak.

The stronger the promotion, the stronger the required independence.

## When no verifier exists

Do not discard an idea merely because it cannot yet be tested.

Mark it **speculative / unverified**, keep its scope narrow, and prevent it from silently changing the seed. Lack of a verifier is itself information about the maturity of the claim.

## Operating rhythm

```text
expand → discriminate → expand → discriminate
```

The system should become more permissive upstream as search capacity grows, and more severe downstream as claims approach revision or canon.
