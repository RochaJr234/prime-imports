from pathlib import Path
from PIL import Image
import re, shutil, zipfile, os

root=Path('/mnt/data/primework')
imgdir=root/'images'; imgdir.mkdir(exist_ok=True)

# Use the supplied/generated transparent logo and new hero banner.
shutil.copy2('/mnt/data/prime-imports-logo.png', imgdir/'logo-completa.png')
shutil.copy2('/mnt/data/a_wide_elegant_promotional_banner_hero_image_with.png', imgdir/'prime-imports-banner-rose.png')

# Update index: transparent logo and hero banner image.
idx=(root/'index.html').read_text(encoding='utf-8')
idx=idx.replace('images/icon.png?v=3.1', 'images/logo-completa.png?v=4.0')
idx=idx.replace('images/icon.png?v=3.0', 'images/logo-completa.png?v=4.0')
old='''                <div class="dashboard-main-hero">\n                    <div class="dashboard-hero-glow dashboard-hero-glow-one"></div>\n                    <div class="dashboard-hero-glow dashboard-hero-glow-two"></div>\n                    <div class="dashboard-wave dashboard-wave-one"></div>\n                    <div class="dashboard-wave dashboard-wave-two"></div>\n\n                    <div class="dashboard-main-copy">\n                        <span class="dashboard-main-kicker">PAINEL DE CONTROLE</span>\n                        <h2>Prime Imports</h2>\n                        <h3>Seu negócio em um só lugar.</h3>\n                        <p>Acompanhe vendas, estoque e financeiro de forma rápida e organizada.</p>\n                    </div>\n\n                    <div class="dashboard-main-logo">\n                        <img src="images/logo-completa.png?v=4.0" alt="Prime Imports">\n                        <span>IMPORTS</span>\n                    </div>\n\n                    <div class="dashboard-growth">\n                        <span class="dashboard-growth-arrow">↗</span>\n                        <div class="dashboard-growth-bars">\n                            <i></i><i></i><i></i><i></i><i></i>\n                        </div>\n                    </div>\n                </div>'''
new='''                <div class="dashboard-main-hero dashboard-brand-banner">\n                    <img\n                        src="images/prime-imports-banner-rose.png?v=4.0"\n                        alt="Prime Imports — Importados, tecnologia e estilo"\n                        class="dashboard-brand-banner-image"\n                        loading="eager"\n                    >\n                </div>'''
if old not in idx:
    raise SystemExit('Hero markup not found')
idx=idx.replace(old,new)
(root/'index.html').write_text(idx,encoding='utf-8')

# Theme overrides: rose-gold / cream / espresso palette and responsive banner.
theme=(root/'css/prime-theme.css').read_text(encoding='utf-8')
theme += r'''

/* =========================================================
   PRIME IMPORTS — IDENTIDADE ROSE GOLD 4.0
   Baseada no novo banner oficial
   ========================================================= */
:root{
  --prime-rose:#C98263;
  --prime-rose-light:#E8B79F;
  --prime-rose-pale:#F8E8DF;
  --prime-copper:#A95D43;
  --prime-espresso:#241712;
  --prime-brown:#5A3327;
  --prime-cream:#FFF8F2;
  --prime-sand:#F3E3D8;
  --prime-gold:#C98A62;
  --prime-gold-light:#E8B79F;
  --prime-gold-dark:#8F4D39;
  --azul:var(--prime-rose);
  --azul-escuro:var(--prime-copper);
  --azul-profundo:var(--prime-espresso);
  --azul-claro:var(--prime-rose-pale);
  --azul-muito-claro:var(--prime-cream);
}

body{
  background:linear-gradient(180deg,#fffaf6 0%,#f6e9df 100%)!important;
}

.sidebar{
  background:linear-gradient(180deg,#211713 0%,#2c1b16 55%,#17100e 100%)!important;
  box-shadow:4px 0 28px rgba(61,31,20,.20)!important;
}
.sidebar-header{border-bottom-color:rgba(232,183,159,.22)!important;}
.brand-logo{background:transparent!important;box-shadow:none!important;border-radius:0!important;}
.nav-item.active,.nav-item:hover{
  background:linear-gradient(135deg,#d79a78,#a75b42)!important;
  color:#fff!important;
}
.nav-item.active::before{background:#f4c9b2!important;}
.topbar{
  background:rgba(255,250,246,.97)!important;
  border-bottom:1px solid #ead7cc!important;
}
.topbar-button,.menu-toggle{color:#8f4d39!important;}
.search-box:focus-within{border-color:#c98263!important;box-shadow:0 0 0 3px rgba(201,130,99,.14)!important;}
.primary-button,.btn-primary{
  background:linear-gradient(135deg,#c98263,#a95d43)!important;
  box-shadow:0 5px 16px rgba(169,93,67,.20)!important;
}
.primary-button:hover,.btn-primary:hover{background:linear-gradient(135deg,#d99b7d,#965039)!important;}
.secondary-button{border-color:#dfc2b2!important;color:#8f4d39!important;background:#fffaf6!important;}

/* Novo banner */
.dashboard-brand-banner{
  position:relative!important;
  width:100%!important;
  min-height:0!important;
  height:auto!important;
  padding:0!important;
  overflow:hidden!important;
  background:#f6e5da!important;
  border:1px solid #ead1c2!important;
  border-radius:22px!important;
  box-shadow:0 16px 38px rgba(83,43,29,.12)!important;
  isolation:isolate!important;
}
.dashboard-brand-banner-image{
  display:block!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:2172/724!important;
  object-fit:cover!important;
  object-position:center!important;
}
.dashboard-brand-banner:before,.dashboard-brand-banner:after{display:none!important;}

.dashboard-main-hero{box-shadow:0 16px 38px rgba(83,43,29,.12)!important;}
.dashboard-overview-card,.dashboard-card,.dashboard-panel,.dashboard-quick-card,.dashboard-profit-card,.dashboard-performance-panel{
  border-color:#ead8cd!important;
  box-shadow:0 8px 24px rgba(83,43,29,.055)!important;
  background:#fffdfb!important;
}
.dashboard-overview-card:hover,.dashboard-card:hover,.dashboard-quick-card:hover{
  border-color:#d9a188!important;
  box-shadow:0 12px 28px rgba(122,66,47,.11)!important;
}
.overview-icon,.dashboard-card-icon,.dashboard-overview-icon,.dashboard-quick-icon,.quick-icon{
  background:linear-gradient(135deg,#e5ad91,#b9684c)!important;
  color:#fff!important;
  box-shadow:0 8px 18px rgba(185,104,76,.16)!important;
}
.dashboard-section-kicker,.dashboard-eyebrow{color:#a95d43!important;}
.dashboard-today-pill{background:#faece4!important;color:#8f4d39!important;border-color:#e4c2b1!important;}
.dashboard-stock-track,.progress-track{background:#eee2db!important;}
.dashboard-stock-fill,.progress-fill{background:linear-gradient(90deg,#d89a7c,#a95d43)!important;}
.data-table thead th{background:#f8eee8!important;color:#714536!important;}
.data-table tbody tr:hover{background:#fff8f3!important;}
input:focus,select:focus,textarea:focus{border-color:#c98263!important;box-shadow:0 0 0 3px rgba(201,130,99,.11)!important;}
.badge-primary,.status-primary{background:#fae8df!important;color:#8f4d39!important;}
#nuvemContent button{background:linear-gradient(135deg,#c98263,#a95d43)!important;}
.jc-backup-actions button:first-child{background:linear-gradient(135deg,#c98263,#a95d43)!important;}
.tab-button.active,.filter-button.active{color:#8f4d39!important;border-color:#c98263!important;background:#fff4ee!important;}
.jc-cloud-card{border-color:#e5cfc3!important;}
.jc-splash{background:radial-gradient(circle at 50% 35%,#7a4333 0%,#2b1b16 42%,#0d0908 100%)!important;}
.jc-splash-ring{stroke:#e5ad91!important;}
.jc-splash-track{stroke:rgba(232,183,159,.18)!important;}

/* Pequenas correções de logo sem fundo */
.sidebar .brand-logo,.brand img,.dashboard-main-logo img{background:transparent!important;}

@media(max-width:700px){
  .dashboard-brand-banner{border-radius:16px!important;margin-bottom:16px!important;}
  .dashboard-brand-banner-image{aspect-ratio:2172/724!important;object-fit:cover!important;}
}
'''
(root/'css/prime-theme.css').write_text(theme,encoding='utf-8')

