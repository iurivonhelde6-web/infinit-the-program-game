"""Troca o letreiro "THE MATRIX / REALITY IS A PRISON" do city-green.webp por "INFINIT / NO EXIT CONDITION".

Uso: python3 art-src/retext_city_green.py <fonte PressStart2P-Regular.ttf>
  (rode a partir de infinit-game/; lê sempre o backup art-src/city-green.original.webp)

(a) apaga o texto antigo e o brilho dele, recompondo o painel com linhas limpas do próprio painel;
(b) desenha o texto novo em uma camada separada (Press Start 2P, sem antialias, ampliada com nearest);
(c) aplica brilho verde e mistura com o fundo (screen);
(d) salva em WebP, mesma resolução, quality 95.
"""
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

FONT = sys.argv[1]
SRC = Path('art-src/city-green.original.webp')
DST = Path('public/assets/city-green.webp')

if not SRC.exists():
    shutil.copy2(DST, SRC)  # backup fora de public/ (não vai para o build)

img = Image.open(SRC).convert('RGB')
a = np.asarray(img).copy()

# ── painel: bordas internas medidas na imagem (a moldura inclina; a direita mais que a esquerda) ──
def left(y):  # primeira coluna interna do painel
    return int(round(1315 + 0.032 * (y - 200)))

def right(y):  # última coluna interna do painel
    return int(round(1460 + 0.045 * (y - 200)))

# ── (a) apagar: linhas 221–401 reconstruídas com faixas inteiras do próprio painel ──
# A textura é feita de blocos 2D ("código" apagado): copiar faixas contíguas preserva os blocos.
# Faixas doadoras sem a sombra interna do topo/base; alternadas e espelhadas para não repetir.
# Cada linha é ancorada nas duas bordas (metade esquerda pela borda esquerda, direita pela direita),
# para que o sombreado junto à moldura continue no lugar mesmo com a largura mudando.
BANDS = [(189, 221), (402, 427)]
src = a.copy()
y, k = 221, 0
while y < 402:
    b0, b1 = BANDS[k % 2]
    flip = (k // 2) % 2 == 1
    for d in range(b0, b1):
        if y >= 402:
            break
        xl, xr, dl, dr = left(y), right(y), left(d), right(d)
        mid = (xl + xr) // 2
        for x in range(xl, xr + 1):
            sx = dl + (x - xl) if x <= mid else dr - (xr - x)
            if flip:  # espelho do miolo, mantendo 4 px junto a cada borda
                if xl + 4 <= x <= xr - 4:
                    sx = dl + 4 + (dr - 4 - (dl + 4)) - (sx - (dl + 4)) if dl + 4 <= sx <= dr - 4 else sx
            a[y, x] = src[d, sx]
        y += 1
    k += 1
erased = Image.fromarray(a)

# ── (b) texto novo em camada separada ──
font = ImageFont.truetype(FONT, 8)

def line(text, scale):
    w = int(font.getlength(text))
    layer = Image.new('L', (w, 8), 0)
    dr = ImageDraw.Draw(layer)
    dr.fontmode = '1'  # sem antialias: só pixels cheios
    dr.text((0, 0), text, font=font, fill=255)
    return layer.resize((round(w * scale), round(8 * scale)), Image.NEAREST)

mask = Image.new('L', img.size, 0)
for text, scale, cy in (('INFINIT', 2.5, 266), ('NO EXIT', 1.75, 334), ('CONDITION', 1.75, 362)):
    m = line(text, scale)
    cx = (left(cy) + right(cy)) / 2
    mask.paste(m, (round(cx - m.width / 2), round(cy - m.height / 2)))

# ── (c) brilho + mistura ──
core = (88, 230, 123)   # verde claro das letras antigas (percentil 90)
glow = (0, 200, 75)
halo_near = mask.filter(ImageFilter.GaussianBlur(2.5)).point(lambda v: int(v * 0.65))
halo_far = mask.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * 0.35))
halo = ImageChops.add(halo_near, halo_far)
glow_layer = Image.composite(Image.new('RGB', img.size, glow), Image.new('RGB', img.size, 0), halo)
out = ImageChops.screen(erased, glow_layer)
out.paste(Image.new('RGB', img.size, core), (0, 0), mask)  # letras nítidas por cima do brilho

# ── (d) salvar ──
out.save(DST, 'WEBP', quality=95, method=6)
print('ok', out.size, DST)
