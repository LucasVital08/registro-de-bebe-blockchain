# Registro de Bebê na Blockchain

Este projeto implementa um contrato inteligente em Solidity para registrar os dados de nascimento de um bebê na blockchain Ethereum. 

## Descrição

O contrato `RegistroDeBebes.sol` permite registrar informações importantes de um bebê, como nome, pais, detalhes do nascimento e local, garantindo que esses dados sejam imutáveis e publicamente verificáveis na blockchain.

## Funcionalidades

- **Registrar Bebê**: Permite registrar os dados de nascimento de um bebê.
- **Obter Dados do Bebê**: Permite visualizar os dados registrados do bebê.

## Detalhes do Caso Concreto

Na data de hoje, 23 de junho, Dia de São João, realizei o registro de nascimento da minha filha. Os detalhes do registro são os seguintes:

- **Nome**: Maria Luísa Helena Moura Monteiro
- **Pai**: Lucas Vital de Paula Monteiro
- **Mãe**: Maísa Vitória Moura Ribeiro Silva
- **Detalhes do Nascimento**: Nascida às 08 horas e 36 minutos do dia 22 de Junho de 2024
- **Local**: Hospital Barão de Lucena - Recife, Pernambuco, Brasil

### Decodificação dos Logs

Os dados registrados podem ser visualizados e decodificados a partir dos logs de eventos na blockchain. Aqui está um exemplo da decodificação manual dos logs:

- **Nome**:
  - Hex: `4d61726961204c75c3ad73612048656c656e61204d6f757261204d6f6e746569726f`
  - String: `Maria Luísa Helena Moura Monteiro`

- **Pai**:
  - Hex: `4c7563617320566974616c206465205061756c61204d6e746569726f`
  - String: `Lucas Vital de Paula Monteiro`

- **Mãe**:
  - Hex: `4d61c3ad736120566974c3b3726961204d6f757261205269626569726f2053696c7661`
  - String: `Maísa Vitória Moura Ribeiro Silva`

- **Detalhes do Nascimento**:
  - Hex: `4e61736369646120c3a07320303820686f7261732065203336206d696e75746f7320646f20646961203232206465204a756e686f20646520323032342e20486f73706974616c20426172c3a36f206465204c7563656e61202d205265636966652e205065726e616d6275636f2e2042726173696c`
  - String: `Nascida às 08 horas e 36 minutos do dia 22 de Junho de 2024. Hospital Barão de Lucena - Recife. Pernambuco. Brasil`

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/LucasVital08/registro-de-bebe-blockchain.git
   cd registro-de-bebe-blockchain
