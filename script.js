// ========== VARIÁVEIS GLOBAIS ==========
let deferredPrompt = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {

  atualizarTituloEntrega();
  
  // Atualiza total ao digitar quantidade
  document.querySelectorAll('input[type="number"]').forEach(input =>
    input.addEventListener('input', calcularTotal)
  );

  // Tabs de recebimento
  const tabBtns = document.querySelectorAll('.recebimento-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('recebimento').value = this.getAttribute('data-value');
      mostrarEntrega(this.getAttribute('data-value') === 'entrega');
    });
  });

  // Tabs de pagamento (inicia como "entrega")
  selecionarPagamento('entrega');

  // Banner "adicionar à tela inicial"
  const banner = document.getElementById('add-to-home-banner');
  const fechar = document.getElementById('fechar-banner');
  if (banner) {
    banner.onclick = function(e) {
      if (e.target.id !== 'fechar-banner') instalarPWA();
    };
  }
  if (fechar) {
    fechar.onclick = function(event) {
      event.stopPropagation();
      banner.style.display = 'none';
      localStorage.setItem('addToHomeDismissed', '1');
    };
  }

  // Exibe o banner se for mobile e ainda não foi fechado
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !localStorage.getItem('addToHomeDismissed')) {
    setTimeout(function() {
      if (banner) banner.style.display = 'block';
    }, 1200);
  }

  // Inicializa resumo e total
  calcularTotal();
});

// ========== TABS PRODUTOS ==========
function mostrarAba(id) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`.tab-btn[onclick="mostrarAba('${id}')"]`).classList.add('active');
}

// ========== RECEBIMENTO ==========
function mostrarEntrega(exibir) {
  document.getElementById("campos-entrega").style.display = exibir ? "block" : "none";
}

function preencherEnderecoSalvo() {
  const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  if (!cpf) return;
  const dados = localStorage.getItem('endereco_' + cpf);
  if (dados) {
    try {
      const end = JSON.parse(dados);
      document.getElementById('rua').value = end.rua || '';
      document.getElementById('numero').value = end.numero || '';
      document.getElementById('bairro').value = end.bairro || '';
      document.getElementById('referencia').value = end.referencia || '';
    } catch (e) {}
  }
}

function salvarEnderecoPorCPF() {
  const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  if (!cpf) return;
  const endereco = {
    rua: document.getElementById('rua').value,
    numero: document.getElementById('numero').value,
    bairro: document.getElementById('bairro').value,
    referencia: document.getElementById('referencia').value
  };
  localStorage.setItem('endereco_' + cpf, JSON.stringify(endereco));
}

// ========== ALTERAR QUANTIDADE ==========
function alterarQuantidade(id, delta) {
  const input = document.getElementById(id);
  let valorAtual = parseInt(input.value) || 0;
  valorAtual = Math.max(0, valorAtual + delta);
  input.value = valorAtual;
  calcularTotal();
}

