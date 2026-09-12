# source — Tishby, Pereira & Bialek 2000: the information bottleneck method

Status: **stressed**  
Provenance: Naftali Tishby, Fernando C. Pereira, William Bialek, “The Information Bottleneck Method,” arXiv:physics/0004057 (conference version 1999; arXiv 2000). https://arxiv.org/abs/physics/0004057  
Branch: `relevant-information-under-bottleneck`

## Native question

How should a limited code for a variable X be constructed when the goal is not faithful reconstruction of X itself but preservation of the information in X that is relevant to another variable Y?

## Claims in the source's own terms

The paper defines relevant information by the statistical dependence between X and Y. It seeks a compressed representation of X that minimizes retained information about X while preserving as much mutual information as possible about Y.

The method generalizes rate-distortion theory by letting the effective distortion measure arise from the joint statistics of X and Y rather than requiring it to be specified externally in the usual form.

The resulting tradeoff is formal: more compression generally loses information relevant to prediction of Y, while less compression preserves more of X.

## Evidence / argument actually offered

The contribution is mathematical. The authors derive a variational optimization problem and self-consistent equations for the encoder and decoder and describe an iterative method for finding solutions.

## Explicit limits / unknowns

- Relevance is defined relative to the chosen Y. The method does not determine which downstream variable ought to matter.
- Mutual information preservation is not equivalent to semantic understanding, causal explanation, or agency.
- The framework is statistical; it does not require an internal world model or a cognitive learner.

## Assumptions under pressure

A representation can be intentionally lossy and still be optimal for a specified prediction problem. “More information retained” is therefore not synonymous with “better representation.”

## Rival reading

The framework may simply formalize task-specific compression. It does not show that cognition in general should be understood as compression, nor that every useful abstraction is information-bottleneck optimal.

## Possible displacement of the seed

**Candidate displacement:** compression should not sit in the chain as an unqualified good or generic mechanism. The operative quantity may be **relevant retained structure relative to a task**, and relevance itself is an unresolved external choice. This makes “what is preserved for what?” prior to any claim that compression enables prediction or control.
