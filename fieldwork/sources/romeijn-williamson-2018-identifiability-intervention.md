# source — Romeijn & Williamson 2018: intervention and identifiability

Status: **stressed**  
Provenance: Jan-Willem Romeijn & Jon Williamson, “Intervention and Identifiability in Latent Variable Modelling,” *Minds and Machines* 28(2), 2018, 243–264. DOI: 10.1007/s11023-018-9460-y. https://pmc.ncbi.nlm.nih.gov/articles/PMC6438491/  
Branch: `intervention-and-identifiability`

## Native question

If several statistical hypotheses assign the same likelihood to every ordinary observation, can intervention data make them identifiable?

## Claims in the source's own terms

An unidentified model contains distinct hypotheses that fit the observational data equally well. More observations of the same type therefore need not select a unique hypothesis. The authors show, for latent-variable examples connected to Bayesian networks, how intervention data can under stated causal assumptions distinguish hypotheses that passive data cannot.

## Evidence / argument actually offered

The paper gives formal examples of statistical unidentifiability, maps them to causal Bayesian-network structure, and shows how altering the data-generating process can provide discriminating information.

## Explicit limits / unknowns

- The proposed method is not developed in full generality for every latent-variable model.
- Intervention works only with assumptions about the causal structure and intervention semantics.
- Some ambiguity is not practically removable.

## Assumptions under pressure

More data is not always more discrimination. If the measurement channel maps distinct hypotheses to the same evidence, progress may require changing the experiment rather than increasing sample size.

## Rival reading

Theoretical criteria can sometimes resolve underdetermination without intervention, and badly chosen interventions can add cost without identifiability. Intervention is a tool, not an automatic cure.

## Possible displacement of the seed

**Candidate displacement:** “the world answers” is incomplete unless the interface/probe makes rival models answer differently. Contact can occur without discrimination. A useful probe changes the observation channel when necessary.