# Receipt: replace the inline visual palette and logo default. Use transparent logo.
r=(root/'JS/recibo.js').read_text(encoding='utf-8')
r=r.replace('logo: "images/logo-completa.png"','logo: "images/logo-completa.png"')
# broad targeted color replacements inside receipt template only; all occurrences are visual colors in this file.
repls={
'#f5f7fa':'#f8eee8',
'#111827':'#2b1b16',
'#155fb0':'#a95d43',
'#172033':'#3a241d',
'#64748b':'#80645a',
'#d8dee7':'#ead8cd',
'#526174':'#79584c',
'#202938':'#3b2a24',
'#f7f9fb':'#fbf3ee',
'#e7f2ff':'#f6dfd3',
'#13233a':'#3b241b',
'#e6f3ff':'#f7e5dc',
'#c9d0d9':'#ddc5b9',
}
for a,b in repls.items(): r=r.replace(a,b)
# enhance receipt CSS after .recibo rule and make logo no-background friendly
r=r.replace('.recibo{width:100%;max-width:none;margin:0 auto;background:#fff;padding:34px 36px 30px;box-shadow:0 4px 22px rgba(15,23,42,.08)}',
'''.recibo{width:100%;max-width:none;margin:0 auto;background:linear-gradient(180deg,#fffdfb 0%,#fff8f3 100%);padding:34px 36px 30px;box-shadow:0 4px 22px rgba(83,43,29,.09);border:1px solid #ead8cd}''')
r=r.replace('.marca{text-align:center;padding-bottom:20px;border-bottom:3px solid #a95d43}', '.marca{text-align:center;padding-bottom:20px;border-bottom:3px solid #c98263}')
r=r.replace('.logo{display:block;width:min(320px,48vw);height:auto;max-height:150px;object-fit:contain;margin:0 auto 2px}', '.logo{display:block;width:min(300px,48vw);height:auto;max-height:140px;object-fit:contain;margin:0 auto 2px;background:transparent!important}')
r=r.replace('.rodape{margin-top:26px;padding-top:18px;border-top:3px solid #a95d43;text-align:center}', '.rodape{margin-top:26px;padding-top:18px;border-top:3px solid #c98263;text-align:center}')
# print/mobile border consistency
r=r.replace('.recibo{width:100%;max-width:none;padding:8mm 7mm 6mm;box-shadow:none}', '.recibo{width:100%;max-width:none;padding:8mm 7mm 6mm;box-shadow:none;border:0}')
(root/'JS/recibo.js').write_text(r,encoding='utf-8')

# Update theme-color metadata.
idx=(root/'index.html').read_text(encoding='utf-8').replace('content="#B8860B"','content="#C98263"')
(root/'index.html').write_text(idx,encoding='utf-8')

# Validate JS syntax with node.
