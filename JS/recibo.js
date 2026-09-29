/* =========================================================
   PRIME IMPORTS 2.0
   RECIBO DE VENDA — LAYOUT PROFISSIONAL
   ========================================================= */
(function () {
    "use strict";

    if (!window.JCStorage) {
        console.error("JCStorage não foi carregado.");
        return;
    }

    const JCRecibo = {
        obterEmpresa: function () {
            return window.JCStorage.obterConfiguracoes() || {
                empresa: "Prime Imports",
                logo: "images/logo-completa.png"
            };
        },

        moeda: function (valor) {
            return Number(valor || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
        },

        data: function (valor) {
            if (!valor) return "";
            const d = new Date(valor);
            return isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
        },

        escapar: function (texto) {
            return String(texto == null ? "" : texto)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        formaPagamento: function (forma) {
            const formas = {
                dinheiro: "Dinheiro",
                pix: "Pix",
                cartao: "Cartão",
                prazo: "A prazo"
            };
            return formas[String(forma || "").toLowerCase()] || "Não informado";
        },

        gerarHTML: function (venda) {
            if (!venda) return "";

            const empresa = this.obterEmpresa();
            const cliente = venda.clienteNome || "Cliente não informado";
            const itens = Array.isArray(venda.itens) ? venda.itens : [];

            /*
             * O recibo é aberto em uma janela about:blank.
             * Por isso, um caminho relativo como "images/logo-completa.png"
             * não consegue encontrar a imagem. Transformamos caminhos locais
             * em URL absoluta baseada na página atual.
             */
            let logoSrc = empresa && empresa.logo
                ? String(empresa.logo)
                : "images/logo-completa.png";

            if (
                logoSrc &&
                !/^(data:|blob:|https?:|file:)/i.test(logoSrc)
            ) {
                try {
                    logoSrc = new URL(logoSrc, window.location.href).href;
                } catch (erroLogo) {
                    console.warn("Não foi possível resolver a logo do recibo:", erroLogo);
                }
            }

            const linhas = itens.map(function (item) {
                return `
                    <tr>
                        <td class="produto">${JCRecibo.escapar(item.nome)}</td>
                        <td class="center">${JCRecibo.escapar(item.quantidade)}</td>
                        <td class="right">${JCRecibo.moeda(item.valorUnitario)}</td>
                        <td class="right">${JCRecibo.moeda(item.subtotal)}</td>
                    </tr>`;
            }).join("");

            const parcelado =
                (venda.formaPagamento === "cartao" || venda.formaPagamento === "prazo") &&
                Number(venda.parcelas) > 0;

            const parcelamento = parcelado
                ? `<div class="subinfo">${Number(venda.parcelas)}x${venda.primeiraParcela ? ` · início ${this.data(venda.primeiraParcela + "T12:00:00")}` : ""}</div>`
                : "";

            const garantia = String(venda.garantia || "").trim();
            const numeroNF = String(venda.numeroNF || "").trim();

            return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<title>Recibo ${this.escapar(venda.numero || "")}</title>
<style>
*{box-sizing:border-box}
@page{size:A4 portrait;margin:10mm}
html,body{margin:0;padding:0;background:#f8eee8;color:#2b1b16;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{padding:18px;width:100vw;min-width:0;max-width:100vw;overflow-x:hidden;zoom:1;-webkit-text-size-adjust:100%}
.acoes{width:100%;max-width:none;margin:0 auto 14px;display:flex;justify-content:flex-end;align-items:center;gap:10px}
.botao-imprimir{border:0;background:#a95d43;color:#fff;padding:12px 18px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 5px 15px rgba(21,95,176,.18)}
.ajuda-pdf{font-size:11px;color:#80645a}
.recibo{width:100%;max-width:none;margin:0 auto;background:linear-gradient(180deg,#fffdfb 0%,#fff8f3 100%);padding:34px 36px 30px;box-shadow:0 4px 22px rgba(83,43,29,.09);border:1px solid #ead8cd}
.marca{text-align:center;padding-bottom:20px;border-bottom:3px solid #c98263}
.logo{display:block;width:min(300px,48vw);height:auto;max-height:140px;object-fit:contain;margin:0 auto 2px;background:transparent!important}
.empresa-nome{font-size:20px;font-weight:500;margin:0;color:#3a241d}
.titulo{text-align:center;padding:23px 0 25px}
.titulo h1{margin:0;font-size:30px;line-height:1.1;letter-spacing:.2px;color:#3a241d}
.info{display:grid;grid-template-columns:1fr 1fr;border-bottom:3px solid #a95d43;margin-bottom:20px}
.info-item{min-height:76px;padding:13px 16px 14px 48px;position:relative;border-bottom:1px solid #ead8cd}
.info-item:nth-child(odd){border-right:1px solid #ead8cd}
.info-icon{position:absolute;left:10px;top:16px;width:25px;height:25px;color:#a95d43;font-size:22px;line-height:25px;font-weight:700}
.info-label{display:block;font-size:12px;font-weight:700;letter-spacing:.4px;color:#79584c;text-transform:uppercase;margin-bottom:6px}
.info-value{font-size:17px;font-weight:700;color:#3a241d;line-height:1.25;word-break:break-word}
.subinfo{font-size:13px;font-weight:400;color:#80645a;margin-top:5px}
.tabela{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:0}
.tabela th{background:#a95d43;color:#fff;text-transform:uppercase;font-size:13px;padding:11px 10px;text-align:left;letter-spacing:.2px}
.tabela th:nth-child(1){width:48%}.tabela th:nth-child(2){width:12%}.tabela th:nth-child(3){width:20%}.tabela th:nth-child(4){width:20%}
.tabela td{padding:12px 10px;border:1px solid #ead8cd;border-top:0;font-size:14px;color:#3b2a24;vertical-align:middle}
.tabela .produto{font-weight:500;word-break:break-word}
.center{text-align:center}.right{text-align:right}
.resumo{width:min(100%,510px);margin:20px 0 0 auto;border:1px solid #ead8cd}
.resumo-linha{display:flex;justify-content:space-between;gap:20px;padding:10px 16px;background:#fbf3ee;border-bottom:1px solid #ead8cd;font-size:15px}
.resumo-total{display:flex;justify-content:space-between;gap:20px;padding:15px 18px;background:#f6dfd3;color:#3b241b;font-size:22px;font-weight:800}
.vencimento{margin-top:22px;padding:15px 18px;background:#f7e5dc;border-radius:7px;font-size:17px;color:#3a241d}
.vencimento strong{font-weight:800;margin-right:8px}
.observacoes{margin-top:20px;border:1px solid #ddc5b9;border-radius:7px;padding:16px;min-height:80px}
.obs-label{font-size:12px;font-weight:700;color:#79584c;text-transform:uppercase;margin-bottom:8px}
.obs-text{font-size:14px;white-space:pre-wrap;line-height:1.45}
.rodape{margin-top:26px;padding-top:18px;border-top:3px solid #c98263;text-align:center}
.rodape strong{display:block;font-size:19px;color:#3a241d;margin-bottom:7px}.rodape span{font-size:15px;color:#80645a}
@media screen and (max-width:1100px){
 body{padding:8px;background:#fff;width:100%;min-width:0;max-width:100%;overflow-x:hidden}
 .acoes{width:100%;max-width:none;justify-content:center;flex-wrap:wrap;margin-bottom:10px}.ajuda-pdf{width:100%;text-align:center}
 .recibo{width:100%;max-width:none;margin:0;padding:22px 14px 24px;box-shadow:none}
 .logo{width:min(300px,62vw);height:auto;max-height:135px}
 .empresa-nome{font-size:18px}.titulo{padding:18px 0 20px}.titulo h1{font-size:25px}
 .info-item{padding-left:38px;min-height:76px}.info-icon{left:6px;font-size:18px}.info-label{font-size:10px}.info-value{font-size:14px}.subinfo{font-size:11px}
 .tabela th,.tabela td{padding:9px 6px;font-size:11px}.tabela th{font-size:10px}
 .resumo{width:100%}.resumo-linha{font-size:14px}.resumo-total{font-size:19px}
 .vencimento{font-size:14px}.observacoes{font-size:13px}
}
@media print{
 body{padding:0;background:#fff}
 .acoes{display:none}
 .recibo{width:100%;max-width:none;padding:8mm 7mm 6mm;box-shadow:none;border:0}
 .logo{width:230px;height:auto;max-height:105px}
 .titulo h1{font-size:25px}.info-item{min-height:62px;padding-top:9px;padding-bottom:9px}.info-value{font-size:14px}.tabela td,.tabela th{font-size:11px;padding:8px}.resumo{margin-top:14px}.vencimento{margin-top:14px;padding:10px 14px}.observacoes{margin-top:14px;min-height:55px}.rodape{margin-top:16px;padding-top:12px}
}
</style>
</head>
<body>
<div class="acoes">
<button class="botao-imprimir" onclick="window.print()">Imprimir / Salvar PDF</button>
<span class="ajuda-pdf">No celular, escolha “Salvar como PDF” na impressão.</span>
</div>

<main class="recibo">
<section class="marca">
<img class="logo" src="${this.escapar(logoSrc)}" alt="Prime Imports" onerror="this.style.display='none';">
</section>

<header class="titulo"><h1>RECIBO DE VENDA</h1></header>

<section class="info">
<div class="info-item"><span class="info-icon">▤</span><span class="info-label">Nº DA VENDA</span><span class="info-value">${this.escapar(venda.numero)}</span></div>
<div class="info-item"><span class="info-icon">▦</span><span class="info-label">DATA</span><span class="info-value">${this.data(venda.data)}</span></div>
<div class="info-item"><span class="info-icon">♙</span><span class="info-label">CLIENTE</span><span class="info-value">${this.escapar(cliente)}</span></div>
<div class="info-item"><span class="info-icon">▭</span><span class="info-label">PAGAMENTO</span><span class="info-value">${this.formaPagamento(venda.formaPagamento)}</span>${parcelamento}</div>
${garantia ? `<div class="info-item"><span class="info-icon">✓</span><span class="info-label">GARANTIA</span><span class="info-value">${this.escapar(garantia)}</span></div>` : ""}
${numeroNF ? `<div class="info-item"><span class="info-icon">▤</span><span class="info-label">N° N.F</span><span class="info-value">${this.escapar(numeroNF)}</span></div>` : ""}
</section>

<table class="tabela">
<thead><tr><th>Produto</th><th class="center">Qtd.</th><th class="right">Valor unit.</th><th class="right">Subtotal</th></tr></thead>
<tbody>${linhas || `<tr><td colspan="4" class="center">Nenhum item registrado.</td></tr>`}</tbody>
</table>

<section class="resumo">
<div class="resumo-linha"><span>Subtotal</span><strong>${this.moeda(venda.subtotal)}</strong></div>
<div class="resumo-linha"><span>Desconto</span><strong>${this.moeda(venda.desconto)}</strong></div>
<div class="resumo-total"><span>TOTAL</span><strong>${this.moeda(venda.total)}</strong></div>
</section>

${venda.vencimento ? `<div class="vencimento"><strong>Vencimento:</strong> ${this.data(venda.vencimento)}</div>` : ""}
${venda.observacoes ? `<section class="observacoes"><div class="obs-label">OBSERVAÇÃO</div><div class="obs-text">${this.escapar(venda.observacoes)}</div></section>` : ""}

<footer class="rodape"><strong>Obrigado pela preferência!</strong><span>Prime Imports</span></footer>
</main>
</body>
</html>`;
        },

        abrir: function (vendaId) {
            const vendas = window.JCStorage.obterVendas();
            const venda = vendas.find(function (item) { return item.id === vendaId; });
            if (!venda) return { sucesso:false, mensagem:"Venda não encontrada." };
            const janela = window.open("", "_blank");
            if (!janela) return { sucesso:false, mensagem:"O navegador bloqueou a abertura do recibo." };
            janela.document.open();
            janela.document.write(this.gerarHTML(venda));
            janela.document.close();
            return { sucesso:true, mensagem:"Recibo aberto com sucesso." };
        },

        abrirUltimaVenda: function () {
            const vendas = window.JCStorage.obterVendas();
            if (!vendas.length) return { sucesso:false, mensagem:"Ainda não existe nenhuma venda." };
            return this.abrir(vendas[vendas.length - 1].id);
        }
    };

    window.JCRecibo = JCRecibo;
})();