// ========== RESUMO E TOTAL ==========
function calcularTotal() {
  const brigadeiro = parseInt(document.getElementById('qtd_brigadeiro').value) || 0;
  const beijinho = parseInt(document.getElementById('qtd_beijinho').value) || 0;
  const doisAmores = parseInt(document.getElementById('qtd_dois_amores').value) || 0;
  const biscAmantegado = parseInt(document.getElementById('qtd_biscoito')?.value) || 0;
  const cafe = parseInt(document.getElementById('qtd_cafe')?.value) || 0;
  const capuccino = parseInt(document.getElementById('qtd_capuccino')?.value) || 0;
  const agua = parseInt(document.getElementById('qtd_agua')?.value) || 0;

  const precoUnitario = 2;
  const totalDoces = brigadeiro + beijinho + doisAmores;
  const totalBiscoitos = biscAmantegado;
  const totalBebidas = cafe + capuccino + agua;

  let total = totalDoces * precoUnitario;
  let embalagemExtra = 0;

  // Embalagem extra se não for múltiplo de 6
  const docesRestantes = totalDoces % 6;
  if (docesRestantes > 0 && totalDoces > 0) {
    total += 1;
    embalagemExtra = 1;
    document.getElementById("aviso_embalagem").style.display = 'block';
    document.getElementById("aviso_embalagem").innerText = `Adicione mais ${6 - docesRestantes} docinhos para evitar a taxa de embalagem extra.`;
  } else {
    document.getElementById("aviso_embalagem").style.display = 'none';
    document.getElementById("aviso_embalagem").innerText = '';
  }

  total += totalBiscoitos * precoUnitario;
  total += totalBebidas * precoUnitario;

  document.getElementById('linha_brigadeiro').innerText = brigadeiro > 0 ? `Brigadeiro | ${String(brigadeiro).padStart(2,'0')} | R$ ${(brigadeiro * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_beijinho').innerText = beijinho > 0 ? `Beijinho | ${String(beijinho).padStart(2,'0')} | R$ ${(beijinho * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_dois_amores').innerText = doisAmores > 0 ? `Dois Amores | ${String(doisAmores).padStart(2,'0')} | R$ ${(doisAmores * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_biscoito_amantegado').innerText = biscAmantegado > 0? `Biscoito Amantegado | ${String(biscAmantegado).padStart(2,'0')} | R$ ${(biscAmantegado * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_cafe').innerText = cafe > 0? `Café | ${String(cafe).padStart(2,'0')} | R$ ${(cafe * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_capuccino').innerText = capuccino > 0? `Capuccino | ${String(capuccino).padStart(2,'0')} | R$ ${(capuccino * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_agua').innerText = agua > 0? `Água | ${String(agua).padStart(2,'0')} | R$ ${(agua * precoUnitario).toFixed(2)}` : '';
  document.getElementById('linha_embalagem').innerText = embalagemExtra > 0 ? `Embalagem extra R$ 1,00` : '';

  document.getElementById('totalPedido').innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

// ========== PIX ==========
function mostrarAbaPagamento(tipo) {
  document.querySelectorAll('#abas-pagamento .tab-btn').forEach(btn =>
    btn.classList.toggle('active', btn.getAttribute('data-aba') === tipo)
  );
  document.getElementById('pagamento-entrega').style.display = (tipo === 'entrega') ? 'block' : 'none';
  document.getElementById('pagamento-agora').style.display = (tipo === 'agora') ? 'block' : 'none';
}

function selecionarPagamento(tipo) {
  document.querySelectorAll('#tabs-pagamento .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-pagamento') === tipo);
  });
  document.getElementById('area-pix').style.display = (tipo === 'pix') ? 'flex' : 'none';
}

function getFormaPagamento() {
  if(document.querySelector('#abas-pagamento .tab-btn.active').getAttribute('data-aba') === "entrega") {
    return document.querySelector('input[name="pagamento_entrega"]:checked').value;
  } else {
    return "pix-pagamento-antecipado";
  }
}

function copiarPix() {
  const input = document.getElementById('pix-chave');
  navigator.clipboard.writeText(input.value).then(() => {
    const msg = document.getElementById('pix-msg');
    msg.style.display = 'inline';
    setTimeout(() => { msg.style.display = 'none'; }, 1800);
  });
}

// Caso clique no bloco antigo de QR code pix, só copia a chave (compatibilidade)
function copiarChavePix() {
  const chave = document.getElementById("chave_pix").innerText;
  navigator.clipboard.writeText(chave);
}

// ========== ENVIAR PEDIDO ==========
function montarResumoPedido() {
  const ids = [
    { id: 'qtd_brigadeiro', nome: 'Brigadeiro' },
    { id: 'qtd_beijinho', nome: 'Beijinho' },
    { id: 'qtd_dois_amores', nome: 'Dois Amores' },
    { id: 'qtd_biscoito', nome: 'Biscoito Amanteigado' },
    { id: 'qtd_cafe', nome: 'Café' },
    { id: 'qtd_capuccino', nome: 'Capuccino' },
    { id: 'qtd_agua', nome: 'Água' }
  ];
  const precoUnitario = 2;
  let texto = '';
  ids.forEach(({ id, nome }) => {
    const qtd = parseInt(document.getElementById(id)?.value) || 0;
    if (qtd > 0) {
      texto += `${nome}: ${qtd} (R$ ${(qtd * precoUnitario).toFixed(2)}) | `;
    }
  });
  if (document.getElementById('linha_embalagem').innerText) {
    texto += 'Embalagem extra: R$ 1,00 | ';
  }
  return texto;
}

