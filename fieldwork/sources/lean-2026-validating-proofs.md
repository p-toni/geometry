# source — Lean 2026: validating a Lean proof

Status: **stressed**  
Provenance: Lean Reference Manual, “Validating a Lean Proof,” accessed 2026-09-12. https://lean-lang.org/doc/reference/latest/ValidatingProofs/  
Branch: `proof-checking-and-trust-boundaries`

## Native question

How should a Lean proof be validated under different threat models, especially when the proof may be unreviewed or adversarial?

## Claims in the source's own terms

The manual distinguishes ordinary checking from stronger validation. `lean4checker` replays stored declarations through the Lean kernel. For high-risk or potentially malicious proofs, the manual presents `comparator` plus external checkers as the gold-standard path: build the candidate in a sandbox, export the proof, replay it outside the candidate's reach, and ensure that the proved theorem statements match trusted challenge statements.

The manual explicitly separates two questions: whether a theorem has a valid proof and what the theorem statement means.

## Evidence / argument actually offered

This is official operational guidance from the Lean project. It specifies escalating validation procedures, the trust each procedure requires, and the classes of errors or attacks each protects against.

## Explicit limits / unknowns

- No checker eliminates all trust; every route has a trusted computing base.
- Independent checking validates formal derivation, not the informal interpretation of the theorem.
- The strength required depends on the threat model.

## Assumptions under pressure

“Formally verified” is not a single binary property. The certificate has a target, a threat model, a trusted base, and a statement whose intended meaning must be checked separately.

## Rival reading

For normal honest developments, ordinary Lean kernel checking may already be more assurance than the practical context requires. The stronger comparator path is not a reason to distrust proof assistants generally; it is a response to a stronger adversarial model.

## Possible displacement of the seed

None directly. This displaces the **research verification fabric**: independent verification must specify not only the verifier but also the object being verified, the statement-fidelity check, and the remaining trusted base.
