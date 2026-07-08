# Registro de Bebê na Blockchain

Contrato inteligente em Solidity para registrar dados de nascimento na blockchain Ethereum de forma **controlada, validada e auditável**.

O contrato original (`RegistroDeBebes`) funcionava, mas eu fiz uma auditoria de segurança e evoluí o projeto para corrigir uma série de falhas de controle de acesso, privacidade e design. Este README documenta **o que eu alterei e por quê** — é um projeto de estudo do meu portfólio, no qual usei a IA Claude como ferramenta de apoio ao aprendizado.

## Estrutura do projeto

- `RegistroDeBebes.sol` — versão corrigida do contrato (renomeada a partir do antigo `registroDeBebes.sol.sol`).
- `frontend/` — dApp em HTML/CSS/JS + ethers.js para interagir com o contrato via MetaMask (conectar carteira, registrar, consultar, verificar integridade e transferir propriedade). Veja `frontend/README.md`.

## O que eu aprendi primeiro: estado vs. histórico

Um ponto central que eu esclareci durante o estudo: **imutabilidade da blockchain** e **estado atual do contrato** são coisas diferentes.

- **Histórico (imutável):** cada chamada vira uma transação gravada num bloco. A transação que registrei e seus *event logs* ficam lá para sempre — ninguém altera aquele bloco.
- **Estado atual (sobrescrevível):** uma variável de `storage` guarda apenas o *último* valor escrito. No contrato original, `obterBebe()` podia ser sobrescrito, ou seja, não era uma fonte de verdade confiável ao vivo.

Conclusão de design: a prova permanente do registro é o **log do evento** na transação específica; o getter precisa ser protegido para refletir dados confiáveis. Foi isso que orientou minhas correções.

## Alterações que eu apliquei

| # | Falha corrigida | O que eu fiz |
|---|-----------------|--------------|
| 1 | Sem controle de acesso | Adicionei `owner`, `constructor` que define o dono, e o modifier `onlyOwner`. Agora só o dono registra. |
| 2 | Privacidade (LGPD/GDPR) | Adicionei `dataHash` (keccak256) e a função `registrarHash`, permitindo gravar só a prova de integridade e manter os dados pessoais off-chain. |
| 3 | Slot único de armazenamento | Troquei a variável única por `mapping(uint256 => Bebe)` + `totalRegistros`, suportando múltiplos registros com histórico. |
| 4 | Sem validação de entrada | Adicionei checagens com `revert` + *custom errors* (ex.: nome e mãe obrigatórios). |
| 5 | Sem autoria/timestamp | Passei a gravar `registradoPor` (`msg.sender`) e `registradoEm` (`block.timestamp`). |
| 6 | Pragma flutuante | Fixei a versão do compilador em `0.8.24` (era `^0.8.0`). |
| 7 | Eventos sem índice | Refiz o evento com `id` e `registradoPor` `indexed`, facilitando filtragem de logs. |
| 8 | Higiene de projeto | Renomeei o arquivo de `registroDeBebes.sol.sol` para `RegistroDeBebes.sol` e documentei as funções com NatSpec. |

## Funções principais

- `registrarBebe(...)` — registra um bebê (versão didática com texto). Restrita ao dono; valida entradas e gera um `dataHash`.
- `registrarHash(bytes32)` — modo recomendado: grava apenas o hash dos dados (sem PII on-chain).
- `obterBebe(uint256 id)` — lê um registro pelo id.
- `verificarIntegridade(id, ...)` — confere se um conjunto de dados corresponde ao hash gravado.
- `transferirPropriedade(address)` — transfere a titularidade do contrato.

## Conceitos que estudei neste projeto

- Modelo de contas e `msg.sender`; `constructor`, `modifier` e controle de acesso.
- `storage` vs `memory` vs `calldata` e custo de gás de `string`.
- *Custom errors* vs `require` com string.
- Eventos, `indexed` e como logs garantem integridade (receipts trie).
- Padrão **hash on-chain / dado off-chain** para privacidade (LGPD/GDPR).

## Próximos passos de estudo

- Usar as bibliotecas auditadas da **OpenZeppelin** (`Ownable`/`AccessControl`) no lugar do controle de acesso feito à mão.
- Escrever testes automatizados com **Foundry** ou **Hardhat**.
- Rodar análise estática com **Slither** e configurar CI.

---

> Projeto de estudo. Utilizei a IA Claude como instrumento de apoio ao aprendizado; as decisões de design e a implementação fazem parte do meu processo de estudo em segurança de contratos inteligentes.
