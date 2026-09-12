# source — Kalman 1960: observability and controllability

Status: **stressed**  
Provenance: R. E. Kalman, “Contributions to the Theory of Optimal Control” / “On the General Theory of Control Systems,” 1960-era foundational work introducing controllability and observability. National Technical Reports Library record: AD724842.  
Branch: `partial-observation-and-control`

## Native question

Which internal states of a dynamical system can be inferred from its outputs, and which state changes can be produced through available inputs?

## Claims in the source's own terms

Kalman's systems framework separates two structural properties:

- **controllability** — whether admissible inputs can move the system through the relevant state space;
- **observability** — whether the internal state can be reconstructed from measured outputs over time.

A system can fail one property independently of the other. Regulation and estimation therefore depend on more than merely having a model of the system.

## Evidence / argument actually offered

The contribution is mathematical and structural for linear dynamical systems. It develops algebraic criteria that make controllability and observability testable properties of a system representation.

## Explicit limits / unknowns

- Linear-state-space results do not automatically extend to arbitrary nonlinear or partially known systems.
- Observability is model-relative: changing the state variables or measurement model can change the analysis.
- Controllability does not imply that control is cheap, robust, safe, or semantically desirable.

## Assumptions under pressure

Access to a system is multidimensional. Measurement, reconstruction, prediction, and intervention are not the same capability.

## Rival reading

The state-space formalism may be a useful engineering representation rather than the system's uniquely correct decomposition. Observability and controllability characterize the chosen model as well as the physical plant.

## Possible displacement of the seed

**Candidate displacement:** the phrase “prediction and control” currently bundles different capabilities. A bounded interface may support control without full observability, or observation without controllability. The seed may need to separate what can be known from what can be changed.
