// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title  RegistroDeBebes
/// @notice Registra dados de nascimento na blockchain de forma controlada e auditável.
/// @dev    PRIVACIDADE (LGPD/GDPR): a blockchain é pública e imutável. NÃO grave dados
///         pessoais em claro em produção. O modo recomendado é registrar apenas o
///         `dataHash` (keccak256 dos dados) e manter o conteúdo real off-chain
///         (banco de dados ou IPFS criptografado). Os campos em texto abaixo são
///         mantidos para fins didáticos/compatibilidade e devem ser evitados no mundo real.
contract RegistroDeBebes {
    // ------------------------------------------------------------------
    // Controle de acesso (Correção da Falha #1)
    // ------------------------------------------------------------------
    address public owner;

    error NaoAutorizado();
    error EnderecoInvalido();
    error CampoObrigatorio();
    error HashInvalido();
    error RegistroInexistente();

    constructor() {
        owner = msg.sender; // quem faz o deploy vira o dono
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NaoAutorizado();
        _;
    }

    /// @notice Transfere a titularidade do contrato para outro endereço.
    function transferirPropriedade(address novoDono) external onlyOwner {
        if (novoDono == address(0)) revert EnderecoInvalido();
        owner = novoDono;
    }

    // ------------------------------------------------------------------
    // Modelo de dados (Correções das Falhas #3 e #5)
    // ------------------------------------------------------------------
    struct Bebe {
        string nome;
        string pai;
        string mae;
        string detalhesNascimento;
        string local;
        bytes32 dataHash;      // impressão digital dos dados (recomendado como fonte primária)
        address registradoPor; // autoria
        uint256 registradoEm;  // timestamp do bloco
        bool existe;
    }

    // mapping + contador → múltiplos registros com histórico, em vez de um slot sobrescrevível
    uint256 public totalRegistros;
    mapping(uint256 => Bebe) private bebes;

    // ------------------------------------------------------------------
    // Eventos (Correção da Falha #7: campos indexáveis para filtragem)
    // ------------------------------------------------------------------
    event BebeRegistrado(
        uint256 indexed id,
        address indexed registradoPor,
        bytes32 dataHash,
        uint256 registradoEm
    );

    // ------------------------------------------------------------------
    // Escrita
    // ------------------------------------------------------------------
    /// @notice Registra um bebê (versão com texto — didática). Restrito ao dono.
    /// @return id Identificador sequencial do registro.
    function registrarBebe(
        string calldata _nome,
        string calldata _pai,
        string calldata _mae,
        string calldata _detalhesNascimento,
        string calldata _local
    ) external onlyOwner returns (uint256 id) {
        // Correção da Falha #4: validação de entrada
        if (bytes(_nome).length == 0) revert CampoObrigatorio();
        if (bytes(_mae).length == 0) revert CampoObrigatorio();

        bytes32 dataHash = keccak256(
            abi.encode(_nome, _pai, _mae, _detalhesNascimento, _local)
        );

        id = totalRegistros++;
        bebes[id] = Bebe({
            nome: _nome,
            pai: _pai,
            mae: _mae,
            detalhesNascimento: _detalhesNascimento,
            local: _local,
            dataHash: dataHash,
            registradoPor: msg.sender,
            registradoEm: block.timestamp,
            existe: true
        });

        emit BebeRegistrado(id, msg.sender, dataHash, block.timestamp);
    }

    /// @notice Registra APENAS o hash dos dados (Correção da Falha #2, modo recomendado).
    /// @dev    Mantém os dados pessoais off-chain; on-chain fica só a prova de integridade.
    function registrarHash(bytes32 _dataHash) external onlyOwner returns (uint256 id) {
        if (_dataHash == bytes32(0)) revert HashInvalido();

        id = totalRegistros++;
        Bebe storage b = bebes[id];
        b.dataHash = _dataHash;
        b.registradoPor = msg.sender;
        b.registradoEm = block.timestamp;
        b.existe = true;

        emit BebeRegistrado(id, msg.sender, _dataHash, block.timestamp);
    }

    // ------------------------------------------------------------------
    // Leitura
    // ------------------------------------------------------------------
    /// @notice Retorna um registro pelo id.
    function obterBebe(uint256 id) external view returns (Bebe memory) {
        if (!bebes[id].existe) revert RegistroInexistente();
        return bebes[id];
    }

    /// @notice Confere se um conjunto de dados corresponde ao hash gravado (integridade).
    function verificarIntegridade(
        uint256 id,
        string calldata _nome,
        string calldata _pai,
        string calldata _mae,
        string calldata _detalhesNascimento,
        string calldata _local
    ) external view returns (bool) {
        if (!bebes[id].existe) revert RegistroInexistente();
        return bebes[id].dataHash ==
            keccak256(abi.encode(_nome, _pai, _mae, _detalhesNascimento, _local));
    }
}
