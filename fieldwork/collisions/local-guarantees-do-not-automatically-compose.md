# collision — local guarantees do not automatically compose

Status: **open after probe**

## Independently developed inputs

- fault-tolerant computation: system-level reliability can exceed component reliability through explicit redundancy / restoration structure;
- CRDTs: convergence depends on algebraic conditions on local updates and merges;
- universal composability: security guarantees require a contract designed to survive contextual composition;
- exact probe `local-independence-does-not-compose`: two locally secret-independent outputs jointly reveal the secret.

## Displacement

“Where does the property hold?” cannot be answered without naming the boundary at which it was verified.

A component property and a system property are different claims. Some properties compose only under additional structural assumptions; others can disappear or reverse when components are combined.

## Distinction created

```text
local property
≠ composition rule
≠ global property
```

## What this does not establish

It does not show that composition usually fails, nor that local verification is weak. It shows only that **boundary enlargement creates a new proof obligation** unless a composition theorem or contract discharges it.

## Next discriminator

Find two genuinely different domains in which a local guarantee either does or does not lift to a larger boundary, and identify the minimal extra condition that decides which case holds.
