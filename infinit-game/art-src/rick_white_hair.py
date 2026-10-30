"""Recolore só o cabelo do Rick: de preto para branco acinzentado (rampa #5A5F66 → #E6E8EB).

Uso (a partir de infinit-game/): python3 art-src/rick_white_hair.py
Lê os originais de backup-sprites/ e grava em public/assets/ (WebP lossless: nenhuma cor nova além da rampa).

Máscara do cabelo = região da cabeça por coordenadas (acima dos óculos/sobrancelhas, laterais da cabeça)
                    E pixel neutro/escuro (pele e sobrancelhas puxam para o vermelho; o fundo de código, para o verde).
Sombreamento: a luminosidade original é equalizada dentro do cabelo e mapeada para 5 tons da rampa.
"""
from pathlib import Path

import numpy as np
from PIL import Image

RAMP = np.array([(0x5A, 0x5F, 0x66), (0x7D, 0x82, 0x89), (0xA0, 0xA4, 0xAA), (0xC3, 0xC6, 0xCB), (0xE6, 0xE8, 0xEB)], dtype=np.uint8)
# limites do CDF de luminosidade para cada tom (sombra profunda pouca, base clara dominante)
STEPS = [0.08, 0.25, 0.55, 0.85]


def region_sprite(h, w):
    y, x = np.mgrid[0:h, 0:w]
    head = (x >= 212) & (x <= 340) & (y <= 112)
    center = (x >= 250) & (x <= 325) & (y <= 70)             # acima do topo dos óculos
    left_side = (x < 250) & (y <= 75)                         # têmpora, acima da orelha e da haste
    right_side = (x >= 326) & (y <= 92)                       # depois do fim da lente direita
    nape = (x >= 321) & (y >= 93) & (y <= 108)                # nuca, atrás da bochecha direita
    warm_zone = y < 60                                        # mechas marrons só acima da testa
    return head & (center | left_side | right_side | nape), warm_zone


def region_portrait(h, w):
    y, x = np.mgrid[0:h, 0:w]
    head = np.abs((x - 240) / 250.0) ** 3 + np.abs((y - 330) / 300.0) ** 3 <= 1   # superelipse: topo achatado da cabeça
    center = (x >= 110) & (x < 418) & (y < 300)               # acima das sobrancelhas
    left_side = (x < 110) & (y < 335)                         # acima da orelha esquerda
    right_side = (x >= 418) & (y < 340)                       # lateral direita, acima da haste dos óculos
    warm_zone = y < 200                                       # pontas da franja; abaixo disso, marrom escuro é sombra de pele
    return head & (center | left_side | right_side), warm_zone


def hair_pixels(rgb, warm_zone):
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    not_skin = (r - g) < 22                  # pele/sobrancelha: vermelho bem acima do verde
    not_code = (g - np.maximum(r, b)) < 10   # fundo de código: verde dominante (mesmo nos vãos escuros)
    neutral = (mx - mn) < 70                 # inclui reflexos dourados (R−G baixo; a pele tem R−G ≥ 37)
    dark_warm = warm_zone & (lum < 95)       # mechas marrons do cabelo; a pele é bem mais clara
    dull = (mx - mn) < 62                    # reflexos bege/castanho-acinzentados (a pele mais apagada tem 63+)
    return not_code & (lum < 215) & ((not_skin & neutral) | dark_warm | dull), lum, not_code


def touching(mask):
    """Pixels vizinhos (4-conectados) de algum pixel da máscara."""
    t = np.zeros_like(mask)
    t[1:, :] |= mask[:-1, :]; t[:-1, :] |= mask[1:, :]
    t[:, 1:] |= mask[:, :-1]; t[:, :-1] |= mask[:, 1:]
    return t


def largest_component(mask):
    """Maior região 4-conectada da máscara (BFS simples, sem dependências extras)."""
    h, w = mask.shape
    label = np.zeros((h, w), dtype=np.int32)
    best, best_size, cur = 0, 0, 0
    for sy, sx in zip(*np.nonzero(mask)):
        if label[sy, sx]:
            continue
        cur += 1
        label[sy, sx] = cur
        stack, size = [(sy, sx)], 0
        while stack:
            y, x = stack.pop()
            size += 1
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not label[ny, nx]:
                    label[ny, nx] = cur
                    stack.append((ny, nx))
        if size > best_size:
            best, best_size = cur, size
    return label == best


def recolor(src, dst, region_fn):
    im = Image.open(src)
    has_alpha = im.mode == 'RGBA'
    im = im.convert('RGBA' if has_alpha else 'RGB')
    a = np.asarray(im).copy()
    rgb = a[..., :3]
    h, w = rgb.shape[:2]

    region, warm_zone = region_fn(h, w)
    candidate, lum, not_code = hair_pixels(rgb, warm_zone)
    mask = region & candidate
    if has_alpha:
        mask &= a[..., 3] > 0
    mask = largest_component(mask)  # descarta ilhas soltas (vãos escuros do fundo, etc.)

    # equalização da luminosidade dentro do cabelo → tom da rampa
    vals = lum[mask]
    order = np.sort(vals)
    cdf = (np.searchsorted(order, vals, side='left') + np.searchsorted(order, vals, side='right')) / (2 * len(order))
    tone = np.digitize(cdf, STEPS)
    out = rgb.copy()
    out[mask] = RAMP[tone]

    # linha escura entre cabelo e pele (1–2 px): vira o contorno do cabelo, no tom mais escuro da rampa
    edge = region & ~mask & touching(mask) & (lum < 60) & not_code
    if has_alpha:
        edge &= a[..., 3] > 0
    out[edge] = RAMP[0]

    # contorno: cabelo encostado na transparência fica no tom mais escuro da rampa (linha do pixel art)
    if has_alpha:
        out[mask & touching(a[..., 3] == 0)] = RAMP[0]

    a[..., :3] = out
    Image.fromarray(a, 'RGBA' if has_alpha else 'RGB').save(dst, 'WEBP', lossless=True, exact=True, quality=100, method=6)
    print(f'{dst}: {mask.sum()} pixels de cabelo + {edge.sum()} de contorno, {im.size}, alpha={has_alpha}')
    return mask


if __name__ == '__main__':
    bk, assets = Path('backup-sprites'), Path('public/assets')
    recolor(bk / 'rick-sprite.webp', assets / 'rick-sprite.webp', region_sprite)
    recolor(bk / 'rick-portrait.webp', assets / 'rick-portrait.webp', region_portrait)
