# branch — compositional security

Role: **alien / hostile**  
Status: open

## Native question

Under what conditions does a protocol that is secure in isolation remain secure when embedded in an arbitrary larger environment with concurrent sessions and adversarial interaction?

## Why this branch exists

Cryptographic protocol theory has an unusually explicit answer to a problem that recurs elsewhere: local correctness or secrecy claims do not automatically compose into a system-level guarantee.

## Native vocabulary / literatures

Ideal functionality, real/ideal simulation, environment, adversary, universal composition, concurrent sessions, composability, modular proof.

## Competing explanations to preserve

- stand-alone security as sufficient for a particular deployment;
- universal composability as a stronger contextual guarantee;
- composition failures caused by shared state, scheduling, side information, or correlated outputs;
- system-level guarantees that require assumptions not visible in component contracts.

## What would make this branch matter

A precise distinction between a property of each component and a property of the composed system, especially when the environment can combine individually uninformative outputs into new information.

## Stop condition

Pause when further cryptographic machinery no longer changes the general composition distinction or supply a sharper independent verifier.
