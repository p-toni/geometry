# probe — learning without explicit error

Status: **ambiguous**  
Tests: `learning-may-not-require-error`

## Verification contract

```yaml
claim: >
  Learning requires a consequential error signal to reach an adaptive state.
scope: >
  Implementation-level requirements of Oja-style unsupervised adaptation.
claim_type: conceptual / mathematical-model

alternatives:
  A: An explicit mismatch variable is necessary to execute the update.
  B: Learning can occur using local activity variables without an explicit target mismatch.

discriminator: >
  Inspect the variables required by Oja's update. Keep implementation-level
  requirements separate from a later optimization interpretation.
expected_if_A: The update requires a distinct mismatch variable.
expected_if_B: The update uses input, current weights, output activation, and learning rate only.

independent_verifier: Oja's published update and convergence analysis.
trusted_base: Correct reading of the mathematical model and assumptions.
result: ambiguous
status: ambiguous
```

## Observation

Oja's rule can be written as:

```text
y = wᵀx
w' = w + η y (x - y w)
```

The implementation receives `x`, `w`, `y`, and `η`; it does not require a teacher target, reward, desired output, or separately supplied prediction mismatch.

Under the paper's assumptions, the weight dynamics converge toward the dominant principal component of the stationary input covariance, which is a standard unsupervised-learning result.

## Why this is ambiguous

At implementation level, B is supported: no explicit target mismatch is required.

However, the dynamics can be given an optimization interpretation, and a sufficiently broad definition of `error` could treat the local corrective term as implicit error. That creates a terminology problem rather than a clean win: if `error` means externally supplied mismatch, the backbone is too strong; if it means any difference that drives adaptation, it risks losing discriminating power.

## What changed

This is the first deliberately ambiguous probe in the round. `Error` is now a live pressure point in the working backbone. No seed or backbone wording is changed yet.
