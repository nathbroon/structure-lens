import numpy as np, time
from ai_edge_litert.interpreter import Interpreter
from prep import decode
enc=Interpreter(model_path='encoder.tflite'); enc.allocate_tensors()
dec=Interpreter(model_path='decoder_step.tflite')
def predict(img, maxlen=300):
    x=decode(img)
    enc.set_tensor(enc.get_input_details()[0]['index'],x); enc.invoke()
    f=enc.get_tensor(enc.get_output_details()[0]['index'])
    seq=[13]; conf=[]
    for _ in range(maxlen):
        di=dec.get_input_details()
        tin=[d for d in di if d['dtype']==np.int32][0]; fin=[d for d in di if d['dtype']==np.float32][0]
        dec.resize_tensor_input(tin['index'],[len(seq),1]); dec.allocate_tensors()
        dec.set_tensor(tin['index'],np.array(seq,np.int32).reshape(-1,1)); dec.set_tensor(fin['index'],f); dec.invoke()
        lg=dec.get_tensor(dec.get_output_details()[0]['index']).reshape(-1)
        t=int(lg.argmax()); p=np.exp(lg-lg.max()); conf.append(float(p[t]/p.sum())); seq.append(t)
        if t==14: break
    return seq, conf
if __name__=='__main__':
    import sys
    from rdkit import Chem; from rdkit.Chem import Draw
    for smi in sys.argv[1:]:
        t=time.time(); s,c=predict(Draw.MolToImage(Chem.MolFromSmiles(smi),size=(500,500)))
        print(smi, s, f"min conf {min(c):.2f}", f"{time.time()-t:.1f}s")
