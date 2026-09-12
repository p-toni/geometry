# source — von Neumann 1956: reliable organisms from unreliable components

Status: **stressed**  
Provenance: John von Neumann, “Probabilistic Logics and the Synthesis of Reliable Organisms from Unreliable Components,” in *Automata Studies*, Annals of Mathematics Studies 34, Princeton University Press, 1956, 43–98. https://www.jstor.org/stable/j.ctt1bgzb3s.5  
Branch: `reliable-computation-unreliable-components`

## Native question

How can automata compute reliably when the physical elements implementing logical operations have nonzero error rates?

## Claims in the source's own terms

Von Neumann treats error as an intrinsic feature of physical logic rather than an exceptional accident. He develops redundant organizations in which unreliable elements are combined with restoration/majority mechanisms so that the probability of logical failure can be driven down when component error remains below appropriate thresholds.

The central distinction is between the reliability of individual physical elements and the reliability of the larger logical organization they implement.

## Evidence / argument actually offered

The work is theoretical and mathematical, developing probabilistic models of unreliable logical components and architectures that suppress error through redundancy.

## Explicit limits / unknowns

- Guarantees depend on assumptions about error probabilities and dependence structure.
- Redundancy has cost in components, energy, latency and wiring.
- Strongly correlated or adversarial failures can defeat schemes designed for independent noise.
- Reliability of output does not imply semantic correctness of the specification being computed.

## Assumptions under pressure

A system-level invariant can be more reliable than the elements carrying it. What persists may be a corrected logical relation rather than any particular physical state or component trajectory.

## Rival reading

The phenomenon is not mysterious emergence: the increased reliability is purchased by explicit redundancy and assumptions about noise. Any analogy elsewhere must identify the actual restoring mechanism and failure model.

## Possible displacement of the seed

**Candidate displacement:** error integration can be constitutive rather than merely diagnostic. Some systems preserve structure by continuously correcting deviations, so persistence may depend on **repair dynamics**, not static invariance.
