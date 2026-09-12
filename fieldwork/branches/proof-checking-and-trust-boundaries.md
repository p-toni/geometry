# branch — proof checking and trust boundaries

Role: **cross-cutting**  
Status: open

## Native question

What exactly has been established when a formal proof assistant accepts a proof, and what remains outside that certificate?

## Why this branch exists

AI-generated mathematics makes the distinction operational. Proof checking can be mechanically severe while still depending on the theorem statement, imported axioms and definitions, the checker implementation, and the relation between the formal statement and the informal claim people care about.

## Native vocabulary / literatures

Proof assistants, kernel, trusted computing base, proof term, theorem statement, axioms, elaboration, independent checker, formalization gap, semantic fidelity, adversarial proof checking.

## Competing explanations to preserve

- kernel acceptance is sufficient for the formal theorem under the stated assumptions;
- high-stakes or adversarial proofs require independent checking beyond the ordinary build;
- even perfect derivational checking leaves a separate question of whether the formal statement captures the intended mathematics;
- social mathematical understanding and uptake remain distinct from machine verification.

## What would make this branch matter

A clean decomposition of verification into boundaries that changes how fieldwork promotes claims, especially claims produced by the same AI system that proposes them.

## Stop condition

Pause when additional proof-assistant literature only repeats the same trust-boundary decomposition without changing a verification contract or producing a new failure mode.
