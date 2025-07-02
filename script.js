// PWA service worker (coloque o service worker em seu próprio arquivo se quiser mais recursos de cache)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

// ---- Tabs de produtos (docinhos/biscoitos/bebidas) ----
function mostrarAba(nomeAba) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick*="${nomeAba}"]`).classList.add('active');
  document.getElementById(nomeAba).classList.add('active');
}

// ---- Alterar quantidade ----
function alterarQuantidade(id, delta) {
  const input = document.getElementById(id);
  let val = parseInt(input.value) || 0;
  val = Math.max(0, val + delta);
  input.value = val;
  atualizarResumo();
}

// ---- Tabs de recebimento ----
document.querySelectorAll('.recebimento-btn').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.recebimento-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('recebimento').value = btn.dataset.value;
    document.getElementById('campos-entrega').style.display = (btn.dataset.value === 'entrega') ? 'block' : 'none';
  };
});

// ---- Tabs de pagamento ----
function selecionarPagamento(tipo) {
  document.querySelectorAll('#tabs-pagamento .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-pagamento') === tipo);
  });
  document.getElementById('area-pix').style.display = (tipo === 'pix') ? 'flex' : 'none';
}

// ---- Copiar chave PIX ----
function copiarPix() {
  const input = document.getElementById('pix-chave');
  navigator.clipboard.writeText(input.value).then(() => {
    const msg = document.getElementById('pix-msg');
    msg.style.display = 'inline';
    setTimeout(() => { msg.style.display = 'none'; }, 1500);
  });
}

// ---- Atualizar resumo e total ----
function atualizarResumo() {
  const preco = 2;
  const qtd_brigadeiro = parseInt(document.getElementById('qtd_brigadeiro').value) || 0;
  const qtd_beijinho = parseInt(document.getElementById('qtd_beijinho').value) || 0;
  const qtd_dois_amores = parseInt(document.getElementById('qtd_dois_amores').value) || 0;

  let total = (qtd_brigadeiro + qtd_beijinho + qtd_dois_amores) * preco;
  let embalExtra = "";

  document.getElementById('linha_brigadeiro').innerText = qtd_brigadeiro > 0 ? `Brigadeiro: ${qtd_brigadeiro} (R$ ${(qtd_brigadeiro*preco).toFixed(2).replace('.',',')})` : "";
  document.getElementById('linha_beijinho').innerText = qtd_beijinho > 0 ? `Beijinho: ${qtd_beijinho} (R$ ${(qtd_beijinho*preco).toFixed(2).replace('.',',')})` : "";
  document.getElementById('linha_dois_amores').innerText = qtd_dois_amores > 0 ? `Dois Amores: ${qtd_dois_amores} (R$ ${(qtd_dois_amores*preco).toFixed(2).replace('.',',')})` : "";

  // Embalagem extra (opcional: se quiser regras diferentes, ajuste aqui)
  if ((qtd_brigadeiro + qtd_beijinho + qtd_dois_amores) >= 10) {
    embalExtra = "Embalagem extra: R$ 1,00";
    total += 1;
  }
  document.getElementById('linha_embalagem').innerText = embalExtra;

  document.getElementById('totalPedido').innerHTML = `<strong>Total: R$ ${total.toFixed(2).replace('.',',')}</strong>`;
}
['qtd_brigadeiro', 'qtd_beijinho', 'qtd_dois_amores'].forEach(id => {
  document.getElementById(id).addEventListener('input', atualizarResumo);
});
atualizarResumo();

// ---- Envio do pedido ----
function enviarParaWhatsapp() {
  const nome = document.getElementById('nome').value.trim();
  if (!nome) { alert("Por favor, preencha seu nome."); return; }
  const recebimento = document.getElementById('recebimento').value;
  const pagamento = document.querySelector('#tabs-pagamento .tab-btn.active').dataset.pagamento;

  // Itens
  const qtd_brigadeiro = parseInt(document.getElementById('qtd_brigadeiro').value) || 0;
  const qtd_beijinho = parseInt(document.getElementById('qtd_beijinho').value) || 0;
  const qtd_dois_amores = parseInt(document.getElementById('qtd_dois_amores').value) || 0;
  let total = (qtd_brigadeiro + qtd_beijinho + qtd_dois_amores) * 2;
  let texto_pedido = "";
  if (qtd_brigadeiro) texto_pedido += `Brigadeiro: ${qtd_brigadeiro} (R$ ${(qtd_brigadeiro*2).toFixed(2).replace('.',',')})\n`;
  if (qtd_beijinho) texto_pedido += `Beijinho: ${qtd_beijinho} (R$ ${(qtd_beijinho*2).toFixed(2).replace('.',',')})\n`;
  if (qtd_dois_amores) texto_pedido += `Dois Amores: ${qtd_dois_amores} (R$ ${(qtd_dois_amores*2).toFixed(2).replace('.',',')})\n`;
  // Embalagem extra
  if ((qtd_brigadeiro + qtd_beijinho + qtd_dois_amores) >= 10) {
    texto_pedido += `Embalagem extra: R$ 1,00\n`;
    total += 1;
  }
  if (!texto_pedido) { alert("Selecione ao menos 1 docinho."); return; }

  // Dados de entrega
  let endereco = "";
  if (recebimento === "entrega") {
    const cpf = document.getElementById('cpf').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    if (!cpf || !rua || !numero || !bairro) {
      alert("Preencha todos os campos de entrega (CPF, rua, número, bairro).");
      return;
    }
    endereco = `CPF: ${cpf}\nRua: ${rua}, Nº: ${numero}\nBairro: ${bairro}`;
    const referencia = document.getElementById('referencia').value.trim();
    if (referencia) endereco += `\nReferência: ${referencia}`;
  }

  // Resumo final do pedido
  let msg = `*Pedido Dani Docinhos*\nNome: ${nome}\nRecebimento: ${recebimento}`;
  if (endereco) msg += `\n${endereco}`;
  msg += `\n\n${texto_pedido}Total: R$ ${total.toFixed(2).replace('.',',')}\nPagamento: ${pagamento}`;
  if (pagamento === "pix") msg += `\nChave PIX: 093.095.589-70`;

  // Envio para Google Apps Script (ajuste sua URL)
  fetch('SUA_URL_DO_APPS_SCRIPT_AQUI', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome, recebimento, pagamento, pedido: texto_pedido.replace(/\n/g, ' | '), endereco, total: total.toFixed(2)
    })
  });

  // WhatsApp (ajuste seu número!)
  const numeroZap = "SEU_NUMERO_WHATSAPP";
  const urlZap = `https://wa.me/${numeroZap}?text=${encodeURIComponent(msg)}`;
  window.open(urlZap, '_blank');

  // Sugestão para adicionar à tela inicial após enviar
  setTimeout(mostrarBannerAddHome, 900);
}

