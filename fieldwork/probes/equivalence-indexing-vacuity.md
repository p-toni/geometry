# probe — equivalence indexing vacuity

Status: **bad discriminator**  
Tests: working-backbone clause `Any useful equivalence is indexed by what must be preserved.`

## Verification contract

```yaml
claim: >
  The statement that an equivalence is indexed by what must be preserved places
  a substantive restriction on candidate equivalence relations.
scope: >
  Abstract equivalence relations on a finite or arbitrary set, before any
  independently specified scientific task or transformation class is supplied.
claim_type: formal / conceptual

alternatives:
  A: >
    Some equivalence relations cannot be represented as equality of a preserved
    feature, so the clause rules them out even without extra structure.
  B: >
    Every equivalence relation can be represented as equality of a quotient/class
    label; therefore the clause is vacuous unless the preservation criterion is
    specified independently of the equivalence being justified.

discriminator: >
  Given an arbitrary equivalence relation ~ on X, construct the quotient map
  q: X -> X/~ and check whether x ~ y iff q(x) = q(y).
expected_if_A: >
  There exists an equivalence relation for which no such preserved class feature exists.
expected_if_B: >
  The quotient construction works for every equivalence relation by definition.

verification_target: >
  Whether the backbone clause has falsifiable content when “what must be preserved”
  is allowed to be chosen after the equivalence relation is known.
independent_verifier: >
  Elementary quotient-set construction; no semantic judgment is needed.
independence_rationale: >
  The result follows from the definition of an equivalence relation and quotient set,
  independently of the research narrative.
trusted_base: Standard set-theoretic definitions of equivalence relation and quotient.

result: bad discriminator
would_change_if_wrong: >
  If A held, the current clause would retain nontrivial formal content without an
  independently fixed preservation criterion.
status: bad_discriminator
```

## Observation

For any equivalence relation `~` on a set `X`, let `X/~` be the set of equivalence classes and define:

```text
q(x) = [x]
```

Then exactly:

```text
x ~ y  iff  q(x) = q(y)
```

So every equivalence relation can be redescribed as preserving the feature “equivalence-class identity.”

## Why this is a protocol failure rather than a theorem for the backbone

The working sentence is not false. The problem is worse for verification: under an unrestricted reading it is **too easy to make true**.

If “what must be preserved” may be defined post hoc from the equivalence relation itself, the clause rules out nothing. It cannot discriminate a scientifically grounded equivalence from an arbitrary partition.

The statement only gains epistemic content when the preservation criterion is fixed independently, for example by:

- a transformation group;
- a prediction target;
- an intervention;
- a task/loss function;
- a measurement channel;
- a causal question;
- another predeclared verifier.

## What changed

This is the first `bad discriminator` outcome in the round.

The stronger candidate wording is not yet promoted, but the pressure is clear:

> A useful equivalence must be justified by a preservation criterion specified independently enough that alternative partitions could fail it.

That is a materially stronger claim than the current backbone sentence and can, in principle, be tested.
