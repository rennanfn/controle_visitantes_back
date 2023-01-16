import { validaToken } from './../utils/token';
import { CadUsuarioOut } from './../model/Cad_usuario';
import oracledb, { Connection, connectionClass } from 'oracledb';
import { Request, Response } from 'express';
import { BdOracle } from '../model/BdOracle';
import { Usuario } from '../model/Cad_usuario';
import { ErrorGeneral } from '../model/ErrorGeneral';
import CadUsuarioDB from '../modelDB/Cad_Usuario_DB';
import Criptografar from '../utils/criptografar';
import retornoPadrao from '../utils/retornoPadrao';
import { Token } from '../Interfaces';
//import jwt from 'jsonwebtoken';
import {
  gerarAutorizacoes,
  gerarToken,
  getDataToRefresh,
} from '../utils/token';

export class Login {
  /*static async autenticar(req: Request, resp: Response): Promise<Response> {
    const { usuario, senha } = req.body;
    console.log(`recebido ${usuario}, ${senha}`);
    if (usuario === 'admin' && senha === 'admin') {
      return resp.json({ auth: true });
    }
    return resp.status(400).json({ msg: 'Login ou senha inválidos' });
  }*/

  static async autenticar(req: Request, resp: Response): Promise<Response> {
    const usuario: Usuario = req.body;

    if (
      typeof usuario.usuario === 'undefined' ||
      typeof usuario.senha === 'undefined'
    ) {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebeido não é do tipo esperado'));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retorno = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retorno);
    }

    const cadUsuario = new CadUsuarioDB();
    try {
      console.log(`Validando usuário ${usuario.usuario} e senha`, 0);

      const usuarioBD = await cadUsuario.find(usuario.usuario, connection);

      if (usuarioBD.length === 0) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos.`));
      }
      if (
        typeof usuarioBD[0].senha === 'undefined' ||
        usuarioBD[0].senha === null
      ) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos.`));
      }

      const senhasConferem = await Criptografar.compararSenhas(
        usuario.senha,
        usuarioBD[0].senha,
      );

      if (senhasConferem) {
        const dadosToken = await Login.prepararToken(usuarioBD[0], connection);

        const token = gerarToken(dadosToken);
        if (token === '') {
          return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
        }
        console.log(`Token gerado com sucesso.`, 0);
        return resp.status(200).json({ token });
      }
      return resp.json(usuarioBD);
    } catch (error) {
      await connection.rollback();
      const retorno = ErrorGeneral.getErrorGeneral(
        'Erro ao autenticar usuário',
        error,
      );
      return resp.status(400).json(retorno);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async prepararToken(
    usuarioBD: Usuario,
    connection: oracledb.Connection,
  ): Promise<Token> {
    const cadUsuario = new CadUsuarioDB();

    if (
      typeof usuarioBD.usuario === 'undefined' ||
      usuarioBD.usuario === null
    ) {
      return {} as Token;
    }
    const usuarioNome = await cadUsuario.find(usuarioBD.usuario, connection);

    const dadosToken: Token = {
      cod_usuario: Number(usuarioNome[0].cod_usuario),
      usuario:
        typeof usuarioNome[0].usuario !== 'undefined'
          ? usuarioNome[0].usuario
          : '',
      /*senha:
        typeof usuarioNome[0].senha !== 'undefined' ? usuarioNome[0].senha : '',*/
    };
    return dadosToken;
  }

  static async refreshToken(req: Request, resp: Response): Promise<Response> {
    const token = req.headers.authorization;
    const userIp = req.userIp?.ip ?? '';

    if (typeof token === 'undefined') {
      console.log(
        `Request sem token, cancelado refresh token - ip: ${userIp}`,
        1,
      );
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`),
        );
    }

    const dataToken = getDataToRefresh(token, userIp);
    if (!dataToken) {
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`),
        );
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retorno = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retorno);
    }

    try {
      console.log(`Validando usuário - RefreshToken ${dataToken.usuario}`, 0);
      const cadUsuario = new CadUsuarioDB();
      const usuarioBD = await cadUsuario.find(dataToken.usuario, connection);

      if (usuarioBD.length === 0) {
        console.log(
          `Usuário ${dataToken.usuario} não encontrado - ip: ${userIp}`,
          1,
        );
        return resp
          .status(400)
          .json(retornoPadrao(1, `Erro ao tentar atualizar token`));
      }

      const dadosToken = await Login.prepararToken(usuarioBD[0], connection);

      const tokenNovo = gerarToken(dadosToken);
      if (tokenNovo === '') {
        return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
      }

      console.log(`Token gerado com sucesso`, 0);
      return resp.status(200).json({ token: tokenNovo });
    } catch (error) {
      const resultErro = ErrorGeneral.getErrorGeneral(
        'Erro ao atualizar token',
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
