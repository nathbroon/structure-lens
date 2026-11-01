const fs=require("fs");
const Q=JSON.parse(fs.readFileSync("../qed_params.json"));
require("@rdkit/rdkit")().then(RD=>{
  const acc=Q.acceptors.map(s=>RD.get_qmol(s)), al=Q.alerts.map(s=>RD.get_qmol(s));
  const nMatch=(m,q)=>{const r=JSON.parse(m.get_substruct_matches(q));return Array.isArray(r)?r.length:0};
  const lines=fs.readFileSync("../data/clintox_std.csv","utf8").trim().split("\n").slice(1);
  const out=[],seen=new Set();
  for(const l of lines){const [smi,app]=l.split(",");if(app!=="1")continue;
    let best=null,bn=-1;for(const p of smi.split(".")){const m=RD.get_mol(p);if(m&&m.is_valid()){const n=m.get_num_atoms();if(n>bn){bn=n;best&&best.delete();best=m}else m.delete()}else m&&m.delete()}
    if(!best)continue; const can=best.get_smiles(); if(seen.has(can)){best.delete();continue} seen.add(can);
    const d=JSON.parse(best.get_descriptors());
    const hba=acc.reduce((a,q)=>a+nMatch(best,q),0), alerts=al.reduce((a,q)=>a+(nMatch(best,q)?1:0),0);
    out.push({smi:can,mw:d.amw,clogp:d.CrippenClogP,tpsa:d.tpsa,hbd:d.lipinskiHBD,hba:d.lipinskiHBA,rotb:d.NumRotatableBonds,arom:d.NumAromaticRings,fsp3:d.FractionCSP3,heavy:d.NumHeavyAtoms,qhba:hba,qhbd:d.NumHBD,alerts});
    best.delete();
  }
  fs.writeFileSync("../drugs_desc.json",JSON.stringify(out)); console.log(out.length);
});
