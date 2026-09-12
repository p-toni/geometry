---
name: anti-collapse-research
description: Explore a question broadly without making the current Geometry thesis the search ontology. Use for autonomous fieldwork, literature exploration, source ingestion, competing explanations, and research synthesis.
---

# Anti-collapse research

## Constitution

> Attraction chooses where to look.  
> Native understanding comes before translation.  
> Difference decides what deserves attention.  
> Contact decides what survives.

The current thesis is an experimental object, not the organizing ontology of search.

A bounded learner can use the research system to explore vastly more possibilities than the learner has to carry. Search width may grow faster than human-facing complexity.

## Start

Read, in order:

1. `fieldwork/seed.md`
2. `fieldwork/index.yml`
3. `fieldwork/state-space-exploration.md`
4. `fieldwork/verification.md`
5. relevant files in `fieldwork/scouts/`, `branches/`, `sources/`, and `collisions/`

Do not begin by searching Geometry vocabulary unless the branch itself is explicitly about that vocabulary.

## Protocol

### 0. Freeze

Treat `seed.md` as immutable for the round. New formulations go in a synthesis file or candidate note, never silently into the seed.

### 1. Blind scout

Before deep branching, open a broad frontier of native questions.

A blind scout does **not** receive the seed, essays, or collision map. Give it only the native question and enough domain context to search responsibly.

A scout returns:

- the domain's own statement of the problem;
- one or two strong entry sources;
- a visible internal disagreement, if any;
- whether deeper investigation appears warranted.

Do not translate the scout result into Geometry language. A scout may legitimately return “no branch here.”

Typical broad pulse: 24–40 scout cells.

### 2. Promote and diverge

Promote only scouts that earned depth through a native distinction, competing mechanism, anomaly, intervention, falsification opportunity, or useful alienness.

Maintain multiple relationships to the current seed once branches are promoted:

- **adjacent** — studies the same phenomena from nearby work;
- **rival** — explains the same phenomena differently;
- **hostile** — argues the framing is unnecessary, metaphorical, unfalsifiable, or confused;
- **alien** — investigates a potentially analogous phenomenon in a domain that does not share our language;
- **cross-cutting** — changes the boundary or level at which several branches must be described.

These are search roles, not an ontology. Do not force equal quotas, but do not synthesize while an entire role is absent without recording why.

Keep the sustained native working set roughly 8–14 branches unless independence or depth degrades.

### 3. Native pass

For each serious source, create `fieldwork/sources/<id>.md` before relating it to Geometry.

Record:

- source and provenance;
- native question;
- claims in the source's own terms;
- evidence / argument actually offered;
- assumptions;
- explicit uncertainties and limits;
- strongest rival reading you can identify;
- only then: possible displacement of the seed.

If you cannot explain the source without our vocabulary, the native pass failed.

### 4. Stress

Ask what the framework rules out, what would count against it, what a simpler account explains, and where metaphor may be doing work that mechanism has not earned.

Do not repair the source on its behalf.

### 5. Collide

Create a collision only when two or more independently understood branches create pressure that cannot be represented as simple agreement.

A useful collision contains at least one of:

- a new distinction;
- an unresolved contradiction;
- a discriminating question;
- a candidate probe;
- a change in the level at which the learner/system/boundary must be defined.

Semantic resemblance does not count.

Keep only two to four collisions in the active integrator working set. Others may remain open without being simultaneously synthesized.

### 6. Verify / contact

Turn the strongest collision into a probe only when live alternatives can be made to differ under a constraint.

Minimum form:

```text
A predicts / permits / requires X
B predicts / permits / requires Y
constraint C can distinguish X from Y
```

Every promoted probe must use `fieldwork/templates/probe.md` and carry the verification contract from `fieldwork/verification.md`.

Prefer the cheapest discriminating probe, not the grandest experiment. Valid contact can include empirical intervention, formal proof/verification, historical evidence, behavioral prediction, executable tests, a built artifact, an external decision with observable consequence, or another explicit constraint the map cannot negotiate with.

Discovery and justification are separate jobs. The verifier should be as independent of the claim-generation mechanism as the domain permits.

Promote zero to two probes at once by default. A cheap probe can be more valuable than another wave of reading.

### 7. Source-closed synthesis

Periodically stop retrieval. With sources closed, write:

- questions that now exist but did not before;
- distinctions that survived;
- what the seed can no longer say honestly;
- what remains load-bearing;
- unresolved alternatives;
- next discriminating probes.

Then reopen sources only to correct provenance and overclaiming.

Trigger a reset when new branches mostly rename old distinctions, source cards become predictable, one vocabulary dominates, or large search spend stops changing the human-facing displacement.

### 8. Revision

A seed can be preserved, weakened, split, expanded, or broken. Do not optimize for continuity.

Probe results may revise the seed only when:

1. the discriminator was stated before the result;
2. the verifier was sufficiently independent;
3. the result survived checking appropriate to its claim type;
4. the displacement can be reconstructed source-closed;
5. it changes a prediction, decision, distinction, or statement we would otherwise retain.

Cross-domain claims need heterogeneous survival before becoming canon. Several neighboring citations are not heterogeneous contact.

Published essays change only after this stage.

## Promotion ladder

```text
scout → branch       fertility
branch → collision   displacement
collision → probe    discriminability
probe → seed         independent survival + reconstruction
seed → canon         heterogeneous survival
```

Admission gets cheaper upstream. Proof obligations get stricter downstream.

## Human carrying budget

The research system carries the frontier. The human carries the consequences.

Default update:

- surface at most three to five material displacements;
- do not dump the literature frontier;
- summarize dead branches statistically unless a failure is itself informative;
- preserve unresolved alternatives.

## Anti-patterns

- literature tour;
- citation accumulation;
- 'everyone is saying Geometry';
- global synthesis on first contact;
- turning uncertainty into one larger metaphor;
- letting scouts see the answer they are supposed to find;
- promoting a collision that cannot yet discriminate alternatives;
- using the generator as its only verifier when a stronger independent constraint exists;
- using the model's prose fluency as evidence of ownership;
- treating attraction as truth rather than search allocation.

## File templates

Use the templates under `fieldwork/templates/`. Keep schemas small. If the schema starts deciding what can be discovered, weaken it.
