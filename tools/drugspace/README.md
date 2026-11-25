# Drug-space map (data/drugspace.json)

1. ClinTox (MoleculeNet) from github.com/GLambard/Molecules_Dataset_Collection,
   FDA_APPROVED = 1 only. Largest fragment and neutralised with RDKit
   (rdMolStandardize LargestFragmentChooser + Uncharger) -> clintox_std.csv.
2. `node space.js` computes the descriptors with RDKit.js 2026.03.6 (the same
   library the page uses, so projected compounds line up exactly);
   `node arom.js` adds RDKit QED's aromatic-ring count.
3. PCA (numpy SVD) on z-scored MW, Crippen cLogP, TPSA, Lipinski HBD/HBA,
   rotatable bonds, aromatic rings and Fsp3, for drugs with MW 100-1000.
   (From version 1.1 Fsp3 is replaced by the plane of best fit; see step 5.)
   The file stores the means, SDs, loadings and every drug's coordinates and
   SMILES, so the page projects a new structure with the same transform.

4. `node scaffolds.js ../../data/drugspace.json` adds each drug's eight
   descriptors (`desc`, in the order of `descriptors`) and Bemis–Murcko
   scaffold (`scaffold`, an index into `scaffolds`). The scaffold code is the
   same as the page's: side chains removed, exocyclic double bonds kept, stereo
   ignored, `""` for acyclic drugs. It matches RDKit's MurckoScaffold on 1,292
   of 1,294 drugs; the other two are dye cations where RDKit.js puts an H on
   the iminium nitrogen. The page uses `desc` for the typicality score and
   property profile, and `scaffold` to find drugs with the same scaffold. A
   data file without these fields still works: the page then works them out
   itself, which takes several seconds on a phone.

5. Plane of best fit (Firth, Brown & Blagg, J. Chem. Inf. Model. 2012,
   doi:10.1021/ci300293f). `node pbf.mjs ../../data/drugspace.json 0 1294 pbf.json`
   builds one conformer per drug exactly as the page does (OpenChemLib 9.25.2
   ConformerGenerator, seed 1, MMFF94s+ 600 iterations) and takes the mean
   distance of the heavy atoms from their least-squares plane. It agrees with
   RDKit's CalcPBF on the same coordinates. About 1.5 s per drug.
   `python3 pca_pbf.py ../../data/drugspace.json pbf.json` puts PBF in place of
   Fsp3 and redoes the PCA: PC1 (45%) follows polarity and size; PC2 (26%)
   follows cLogP, size, aromatic rings, rotatable bonds and PBF.

6. Complexity and 3D shape. `node shape.mjs ../../data/drugspace.json 0 1294 shape.json`
   gives PBF, NPR1 and NPR2 (Sauer & Schwarz 2003; mass-weighted, heavy
   atoms) from the same conformer pipeline. Then
   `RDKIT=... node complexity.js ../../data/drugspace.json shape.json` adds
   `cx` = { keys, v }: pbf, npr1, npr2, Bertz CT (`bertz.js`, a port of
   RDKit's BertzCT that matches RDKit to 1e-6 on every drug), Fsp3,
   stereocentres, spiro atoms, bridgehead atoms and Kier Phi. OpenChemLib's
   conformer search is reproducible for all but a couple of large flexible
   drugs between runs (PBF r = 0.999).

`qed_params.json` holds RDKit's QED parameters, acceptor SMARTS and 116
structural alerts (exported from rdkit.Chem.QED). From version 1.1 the page
uses only the alerts; QED was replaced by the typicality score.