function enviarParaWhatsapp() {
  // Dados básicos
  const nome = document.getElementById("nome").value.trim();
  const total = document.getElementById("totalPedido").innerText;
  const recebimento = document.getElementById('recebimento').value;
  const feedback = document.getElementById('mensagem-feedback');
  const entregaInfo = window.dataEntregaDocinhos || getNextDeliveryDate();

  // Determinar forma de pagamento
  let pagamento = getFormaPagamento();

  // Validação do nome
  if (!nome) {
    feedback.textContent = "Por favor, preencha o campo Nome.";
    feedback.style.color = "red";
    document.getElementById("nome").focus();
    return;
  }

  // Validação dos doces
  const pedidos = [
    parseInt(document.getElementById('qtd_brigadeiro').value) || 0,
    parseInt(document.getElementById('qtd_beijinho').value) || 0,
    parseInt(document.getElementById('qtd_dois_amores').value) || 0
  ];
  const totalPedidos = pedidos.reduce((a, b) => a + b, 0);
  if (totalPedidos === 0) {
    feedback.textContent = "Adicione pelo menos 1 doce ao pedido!";
    feedback.style.color = "red";
    return;
  }

  // Validação de entrega (se necessário)
  let enderecoTexto = "";
  let cpf = "", rua = "", numero = "", bairro = "", referencia = "";
  if (recebimento === "entrega") {
    cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    rua = document.getElementById('rua').value.trim();
    numero = document.getElementById('numero').value.trim();
    bairro = document.getElementById('bairro').value.trim();
    referencia = document.getElementById('referencia').value.trim();
    if (!cpf || cpf.length < 11) {
      feedback.textContent = "Preencha um CPF válido para entrega.";
      feedback.style.color = "red";
      document.getElementById("cpf").focus();
      return;
    }
    if (!rua || !numero || !bairro) {
      feedback.textContent = "Preencha todos os campos de endereço para entrega.";
      feedback.style.color = "red";
      return;
    }
    salvarEnderecoPorCPF();
    enderecoTexto = `\n\nEntrega para:\n${rua}, Nº ${numero}, ${bairro}\nReferência: ${referencia}\nCPF: ${cpf}`;
  }

  feedback.textContent = "";

  // Monta mensagem WhatsApp
  const ids = [
    { id: 'qtd_brigadeiro', nome: 'Brigadeiro' },
    { id: 'qtd_beijinho', nome: 'Beijinho' },
    { id: 'qtd_dois_amores', nome: 'Dois Amores' },
    { id: 'qtd_biscoito', nome: 'Biscoito Amanteigado' },
    { id: 'qtd_cafe', nome: 'Café' },
    { id: 'qtd_capuccino', nome: 'Capuccino' },
    { id: 'qtd_agua', nome: 'Água' }
  ];
  const precoUnitario = 2;
  let mensagem = `Olá! Meu nome é ${nome} e gostaria de fazer o seguinte pedido:%0A%0A\u0060\u0060\u0060`;
  ids.forEach(({ id, nome }) => {
    const qtd = parseInt(document.getElementById(id)?.value) || 0;
    if (qtd > 0) {
      mensagem += `${nome.padEnd(12)}| ${String(qtd).padStart(2, '0')} | R$ ${(qtd * precoUnitario).toFixed(2)}%0A`;
    }
  });
  if (document.getElementById('linha_embalagem').innerText) {
    mensagem += `Embalagem   | 01 | R$ 1.00%0A`;
  }
  mensagem += `%0A\u0060\u0060\u0060${total}%0A%0AForma de Pagamento: ${pagamento}`;
  mensagem += `%0A%0ARecebimento: ${recebimento === "entrega" ? "Entrega" : "Retirada"}`;
  if (recebimento === "entrega") {
    mensagem += `%0A${encodeURIComponent(enderecoTexto)}`;
  }
  if (pagamento === 'pix' || pagamento === 'pix-pagamento-antecipado') {
    mensagem += `%0AChave PIX: 093.095.589-70`;
  }
  mensagem += `%0AData de Entrega: ${entregaInfo.dataFormatada} (${entregaInfo.diaSemana})`;

  // Monta objeto com os dados do pedido
  const dadosPedido = {
    nome,
    recebimento,
    cpf,
    rua,
    numero,
    bairro,
    referencia,
    pedido: montarResumoPedido(),
    pagamento,
    total,
    data_entrega: entregaInfo.dataEntregaISO
  };

  // Envia para Google Apps Script (ajuste a URL abaixo)
  fetch('https://script.google.com/macros/s/AKfycbwuJC5C5i0hDXxAEwmTJpgzklX8i6_svYo1GAEGvAy_UJm41l86K5iZVAXaf0jJTuYknA/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosPedido)
  });

  // Sugere adicionar à tela inicial
  setTimeout(mostrarBannerAddHome, 1000);

  // WhatsApp (ajuste seu número!)
  const url = `https://wa.me/5542999589689?text=${mensagem}`;
  window.open(url, '_blank');

  feedback.textContent = "Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.";
  feedback.style.color = "green";
  setTimeout(() => { feedback.textContent = ""; }, 4000);
}

