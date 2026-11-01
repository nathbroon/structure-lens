import csv, json, random, sys, numpy as np
from multiprocessing import Pool
from rdkit import Chem, RDLogger; from rdkit.Chem import Draw
RDLogger.DisableLog('rdApp.*')
random.seed(1)
smis=[]
for f in ['dm/x/datamol/data/chembl_drugs.csv','dm/x/datamol/data/chembl_samples.csv','dm/x/datamol/data/freesolv.csv']:
    r=csv.DictReader(open(f)); col=[c for c in r.fieldnames if 'smiles' in c.lower()][0]
    smis+= [row[col] for row in r]
special="""C[Se]C CC[Si](C)(C)C OB(O)c1ccccc1 Ic1ccccc1 C[N+](C)(C)C [O-][N+](=O)c1ccccc1 C[C@H](N)C(=O)O C[C@@H](O)CC
F/C=C/F F/C=C\\F CP(=O)(O)O C1CC2CCC3CCC4CCC5CCCC6CCC(C1)C2C3C45C6 CS(=O)(=O)N [2H]C([2H])([2H])O
C1CCC2(CC1)CCC1(CC2)CCC2(CC1)CCCC2 [Na+].[Cl-] O=C([O-])C.[K+] C#N CC#CC N=[N+]=[N-] [NH4+] C[S+](C)C [O-]S(=O)(=O)[O-]
OC(=O)c1cc(Br)cc(Cl)c1 FC(F)(F)c1ccncc1 C1=CC=CC=C1 Cc1cc2ccccc2[nH]1 c1ccc2c(c1)oc1ccccc12 c1csc(n1)N C1CC1 C[13CH3]
[Pt](Cl)(Cl)(N)N [Fe+2] O=[As](O)(O)c1ccccc1 C[Sn](C)(C)C [Li]CCCC [Mg](Cl)C CC(C)(C)[Si](C)(C)OC [Se]=C=[Se] O[B-](O)(O)O
C1CC23CCC4(CC2)CCC1(CC3)CC4 CC1=C(C(=O)OC)C(c2ccccc2[N+](=O)[O-])C(C(=O)OC)=C1C""".split()
smis+=special*3
mols=[]
for s in smis:
    m=Chem.MolFromSmiles(s)
    if m and m.GetNumHeavyAtoms()<=45: mols.append(Chem.MolToSmiles(m))
mols=list(dict.fromkeys(mols)); random.shuffle(mols)
N=int(sys.argv[1]); mols=[m for m in mols if m in set(Chem.MolToSmiles(Chem.MolFromSmiles(s)) for s in special)]+mols[:N]
def work(smi):
    from infer import predict
    m=Chem.MolFromSmiles(smi)
    img=Draw.MolToImage(m,size=(random.choice([400,500,600]),)*2)
    seq,conf=predict(img)
    return {'smi':smi,'seq':seq,'conf':conf}
if __name__=='__main__':
    with Pool(2) as p, open('calib.jsonl','w') as out:
        for i,r in enumerate(p.imap_unordered(work,mols,chunksize=4)):
            out.write(json.dumps(r)+'\n'); out.flush()
