# #94 · WCAG 2.x contrast of the main text/background pairs in both modes, read from PaletteTokens.swift.
# Usage: python3 -I contrast.py ios/Packages/RepMileUI/Sources/RepMileUI/DesignSystem/PaletteTokens.swift
import re,sys
src=open(sys.argv[1]).read()
T={m[0]:(int(m[1],16),int(m[2],16)) for m in re.findall(r'RMColorToken\("([^"]+)", dark: 0x([0-9A-F]+), light: 0x([0-9A-F]+)\)',src)}
def rgba(v): return ((v>>24)&255,(v>>16)&255,(v>>8)&255,(v&255)/255)
def over(fg,bg):
    a=fg[3]; return tuple(fg[i]*a+bg[i]*(1-a) for i in range(3))+(1,)
def lum(c):
    def ch(x):
        x/=255; return x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4
    return 0.2126*ch(c[0])+0.7152*ch(c[1])+0.0722*ch(c[2])
def ratio(a,b):
    la,lb=lum(a),lum(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def col(name,mode,base=None):
    c=rgba(T[name][mode])
    return over(c,base) if c[3]<1 else c
pairs=[(f,b,u) for f,b,u in [
 ("texto/primario","fundo/app","text"),("texto/primario","fundo/elevado","text"),("texto/primario","fundo/elevado-2","text"),
 ("texto/secundario","fundo/app","text"),("texto/secundario","fundo/elevado","text"),("texto/secundario","fundo/elevado-2","text"),
 ("texto/terciario","fundo/app","text"),("texto/terciario","fundo/elevado","text"),("texto/terciario","fundo/elevado-2","text"),
 ("agora/sobre","agora","text"),("agora","fundo/app","text"),("agora","agora/suave>fundo/elevado","text"),
 ("acao/corrida-texto","acao/corrida","text"),("acao/forca-texto","acao/forca","text"),
 ("corrida/sobre","corrida/cheio","text"),("forca/sobre","forca","text"),
 ("corrida","fundo/app","text"),("corrida","fundo/elevado","text"),("forca","fundo/app","text"),("forca","fundo/elevado","text"),
 ("marco","fundo/app","text"),("marco","fundo/elevado","text"),
 ("estado/positivo","fundo/app","text"),("estado/positivo","fundo/elevado","text"),
 ("estado/negativo","fundo/app","text"),("estado/negativo","fundo/elevado","text"),
 ("estado/negativo","estado/negativo-suave>fundo/app","text"),("texto/primario","estado/negativo-suave>fundo/app","text"),
 ("corrida","corrida/suave>fundo/elevado","text"),("forca","forca/suave>fundo/elevado","text"),
 ("corrida","corrida/suave>fundo/elevado-2","text"),("forca","forca/suave>fundo/elevado-2","text"),
 ("corrida/sobre","corrida/cheio","text"),("forca/sobre","forca","text"),
 ("estado/negativo","fundo/app","border"),
 ("zona/1","fundo/elevado","graphic"),("zona/2","fundo/elevado","graphic"),("zona/3","fundo/elevado","graphic"),("zona/4","fundo/elevado","graphic"),("zona/5","fundo/elevado","graphic"),
 ("corrida/previsto","fundo/elevado","graphic"),("forca/previsto","fundo/elevado","graphic"),("linha/base","fundo/app","graphic"),
]]
def bgcol(spec,mode):
    if ">" in spec:
        top,base=spec.split(">"); return col(top,mode,col(base,mode))
    return col(spec,mode)
print("| texto / elemento | fundo | uso | escuro | claro | AA |")
print("|---|---|---|---|---|---|")
for f,b,u in pairs:
    r=[]
    for mode in (0,1):
        bg=bgcol(b,mode); fg=col(f,mode,bg); r.append(ratio(fg,bg))
    need=4.5 if u=="text" else 3.0
    ok=lambda x: "ok" if x>=need else ("≥3 (texto grande)" if u=="text" and x>=3 else ("ABAIXO DE 3" if u=="text" else "ABAIXO"))
    print(f"| {f} | {b.replace('>',' sobre ')} | {u} | {r[0]:.2f} | {r[1]:.2f} | escuro {ok(r[0])} · claro {ok(r[1])} |")
