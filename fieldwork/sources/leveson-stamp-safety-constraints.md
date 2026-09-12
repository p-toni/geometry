# source — Leveson: STAMP / safety as constraint enforcement

Status: **stressed**  
Provenance: Nancy Leveson, *Engineering a Safer World* (MIT Press, 2012) and MIT STAMP/STPA teaching material. https://direct.mit.edu/books/oa-monograph/2908/Engineering-a-Safer-WorldSystems-Thinking-Applied  
Linked branch: `admissibility-by-construction`

## Native question

How should safety be analyzed in complex sociotechnical systems when accidents can arise from unsafe interactions even without a simple component failure chain?

## Claims in the source's own terms

STAMP treats safety as a control problem. Hazards arise when safety-related constraints on system design and operation are not adequately enforced.

The framework shifts emphasis from preventing component failures alone toward constraining system behavior so hazardous states/interactions are excluded, prevented, or controlled.

Leveson's design guidance distinguishes inherently safe design, passive controls, and active controls; where possible, the strongest design is one that makes the hazardous state impossible rather than merely detecting or reacting to it after occurrence.

## Evidence / argument actually offered

The framework is developed through systems-theoretic analysis and extensive accident case studies in safety-critical domains. STPA operationalizes the model into hazard and control analysis.

## Explicit limits / unknowns

- STAMP is a safety-engineering framework, not a general theory of cognition or learning.
- Identifying the right hazards and constraints remains a modeling task and can be wrong or incomplete.
- Constraints can interact or conflict; enforcing one local safety rule does not guarantee system-level safety.

## Assumptions under pressure

Prediction is not the only route to avoiding failure. A system can sometimes gain safety by changing admissibility—making hazardous trajectories unreachable—rather than forecasting them accurately.

## Rival reading

Traditional probabilistic reliability and failure analysis remain useful for many hazards; systems-theoretic framing does not make component-level reliability irrelevant.

## Possible displacement of the working backbone

**Candidate displacement:** accessibility is not only a passive fact to be learned. Designed constraints can intentionally reshape the reachable state space so that desired guarantees depend less on prediction.
