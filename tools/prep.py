import numpy as np, io
from PIL import Image, ImageEnhance
import tensorflow as tf
def decode(img):  # img: PIL
    img=img.convert("RGBA"); bg=Image.new("RGBA",img.size,(255,255,255)); img=Image.alpha_composite(bg,img)
    a=np.asarray(img); lo,hi=int(a.min()),int(a.max())
    lut=np.zeros(256,np.uint8); lut[lo:hi+1]=np.linspace(0,255,hi-lo+1,dtype=np.uint8); a=lut[a]
    g=(a[...,0]*0.114+a[...,1]*0.587+a[...,2]*0.299).round().astype(np.uint8)  # cv2 BGR2GRAY on RGB(A)
    im=ImageEnhance.Contrast(Image.fromarray(g)).enhance(1.8)
    w,h=im.size
    if w==h and w<512: im=im.resize((512,512),Image.LANCZOS)
    elif w>=512 or h>=512: pass
    else:
        r=512/max(w,h); im=im.resize((int(w*r),int(h*r)),Image.LANCZOS)
    a=np.asarray(im.convert("L")); m=a>200; rows=np.flatnonzero((~m).sum(1)); cols=np.flatnonzero((~m).sum(0))
    im=Image.fromarray(a[rows.min():rows.max()+1, cols.min():cols.max()+1])
    s=max(512,int(1.2*max(im.size))); sq=Image.new(im.mode,(s,s),"white"); sq.paste(im,((s-im.size[0])//2,(s-im.size[1])//2))
    im=ImageEnhance.Brightness(sq).enhance(1.6)
    x=tf.constant(np.stack([np.asarray(im)]*3,-1))
    x=tf.image.resize(x,(512,512),method="gaussian",antialias=True)
    x=(x/255.0-[0.485,0.456,0.406])/[0.229,0.224,0.225]
    return np.asarray(x,np.float32)
