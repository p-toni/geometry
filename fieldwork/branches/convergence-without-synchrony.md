# branch — convergence without synchrony

Role: **alien / cross-cutting**  
Status: open

## Native question

How can replicas that accept updates independently and out of order still converge to compatible state without requiring synchronous coordination?

## Why this branch exists

Conflict-free replicated data types provide explicit sufficient conditions for convergence in distributed systems where no replica has privileged global control over the update sequence.

## Native vocabulary / literatures

Eventual consistency, strong eventual consistency, CRDTs, semilattices, commutativity, monotonicity, replicas, merges, causality.

## Competing explanations to preserve

- state-based convergence;
- operation-based convergence;
- consensus / coordination-based consistency;
- application-specific conflict resolution;
- systems where convergence is insufficient because semantic invariants can still be violated.

## What would make this branch matter to the seed

A precise example of global consistency emerging from local update rules and algebraic constraints without synchronous global supervision—and a counterexample showing where convergence is not enough.

## Stop condition

Pause if 'convergence' gets generalized into stability or agreement without retaining the formal assumptions that make CRDT guarantees possible.
