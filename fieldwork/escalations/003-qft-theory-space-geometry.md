# escalation 003 — geometries of quantum field theory spaces

Status: **escalation lane — native geometric control, no theory promotion**  
Source: Masahito Yamazaki, *Geometries of Quantum Field Theories*, arXiv:2609.28210v1 (23 Sep 2026). English translation of a 2015 Japanese book; the author states the technical content is essentially the 2015 text, with corrections and small changes.

## Why this escalated

This source uses "geometry" in a highly developed, domain-native technical sense and therefore provides a useful control against letting Geometry become a generic metaphor.

Its central question is not "is everything geometry?" but:

> when we consider a **space of quantum field theories and the relations among them**, what mathematical structure becomes visible that is not visible in one isolated presentation?

The book studies a concrete answer through supersymmetric field theories, duality, renormalization, compactification, 3-manifolds, Teichmüller theory, hyperbolic geometry, knot theory and cluster algebras.

## Three different senses of geometry must remain separate

The book contains several geometries that should not be collapsed:

1. **geometry used to construct a field theory** — e.g. compactifying a higher-dimensional theory on a 2d or 3d manifold;
2. **geometry of mathematical spaces associated with the theory** — e.g. hyperbolic 3-manifolds, Teichmüller/moduli spaces;
3. **structure on a theory space** — relations among multiple field-theory descriptions, dualities, gauging/composition operations and their geometric/algebraic organization.

The third is the one most relevant to our fieldwork, but the source does not establish that every theory space or every information space has one universal geometry.

## Native displacement 1 — the object is not its presentation

Duality gives explicit cases in which different Lagrangians / gauge descriptions encode the same low-energy physics.

For Seiberg duality, the book emphasizes that two UV theories with different gauge groups can flow to the same IR fixed point. The equivalence is therefore not equality of microscopic descriptions; it is indexed by a physically specified regime and preserved observables.

This is an unusually clean native example of the guard learned in round 001:

```text
same representation
    !=
same object

different representations
    can be equivalent
    relative to independently specified preserved physics
```

The relevant equivalence criterion is not invented after seeing the partition: the IR fixed point / physical observables supply the criterion.

The book pushes this further in its conclusion: a single quantum theory can admit several, in general infinitely many, classical limits, and some quantum theories have no classical Lagrangian description at all. Duality can therefore be viewed partly as redundancy introduced by classical representations used to access a quantum object.

This is a strong example of **representation not exhausting ontology**, but only at the stated QFT scope.

## Native displacement 2 — some structure exists only relationally

Yamazaki repeatedly stresses that certain geometric, algebraic or integrable structures become visible only when we consider a **theory space of theories**, rather than one theory in isolation.

A concrete example is the appearance of integrable structure in families of 4d quiver gauge theories: Seiberg duality translates to graph transformations related to the star-star relation, and Yang-Baxter integrability becomes a duality relation among theories.

This is important because it makes "structure is relational" non-metaphorical:

```text
property of one object
    !=
structure of relations among objects / presentations
```

The stronger universal statement "all meaningful structure is relational" is not earned.

## Native displacement 3 — tetrahedron as building block, not ruler of all geometry

Chapter 9 is a particularly useful control on the earlier Fuller branch.

Ideal tetrahedra are genuine local building blocks in the 3d-3d correspondence. The book identifies:

```text
ideal tetrahedron
    ↔
basic 3d N=2 theory

gluing tetrahedra
    ↔
gluing corresponding field theories
```

This gives tetrahedral decomposition real mathematical/physical content in this domain.

But the decomposition is **not unique**. A 2–3 Pachner move replaces two ideal tetrahedra with three while preserving the underlying 3-manifold description; on the field-theory side this corresponds to a mirror duality/equivalence.

So the source sharpens the Fuller lesson:

```text
tetrahedron can be a privileged local presentation primitive
        !=
tetrahedron is the unique global form
        !=
number or arrangement of tetrahedra is invariant
```

What survives the 2–3 move is the higher-level object / equivalence, not a particular tetrahedral decomposition.

This is a better technical answer to "which geometry rules them all?" than tetrahedral primacy: **the useful primitive can change under equivalence moves while the represented structure remains.**

## Native displacement 4 — coarse-graining licenses equivalence at a scale

Renormalization and effective field theory provide another concrete mechanism.

Low-energy behavior can become insensitive to high-energy details. Distinct ultraviolet theories can therefore converge toward the same infrared physics.

This gives a native case where coarse-graining is not merely lossy compression. The discarded detail is licensed by a scale/regime in which it ceases to affect the observables being modeled.

Again:

```text
discard detail
    + independently specified regime
    + preserved observables
    → legitimate effective equivalence
```

The source does not imply that every compression or coarse-graining is predictive or physically valid.

## Collision with our existing map

This source does **not** resurrect the frozen seed.

It supports a more careful family of distinctions already surviving round 001:

- equivalence needs a preservation criterion;
- representation and represented object can differ;
- structure can live in relations among descriptions rather than inside one representation;
- decomposition primitives need not themselves be global invariants;
- gluing/composition requires compatibility conditions;
- coarse-graining is licensed relative to a scale and retained observables.

The source is particularly valuable because these distinctions arise from a mature technical framework rather than from our vocabulary.

## Strongest rival reading

A skeptical reading is:

> "geometry of QFTs" is a domain-specific mathematical correspondence in a restricted class of supersymmetric theories, not evidence for a general epistemic or cognitive Geometry.

The source itself largely supports this caution. It explicitly limits the developed correspondence to specific compactifications and supersymmetric theories, while expressing broader applicability as expectation rather than established result.

Therefore cross-domain promotion would require separate evidence.

## What this changes about the Fuller control

The earlier Fuller branch asked whether tetrahedral / simplicial representations are unusually useful for some classes of systems.

This book gives a clear **yes for one highly specific class**:

- ideal tetrahedra provide compositional building blocks for hyperbolic 3-manifolds;
- corresponding basic 3d N=2 theories can be glued in parallel;
- local decomposition changes map to duality moves.

But the same example simultaneously rejects a naïve universalization because two and three tetrahedra can be alternative presentations of the same higher-level object.

The interesting object is therefore not "the tetrahedron" alone but:

> **primitive + gluing law + equivalence moves + preserved global object.**

That quadruple is worth carrying as a technical pattern, not a universal ontology.

## Candidate future discriminator

No deep cycle is currently earned.

If we later consider promoting the cross-domain claim:

> "robust structure is often characterized less by a privileged representation than by transformations between representations that preserve specified observables",

then this QFT case can serve as one heterogeneous instance.

A serious test would need a different domain where:

1. multiple non-isomorphic representations describe the same target;
2. the preservation criterion is independently specified;
3. local moves connect representations;
4. composition/gluing is explicit;
5. the claim can fail if no such move-invariant structure exists.

Until then, this remains a native exemplar, not evidence for a universal Geometry theory.

## Routing decision

Remain in **escalation**.

This source earns a durable technical control:

```text
geometry of an isolated representation
        !=
geometry / structure of a space of representations
        !=
invariant object under representation-changing moves
```

It also gives the strongest technical refinement so far of the tetrahedron thread:

> tetrahedrality may be a powerful local decomposition language even when the decomposition itself is non-unique and not the invariant.

No seed, canon, or router change is justified.

## Source

- https://arxiv.org/abs/2609.28210
- https://arxiv.org/pdf/2609.28210
