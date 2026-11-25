// Usage: npm install openchemlib@9.25.2 && node shape.mjs ../../data/drugspace.json 0 1294 shape.json
// 3D shape for the reference drugs with the conformer pipeline the page uses
// (OpenChemLib ConformerGenerator seed 1, MMFF94s+ 600 iterations), heavy atoms only:
// PBF (Firth, Brown & Blagg 2012) and normalised PMI ratios NPR1, NPR2 (Sauer & Schwarz 2003, mass-weighted).
import O from 'openchemlib';
import fs from 'fs';
O.Resources.registerFromNodejs();
const MASS = { C: 12.011, N: 14.007, O: 15.999, F: 18.998, P: 30.974, S: 32.065, Cl: 35.453, Br: 79.904, I: 126.904, B: 10.812, Si: 28.086, Se: 78.971, As: 74.922 };
function eig3(A0) {
  const A = A0.map(r => r.slice()), V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) for (let p = 0; p < 2; p++) for (let q = p + 1; q < 3; q++) {
    if (Math.abs(A[p][q]) < 1e-12) continue;
    const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), co = Math.cos(th), si = Math.sin(th);
    for (let k = 0; k < 3; k++) { const x = A[k][p], y = A[k][q]; A[k][p] = co * x - si * y; A[k][q] = si * x + co * y; }
    for (let k = 0; k < 3; k++) { const x = A[p][k], y = A[q][k]; A[p][k] = co * x - si * y; A[q][k] = si * x + co * y; }
    for (let k = 0; k < 3; k++) { const x = V[k][p], y = V[k][q]; V[k][p] = co * x - si * y; V[k][q] = si * x + co * y; }
  }
  return { val: [A[0][0], A[1][1], A[2][2]], vec: V };
}
export function shapeFromMolfile(mf) {
  const L = mf.split("\n"), n = parseInt(L[3].slice(0, 3)), P = [], W = [];
  for (let i = 0; i < n; i++) { const l = L[4 + i], el = l.slice(31, 34).trim(); if (el !== "H") { P.push([+l.slice(0, 10), +l.slice(10, 20), +l.slice(20, 30)]); W.push(MASS[el] || 12.011); } }
  const N = P.length; if (N < 2) return { pbf: 0, npr1: NaN, npr2: NaN };
  // PBF: unweighted best-fit plane through heavy atoms
  let pbf = 0;
  if (N >= 4) {
    const c = [0, 1, 2].map(k => P.reduce((a, p) => a + p[k], 0) / N), A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const p of P) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) A[i][j] += (p[i] - c[i]) * (p[j] - c[j]);
    const e = eig3(A); let m = 0; for (let k = 1; k < 3; k++) if (e.val[k] < e.val[m]) m = k;
    const nv = [e.vec[0][m], e.vec[1][m], e.vec[2][m]];
    pbf = P.reduce((a, p) => a + Math.abs((p[0] - c[0]) * nv[0] + (p[1] - c[1]) * nv[1] + (p[2] - c[2]) * nv[2]), 0) / N;
  }
  // PMI: mass-weighted inertia tensor about the centre of mass
  const M = W.reduce((a, b) => a + b, 0), cm = [0, 1, 2].map(k => P.reduce((a, p, i) => a + W[i] * p[k], 0) / M);
  const I = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  P.forEach((p, i) => { const d = p.map((v, k) => v - cm[k]), r2 = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) I[a][b] += W[i] * ((a === b ? r2 : 0) - d[a] * d[b]); });
  const ev = eig3(I).val.sort((a, b) => a - b);
  return { pbf, npr1: ev[2] > 1e-9 ? ev[0] / ev[2] : NaN, npr2: ev[2] > 1e-9 ? ev[1] / ev[2] : NaN };
}
export function conformer(smi, seed = 1) {
  const m = O.Molecule.fromSmiles(smi); m.addImplicitHydrogens();
  const conf = new O.ConformerGenerator(seed, false).getOneConformerAsMolecule(m);
  if (!conf) return null;
  try { const ff = new O.ForceFieldMMFF94(conf, "MMFF94s+", {}); ff.minimise({ maxIts: 600 }); } catch {}
  return conf.toMolfile();
}
if (process.argv[2]) {
  const [file, a, b, out] = process.argv.slice(2);
  const S = JSON.parse(fs.readFileSync(file, "utf8")), res = {};
  for (let i = +a; i < Math.min(+b, S.points.length); i++) {
    let v = null; try { const mf = conformer(S.points[i][2]); if (mf) v = shapeFromMolfile(mf); } catch {}
    res[i] = v && [+v.pbf.toFixed(4), +v.npr1.toFixed(4), +v.npr2.toFixed(4)];
    if (i % 25 === 0) fs.writeFileSync(out + ".progress", String(i));
  }
  fs.writeFileSync(out, JSON.stringify(res));
}
