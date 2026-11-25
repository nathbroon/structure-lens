"""Swap Fsp3 for the plane of best fit (pbf.json from pbf.mjs) in data/drugspace.json and redo the PCA.
   python3 pca_pbf.py ../../data/drugspace.json pbf.json"""
import json, sys, numpy as np
f, pf = sys.argv[1], sys.argv[2]
S = json.load(open(f)); pb = json.load(open(pf))
k = S["descriptors"].index("fsp3"); S["descriptors"][k] = "pbf"
for i, d in enumerate(S["desc"]): d[k] = pb.get(str(i))
X = np.array([[np.nan if x is None else x for x in d] for d in S["desc"]], float)
ok = ~np.isnan(X).any(1)
mu, sd = X[ok].mean(0), X[ok].std(0, ddof=1)
U, s, Vt = np.linalg.svd((X[ok] - mu) / sd, full_matrices=False)
ev = s ** 2 / (s ** 2).sum(); L = Vt[:2].copy(); names = S["descriptors"]
if L[0][names.index("tpsa")] < 0: L[0] *= -1     # PC1: more polar to the right
if L[1][names.index("mw")] < 0: L[1] *= -1       # PC2: larger upwards
Xf = X.copy(); Xf[np.isnan(Xf[:, k]), k] = np.nanmedian(X[:, k])
P = ((Xf - mu) / sd) @ L.T
S["mean"] = [round(float(x), 5) for x in mu]; S["sd"] = [round(float(x), 5) for x in sd]
S["loadings"] = [[round(float(x), 5) for x in r] for r in L]; S["explained"] = [round(float(x), 4) for x in ev[:2]]
for i, p in enumerate(S["points"]): p[0], p[1] = round(float(P[i, 0]), 3), round(float(P[i, 1]), 3)
json.dump(S, open(f, "w"), separators=(",", ":"))
print("explained", S["explained"])
