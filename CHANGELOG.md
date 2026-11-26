# Release notes

The same notes are in the app: Settings › What's new, or open the app's address with `#whats-new` at the end.

## 1.1.0 · 26 November 2026

### New
- **Report tab.** A one-page summary of the structure: depiction, identifiers, key properties, rule checks, what it is, pharmacology, patents and the most similar approved drug, with a QR code that opens it again. Save PDF, Share PDF and Link and QR sit at the top.
- **PDF report.** Save or share a multi-page A4 PDF with everything the app found: all descriptors, typicality, ESOL and alerts, rule checks, the property profile and drug-space charts, approved drugs with the same scaffold, PubChem (description, synonyms), ChEMBL (phase, mechanism, indications, potency by target), Wikipedia, patents, UniChem cross-references, the photo the structure was read from, a link to the interactive 3D model, and a methods, references and licences page. Made on the device with jsPDF.
- **Live links in the PDF.** PubChem, ChEMBL, SureChEMBL and Wikidata IDs, ChEMBL targets, Wikipedia, each patent (Google Patents), UniChem cross-references, each similar drug (opens in Structure Lens), reference DOIs and licences.
- **Share links.** The address carries the SMILES (`#smiles=…`), so a link opens straight to that structure on any device with no photo and no model download. `?smiles=…` also works, and `&tab=3d` (or `props`, `src`, `report`) opens that tab.
- **Share button** (top bar). Sends the link through the phone's share sheet, or copies it where there is no share sheet.
- **QR codes** of the link or of the SMILES alone, on the Report tab, in the share sheet and on the PDF. Save the QR code as an image.
- **History files.** Export the history as JSON; import it on another phone. Imports merge with the existing list, keep the newest date and skip anything RDKit can't read.
- **Redesigned Properties tab.** A typicality score, a property profile showing where each property falls among 1,294 approved drugs (with percentiles and Lipinski/Veber limits), rule checks listing every criterion, structural alerts highlighted on the structure (tap one to isolate it), and descriptors grouped by kind.
- **Plane of best fit replaces Fsp3.** PBF (Firth, Brown & Blagg, J. Chem. Inf. Model. 2012) is the mean distance of the heavy atoms from their best-fit plane in a 3D conformer. The app builds one conformer (OpenChemLib, seed 1, MMFF94s+), which the 3D tab then reuses, and the 1,294 reference drugs were computed the same way. PBF is in the property profile, the typicality score, the drug-space PCA (axes recomputed; PC2 is now "larger, more lipophilic") and the descriptor list.
- **App icon and link preview.** A new icon (the aromatic ring with a lens), drawn separately for 16 and 32 px so it stays sharp in browser tabs, plus the iPhone home-screen icon, Android icons (including maskable), favicon.ico and a web app manifest. Shared links to the site now show a preview card (1200 x 630) with the icon, a one-line description and two app screens, through Open Graph and Twitter card tags.
- **Simpler interface.** Properties tab: jump links to each panel that stay pinned under the header while scrolling and highlight the panel in view, and the Sources chips likewise stay pinned (switching source while scrolled down starts the new one at its top), compact rule checks (only failures highlighted) and complexity rows (definitions in About these measures), similar-drug panels show six with Show all. Scan: the Recognise button appears once there is a photo; tapping the empty photo box opens the camera; the formula is no longer shown twice. Settings: model-file options and the connection check are folded. About 15% less scrolling on Properties.
- **Shorter PDF (5 pages for caffeine, was 6).** Page 1 is a summary with twelve key numbers, typicality and rule verdicts, the main identifiers and links; similar drugs are six to a row; the full identifiers and all descriptors move to an appendix; headings no longer sit alone at the foot of a page.
- **Checked calculations and links.** Every 2D property, ESOL, the alerts, scaffolds, Tanimoto scores, typicality and map positions match independent RDKit/numpy calculations for 18 test structures. Each kind of link (64 patterns, 217 links) was opened in a browser.
- **Neutral parent.** Salts and charged forms are calculated and looked up as their neutral parent (largest fragment, uncharged like RDKit's Uncharger), the form the approved drugs are stored in and the databases file them under, so a salt finds its parent's PubChem record and patents; the Properties tab and PDF say so. When an InChIKey matches several PubChem records (tautomers, duplicate depositions), the one with most patents and articles is used.
- **Links always work.** Shared links, QR codes and PDF links point to the public site even from a copy of the page opened from Files or a preview.
- **3D conformers in the background.** Built in a Web Worker, so the page no longer freezes on large molecules (it could lock for 10-30 s on a phone).
- **Clearer failures.** A lookup that gets no answer says the database may be down or busy and offers Try again; Wikipedia no longer waits for a slow ChEMBL; requests time out after 20 s (one retry).
- ONNX Runtime licence link now points to npm: Microsoft's GitHub repository was withdrawn in November 2026. Cross-reference sites that ask you to sign in (Guide to Pharmacology, CCDC) are marked 🔒.
- **Nearest approved drugs**: a separate panel (and PDF section) with the 12 approved drugs most similar by Morgan fingerprint, whatever their scaffold, marking those that also share the scaffold. The Report tab names the three nearest.
- Properties tab panels in the order: drug-likeness, property profile, drug space, rule checks, structural alerts, complexity and 3D shape, same-scaffold drugs, nearest neighbours, all descriptors.
- **Scanned drawing in the PDF**, labelled, beside the recognised structure. The last eight scan photos are kept on the phone (keyed by canonical SMILES), so the drawing is still there after Safari reloads the page or when the structure is reopened from history.
- **Fsp3** stays in the property profile (after the eight typicality properties), the Report tab and the PDF, alongside the plane of best fit.
- **Complexity and 3D shape** card: the PMI triangle (normalised principal-moment ratios, Sauer & Schwarz 2003) against approved drugs, plus plane of best fit, NPR1, NPR2, Bertz CT (Bertz 1981), Fsp3 (Lovering et al. 2009), stereocentres, spiro atoms, bridgehead atoms and Kier flexibility Φ, each with its percentile among approved drugs, and PubChem's complexity value when the compound is in PubChem. All descriptors adds kappa and chi indices. PBF and NPR are worked out whenever the Properties tab opens, whatever the data file holds.
- The page asks for `data/drugspace.json?v=<version>`, so phones fetch the new data file after an update instead of a cached copy.
- **Typicality replaces QED.** The Mahalanobis distance from the centre of approved-drug property space over eight RDKit properties (MW, cLogP, TPSA, HBD, HBA, rotatable bonds, aromatic rings, PBF; log scale for MW, TPSA and counts), using the covariance of the approved drugs, reported as the share of approved drugs further from the centre. No fitted weights or desirability functions. QED is also gone from the ChEMBL panel and the PDF.
- **Same-scaffold drugs.** The approved drugs shown are those with the same Bemis–Murcko scaffold as the compound (up to 12, ranked by Morgan Tanimoto similarity), with the scaffold drawn. Previously the three nearest drugs by fingerprint alone. `data/drugspace.json` now stores each drug's descriptors and scaffold (see `tools/drugspace/scaffolds.js`).
- **Offline mode** (Settings, with a padlock in the top bar while it is on). Keeps every structure on the phone: PubChem, ChEMBL, Wikipedia, SureChEMBL and UniChem lookups are off, a recognition server is never used, and the Sources tab says why. Enforced by the browser: a Content Security Policy, added before anything else loads, refuses any connection or image except from the site itself, jsDelivr (the libraries) and a custom model folder if one is set. Recognition, properties, drug space, similar drugs, 3D, the report and the PDF all still work. Switching it reloads the app with the current structure. While it is on, the app looks sealed: a dark, hatched header with a green padlock (and a matching phone status bar), a lock badge on the Sources tab, a Sources page that lists each blocked database, and a Sealed tag in Settings.
- **Hand-drawn examples.** Example draws a random approved drug from the 1,294 reference drugs (one neutral component, common elements, MW 150–420, an aromatic ring, at most two stereocentres, no bridges) with RDKit's comic mode, in one pen colour on off-white paper with slight wobble, tilt and grain. Tap it again for another; Recognise structure reveals which drug it is. In testing, DECIMER read 11 of 12 such drawings exactly (the twelfth lost only an E/Z marking).
- **Approved-drug names in the data file.** `data/drugspace.json` carries the PubChem title of each of the 1,294 reference drugs, so similar drugs are named at once and in Offline mode, without one PubChem request per drug.
- **Release notes** in the app, with a "New" chip on the Scan tab until you have seen them.

### Changed
- Sources are in the order Wikipedia, ChEMBL, Patents, PubChem, Other databases, in the app and the PDF.
- **Patents come from PubChem.** SureChEMBL's new API no longer accepts requests from other websites, so the app now shows PubChem's patent, patent-family and literature counts and, for up to 10,000 patents, eight patent numbers with title, priority date and assignee (newest WO, then US, then EP documents, titled ones first; PubChem's alphabetical order put the oldest numbers first, which are the ones most often linked to a compound by mistake). The SureChEMBL ID from UniChem still links to SureChEMBL.
- **Sharper structure drawings.** Atom labels keep a readable minimum size on large molecules, line weights are consistent, and F, Cl, Br, I, S and P use darker colours. The PDF draws structures at four times the resolution.
- PubChem requests for drug names and patent titles are spaced out to stay within PubChem's limit of five a second.
- The app opens empty, ready for a photo; shared links still open straight to their structure. The Scan tab shows a status line only while the recognition model downloads or starts, or if it fails.
- Links, QR codes and the link preview use the site's own address, `https://structure-lens.croftware.com/` (the GitHub Pages address redirects there).
- A copy of the page opened from somewhere other than the website (a download, another host) fetches the model and the drug-space data from https://structure-lens.croftware.com/, so recognition, the drug-space map and similar drugs still work.
- History moved from the tab bar to the clock button in the top bar; the Report tab takes its place.
- History keeps up to 300 structures (was 40) and stores each InChIKey.
- Licences list jsPDF and QR Code Generator; full texts are in `THIRD_PARTY_LICENSES.md`.

### History file format
```json
{
  "format": "structure-lens-history", "formatVersion": 1,
  "app": "Structure Lens 1.1.0", "exported": "2026-11-25T15:00:00.000Z", "count": 1,
  "items": [{ "smiles": "Cn1c(=O)c2c(ncn2C)n(C)c1=O", "name": "Caffeine",
              "inchikey": "RYYVLZVUVIJVGH-UHFFFAOYSA-N", "time": "2026-11-25T14:58:00.000Z",
              "link": "https://structure-lens.croftware.com/#smiles=Cn1c(=O)c2c(ncn2C)n(C)c1=O" }]
}
```
Import also accepts a plain array of SMILES strings or of `{ "smiles": … }` objects.

## 1.0.0 · 1 November 2026

First release.
- Photograph a drawn structure and read it with DECIMER running on the phone.
- Properties: drug-likeness radar, QED, ESOL logS, structural alerts, rule checks and a map of 1,294 approved drugs.
- 3D model with OpenChemLib and 3Dmol.js.
- Lookups in PubChem, ChEMBL, Wikipedia, SureChEMBL and UniChem.
- History on the phone, settings, connection check and licences.
