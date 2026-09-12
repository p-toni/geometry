# collision — order without a global view

Status: **open**

## Independent inputs

- `lamport-1978-time-clocks-ordering` — distributed systems can derive a causal partial order and construct an operational total order without a universal shared clock.
- `hutchins-1991-organizing-work-by-adaptation` — a work system can reorganize successfully before any participant represents the global solution.
- `giere-2007-distributed-cognition-without-knowing` — distributed cognitive processing does not automatically create a distributed epistemic subject.
- `openai-2026-navier-stokes` — a live case where search, synthesis, formalization, and verification are distributed across many agents and stages.

## Why this is a collision rather than an agreement

Lamport gives a formal case where system-level coordination emerges from local causal relations plus a convention; Hutchins gives an empirical organizational case; Giere blocks the inference from distributed processing to a distributed knower.

The collision is that **global coherence, global representation, and global epistemic agency are different properties**.

## New distinction / contradiction

Track separately:

1. **causal order** — which events can influence which others;
2. **operational order** — an imposed convention sufficient for coordination;
3. **global state** — a system-level description available to an analyst or protocol;
4. **global view** — a component actually possesses that description;
5. **global understanding** — a subject can reconstruct and reason through it;
6. **global responsibility** — someone or something is answerable for the result.

A distributed system may have 1–3 without 4–6.

## Pressure on the seed

If a “learner” is defined by successful system-level adaptation, the unit can exist without a single internal viewpoint. If a learner is defined by understanding or epistemic responsibility, the boundary may be elsewhere.

This makes `where is the learner?` a bundle of questions rather than one question.

## What remains unresolved

How much local reconstruction is necessary for responsible reliance on a globally verified result, and whether a formal verification boundary can substitute for any missing global human understanding.

## Candidate discriminating probe

Use one theorem-level claim from the OpenAI Navier–Stokes artifact. Trace its causal/order structure from search proposal through synthesis, Lean formalization, checking, and human uptake. Record which of the six properties above is present at each stage.

The probe should make it possible to describe the system without saying either “the whole system knows” or “nothing is known until one human contains the proof.”
