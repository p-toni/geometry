# backbone claim types

Status: **protocol correction under test**

The working backbone currently mixes claims with different logical roles. Treating every sentence as though it were the same kind of proposition creates bad probes.

## Claim roles

### 1. Universal / conditional claim

Example:

> A bounded system cannot realize, observe, or represent every possibility.

This is falsifiable by counterexample. It should carry an explicit scope and antecedent.

### 2. Mechanistic explanation

Example:

> Interfaces, constraints, dynamics, and history shape what becomes accessible.

This must do more than redescribe an observed outcome. A mechanism should be specified independently enough to rule out alternatives.

### 3. Taxonomic possibility statement

Example:

> Structure may be represented, enacted, selected, or distributed.

A sentence of the form `may be A, B, C...` can be useful as an anti-collapse reminder while having little falsifiable content. Do not pretend it is a law.

### 4. Distinction / separation claim

Example:

> Prediction, intervention, and control require different forms of access.

The appropriate test asks whether the capabilities can be dissociated under controlled examples, not whether different words can be assigned after the fact.

### 5. Operational / epistemic guard

Example:

> Learning requires that consequential error survive a channel and reach something that can revise.

This mixes a proposed mechanism with a methodological intuition. Key terms (`error`, `channel`, `revision`) need operational scope or the clause can become true by definition.

## Operating rule

Before falsifying a backbone clause, first label its role:

```text
universal | conditional | mechanistic | taxonomy | distinction | operational guard
```

Then choose a verifier appropriate to that role.

A taxonomy is not strengthened by surviving a counterexample search it was never specific enough to fail. A universal claim is not rescued by reclassifying it as metaphor after a counterexample appears.

## Promotion consequence

The next source-closed reconstruction should distinguish:

- claims we think are true;
- distinctions we need to preserve;
- taxonomies that merely keep alternatives visible;
- methodological rules for how inquiry should proceed.

Only the first category should be treated as a candidate general theory without further qualification.
