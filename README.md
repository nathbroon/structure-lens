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
and SureChEMBL are blocked. The page shows a red banner when this happens,
and "Connection check" at the bottom lists which service failed and why.

To load the model without hosting it, copy the files in `decimer/` to the
phone and use Recognition settings > "Load model files from phone".

## What the app shows
- **Scan**: the photo with Take photo, Choose image and Example below it,
  then the detected structure, name, formula, InChIKey and SMILES.
- **Properties**: a drug-likeness radar (lipophilicity, size, polarity,
  ESOL insolubility, unsaturation, flexibility against the oral-drug range),
  QED, ESOL logS, structural alerts, rule checks, and a map of 1,294
  FDA-approved drugs (PCA of eight RDKit properties) with the compound and its
  three most similar drugs placed on it. `data/drugspace.json` holds the map;
  `tools/drugspace/` explains how it was built.
- **3D**: an interactive model (rotate, zoom, styles, hydrogens, spin). One
  conformer from OpenChemLib, minimised with MMFF94s, shown with 3Dmol.js.
- **Sources**: PubChem, ChEMBL, Wikipedia, SureChEMBL patents and UniChem
  cross-references, one tab each.
- **History**: past structures with thumbnails, kept on the phone.
- The gear opens settings: theme, recognition, connection check, and the
  licences of every component and data source.

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
PubChem PUG REST, ChEMBL API, Wikidata SPARQL + Wikipedia REST, UniChem,
SureChEMBL API. RDKit.js 2026.03.6, ONNX Runtime Web 1.30.0, 3Dmol.js 2.5.5 and
OpenChemLib 9.25.2 load from jsDelivr.
