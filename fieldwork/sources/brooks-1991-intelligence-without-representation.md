# source — Brooks 1991: intelligence without representation

Status: **stressed**  
Provenance: Rodney A. Brooks, “Intelligence without representation,” *Artificial Intelligence* 47 (1991), 139–159. https://people.csail.mit.edu/brooks/papers/representation.pdf  
Branch: `geometry-as-metaphor`

## Native question

How should an autonomous intelligent system be built if it must continuously perceive and act in a real environment rather than reason from a complete internal world model?

## Claims in the source's own terms

Brooks argues for incrementally building complete situated agents whose capabilities are tested through real sensing and action. In the simple autonomous robots studied, explicit internal representations and models were not required for competent behavior and could get in the way.

His provocative conclusion is that the world can function as its own model, and his broader hypothesis is that “representation” is the wrong unit of abstraction for much of intelligent behavior. Behavior emerges from layered perception–action competencies rather than a central symbolic model that first reconstructs the world.

## Evidence / argument actually offered

The argument is grounded in a series of behavior-based autonomous mobile robots and the subsumption architecture. Brooks contrasts their incremental, situated construction with then-dominant symbolic AI systems and argues from engineering performance and architectural simplicity.

## Explicit limits / unknowns

- The strongest evidence concerns relatively simple embodied intelligence, not mathematics, long-horizon planning, language, or detached counterfactual reasoning.
- “Representation” is itself contested; a critic can interpret sensor states, activity layers, or control signals as representations in a weaker functional sense.
- Success without a central world model does not establish that no internal structure whatsoever contributes to behavior.

## Assumptions under pressure

The paper rejects the assumption that competent navigation or control implies an explicit internal map. Continuous coupling to the environment can carry part of the burden that an internal representation would otherwise carry.

## Rival reading

Later embodied-cognition debates note that Brooks's systems still contain signals with apparent semantic and control roles. The result may therefore be a case against *central, explicit, detached* representations rather than against representation in every sense.

## Possible displacement of the seed

**Candidate displacement:** prediction/control/navigation do not automatically imply that a learner contains an internal geometry. Some useful structure may live in the ongoing agent–environment relation, or in the environment itself. If Geometry requires an internal map, this source is hostile; if Geometry is relational, the boundary must be stated rather than assumed.
