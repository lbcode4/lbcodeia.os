#!/usr/bin/env python3
"""
Renderizador PIL para carrossel dark-tech — Dordrian Store
Produz 7 PNGs 1080x1350 em ./instagram/
"""

import os
import sys
import math
import urllib.request
import zipfile
import io
from PIL import Image, ImageDraw, ImageFont

# ── Diretórios ──────────────────────────────────────────
BASE   = os.path.dirname(os.path.abspath(__file__))
OUT    = os.path.join(BASE, 'instagram')
FONTS  = os.path.join(BASE, '_fonts')
LOGO   = os.path.join(BASE, '..', '..', '..', '..', 'identidade', 'logo.png')
os.makedirs(OUT, exist_ok=True)
os.makedirs(FONTS, exist_ok=True)

W, H = 1080, 1350

# ── Cores ────────────────────────────────────────────────
BG_DEEP  = (7,   7,  15)
BG_PANEL = (15,  15, 34)
ROXO     = (162, 75, 255)
CIANO    = (41, 197, 255)
TXT      = (255, 255, 255)
TXT2     = (201, 201, 214)
ESCURO   = (10,  10,  24)

# ── Fontes ───────────────────────────────────────────────
def download_poppins():
    """Baixa Poppins TTF do Google Fonts se não existir."""
    urls = {
        'Poppins-Regular.ttf':  'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2',
        'Poppins-Bold.ttf':     'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2',
        'Poppins-ExtraBold.ttf':'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1xlFQ.woff2',
        'Poppins-SemiBold.ttf': 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2',
    }
    # Preferir DejaVu que já temos; baixar Poppins via GitHub
    gh_base = 'https://github.com/google/fonts/raw/main/ofl/poppins/'
    gh_files = {
        'Poppins-Regular.ttf':  gh_base + 'Poppins-Regular.ttf',
        'Poppins-Bold.ttf':     gh_base + 'Poppins-Bold.ttf',
        'Poppins-ExtraBold.ttf':gh_base + 'Poppins-ExtraBold.ttf',
        'Poppins-SemiBold.ttf': gh_base + 'Poppins-SemiBold.ttf',
    }
    for fname, url in gh_files.items():
        dest = os.path.join(FONTS, fname)
        if not os.path.exists(dest):
            print(f'Baixando {fname}…', end=' ', flush=True)
            try:
                urllib.request.urlretrieve(url, dest)
                print('OK')
            except Exception as e:
                print(f'FALHOU ({e}) — usando DejaVu')

DEJAVU  = '/usr/share/fonts/truetype/dejavu/'
DEJAVU_R = DEJAVU + 'DejaVuSans.ttf'
DEJAVU_B = DEJAVU + 'DejaVuSans-Bold.ttf'

def load_font(weight='regular', size=32):
    """Carrega Poppins se disponível, senão DejaVu."""
    mapping = {
        'regular':   'Poppins-Regular.ttf',
        'semibold':  'Poppins-SemiBold.ttf',
        'bold':      'Poppins-Bold.ttf',
        'extrabold': 'Poppins-ExtraBold.ttf',
    }
    fallback = {
        'regular':   DEJAVU_R,
        'semibold':  DEJAVU_B,
        'bold':      DEJAVU_B,
        'extrabold': DEJAVU_B,
    }
    path = os.path.join(FONTS, mapping.get(weight, 'Poppins-Regular.ttf'))
    if not os.path.exists(path):
        path = fallback.get(weight, DEJAVU_R)
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.truetype(DEJAVU_R, size)

# ── Utilitários de desenho ───────────────────────────────

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_gradient_bg(img, top_color, bottom_color=BG_DEEP):
    """Fundo gradiente vertical."""
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        c = lerp_color(top_color, bottom_color, t)
        d.line([(0, y), (W, y)], fill=c)

def draw_dots(img, color, alpha=25):
    """Textura de pontos de circuito sutil."""
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    step = 140
    for x in range(0, W, step):
        for y in range(0, H, step):
            r = 3
            d.ellipse([x-r, y-r, x+r, y+r], fill=(*color, alpha))
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))

