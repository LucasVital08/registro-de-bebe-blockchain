/* =====================================================================
 * app.js — lógica do dApp Registro de Bebê
 * Usa ethers.js v6 + MetaMask para ler e escrever no contrato.
 * ===================================================================== */

const STORAGE_KEY = "registroDeBebes:contractAddr";

// Estado global do app
const state = {
  provider: null,   // ethers.BrowserProvider
  signer: null,     // conta conectada
  account: null,    // endereço da conta
  chainId: null,    // id da rede (bigint)
  contract: null,   // instância do contrato
  contractAddr: null,
  isOwner: false,
};

// Atalhos de DOM
const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
const REDES = {
  1n: { nome: "Ethereum Mainnet", explorer: "https://etherscan.io" },
  11155111n: { nome: "Sepolia", explorer: "https://sepolia.etherscan.io" },
  17000n: { nome: "Holesky", explorer: "https://holesky.etherscan.io" },
  137n: { nome: "Polygon", explorer: "https://polygonscan.com" },
  80002n: { nome: "Polygon Amoy", explorer: "https://amoy.polygonscan.com" },
};

function infoRede(chainId) {
  return REDES[chainId] || { nome: `Chain ${chainId}`, explorer: null };
}

function encurtar(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function linkTx(hash) {
  const ex = infoRede(state.chainId).explorer;
  return ex ? `${ex}/tx/${hash}` : null;
}

function formatarData(timestampSegundos) {
  const n = Number(timestampSegundos);
  if (!n) return "—";
  return new Date(n * 1000).toLocaleString("pt-BR");
}

function toast(mensagem, tipo = "info", titulo = null) {
  const el = document.createElement("div");
  el.className = `toast ${tipo}`;
  el.innerHTML = `${titulo ? `<div class="t-title">${titulo}</div>` : ""}<div>${mensagem}</div>`;
  $("toasts").appendChild(el);
  setTimeout(() => el.remove(), 8000);
}

/** Extrai uma mensagem de erro legível (inclui custom errors do contrato). */
function mensagemErro(err) {
  return (
    err?.reason ||
    err?.shortMessage ||
    err?.info?.error?.message ||
    err?.message ||
    "Erro desconhecido"
  );
}

// ---------------------------------------------------------------------
// Conexão com a carteira
// ---------------------------------------------------------------------
async function conectar() {
  if (!window.ethereum) {
    $("noWallet").classList.add("show");
    toast("MetaMask não encontrada.", "error");
    return;
  }
  try {
    state.provider = new ethers.BrowserProvider(window.ethereum);
    await state.provider.send("eth_requestAccounts", []);
    state.signer = await state.provider.getSigner();
    state.account = await state.signer.getAddress();

    const net = await state.provider.getNetwork();
    state.chainId = net.chainId;

    atualizarBadgeRede();
    $("account").textContent = encurtar(state.account);
    $("connectBtn").textContent = encurtar(state.account);

    // Se já houver contrato salvo, instancia
    if (state.contractAddr) instanciarContrato();

    liberarUI(true);
    toast("Carteira conectada.", "success");
  } catch (err) {
    toast(mensagemErro(err), "error", "Falha ao conectar");
  }
}

function atualizarBadgeRede() {
  const info = infoRede(state.chainId);
  const badge = $("netBadge");
  badge.textContent = `Rede: ${info.nome}`;
  badge.classList.add("ok");
}

function liberarUI(ativo) {
  document.querySelectorAll(".app-gated").forEach((el) => {
    el.classList.toggle("disconnected", !ativo);
  });
}

// ---------------------------------------------------------------------
// Contrato
// ---------------------------------------------------------------------
function instanciarContrato() {
  if (!state.signer || !state.contractAddr) return;
  state.contract = new ethers.Contract(state.contractAddr, window.CONTRACT_ABI, state.signer);
  atualizarEstadoContrato();
  carregarRegistros();
}

async function definirContrato() {
  const addr = $("contractAddr").value.trim();
  if (!ethers.isAddress(addr)) {
    toast("Endereço de contrato inválido.", "error");
    return;
  }
  state.contractAddr = ethers.getAddress(addr);
  localStorage.setItem(STORAGE_KEY, state.contractAddr);
  if (!state.signer) {
    await conectar();
    return;
  }
  instanciarContrato();
  toast("Contrato definido.", "success");
}

async function atualizarEstadoContrato() {
  if (!state.contract) return;
  try {
    const [owner, total] = await Promise.all([
      state.contract.owner(),
      state.contract.totalRegistros(),
    ]);
    $("ownerAddr").textContent = encurtar(owner);
    $("total").textContent = total.toString();

    state.isOwner = state.account && owner.toLowerCase() === state.account.toLowerCase();
    const pill = $("isOwner");
    pill.textContent = state.isOwner ? "Sim" : "Não";
    pill.className = `pill ${state.isOwner ? "yes" : "no"}`;
  } catch (err) {
    toast("Não foi possível ler o contrato. Verifique o endereço e a rede.", "error");
    console.error(err);
  }
}

// ---------------------------------------------------------------------
// Ações de escrita
// ---------------------------------------------------------------------
function exigeContrato() {
  if (!state.contract) {
    toast("Defina o endereço do contrato primeiro.", "error");
    return false;
  }
  return true;
}

async function executarTx(promiseTx, btn, resultEl, aoConfirmar) {
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Enviando...";
  try {
    const tx = await promiseTx;
    toast("Transação enviada. Aguardando confirmação...", "info", "Pendente");
    const recibo = await tx.wait();
    const link = linkTx(tx.hash);
    toast(
      link ? `<a href="${link}" target="_blank" rel="noopener">Ver no explorer ↗</a>` : `Hash: ${encurtar(tx.hash)}`,
      "success",
      "Confirmada!"
    );
    if (aoConfirmar) aoConfirmar(recibo, tx);
    await atualizarEstadoContrato();
    await carregarRegistros();
  } catch (err) {
    toast(mensagemErro(err), "error", "Transação falhou");
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

async function registrarBebe() {
  if (!exigeContrato()) return;
  const nome = $("r_nome").value.trim();
  const mae = $("r_mae").value.trim();
  if (!nome || !mae) {
    toast("Nome e Mãe são obrigatórios.", "error");
    return;
  }
  await executarTx(
    state.contract.registrarBebe(
      nome,
      $("r_pai").value.trim(),
      mae,
      $("r_detalhes").value.trim(),
      $("r_local").value.trim()
    ),
    $("registerBtn"),
    $("registerResult"),
    () => {
      ["r_nome", "r_pai", "r_mae", "r_detalhes", "r_local"].forEach((id) => ($(id).value = ""));
    }
  );
}

async function registrarHash() {
  if (!exigeContrato()) return;
  const hash = $("h_hash").value.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    toast("Informe um hash bytes32 válido (0x + 64 hex).", "error");
    return;
  }
  await executarTx(state.contract.registrarHash(hash), $("registerHashBtn"), $("hashResult"));
}

/** Calcula keccak256(abi.encode(...)) igual ao contrato, no lado do cliente. */
function gerarHash() {
  const coder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = coder.encode(
    ["string", "string", "string", "string", "string"],
    [
      $("g_nome").value,
      $("g_pai").value,
      $("g_mae").value,
      $("g_detalhes").value,
      $("g_local").value,
    ]
  );
  const hash = ethers.keccak256(encoded);
  $("h_hash").value = hash;
  toast("Hash gerado e preenchido.", "success");
}

async function transferir() {
  if (!exigeContrato()) return;
  const addr = $("t_addr").value.trim();
  if (!ethers.isAddress(addr)) {
    toast("Endereço inválido.", "error");
    return;
  }
  await executarTx(state.contract.transferirPropriedade(ethers.getAddress(addr)), $("transferBtn"), $("transferResult"));
}

// ---------------------------------------------------------------------
// Ações de leitura
// ---------------------------------------------------------------------
async function consultar() {
  if (!exigeContrato()) return;
  const id = $("q_id").value;
  const el = $("getResult");
  try {
    const b = await state.contract.obterBebe(id);
    el.classList.remove("hidden");
    el.innerHTML = renderBebe(b);
  } catch (err) {
    el.classList.remove("hidden");
    el.textContent = mensagemErro(err);
  }
}

function renderBebe(b) {
  return `<div class="kv">
    <div class="k">Nome</div><div class="v">${b.nome || "—"}</div>
    <div class="k">Pai</div><div class="v">${b.pai || "—"}</div>
    <div class="k">Mãe</div><div class="v">${b.mae || "—"}</div>
    <div class="k">Detalhes</div><div class="v">${b.detalhesNascimento || "—"}</div>
    <div class="k">Local</div><div class="v">${b.local || "—"}</div>
    <div class="k">dataHash</div><div class="v mono">${b.dataHash}</div>
    <div class="k">Registrado por</div><div class="v mono">${b.registradoPor}</div>
    <div class="k">Registrado em</div><div class="v">${formatarData(b.registradoEm)}</div>
  </div>`;
}

async function verificar() {
  if (!exigeContrato()) return;
  const el = $("verifyResult");
  try {
    const ok = await state.contract.verificarIntegridade(
      $("v_id").value,
      $("v_nome").value,
      $("v_pai").value,
      $("v_mae").value,
      $("v_detalhes").value,
      $("v_local").value
    );
    el.classList.remove("hidden");
    el.innerHTML = ok
      ? `<span class="pill yes">✔ Íntegro</span> Os dados correspondem ao hash gravado.`
      : `<span class="pill no">✘ Divergente</span> Os dados NÃO correspondem ao hash gravado.`;
  } catch (err) {
    el.classList.remove("hidden");
    el.textContent = mensagemErro(err);
  }
}

async function carregarRegistros() {
  if (!state.contract) return;
  const cont = $("records");
  try {
    const total = await state.contract.totalRegistros();
    const n = Number(total);
    if (n === 0) {
      cont.innerHTML = `<div class="empty">Nenhum registro ainda.</div>`;
      return;
    }
    // Lê via eventos (mais barato que iterar obterBebe para cada id)
    const filtro = state.contract.filters.BebeRegistrado();
    const eventos = await state.contract.queryFilter(filtro, 0, "latest");
    if (eventos.length === 0) {
      cont.innerHTML = `<div class="empty">Total: ${n}, mas nenhum evento encontrado neste intervalo de blocos.</div>`;
      return;
    }
    cont.innerHTML = eventos
      .slice(-20)
      .reverse()
      .map((ev) => {
        const { id, registradoPor, dataHash, registradoEm } = ev.args;
        return `<div class="record">
          <div>
            <span class="id">#${id.toString()}</span>
            <span class="mono" style="color:var(--muted);margin-left:8px;">${encurtar(registradoPor)}</span>
            <div class="hint">${formatarData(registradoEm)} · hash ${encurtar(dataHash)}</div>
          </div>
          <button class="btn btn-sm" data-id="${id.toString()}">Ver</button>
        </div>`;
      })
      .join("");

    // botões "Ver" preenchem a consulta
    cont.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        $("q_id").value = btn.dataset.id;
        consultar();
        $("q_id").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  } catch (err) {
    cont.innerHTML = `<div class="empty">Não foi possível carregar os registros.</div>`;
    console.error(err);
  }
}

// ---------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------
function init() {
  if (!window.ethereum) $("noWallet").classList.add("show");

  // Endereço de contrato salvo
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo) {
    state.contractAddr = salvo;
    $("contractAddr").value = salvo;
  }

  // Listeners
  $("connectBtn").addEventListener("click", conectar);
  $("setContractBtn").addEventListener("click", definirContrato);
  $("registerBtn").addEventListener("click", registrarBebe);
  $("registerHashBtn").addEventListener("click", registrarHash);
  $("genHashBtn").addEventListener("click", gerarHash);
  $("getBtn").addEventListener("click", consultar);
  $("verifyBtn").addEventListener("click", verificar);
  $("transferBtn").addEventListener("click", transferir);
  $("loadRecordsBtn").addEventListener("click", carregarRegistros);

  // Reagir a mudanças de conta/rede na MetaMask
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => location.reload());
    window.ethereum.on("chainChanged", () => location.reload());
  }
}

document.addEventListener("DOMContentLoaded", init);
