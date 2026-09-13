# probe — tetrahedron is not a universal intrinsic information geometry

Status: **answered / counterexample to literal universality**  
Tests: user-seeded control `tetrahedron rules them all` under a literal intrinsic-geometry reading.

## Verification contract

```yaml
claim: >
  All information-bearing statistical systems possess one intrinsic tetrahedral geometry.
scope: literal universal claim over finite categorical statistical models
claim_type: mathematical / conceptual

alternatives:
  A: Every categorical statistical manifold is intrinsically tetrahedral / 3-dimensional.
  B: Intrinsic dimension and geometry vary with the statistical model; tetrahedrality can at most be a representation for some cases.

discriminator: >
  Compare categorical probability models with different numbers of outcomes under standard information geometry.
expected_if_A: Their intrinsic statistical manifolds all reduce to a tetrahedral 3-simplex.
expected_if_B: Their intrinsic dimensions vary with outcome count and cannot all be diffeomorphic to a 3-simplex.

verification_target: universal intrinsic tetrahedrality, not usefulness of tetrahedral decomposition
independent_verifier: dimension of categorical probability simplex + Fisher-Rao statistical-manifold construction
independence_rationale: manifold dimension is invariant under coordinate changes
trusted_base: standard probability simplex and differential-manifold definitions

result: answered
status: answered
```

## Construction

For a categorical distribution over `c` outcomes, probabilities satisfy:

```text
p_i > 0
Σ p_i = 1
```

The interior of this probability simplex is a statistical manifold of intrinsic dimension `c - 1`, equipped in information geometry with the Fisher–Rao metric.

Therefore:

```text
c = 2  -> 1-dimensional simplex / Bernoulli family
c = 3  -> 2-dimensional simplex
c = 4  -> 3-dimensional simplex (tetrahedral carrier in ordinary simplex coordinates)
c = 5  -> 4-dimensional simplex
...
```

Only the four-outcome simplex has the combinatorial dimension of a tetrahedron. The one- and two-dimensional cases cannot become intrinsically 3-dimensional by a coordinate change, and higher-dimensional cases cannot be intrinsically reduced to a tetrahedron without losing dimensions or imposing an additional projection/decomposition.

## Interpretation

This does **not** show that tetrahedra are useless, unstable, or unimportant. It distinguishes:

- a tetrahedron as a minimum 3D enclosure / structural primitive;
- simplicial decompositions as powerful representational tools;
- Fuller's tetrahedral coordinate program;
- a universal claim that every information geometry is intrinsically tetrahedral.

The last claim fails under the literal reading.

## Native support

Amari's information geometry treats parameterized probability families as statistical manifolds with the Fisher–Rao metric. Categorical models provide manifolds whose intrinsic dimension depends on the number of outcomes. This is enough to block the inference from `tetrahedron is a powerful/minimum 3D primitive` to `tetrahedron is the unique intrinsic geometry of information`.

## What survives from the X pointer

A weaker and interesting question remains open:

> Are there useful classes of information-processing or physical systems for which tetrahedral / simplicial decompositions are especially efficient, stable, or natural?

That is an empirical/mathematical program. It is different from universal intrinsic tetrahedrality.