// ---- Banner "adicionar à tela inicial" ----
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
function isInStandaloneMode() {
  return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone);
}
function mostrarBannerAddHome() {
  if (isInStandaloneMode() || localStorage.getItem('addToHomeDismissed')) return;
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
  let texto = '';
  if (/Android/i.test(navigator.userAgent)) {
    texto = `No Chrome, toque no menu <b>⋮</b> e escolha <b>Adicionar à tela inicial</b>.`;
  } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    texto = `No Safari, toque <b>Compartilhar</b> <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Share_iOS_icon.png" style="height:18px;vertical-align:middle;"> e depois <b>Adicionar à Tela de Início</b>.`;
  }
  document.getElementById('add-to-home-instruction').innerHTML = texto;
  document.getElementById('add-to-home-banner').style.display = 'block';
}
// Clique no banner dispara o prompt de instalação (exceto botão fechar)
document.getElementById('add-to-home-banner').onclick = function(e) {
  if (e.target.id !== 'fechar-banner' && deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
      deferredPrompt = null;
      document.getElementById('add-to-home-banner').style.display = 'none';
      localStorage.setItem('addToHomeDismissed', '1');
    });
  }
};
document.getElementById('fechar-banner').onclick = function(event) {
  event.stopPropagation();
  document.getElementById('add-to-home-banner').style.display = 'none';
  localStorage.setItem('addToHomeDismissed', '1');
};
