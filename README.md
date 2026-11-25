# Structure Lens

Photograph a chemical structure on your phone, read it with DECIMER running
on the phone, then see RDKit properties and what PubChem, ChEMBL, Wikipedia,
SureChEMBL and UniChem know about it.

## Install on GitHub Pages (free, no command line)
GitHub's browser upload fails on large commits, so the files are in four
folders. Upload them one commit at a time, in order.

1. On github.com create a new **public** repository, e.g. `structure-lens`.
2. Click **uploading an existing file**. Open folder `1-site`, select
   everything inside it (`index.html`, `.nojekyll`, `tools`) and drag it onto
   the upload area. **Commit changes**.
3. Back on the repository page: **Add file > Upload files**. Open folder
   `2-model` and drag the **`decimer` folder** (the folder itself, not its
   contents) onto the upload area. **Commit changes**.
4. Repeat step 3 with `3-model`, then with `4-model`. Each adds its files to
   the same `decimer` folder on GitHub.
5. Check that the repository's `decimer` folder holds 12 files: manifest.json,
   vocab.json, encoder.onnx.part1-6 and decoder_step.onnx.part1-4.
6. **Settings > Pages**: Deploy from a branch, branch **main**, folder
   **/ (root)**, **Save**. After a minute the page is live at
   `https://<your-username>.github.io/structure-lens/`. Open it in Safari on
   the iPhone; Share > Add to Home Screen gives it an app icon.

The first recognition downloads the model (about 84 MB) once; after that it
runs offline. Don't use Git LFS for the model parts: GitHub Pages does not
serve LFS files.

Any other HTTPS host works too (e.g. croftware.com): upload the folder as is.

Open the page from its web address. Inside another app's file viewer (the
Claude app, the Files app, mail attachments) connections to PubChem, ChEMBL
and Wikipedia are blocked. The page shows a red banner when this happens,
and "Connection check" at the bottom lists which service failed and why.

To load the model without hosting it, copy the files in `decimer/` to the
phone and use Recognition settings > "Load model files from phone".

## What the app shows
Five tabs along the bottom, three buttons along the top.

- **Scan**: the photo with Take photo, Choose image and Example below it,
  then the detected structure, name, formula, InChIKey and SMILES.
- **Properties**, compared with 1,294 FDA-approved drugs (ClinTox):
  - *Typicality*: the Mahalanobis distance from the centre of approved-drug
    property space over eight RDKit properties, given as the share of
    approved drugs that lie further out; it names any property outside the
    central 90%.
  - *Property profile*: each property against the approved-drug
    distribution, with its percentile and the Lipinski/Veber limits. The
    eight properties are MW, cLogP, TPSA, HBD, HBA, rotatable bonds,
    aromatic rings and the plane of best fit (PBF, Firth, Brown & Blagg 2012),
    a measure of 3D shape from one OpenChemLib conformer. Fsp3 is shown
    after them for comparison.
  - *Complexity and 3D shape*: the PMI triangle (rod, disc, sphere) with
    the approved drugs, and PBF, NPR1, NPR2, Bertz CT, Fsp3, stereocentres,
    spiro and bridgehead atoms and Kier Φ, each with its percentile among
    approved drugs, plus PubChem's complexity value. Kappa and chi indices
    are under All descriptors.
  - ESOL logS, rule checks with every criterion, and the 116 structural
    alerts (Brenk et al. 2008, as used in RDKit) highlighted on the structure.
  - The drug-space map (PCA of the same eight properties) and the approved
    drugs that share the compound's Bemis–Murcko scaffold (up to 12, ranked
    by Morgan Tanimoto similarity).
  - All descriptors, grouped. `data/drugspace.json` holds the drugs, their
    descriptors and scaffolds; `tools/drugspace/` explains how it was built.
- **3D**: an interactive model (rotate, zoom, styles, hydrogens, spin). One
  conformer from OpenChemLib, minimised with MMFF94s, shown with 3Dmol.js.
- **Sources**: Wikipedia, ChEMBL, patents, PubChem and UniChem
  cross-references, one tab each. Patent counts, numbers, titles, priority
  dates and assignees come from PubChem; the SureChEMBL ID (from UniChem)
  links to SureChEMBL.
- **Report**: a one-page summary with a QR code, plus Save PDF, Share PDF
  and Link and QR. The PDF (made on the device with jsPDF) holds everything
  the app found for the structure, with live links to every database entry,
  patent, similar drug and reference.
- **History** (clock, top bar): past structures with thumbnails, kept on the
  phone; export and import as JSON.
- **Share** (top bar): share or copy the structure's link, and a QR code of
  the link or of the SMILES.
- **Settings** (gear): theme, recognition, connection check, release notes,
  and the licences of every component and data source.

## Links
Any structure can be opened directly:
`https://nathbroon.github.io/structure-lens/#smiles=CC(=O)Oc1ccccc1C(=O)O`.
Escape `#` as `%23`, `+` as `%2B` and `[` `]` as `%5B` `%5D` (the Share
button does this). Add `&tab=3d` (or `props`, `src`, `report`) to open a
tab. `#whats-new` opens the release notes.

If `decimer/` or `data/` is missing next to `index.html` (for example a
downloaded copy), the page fetches them from
`https://nathbroon.github.io/structure-lens/`.

## Updating an existing deployment
For 1.1 only text files changed. On GitHub use **Add file > Upload files**
and upload `index.html`, `README.md`, `CHANGELOG.md` and
`THIRD_PARTY_LICENSES.md`, then commit. The model files stay as they are.

## About the model
`decimer/` is the DECIMER TFLite model, split into parts of 9.5 MB
(`manifest.json` lists them; the page joins them), (DECIMER_model_new.tflite) converted
for the browser:

- The TFLite file uses TensorFlow "Flex" TensorList ops inside a while-loop,
  which no browser runtime supports. `tools/surgery.py` splits it into an
  image encoder and a single decoder step (no Flex ops); the page runs the
  token loop itself. Both parts were converted to ONNX with tf2onnx and run
  with ONNX Runtime Web.
- The TFLite file carries no tokenizer. `vocab.json` (47 tokens) was
  recovered by running the model on ~1,450 RDKit-drawn molecules and
  decoding against their InChIKeys (`tools/calib.py`, `tools/vocab2.py`).
  On that set: 88% exact InChIKey, 93% same skeleton. Token ids never seen
  (rare elements, Markush R-groups) show as `*` and are flagged.
- Preprocessing in the page mirrors DECIMER's `decode_image()`.

If you can get `tokenizer_SMILES.pkl` from the DECIMER models.zip, the full
vocabulary can replace `vocab.json` (index_word, keys as strings).

## Data sources
PubChem PUG REST and PUG-View (including patents), ChEMBL API, Wikidata
SPARQL + Wikipedia REST, UniChem. SureChEMBL's API does not accept requests
from other websites, so the app links to SureChEMBL rather than querying it. RDKit.js 2026.03.6, ONNX Runtime Web 1.30.0, 3Dmol.js 2.5.5,
OpenChemLib 9.25.2, jsPDF 4.2.1 and QR Code Generator 2.0.4 load from
jsDelivr.

## Licences
Structure Lens is BSD 3-Clause (`LICENSE`). Every component and data source
is listed with its licence text in `THIRD_PARTY_LICENSES.md` and in the app
under Settings > About and licences. Release notes: `CHANGELOG.md`.
