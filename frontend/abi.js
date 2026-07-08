/**
 * ABI do contrato RegistroDeBebes.sol
 * Gerada a partir da interface pública do contrato. Se você alterar o contrato,
 * recompile no Remix e substitua esta ABI para manter o front-end sincronizado.
 */
window.CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },

  // Custom errors (o ethers usa isso para exibir mensagens de erro legíveis)
  { inputs: [], name: "CampoObrigatorio", type: "error" },
  { inputs: [], name: "EnderecoInvalido", type: "error" },
  { inputs: [], name: "HashInvalido", type: "error" },
  { inputs: [], name: "NaoAutorizado", type: "error" },
  { inputs: [], name: "RegistroInexistente", type: "error" },

  // Evento
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "registradoPor", type: "address" },
      { indexed: false, internalType: "bytes32", name: "dataHash", type: "bytes32" },
      { indexed: false, internalType: "uint256", name: "registradoEm", type: "uint256" },
    ],
    name: "BebeRegistrado",
    type: "event",
  },

  // Getters automáticos das variáveis públicas
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRegistros",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Escrita
  {
    inputs: [
      { internalType: "string", name: "_nome", type: "string" },
      { internalType: "string", name: "_pai", type: "string" },
      { internalType: "string", name: "_mae", type: "string" },
      { internalType: "string", name: "_detalhesNascimento", type: "string" },
      { internalType: "string", name: "_local", type: "string" },
    ],
    name: "registrarBebe",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_dataHash", type: "bytes32" }],
    name: "registrarHash",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "novoDono", type: "address" }],
    name: "transferirPropriedade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Leitura
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "obterBebe",
    outputs: [
      {
        components: [
          { internalType: "string", name: "nome", type: "string" },
          { internalType: "string", name: "pai", type: "string" },
          { internalType: "string", name: "mae", type: "string" },
          { internalType: "string", name: "detalhesNascimento", type: "string" },
          { internalType: "string", name: "local", type: "string" },
          { internalType: "bytes32", name: "dataHash", type: "bytes32" },
          { internalType: "address", name: "registradoPor", type: "address" },
          { internalType: "uint256", name: "registradoEm", type: "uint256" },
          { internalType: "bool", name: "existe", type: "bool" },
        ],
        internalType: "struct RegistroDeBebes.Bebe",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "_nome", type: "string" },
      { internalType: "string", name: "_pai", type: "string" },
      { internalType: "string", name: "_mae", type: "string" },
      { internalType: "string", name: "_detalhesNascimento", type: "string" },
      { internalType: "string", name: "_local", type: "string" },
    ],
    name: "verificarIntegridade",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];
