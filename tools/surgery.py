import copy, numpy as np, flatbuffers
from tensorflow.lite.python import schema_py_generated as S
buf=open('../DECIMER_model_new.tflite','rb').read()
M0=S.ModelT.InitFromObj(S.Model.GetRootAsModel(buf,0))
def tid(g,name):
    return [i for i,t in enumerate(g.tensors) if t.name.decode()==name][0]
def const_val(M,g,i):
    t=g.tensors[i]; b=M.buffers[t.buffer].data
    return np.frombuffer(bytes(b),dtype={2:np.int32,6:np.bool_,0:np.float32}[t.type])
def prune(g, inputs, outputs):
    need=set(outputs); keep=[]; stop=set(inputs)
    for o in reversed(g.operators):
        if any(x in need and x not in stop for x in o.outputs):
            keep.append(o); need.update(i for i in o.inputs if i>=0)
    g.operators=list(reversed(keep)); g.inputs=np.array(inputs,np.int32); g.outputs=np.array(outputs,np.int32)
def build(sub_idx, in_names, out_names, fname, dyn=None):
    M=copy.deepcopy(M0); g=M.subgraphs[sub_idx]
    ins=[tid(g,n) for n in in_names]; outs=[tid(g,n) for n in out_names]
    prune(g,ins,outs)
    # keep only tensors/buffers that are used
    used_t=sorted(set(int(i) for o in g.operators for i in list(o.inputs)+list(o.outputs) if i>=0)|set(int(i) for i in ins+outs))
    remap={o:n for n,o in enumerate(used_t)}
    newbufs=[S.BufferT()]; bmap={}
    tensors=[]
    for o in used_t:
        t=g.tensors[o]
        if t.buffer and M.buffers[t.buffer].data is not None and len(M.buffers[t.buffer].data):
            if t.buffer not in bmap: bmap[t.buffer]=len(newbufs); newbufs.append(M.buffers[t.buffer])
            t.buffer=bmap[t.buffer]
        else: t.buffer=0
        tensors.append(t)
    g.tensors=tensors
    for o in g.operators:
        o.inputs=np.array([remap[int(i)] if i>=0 else -1 for i in o.inputs],np.int32); o.outputs=np.array([remap[int(i)] for i in o.outputs],np.int32)
    g.inputs=np.array([remap[i] for i in ins],np.int32); g.outputs=np.array([remap[i] for i in outs],np.int32)
    ins=[remap[i] for i in ins]
    M.buffers=newbufs; M.metadata=[]; M.metadataBuffer=[]
    for i in (dyn or {}): g.tensors[ins[i]].shapeSignature=np.array(dyn[i],np.int32)
    M.subgraphs=[g]; M.signatureDefs=[]
    b=flatbuffers.Builder(1024); b.Finish(M.Pack(b),file_identifier=b"TFL3")
    open(fname,'wb').write(b.Output())
    used={M.operatorCodes[o.opcodeIndex].customCode for o in g.operators}
    print(fname, len(g.operators),'ops; custom:',[u for u in used if u])
g0=M0.subgraphs[0]
print('start token', const_val(M0,g0,tid(g0,'Const')), 'maxlen', const_val(M0,g0,tid(g0,'Const_2')))
g6=M0.subgraphs[6]; print('end token', const_val(M0,g6,tid(g6,'Const_12')))
build(0,['serving_default_Decoded_Image:0'],['encoder/eff_net_v2_model/blocks_56/Add'],'encoder.tflite')
build(6,['while/TensorArrayV2Stack/TensorListStack','arg4'],['while/strided_slice_2'],'decoder_step.tflite',dyn={0:[-1,1]})
