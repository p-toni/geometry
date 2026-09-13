# probe — local independence does not compose

Status: **answered**  
Tests: `local-guarantees-do-not-automatically-compose`

## Verification contract

```yaml
claim: >
  Two component outputs can each be individually independent of a hidden secret
  while their joint output determines that secret exactly.
scope: >
  A finite probabilistic counterexample to automatic composition of local
  information guarantees.
claim_type: formal / computational

alternatives:
  A: >
    If each component output is individually independent of the secret, their
    composition is also independent of the secret.
  B: >
    Individual independence can hold for each output while the pair jointly
    reveals the secret.

discriminator: >
  Enumerate all values of a uniform secret S and independent uniform random bit R
  for outputs A=R and B=S xor R. Check conditional marginals and the joint map.
expected_if_A: >
  The pair (A,B) remains statistically independent of S.
expected_if_B: >
  Each marginal is uniform for both secret values while S is recovered exactly
  from A xor B.

independent_verifier: >
  Four-row exact truth table / rational probability enumeration.
independence_rationale: >
  The result is fixed by Boolean algebra and the predeclared probability model.

result: B
would_change_if_wrong: >
  If the joint outputs did not reveal S, this construction would fail as a
  certificate that local information guarantees need not compose.
status: answered
```

## Construction

Let:

```text
S ∈ {0,1} uniformly
R ∈ {0,1} uniformly and independently
A = R
B = S xor R
```

Exact table:

```text
S  R  A  B
0  0  0  0
0  1  1  1
1  0  0  1
1  1  1  0
```

For **A** alone:

```text
P(A=0 | S=0)=1/2    P(A=0 | S=1)=1/2
P(A=1 | S=0)=1/2    P(A=1 | S=1)=1/2
```

For **B** alone, the same is true. Each component output is individually independent of S.

But jointly:

```text
S = A xor B
```

so the pair determines the secret with certainty.

## What changed

The probe formally certifies a narrow composition failure:

> **a property verified at each component boundary need not survive when outputs are combined at a larger boundary.**

The failure is not caused by either component marginal changing. The new information exists only in the relation between them.

This supports the need for explicit composition contracts or system-level verification. It does not establish that useful local properties generally fail to compose; it blocks only automatic promotion from local guarantee to global guarantee.
