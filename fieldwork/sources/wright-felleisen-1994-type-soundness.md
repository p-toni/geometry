# source — Wright & Felleisen 1994: a syntactic approach to type soundness

Status: **stressed**  
Provenance: Andrew K. Wright & Matthias Felleisen, “A Syntactic Approach to Type Soundness,” *Information and Computation* 115(1), 1994, 38–94. DOI: 10.1006/inco.1994.1093. https://www.sciencedirect.com/science/article/pii/S0890540184710935  
Branch: `admissibility-by-construction`

## Native question

How can a static type system guarantee that programs accepted as well typed do not encounter specified classes of runtime type errors?

## Claims in the source's own terms

The paper develops a syntactic method for proving type soundness for languages with polymorphism and effects. The core strategy relates typing judgments to operational semantics through properties such as subject reduction / preservation.

In the now-standard formulation, type safety is supported by two distinct obligations: **preservation**, where evaluation steps preserve typing, and **progress**, where a well-typed term is either already a value or can take another valid step.

The guarantee is therefore not post-hoc recognition of bad executions. A type discipline restricts the set of accepted programs so that certain stuck/error states are unreachable for that accepted set, relative to the formal semantics.

## Evidence / argument actually offered

The contribution is formal. The authors prove soundness for a core of Standard ML including polymorphism and features such as references, exceptions, and continuations.

## Explicit limits / unknowns

- Type soundness only excludes the errors encoded by the type system; it is not total program correctness.
- A well-typed program can still violate application-level requirements, security policies, performance goals, or terminate incorrectly.
- Different type systems admit different program sets and prove different safety properties.

## Rival reading

The result is about formal language design, not a universal theory of constraints. Dynamic checking or runtime enforcement can provide different tradeoffs without statically shrinking the admitted program space.

## Possible displacement

**Candidate displacement:** “cut” conflates two operations. An **epistemic cut** groups or ignores distinctions in a representation; an **admissibility constraint** can change the reachable state space itself by excluding programs/transitions before execution. These should not be treated as one primitive without argument.
