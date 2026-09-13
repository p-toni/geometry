# meta-test 003 — fixed-budget low-conflation comparison

Status: **equal-evidence comparison; baseline advantage for ordinary explanation**

Question: **Why is a free soap bubble approximately spherical?**

## Fixed evidence packet

Both arms receive the same three sources and no additional retrieval:

1. Frank Morgan / Michael Hutchings, Berkeley notes on soap bubbles and the isoperimetric problem: surface tension drives area minimization; the sphere uniquely minimizes area at fixed volume in Euclidean space.
2. Richard Fitzpatrick, UT Austin fluid mechanics notes on spherical interfaces: equilibrium minimizes interfacial free energy; Young–Laplace relates curvature, surface tension, and pressure jump.
3. Préve & Saa (2015), *Physical Review E*, on constrained doughnut-shaped soap bubbles: added geometric constraints can change the area-minimizing topology, while the free-bubble case is spherical.

Same model family, same packet, same question. No source advantage is allowed.

## Arm A — simple baseline

Procedure:

```text
read packet → answer question clearly
```

Recovered answer:

- Surface tension makes interfacial area energetically costly.
- For a fixed enclosed volume with no additional constraint, a sphere has the least surface area.
- A free bubble therefore relaxes toward a spherical shape.
- The Young–Laplace relation connects the resulting curvature to the pressure difference across the film.

This is correct, compact, and sufficient for the user question.

## Arm B — anti-collapse protocol

Procedure:

```text
native claim → scope → mechanism → rival/constraint → discriminator
```

Recovered distinctions:

- energy minimization is the physical mechanism;
- the isoperimetric theorem supplies the geometric optimum at fixed volume;
- Young–Laplace describes equilibrium curvature / pressure relation rather than independently explaining why the unconstrained global minimizer is spherical;
- `free` matters: imposed perimeter, contact boundaries, gravity, airflow, or topology constraints can change the realized shape;
- the sphere claim is therefore conditional, not a universal claim about all soap films.

## Did the protocol materially improve the answer?

Only modestly.

The baseline already answers the question with the correct mechanism and relevant condition. The protocol improves scope hygiene and separates two mathematical/physical roles, but it does not generate a materially better decision, prediction, or experiment for the ordinary question.

A possible discriminator — add a fixed equatorial perimeter and test when non-spherical/toroidal minima appear — is scientifically real, but it answers a *new* question introduced by the protocol rather than one required by the user's original request.

## Frozen criteria comparison

| Criterion | Simple baseline | Anti-collapse | Result |
|---|---|---|---|
| Correct mechanism | yes | yes | tie |
| Scope / assumptions | adequate | more explicit | small protocol advantage |
| Rival mechanisms needed | no major rival needed | preserves constrained cases | low marginal value |
| Probe generation | none | yes | protocol advantage, but not needed |
| Answer usefulness | high | high | tie |
| Reasoning/artifact cost | low | substantially higher | baseline advantage |
| Useful conclusion per unit effort | high | lower for this question | baseline advantage |

## Verdict

**Baseline wins for this low-conflation explanatory task.**

This is not a failure of the anti-collapse protocol; it is evidence for a scope boundary. The protocol's extra machinery is not justified whenever the question already has a compact, well-scoped mechanism and the output is not intended to support a durable cross-domain generalization.

Updated protocol hypothesis:

> Use anti-collapse selectively when synthesis risk is material. For ordinary well-scoped explanations, a strong baseline should remain the default.

## External-validity limits

- Same model family produced both arms.
- Reasoning tokens were not exactly equalized.
- The question was deliberately selected to have a compact mechanism.
- This test evaluates procedural fit, not truth discovery in an open research problem.
