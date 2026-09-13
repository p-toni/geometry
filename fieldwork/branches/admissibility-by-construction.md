# branch — admissibility by construction

Role: **alien / cross-cutting**  
Status: open

## Native question

How can a formal system prevent invalid runtime states by restricting what programs or transitions are admissible before execution?

## Native vocabulary / literatures

Type systems, type soundness, preservation, progress, operational semantics, static checking, well-typed programs, illegal/stuck states.

## Competing explanations to preserve

- static exclusion of invalid states;
- dynamic checking that permits broader programs but traps failures at runtime;
- dependent/refinement types that encode stronger properties;
- runtime invariants enforced by monitors rather than type systems.

## What would make this branch matter

A precise distinction between an epistemic partition over already-possible states and a constraint that changes which states or transitions can occur at all.

## Stop condition

Pause after the distinction between observation/checking and admissibility/reachability is explicit and formally testable; do not turn all constraints into “types.”