// ========== PWA / BANNER ADD TO HOME ==========
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

function instalarPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      document.getElementById('add-to-home-banner').style.display = 'none';
      localStorage.setItem('addToHomeDismissed', '1');
    });
  }
}

// ========== SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

function getNextDeliveryDate(now = new Date()) {
  // Horário de corte: meio-dia do dia anterior
  const DAY_MS = 24 * 60 * 60 * 1000;
  const wd = now.getDay(); // 0-dom, 1-seg, ..., 6-sab
  const hour = now.getHours();
  const minute = now.getMinutes();
  const afterNoon = hour > 12 || (hour === 12 && minute > 0);

  // Helper para próxima data por dia da semana (0=domingo, 1=segunda,...)
  function nextWeekdayDate(dow) {
    const result = new Date(now);
    const diff = (dow + 7 - wd) % 7 || 7; // always in future
    result.setDate(now.getDate() + diff);
    result.setHours(0,0,0,0);
    return result;
  }

  // Qual entrega está aberta?
  // Pega último corte: quinta 12h e domingo 12h
  // Pedidos para sexta: aceitos entre domingo 12h e quinta 12h
  // Pedidos para segunda: aceitos entre quinta 12h e domingo 12h

  let entrega, diaSemana;
  let agora = new Date(now);

  // Descobre o último corte (quinta 12h ou domingo 12h)
  let quinta = nextWeekdayDate(4); // próxima quinta
  quinta.setHours(12,0,0,0);
  let domingo = nextWeekdayDate(0); // próximo domingo
  domingo.setHours(12,0,0,0);

  // Descobre qual janela estamos
  let janelaParaSexta = false, janelaParaSegunda = false;

  // Para facilitar, calcula último quinta e último domingo
  let ultimaQuinta = new Date(quinta); ultimaQuinta.setDate(quinta.getDate() - 7);
  let ultimoDomingo = new Date(domingo); ultimoDomingo.setDate(domingo.getDate() - 7);

  if (agora >= ultimoDomingo && agora < quinta) {
    // domingo 12h até quinta 12h: pedidos para sexta
    entrega = nextWeekdayDate(5); // próxima sexta
    diaSemana = 'sex';
  } else if (agora >= quinta && agora < domingo) {
    // quinta 12h até domingo 12h: pedidos para segunda
    entrega = nextWeekdayDate(1); // próxima segunda
    diaSemana = 'seg';
  } else {
    // depois do domingo 12h (domingo à tarde até quinta 12h)
    entrega = nextWeekdayDate(5); // próxima sexta
    diaSemana = 'sex';
  }

  // Formata data DD/MM
  let dd = entrega.getDate().toString().padStart(2,'0');
  let mm = (entrega.getMonth()+1).toString().padStart(2,'0');
  return {
    dataFormatada: `${dd}/${mm}`,
    diaSemana,
    dataEntregaISO: entrega.toISOString().slice(0,10), // yyyy-mm-dd para sheets
    entregaDate: entrega
  };
}

// Troca título ao carregar
function atualizarTituloEntrega() {
  const entrega = getNextDeliveryDate();
  const h2 = document.querySelector('h2');
  if (h2) {
    h2.textContent = `Monte seu pedido para ${entrega.dataFormatada} (${entrega.diaSemana})`;
  }
  // Guarda para uso no envio do pedido
  window.dataEntregaDocinhos = entrega;
}
