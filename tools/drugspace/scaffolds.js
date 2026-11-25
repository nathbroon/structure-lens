// Adds each drug's eight map descriptors and Bemis-Murcko scaffold to data/drugspace.json,
// so the page does not have to compute them for 1,294 drugs on a phone.
// Uses RDKit.js (the library the page uses) and the same scaffold code as index.html.
//   npm install @rdkit/rdkit@2026.3.6 && node scaffolds.js ../../data/drugspace.json
const fs = require("fs");
const init = require("@rdkit/rdkit");
const file = process.argv[2] || "../../data/drugspace.json";
// Bemis-Murcko scaffold: drop side chains (repeatedly remove atoms with one neighbour),
// keep atoms double-bonded to what is left (RDKit's MurckoScaffold convention).
function murcko(RD, mol) {
  const mb = mol.get_molblock().split("\n");
  const cnt = mb[3], na = +cnt.slice(0, 3), nb = +cnt.slice(3, 6);
  const atoms = mb.slice(4, 4 + na), bonds = mb.slice(4 + na, 4 + na + nb).map(l => [+l.slice(0, 3) - 1, +l.slice(3, 6) - 1, +l.slice(6, 9), l]);
  const adj = Array.from({ length: na }, () => []);
  bonds.forEach(([a, b], k) => { adj[a].push(k); adj[b].push(k); });
  const alive = new Array(na).fill(true), deg = adj.map(x => x.length), st = [];
  deg.forEach((d, i) => { if (d <= 1) st.push(i); });
  while (st.length) { const i = st.pop(); if (!alive[i]) continue; alive[i] = false; for (const k of adj[i]) { const [a, b] = bonds[k], j = a === i ? b : a; if (alive[j] && --deg[j] <= 1) st.push(j); } }
  if (!alive.some(Boolean)) return "";
  const keep = alive.slice();
  bonds.forEach(([a, b, o]) => { if (o === 2) { if (alive[a]) keep[b] = true; if (alive[b]) keep[a] = true; } });
  const map = new Map(); let n = 0; keep.forEach((k, i) => { if (k) map.set(i, ++n); });
  const pad = (x, w) => String(x).padStart(w);
  const A = atoms.filter((_, i) => keep[i]).map(l => l.slice(0, 39) + "  0" + l.slice(42, 48) + "  0" + l.slice(51));
  const B = bonds.filter(([a, b]) => keep[a] && keep[b]).map(([a, b, o, l]) => pad(map.get(a), 3) + pad(map.get(b), 3) + pad(o, 3) + "  0" + l.slice(12));
  const props = [];
  for (const l of mb.slice(4 + na + nb)) {
    const m = l.match(/^M  (CHG|ISO|RAD)/); if (!m) continue;
    const v = l.slice(6).trim().split(/\s+/).map(Number).slice(1), pr = [];
    for (let k = 0; k < v.length; k += 2) if (map.has(v[k] - 1)) pr.push([map.get(v[k] - 1), v[k + 1]]);
    if (pr.length) props.push(`M  ${m[1]}${pad(pr.length, 3)}` + pr.map(([i, x]) => pad(i, 4) + pad(x, 4)).join(""));
  }
  const m2 = RD.get_mol(["", "  scaffold", "", pad(A.length, 3) + pad(B.length, 3) + cnt.slice(6), ...A, ...B, ...props, "M  END"].join("\n"));
  if (!m2) return "";
  const s = m2.is_valid() ? m2.get_smiles(JSON.stringify({ doIsomericSmiles: false })) : ""; m2.delete(); return s;
}
init().then(RD => {
  const S = JSON.parse(fs.readFileSync(file, "utf8"));
  const idx = new Map(), scaffolds = [];
  S.desc = []; S.scaffold = [];
  for (const p of S.points) {
    const m = RD.get_mol(p[2]);
    const d = JSON.parse(m.get_descriptors());
    const v = { mw: d.amw, clogp: d.CrippenClogP, tpsa: d.tpsa, hbd: d.lipinskiHBD, hba: d.lipinskiHBA, rotb: d.NumRotatableBonds, arom: d.NumAromaticRings, fsp3: d.FractionCSP3 };
    S.desc.push(S.descriptors.map(k => +(+v[k]).toPrecision(5)));
    const s = murcko(RD, m); m.delete();
    if (!idx.has(s)) { idx.set(s, scaffolds.length); scaffolds.push(s); }
    S.scaffold.push(idx.get(s));
  }
  S.scaffolds = scaffolds;
  S.scaffoldNote = "Bemis-Murcko scaffolds (side chains removed, exocyclic double bonds kept, stereo ignored); '' = acyclic";
  fs.writeFileSync(file, JSON.stringify(S));
  console.log(`${S.points.length} drugs, ${scaffolds.length} scaffolds`);
});
