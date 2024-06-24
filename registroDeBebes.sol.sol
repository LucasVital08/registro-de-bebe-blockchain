// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RegistroDeBebes {
    struct Bebe {
        string nome;
        string pai;
        string mae;
        string detalhesNascimento;
        string local;
    }

    Bebe public bebe;

    event BebeRegistrado(
        string nome,
        string pai,
        string mae,
        string detalhesNascimento,
        string local
    );

    function registrarBebe(
        string memory _nome,
        string memory _pai,
        string memory _mae,
        string memory _detalhesNascimento,
        string memory _local
    ) public {
        bebe = Bebe({
            nome: _nome,
            pai: _pai,
            mae: _mae,
            detalhesNascimento: _detalhesNascimento,
            local: _local
        });

        emit BebeRegistrado(_nome, _pai, _mae, _detalhesNascimento, _local);
    }

    function obterBebe() public view returns (Bebe memory) {
        return bebe;
    }
}
