const fs=require("fs");
require("@rdkit/rdkit")().then(RD=>{
 const q=RD.get_qmol("[$([A;R][!a])]");
 const D=JSON.parse(fs.readFileSync("../drugs_desc.json"));
 for(const r of D){const m=RD.get_mol(r.smi);
  const del=new Set(); const mm=JSON.parse(m.get_substruct_matches(q)); if(Array.isArray(mm)) for(const x of mm) del.add(x.atoms[0]);
  const g=JSON.parse(m.get_json()).molecules[0]; const n=g.atoms.length;
  const keep=[...Array(n).keys()].filter(i=>!del.has(i)); const par=new Map(keep.map(i=>[i,i]));
  const f=x=>{while(par.get(x)!==x){par.set(x,par.get(par.get(x)));x=par.get(x)}return x};
  let E=0; for(const b of g.bonds){const [a,c]=b.atoms; if(del.has(a)||del.has(c))continue; E++; par.set(f(a),f(c));}
  const C=new Set(keep.map(f)).size; r.arom2=E-keep.length+C; m.delete();}
 fs.writeFileSync("../drugs_desc.json",JSON.stringify(D));
});
