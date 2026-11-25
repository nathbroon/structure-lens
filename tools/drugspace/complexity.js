// Complexity descriptors for the reference drugs, stored as S.cx = { keys, v } in data/drugspace.json.
// 2D values from RDKit.js (the page's library); 3D values (PBF, NPR1, NPR2) from shape.mjs output.
//   node complexity.js ../../data/drugspace.json shape.json
const fs = require("fs");
const init = require(process.env.RDKIT || "@rdkit/rdkit");
const bertzCT = require("./bertz.js");
const [file, shapeFile] = process.argv.slice(2);
init().then(RD => {
  const S = JSON.parse(fs.readFileSync(file, "utf8"));
  const shape = shapeFile ? JSON.parse(fs.readFileSync(shapeFile, "utf8")) : {};
  const keys = ["pbf", "npr1", "npr2", "bertz", "fsp3", "stereo", "spiro", "bridge", "phi"];
  const r = (x, d) => x == null || !Number.isFinite(x) ? null : +x.toFixed(d);
  S.cx = { keys, v: S.points.map((p, i) => {
    const m = RD.get_mol(p[2]); const d = JSON.parse(m.get_descriptors()); const b = bertzCT(m); m.delete();
    const sh = shape[i] || [null, null, null];
    return [sh[0], sh[1], sh[2], r(b, 1), r(d.FractionCSP3, 4), d.NumAtomStereoCenters, d.NumSpiroAtoms, d.NumBridgeheadAtoms, r(d.Phi, 3)];
  }) };
  fs.writeFileSync(file, JSON.stringify(S));
  console.log("cx for", S.cx.v.length, "drugs; missing 3D:", S.cx.v.filter(x => x[0] == null).length);
});
