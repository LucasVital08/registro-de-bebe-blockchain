# Front-end (dApp) — Registro de Bebê

Interface web para interagir com o contrato `RegistroDeBebes.sol` usando **MetaMask** e **ethers.js**.

## Recursos

- Conectar carteira (MetaMask) e detectar a rede automaticamente.
- Apontar o endereço do contrato implantado (salvo no navegador).
- Ver dono do contrato, total de registros e se você é o dono.
- **Registrar bebê** (versão didática, texto on-chain).
- **Registrar apenas hash** (modo recomendado para privacidade) com gerador de `keccak256` no cliente.
- **Consultar** um registro pelo id.
- **Verificar integridade** dos dados contra o hash gravado.
- **Transferir propriedade** do contrato.
- Listar **registros recentes** a partir dos eventos `BebeRegistrado`.

## Stack

- HTML/CSS/JS puro (sem build).
- [ethers.js v6](https://docs.ethers.org/v6/) via CDN.
- MetaMask como provedor de carteira.

## Como usar

1. **Faça o deploy do contrato** (ex.: no [Remix](https://remix.ethereum.org)) numa testnet como a **Sepolia** e copie o endereço.
2. **Sirva a pasta `frontend/`.** Como a página carrega a ABI por `<script>`, o mais simples é rodar um servidor local:
   ```bash
   cd frontend
   python3 -m http.server 8000
   # abra http://localhost:8000
   ```
   (Abrir o `index.html` direto pelo `file://` também funciona na maioria dos casos.)
3. Clique em **Conectar carteira**, cole o **endereço do contrato** e clique em **Usar contrato**.
4. Interaja pelos cartões. Transações abrem a MetaMask para você assinar.

## Publicar no GitHub Pages (opcional)

Em *Settings → Pages*, selecione a branch e a pasta `/frontend` (ou mova os arquivos para a raiz). A página funciona como site estático.

## Sincronizar a ABI

Se você alterar o contrato, recompile no Remix e substitua o array em `abi.js` para o front-end continuar compatível.
