# branch — exhaustive state-space verification

Role: **alien / cross-cutting**  
Status: open

## Native question

When can exhaustive exploration of a finite-state model establish that every reachable execution satisfies a temporal property, rather than merely sampling likely trajectories?

## Why this branch exists

Model checking turns state-space exploration into a verifier when the model and property are explicit. It therefore provides a native contrast between searching a space and certifying a claim about all reachable states or paths in that model.

## Native vocabulary / literatures

Transition systems, reachability, temporal logic, CTL/LTL, safety, liveness, state explosion, abstraction, counterexample, model checking.

## Competing explanations to preserve

- exhaustive exploration as proof relative to a finite model;
- simulation / testing as trajectory sampling;
- abstraction as necessary but potentially lossy reduction;
- theorem proving as a different verification route.

## What would make this branch matter

A clean distinction between **exploration coverage** and **verification coverage**. More explored states do not automatically imply a verified property; verification requires an explicit property and a model whose reachable space is actually covered or soundly abstracted.

## Stop condition

Pause when additional model-checking examples only restate exhaustive search without adding a new boundary around model fidelity, abstraction, or property specification.
