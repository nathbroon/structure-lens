# Drug-space map (data/drugspace.json)

1. ClinTox (MoleculeNet) from github.com/GLambard/Molecules_Dataset_Collection,
   FDA_APPROVED = 1 only. Largest fragment and neutralised with RDKit
   (rdMolStandardize LargestFragmentChooser + Uncharger) -> clintox_std.csv.
2. `node space.js` computes the descriptors with RDKit.js 2026.03.6 (the same
   library the page uses, so projected compounds line up exactly);
   `node arom.js` adds RDKit QED's aromatic-ring count.
3. PCA (numpy SVD) on z-scored MW, Crippen cLogP, TPSA, Lipinski HBD/HBA,
   rotatable bonds, aromatic rings and Fsp3, for drugs with MW 100-1000.
   PC1 (43%) follows polarity; PC2 (24%) follows size, aromaticity and cLogP.
   The file stores the means, SDs, loadings and every drug's coordinates and
   SMILES, so the page projects a new structure with the same transform.

`qed_params.json` holds RDKit's QED parameters, acceptor SMARTS and 116
structural alerts (exported from rdkit.Chem.QED). The page's QED matches
RDKit's to 1e-15 on all 1,386 approved drugs.
