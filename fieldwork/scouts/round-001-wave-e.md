# round 001 — selective fresh-start wave E

Status: **open**  
Mode: selective state-space exploration / fresh start  
Seed visibility for scouts: **none**  
Inherited backbone/collision summaries: **none**

Wave E follows the first source-closed reconstruction. It is intentionally smaller than wave D because the round now spends more budget on discriminating probes. The cells below were generated in native language without asking what would support the working backbone.

## Frontier cells

| # | Native domain | Native question | Status |
|---|---|---|---|
| 01 | Metrology | What makes measurements made by different instruments and laboratories comparable to a common reference, and where does uncertainty enter the chain? | promoted |
| 02 | Cryptographic protocol theory | Under what conditions do security guarantees survive arbitrary composition with other protocols and concurrent sessions? | promoted |
| 03 | Model checking | When can exhaustive state-space exploration establish a temporal property of a finite system rather than merely sample likely executions? | promoted |
| 04 | Evolutionary ecology | How can organisms modify the selective environments that subsequently act back on them and later generations? | promoted |
| 05 | Safety engineering | How can a design exclude hazardous states or enforce safety constraints rather than only estimate failure probabilities? | source-linked |
| 06 | Statistical decision theory | How do optimal decisions change when the loss function changes while observations stay fixed? | scout |
| 07 | Database provenance | What record is sufficient to explain how a query result was produced and which inputs contributed to it? | scout |
| 08 | Game theory / common knowledge | Which coordination outcomes require facts to be mutually known at increasing levels rather than merely true for each participant? | scout |
| 09 | Manufacturing tolerances | When can independently acceptable component tolerances accumulate into an unacceptable assembly? | scout |
| 10 | Reproducibility science | Which parts of an experimental claim must be repeated, independently reconstructed, or remeasured for a replication to count? | scout |
| 11 | Legal precedent | How can later cases alter the operational meaning of a rule while maintaining enough continuity for reliance? | scout |
| 12 | Ecological networks | How do network topology and correlated failures change system-level robustness beyond node-level reliability? | scout |
| 13 | Adversarial robustness | When can a classifier remain accurate on ordinary data yet fail under inputs chosen to exploit its decision boundary? | scout |
| 14 | Experimental design | How should an experiment be selected when several models fit existing data but predict different interventions? | scout |
| 15 | Algorithmic statistics | When does a short description capture regularity rather than merely compress accidental detail? | scout |
| 16 | Architecture / regulation | How do building codes, zoning rules, and physical constraints alter which designs are legally and physically realizable before construction begins? | scout |

## Promotion — first four

1. `metrological-traceability` — a native account of reliable contact as a documented calibration chain with uncertainty;
2. `compositional-security` — a formal field where local guarantees are explicitly required to survive environmental composition;
3. `exhaustive-state-space-verification` — a native contrast between exploration and proof of a state-space property;
4. `niche-construction-feedback` — a biological case where agents modify the future selective environment rather than merely move inside a fixed one.

Safety engineering is source-linked to the existing `admissibility-by-construction` collision rather than opening a fifteenth active branch.

## Stop condition

Do not promote additional wave-E cells merely to increase coverage. Promote only if the current four stop producing new discriminators or if a live collision specifically needs another native mechanism.
