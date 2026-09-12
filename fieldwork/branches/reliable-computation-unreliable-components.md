# branch — reliable computation from unreliable components

Role: **alien / cross-cutting**  
Status: open

## Native question

How can a system preserve correct logical behavior when its physical components fail probabilistically?

## Why this branch exists

Fault-tolerant computation gives a formal case where reliability is an emergent property of architecture, redundancy, restoration and error thresholds rather than a property every component must possess.

## Native vocabulary / literatures

Noisy gates, redundancy, majority restoration, multiplexing, fault tolerance, error thresholds, logical versus physical state.

## Competing explanations to preserve

- von Neumann-style multiplexing and majority restoration;
- coding/concatenation approaches;
- component hardening rather than architectural correction;
- correlated-error regimes where independence assumptions break threshold guarantees.

## What would make this branch matter to the seed

If stable logical structure can persist despite component-level error, then persistence and truth at one level cannot be inferred directly from fidelity at another. The architecture that catches and repairs deviation becomes part of the invariant.

## Stop condition

Pause when additional work only changes numerical thresholds without altering the distinction between component reliability, logical reliability, and the assumptions that let redundancy improve the latter.
