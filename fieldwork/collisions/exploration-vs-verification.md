# collision — exploration is not verification

Status: **open**

## Independently developed inputs

- state-space exploration architecture: wide branching is used to discover candidate structure;
- model checking: exhaustive exploration becomes verification only relative to an explicit transition model and property;
- Navier–Stokes/Lean branch: proof checking verifies a formal statement, not every surrounding interpretation;
- anti-collapse protocol: source count and search width are not progress by themselves.

## Displacement

Coverage and proof are different axes.

A search can be broad yet weakly justified. A verifier can be narrow yet strong about one precisely stated claim. Increasing exploration width does not monotonically increase confidence unless a claim and verifier connect the explored space to the promoted conclusion.

## Distinction created

```text
search coverage
≠ model coverage
≠ property coverage
≠ claim validity
```

## What this changes operationally

Every large scout wave should eventually either:

- generate a discriminator;
- die without promotion; or
- justify why the relevant claim cannot yet be verified.

“Many independent-looking hits” is never itself a promotion certificate.

## Next discriminator

Construct a finite transition system where random simulation sees no violation with high probability but exhaustive model checking finds a reachable counterexample. Use it only as a narrow certificate for the difference between likely-trajectory coverage and reachable-state coverage.
