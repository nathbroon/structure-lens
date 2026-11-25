// Usage: npm install openchemlib@9.25.2 && node pbf.mjs ../../data/drugspace.json 0 1294 pbf.json
// PBF (Firth, Brown & Blagg 2012) for the reference drugs, with the conformer pipeline the page uses:
// OpenChemLib ConformerGenerator(seed 1) + MMFF94s+ (600 iterations), heavy atoms only.
import O from 'openchemlib';
import fs from 'fs';
O.Resources.registerFromNodejs();
export function pbfFromMolfile(mf) {
  const L = mf.split("\n"), n = parseInt(L[3].slice(0, 3)), P = [];
  for (let i = 0; i < n; i++) { const l = L[4 + i]; if (l.slice(31, 34).trim() !== "H") P.push([+l.slice(0, 10), +l.slice(10, 20), +l.slice(20, 30)]); }
  if (P.length < 4) return 0;
  const N = P.length, c = [0, 1, 2].map(k => P.reduce((a, p) => a + p[k], 0) / N);
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of P) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) A[i][j] += (p[i] - c[i]) * (p[j] - c[j]);
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) for (let p = 0; p < 2; p++) for (let q = p + 1; q < 3; q++) {
    if (Math.abs(A[p][q]) < 1e-12) continue;
    const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), co = Math.cos(th), si = Math.sin(th);
    for (let k = 0; k < 3; k++) { const x = A[k][p], y = A[k][q]; A[k][p] = co * x - si * y; A[k][q] = si * x + co * y; }
    for (let k = 0; k < 3; k++) { const x = A[p][k], y = A[q][k]; A[p][k] = co * x - si * y; A[q][k] = si * x + co * y; }
    for (let k = 0; k < 3; k++) { const x = V[k][p], y = V[k][q]; V[k][p] = co * x - si * y; V[k][q] = si * x + co * y; }
  }
  let m = 0; for (let k = 1; k < 3; k++) if (A[k][k] < A[m][m]) m = k;
  const nv = [V[0][m], V[1][m], V[2][m]];
  return P.reduce((a, p) => a + Math.abs((p[0] - c[0]) * nv[0] + (p[1] - c[1]) * nv[1] + (p[2] - c[2]) * nv[2]), 0) / N;
}
export function pbfOf(smi, seed = 1) {
  const m = O.Molecule.fromSmiles(smi); m.addImplicitHydrogens();
  const conf = new O.ConformerGenerator(seed, false).getOneConformerAsMolecule(m);
  if (!conf) return null;
  try { const ff = new O.ForceFieldMMFF94(conf, "MMFF94s+", {}); ff.minimise({ maxIts: 600 }); } catch {}
  return pbfFromMolfile(conf.toMolfile());
}
if (process.argv[2]) {
  const [file, a, b, out] = process.argv.slice(2);
  const S = JSON.parse(fs.readFileSync(file, "utf8")), res = {};
  for (let i = +a; i < Math.min(+b, S.points.length); i++) { let v = null; try { v = pbfOf(S.points[i][2]); } catch {} res[i] = v == null ? null : +v.toFixed(4); }
  fs.writeFileSync(out, JSON.stringify(res));
}
