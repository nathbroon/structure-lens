import json, collections, sys
from rdkit import Chem, RDLogger; RDLogger.DisableLog('rdApp.*')
from dutils import encoder, decoder
rows=[]
for f in sys.argv[1:]:
    rows+=[json.loads(l) for l in open(f)]
def kek(smi,iso=True):
    m=Chem.MolFromSmiles(smi); Chem.Kekulize(m,clearAromaticFlags=True)
    return Chem.MolToSmiles(m,kekuleSmiles=True,isomericSmiles=iso)
def key(smi):
    m=Chem.MolFromSmiles(smi)
    return Chem.MolToInchiKey(m) if m else None
for r in rows:
    r['ids']=r['seq'][1:-1] if r['seq'][-1]==14 else None
    r['key']=key(r['smi'])
    try: r['toks']=set(encoder(kek(r['smi'])).split())
    except Exception: r['toks']=set()
V={2:'C',3:'=',4:'(',5:')',6:'O',7:'N',8:'1',9:'2',10:'[',11:']',15:'@',16:'H',31:'+',32:'-'}
DIG=list('3456789')+['%']
def dec(ids,v): return decoder(''.join(v[i] for i in ids))
for rnd in range(12):
    votes=collections.defaultdict(collections.Counter)
    for r in rows:
        ids=r['ids']
        if not ids or not r['key']: continue
        unk=sorted(set(i for i in ids if i not in V))
        if len(unk)!=1: continue
        u=unk[0]; used=set(V.values())
        for cand in sorted(r['toks']|set(DIG)):
            if cand in used: continue
            v=dict(V); v[u]=cand
            k=key(dec(ids,v))
            if k==r['key']: votes[u][cand]+=2
            elif k and k[:14]==r['key'][:14]: votes[u][cand]+=1
    added=0
    for u,c in votes.items():
        (tok,n),=c.most_common(1)
        if n>=2 and tok not in V.values(): V[u]=tok; added+=1
    print('round',rnd,'added',added,'vocab',len(V))
    if not added: break
V.update({0:'<pad>',13:'<start>',14:'<end>'})
ok=sk=bad=unk=0
for r in rows:
    ids=r['ids']
    if not ids: bad+=1; continue
    if any(i not in V for i in ids): unk+=1; continue
    k=key(dec(ids,V))
    if k==r['key']: ok+=1
    elif k and r['key'] and k[:14]==r['key'][:14]: sk+=1
    else: bad+=1
print(f'rows {len(rows)} exact {ok} skeleton-only {sk} wrong/unparsable {bad} unknown-token {unk}')
print({k:V[k] for k in sorted(V)})
missing=collections.Counter(i for r in rows if r['ids'] for i in r['ids'] if i not in V)
print('unmapped ids seen:',missing.most_common(30))
json.dump({str(k):V[k] for k in sorted(V)},open('vocab.json','w'),ensure_ascii=False)