def draw_neon_border(img, pad=40, radius=32, width=3):
    """Moldura neon gradiente roxo→ciano."""
    d = ImageDraw.Draw(img)
    # Simula gradiente na borda desenhando linhas coloridas
    steps = 100
    for i, x in enumerate(range(pad, W - pad, max(1, (W - 2*pad)//steps))):
        t = i / steps
        c = lerp_color(ROXO, CIANO, t)
        d.line([(x, pad), (x, pad + width)], fill=c)
        d.line([(x, H - pad - width), (x, H - pad)], fill=c)
    for i, y in enumerate(range(pad, H - pad, max(1, (H - 2*pad)//steps))):
        t = i / steps
        c = lerp_color(ROXO, CIANO, t)
        d.line([(pad, y), (pad + width, y)], fill=c)
        d.line([(W - pad - width, y), (W - pad, y)], fill=c)
    # Cantos arredondados (aproximação)
    corners = [(pad, pad), (W-pad, pad), (W-pad, H-pad), (pad, H-pad)]
    for cx, cy in corners:
        d.arc([cx-radius, cy-radius, cx+radius, cy+radius], 0, 360,
              fill=CIANO, width=width)

def glow_rect(img, x1, y1, x2, y2, color, blur_r=40):
    """Simula glow radial adicionando camada semi-transparente."""
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    for r in range(blur_r, 0, -5):
        alpha = int(18 * (1 - r/blur_r))
        d.rounded_rectangle([x1-r, y1-r, x2+r, y2+r], radius=20,
                              fill=(*color, alpha))
    base = img.convert('RGBA')
    merged = Image.alpha_composite(base, overlay)
    img.paste(merged.convert('RGB'))

def draw_grad_text(img, text, x, y, font, grad_start=ROXO, grad_end=CIANO):
    """Texto com gradiente horizontal (simulado por corte de pixels)."""
    tmp = Image.new('RGB', (W, H), BG_DEEP)
    d_tmp = ImageDraw.Draw(tmp)
    d_tmp.text((x, y), text, font=font, fill=TXT)
    # Cria máscara do texto
    mask = Image.new('L', (W, H), 0)
    d_mask = ImageDraw.Draw(mask)
    d_mask.text((x, y), text, font=font, fill=255)
    # Gradiente horizontal
    grad = Image.new('RGB', (W, H))
    d_grad = ImageDraw.Draw(grad)
    for px in range(W):
        t = px / W
        c = lerp_color(grad_start, grad_end, t)
        d_grad.line([(px, 0), (px, H)], fill=c)
    img.paste(grad, mask=mask)

def wrap_text(text, font, max_width, draw):
    """Quebra texto em linhas que caibam em max_width."""
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = ' '.join(current + [word])
        bbox = draw.textbbox((0,0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(' '.join(current))
            current = [word]
    if current:
        lines.append(' '.join(current))
    return lines

def draw_label(draw, text, x, y, font, color=CIANO):
    draw.text((x, y), text, font=font, fill=color)

def draw_divider(img, x, y, width=80, color_start=ROXO, color_end=CIANO):
    d = ImageDraw.Draw(img)
    for px in range(width):
        t = px / width
        c = lerp_color(color_start, color_end, t)
        d.line([(x+px, y), (x+px, y+4)], fill=c)

def draw_hexagon(img, cx, cy, size=75, color_start=ROXO, color_end=CIANO, number='1'):
    """Hexágono com gradiente e número."""
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    pts = []
    for i in range(6):
        angle = math.radians(60 * i - 30)
        px = cx + size * math.cos(angle)
        py = cy + size * math.sin(angle)
        pts.append((px, py))

    # Fill gradiente simples (fill sólido roxo)
    d.polygon(pts, fill=(*ROXO, 230))

    # Glow
    for r in range(30, 0, -6):
        alpha = int(80 * (1 - r/30))
        pts_g = []
        for i in range(6):
            angle = math.radians(60 * i - 30)
            px = cx + (size+r) * math.cos(angle)
            py = cy + (size+r) * math.sin(angle)
            pts_g.append((px, py))
        d.polygon(pts_g, fill=(*ROXO, alpha))

    base = img.convert('RGBA')
    merged = Image.alpha_composite(base, overlay)
    img.paste(merged.convert('RGB'))

    # Número
    font_hex = load_font('extrabold', 72)
    d2 = ImageDraw.Draw(img)
    bbox = d2.textbbox((0,0), number, font=font_hex)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    d2.text((cx - tw//2, cy - th//2 - 4), number, font=font_hex, fill=ESCURO)

def draw_cta_pill(img, text, cx, y, font):
    """Botão pílula gradiente."""
    tmp_d = ImageDraw.Draw(img)
    bbox = tmp_d.textbbox((0,0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    px, py = 56, 26
    rx1 = cx - tw//2 - px
    ry1 = y
    rx2 = cx + tw//2 + px
    ry2 = y + th + py*2

    # Gradiente horizontal no pill
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    for x in range(int(rx1), int(rx2)):
        t = (x - rx1) / max(1, rx2 - rx1)
        c = lerp_color(ROXO, CIANO, t)
        d.line([(x, ry1), (x, ry2)], fill=(*c, 255))

    # Máscara arredondada
    mask = Image.new('L', (W, H), 0)
    d_mask = ImageDraw.Draw(mask)
    d_mask.rounded_rectangle([rx1, ry1, rx2, ry2], radius=999, fill=255)

    base = img.convert('RGBA')
    grad_img = Image.alpha_composite(base, overlay)
    # Aplicar com máscara
    img.paste(grad_img.convert('RGB'), mask=mask)

    # Glow
    glow_overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d_glow = ImageDraw.Draw(glow_overlay)
    for r in range(25, 0, -5):
        alpha = int(40 * (1 - r/25))
        d_glow.rounded_rectangle([rx1-r, ry1-r, rx2+r, ry2+r],
                                   radius=999, fill=(*CIANO, alpha))
    img.paste(Image.alpha_composite(img.convert('RGBA'), glow_overlay).convert('RGB'))

    # Texto
    d3 = ImageDraw.Draw(img)
    tx = cx - tw//2
    ty = ry1 + py
    d3.text((tx, ty), text, font=font, fill=ESCURO)

# ── Fundo com padrão de circuito ────────────────────────
def draw_circuit_lines(img, opacity=20):
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    lines = [
        # (x1,y1,x2,y2,color)
        (W-160, 80,  W-160, 380, CIANO),
        (W-160, 200, W-80,  200, CIANO),
        (180,   H-100, 180, H-380, ROXO),
        (80,    H-240, 280, H-240, ROXO),
    ]
    for x1,y1,x2,y2,c in lines:
        d.line([(x1,y1),(x2,y2)], fill=(*c, opacity), width=2)
    base = img.convert('RGBA')
    img.paste(Image.alpha_composite(base, overlay).convert('RGB'))

# ── Glow base (radial na base) ───────────────────────────
def draw_glow_base(img, color=ROXO):
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    cx = W//2
    cy = H + 120
    for r in range(300, 0, -20):
        alpha = int(12 * (1 - r/300))
        d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*color, alpha))
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))

# ════════════════════════════════════════════════════════
# SLIDES
# ════════════════════════════════════════════════════════

def slide_01_capa():
    img = Image.new('RGB', (W, H), BG_DEEP)
    draw_gradient_bg(img, (26, 13, 53), BG_DEEP)
    draw_dots(img, CIANO, 15)
    draw_circuit_lines(img, 22)
    draw_glow_base(img, ROXO)
    draw_neon_border(img)

    d = ImageDraw.Draw(img)
    f_label = load_font('semibold', 17)
    f_h1_eb = load_font('extrabold', 62)
    f_body  = load_font('regular', 29)

    # Label
    label = 'DORDRIAN STORE · ELETRÔNICOS'
    draw_label(d, label, 96, 140, f_label, CIANO)

    # Headline — "Seu eletrônico" branco
    y = 260
    d.text((96, y), 'Seu eletrônico', font=f_h1_eb, fill=TXT)
    bbox = d.textbbox((0,0), 'Seu eletrônico', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 12

    # "resolve" em gradiente
    draw_grad_text(img, 'resolve', 96, y, f_h1_eb)
    bbox2 = d.textbbox((0,0), 'resolve', font=f_h1_eb)
    y += bbox2[3] - bbox2[1] + 12

    # "ou só consome seu tempo?"
    d.text((96, y), 'ou só consome seu tempo?', font=f_h1_eb, fill=TXT)
    bbox3 = d.textbbox((0,0), 'ou só consome seu tempo?', font=f_h1_eb)
    y += bbox3[3] - bbox3[1] + 48

    # Subtítulo
    d.text((96, y), 'Arrasta pra descobrir a diferença →', font=f_body, fill=TXT2)

    img.save(os.path.join(OUT, 'slide-01.png'))
    print('slide-01 OK')

def slide_02_antes():
    img = Image.new('RGB', (W, H), BG_DEEP)
    draw_gradient_bg(img, (12, 9, 26), BG_DEEP)
    draw_dots(img, ROXO, 12)
    draw_circuit_lines(img, 18)
    draw_glow_base(img, ROXO)

    d = ImageDraw.Draw(img)
    f_label = load_font('semibold', 17)
    f_h1_eb = load_font('extrabold', 62)
    f_body  = load_font('regular', 29)

    y = 200
    draw_label(d, 'O ANTES', 96, y, f_label, ROXO)
    y += 60

    # Headline com "bateria morta" em gradiente
    lines_h = ['Aparelho lento,', 'cabo quebrado,']
    for line in lines_h:
        d.text((96, y), line, font=f_h1_eb, fill=TXT)
        bbox = d.textbbox((0,0), line, font=f_h1_eb)
        y += bbox[3] - bbox[1] + 12
    draw_grad_text(img, 'bateria morta.', 96, y, f_h1_eb)
    bbox = d.textbbox((0,0), 'bateria morta.', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 40

    draw_divider(img, 96, y)
    y += 44

    d.text((96, y), 'Cada problema pequeno vira minutos', font=f_body, fill=TXT2)
    bbox = d.textbbox((0,0), 'Cada problema pequeno vira minutos', font=f_body)
    y += bbox[3] - bbox[1] + 8
    d.text((96, y), 'perdidos no seu dia — e a conta vai crescendo.', font=f_body, fill=TXT2)

    draw_glow_base(img, ROXO)
    img.save(os.path.join(OUT, 'slide-02.png'))
    print('slide-02 OK')

def slide_03_numero1():
    img = Image.new('RGB', (W, H), BG_PANEL)
    draw_dots(img, CIANO, 12)
    draw_circuit_lines(img, 18)
    draw_glow_base(img, CIANO)

    d = ImageDraw.Draw(img)
    f_h1_eb = load_font('extrabold', 62)
    f_body  = load_font('regular', 29)

    # Hexágono
    draw_hexagon(img, cx=96+75, cy=220, size=75, number='1')

    y = 360
    lines_h = ['Escolha pelo uso,']
    for line in lines_h:
        d.text((96, y), line, font=f_h1_eb, fill=TXT)
        bbox = d.textbbox((0,0), line, font=f_h1_eb)
        y += bbox[3] - bbox[1] + 12

    draw_grad_text(img, 'não pelo preço.', 96, y, f_h1_eb)
    bbox = d.textbbox((0,0), 'não pelo preço.', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 40

    draw_divider(img, 96, y)
    y += 44

    body = 'Um produto que atende sua rotina dura 3× mais e não precisa de substituição em 6 meses.'
    d_tmp = ImageDraw.Draw(img)
    lines = wrap_text(body, f_body, W - 192, d_tmp)
    for line in lines:
        d.text((96, y), line, font=f_body, fill=TXT2)
        bbox = d.textbbox((0,0), line, font=f_body)
        y += bbox[3] - bbox[1] + 8

    img.save(os.path.join(OUT, 'slide-03.png'))
    print('slide-03 OK')

def slide_04_numero2():
    img = Image.new('RGB', (W, H), BG_DEEP)
    draw_gradient_bg(img, (10, 26, 42), BG_DEEP)
    draw_dots(img, ROXO, 12)
    draw_circuit_lines(img, 18)
    draw_glow_base(img, CIANO)

    d = ImageDraw.Draw(img)
    f_h1_eb = load_font('extrabold', 62)
    f_body  = load_font('regular', 29)

    # Hexágono
    draw_hexagon(img, cx=96+75, cy=220, size=75, number='2')

    y = 360
    d.text((96, y), 'Conecte tudo em um', font=f_h1_eb, fill=TXT)
    bbox = d.textbbox((0,0), 'Conecte tudo em um', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 12

    draw_grad_text(img, 'ecossistema.', 96, y, f_h1_eb)
    bbox = d.textbbox((0,0), 'ecossistema.', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 40

    draw_divider(img, 96, y)
    y += 44

    body = 'Fone, notebook, celular e acessórios que conversam entre si eliminam o atrito do dia a dia.'
    d_tmp = ImageDraw.Draw(img)
    lines = wrap_text(body, f_body, W - 192, d_tmp)
    for line in lines:
        d.text((96, y), line, font=f_body, fill=TXT2)
        bbox = d.textbbox((0,0), line, font=f_body)
        y += bbox[3] - bbox[1] + 8

    img.save(os.path.join(OUT, 'slide-04.png'))
    print('slide-04 OK')

def slide_05_citacao():
    img = Image.new('RGB', (W, H), BG_DEEP)
    # Fundo gradiente roxo→ciano (slide de destaque)
    overlay = Image.new('RGBA', (W, H), (0,0,0,0))
    d_ov = ImageDraw.Draw(overlay)
    for x in range(W):
        t = x / W
        c = lerp_color(ROXO, CIANO, t)
        d_ov.line([(x, 0), (x, H)], fill=(*c, 255))
    img.paste(overlay.convert('RGB'))

    # Aspas decorativas (sutil)
    d = ImageDraw.Draw(img)
    f_quote = load_font('extrabold', 220)
    f_h1    = load_font('extrabold', 68)
    f_sub   = load_font('semibold', 24)

    # aspas top-left sutil
    d.text((60, 20), '\u201c', font=f_quote, fill=(10,10,24, 30) if False else (10,10,24))

    # Texto da citação
    y = 340
    quote_lines = ['"Troquei um produto.', 'Ganhei 40 minutos', 'por dia."']
    for line in quote_lines:
        d.text((96, y), line, font=f_h1, fill=ESCURO)
        bbox = d.textbbox((0,0), line, font=f_h1)
        y += bbox[3] - bbox[1] + 16

    y += 40
    d.text((96, y), '— Cliente Dordrian Store', font=f_sub, fill=(30,30,60))

    img.save(os.path.join(OUT, 'slide-05.png'))
    print('slide-05 OK')

def slide_06_depois():
    img = Image.new('RGB', (W, H), BG_PANEL)
    draw_dots(img, CIANO, 12)
    draw_circuit_lines(img, 18)
    draw_glow_base(img, CIANO)

    d = ImageDraw.Draw(img)
    f_label = load_font('semibold', 17)
    f_h1_eb = load_font('extrabold', 62)
    f_body  = load_font('regular', 29)

    y = 200
    draw_label(d, 'O DEPOIS', 96, y, f_label, CIANO)
    y += 60

    d.text((96, y), 'Tecnologia que trabalha', font=f_h1_eb, fill=TXT)
    bbox = d.textbbox((0,0), 'Tecnologia que trabalha', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 12

    draw_grad_text(img, 'pra você', 96, y, f_h1_eb)
    bbox = d.textbbox((0,0), 'pra você', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 12

    d.text((96, y), 'não contra.', font=f_h1_eb, fill=TXT)
    bbox = d.textbbox((0,0), 'não contra.', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 40

    draw_divider(img, 96, y)
    y += 44

    body = 'O eletrônico certo não aparece — simplesmente funciona. E você faz mais com menos esforço.'
    d_tmp = ImageDraw.Draw(img)
    lines = wrap_text(body, f_body, W - 192, d_tmp)
    for line in lines:
        d.text((96, y), line, font=f_body, fill=TXT2)
        bbox = d.textbbox((0,0), line, font=f_body)
        y += bbox[3] - bbox[1] + 8

    img.save(os.path.join(OUT, 'slide-06.png'))
    print('slide-06 OK')

def slide_07_cta():
    img = Image.new('RGB', (W, H), BG_DEEP)
    draw_gradient_bg(img, (26, 13, 53), BG_DEEP)
    draw_dots(img, CIANO, 15)
    draw_circuit_lines(img, 22)
    draw_glow_base(img, ROXO)
    draw_neon_border(img)

    d = ImageDraw.Draw(img)
    f_label = load_font('semibold', 17)
    f_h1_eb = load_font('extrabold', 64)
    f_cta   = load_font('bold', 30)
    f_logo_txt = load_font('semibold', 14)

    y = 240
    draw_label(d, 'É HORA DE ESCOLHER CERTO', 96, y, f_label, CIANO)
    y += 60

    d.text((96, y), 'Pronto pra fazer a', font=f_h1_eb, fill=TXT)
    bbox = d.textbbox((0,0), 'Pronto pra fazer a', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 12

    draw_grad_text(img, 'escolha certa?', 96, y, f_h1_eb)
    bbox = d.textbbox((0,0), 'escolha certa?', font=f_h1_eb)
    y += bbox[3] - bbox[1] + 64

    # Pílula CTA
    draw_cta_pill(img, 'Veja a seleção na loja →', W//2, y, f_cta)

    # Logo (tenta carregar; se não, texto)
    try:
        logo = Image.open(LOGO).convert('RGBA')
        logo_h = 52
        ratio = logo_h / logo.height
        logo_w = int(logo.width * ratio)
        logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
        img.paste(logo, (96, H - 100), logo.split()[3])
    except Exception:
        d2 = ImageDraw.Draw(img)
        d2.text((96, H - 90), 'Dordrian Store', font=f_logo_txt, fill=TXT2)

    img.save(os.path.join(OUT, 'slide-07.png'))
    print('slide-07 OK')

# ── Main ──────────────────────────────────────────────────
if __name__ == '__main__':
    print('Baixando fontes Poppins…')
    download_poppins()
    print('\nRenderizando slides…')
    slide_01_capa()
    slide_02_antes()
    slide_03_numero1()
    slide_04_numero2()
    slide_05_citacao()
    slide_06_depois()
    slide_07_cta()
    print(f'\nOK — 7 slides em {OUT}')
