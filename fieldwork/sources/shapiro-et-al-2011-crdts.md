# source — Shapiro et al. 2011: conflict-free replicated data types

Status: **stressed**  
Provenance: Marc Shapiro, Nuno Preguiça, Carlos Baquero & Marek Zawirski, “Conflict-free Replicated Data Types,” 2011. https://perso.lip6.fr/Marc.Shapiro/papers/2011/CRDTs_SSS-2011.pdf  
Branch: `convergence-without-synchrony`

## Native question

What algebraic conditions let replicated state converge even when different replicas accept concurrent updates without remote synchronization?

## Claims in the source's own terms

The paper formalizes sufficient conditions for **strong eventual consistency**. Two major constructions are developed:

- state-based CRDTs, where replicas merge states under operations with appropriate monotonic / join-semilattice structure;
- operation-based CRDTs, where delivered update operations commute under the required conditions.

Replicas can therefore converge despite asynchronous delivery and failures without requiring each update to be globally serialized through a central coordinator.

## Evidence / argument actually offered

The work is formal and constructive. It defines consistency conditions, proves sufficient properties for convergence, and applies them to replicated data types.

## Explicit limits / unknowns

- Convergence of replicas does not imply that an application-level invariant is preserved.
- CRDT guarantees depend on precise assumptions about merge functions, delivery, causality, or operation properties.
- Eventual agreement is weaker than immediate consistency and may be inappropriate for some domains.

## Assumptions under pressure

Global agreement can be a consequence of constrained local operations rather than global synchronization. But “all replicas converge” is only one notion of correctness.

## Rival reading

Coordination-free convergence is not a universal replacement for consensus. Some invariants require coordination, and an algebraically convergent state can still be semantically invalid for the application.

## Possible displacement of the seed

**Candidate displacement:** a larger system can acquire global consistency without any component having a complete global view, if local update and merge rules are sufficiently constrained. This sharpens the difference between **convergence**, **correctness**, **understanding**, and **control**.
