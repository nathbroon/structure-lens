// Port of RDKit's BertzCT (rdkit.Chem.GraphDescriptors, Bertz 1981) for RDKit.js molecules.
function bertzCT(mol) {
  const g = JSON.parse(mol.get_json()), M = g.molecules[0], def = g.defaults;
  const ext = (M.extensions || []).find(e => e.name === "rdkitRepresentation") || {};
  const arB = new Set(ext.aromaticBonds || []);
  const n = M.atoms.length; if (n < 2) return 0;
  const Z = M.atoms.map(a => a.z ?? def.atom.z);
  const nb = Array.from({ length: n }, () => []), bo = new Map();
  const D = Array.from({ length: n }, (_, i) => { const r = new Float64Array(n).fill(Infinity); r[i] = 0; return r; });
  (M.bonds || []).forEach((b, k) => {
    let [a, c] = b.atoms; if (a > c) [a, c] = [c, a];
    const o = arB.has(k) ? 1.5 : (b.bo ?? def.bond.bo);
    bo.set(a * n + c, o);
    if (!nb[a].includes(c)) nb[a].push(c); if (!nb[c].includes(a)) nb[c].push(a);
    const w = 1 / o; if (w < D[a][c]) { D[a][c] = w; D[c][a] = w; }
  });
  nb.forEach(l => l.sort((x, y) => x - y));
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) { const dik = D[i][k]; if (dik === Infinity) continue; for (let j = 0; j < n; j++) { const v = dik + D[k][j]; if (v < D[i][j]) D[i][j] = v; } }
  // RDKit uses 1e8 for unconnected pairs
  const seen = new Map(), cls = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = Array.from(D[i], v => v === Infinity ? 1e8 : v).sort((x, y) => x - y).slice(0, 100);
    const key = row.map(v => v.toFixed(4)).join(",");
    if (!seen.has(key)) seen.set(key, seen.size); cls[i] = seen.get(key) + 1;
  }
  const BO = (a, c) => bo.get(Math.min(a, c) * n + Math.max(a, c));
  const types = new Map(), conn = new Map();
  const add = (k, v) => conn.set(k, (conn.get(k) || 0) + v);
  for (let a = 0; a < n; a++) {
    types.set(Z[a], (types.get(Z[a]) || 0) + 1);
    const h = cls[a], L = nb[a];
    for (let i = 0; i < L.length; i++) {
      const ni = L[i], ci = cls[ni], oi = BO(a, ni);
      if (oi > 1 && ni > a) add(Math.min(h, ci) + "|" + Math.max(h, ci), oi * (oi - 1) / 2);
      for (let j = i + 1; j < L.length; j++) { const nj = L[j], cj = cls[nj]; add(Math.min(ci, cj) + "|" + h + "|" + Math.max(ci, cj), oi * BO(a, nj)); }
    }
  }
  if (!conn.size) conn.set("a", 1);
  const H = arr => { const t = arr.reduce((x, y) => x + y, 0); if (!t) return 0; return arr.reduce((s, v) => { const p = v / t; return p > 0 ? s - p * Math.log(p) / Math.LN2 : s; }, 0); };
  const cl = [...conn.values()], tot = cl.reduce((x, y) => x + y, 0);
  return tot * (H(cl) + Math.log(tot) / Math.LN2) + n * H([...types.values()]);
}
module.exports = bertzCT;

