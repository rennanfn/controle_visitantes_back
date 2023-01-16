import {
  CadUsuarioOut,
  Usuario,
  UsuarioInterface,
} from './../model/Cad_usuario';
import { Request, Response } from 'express';
import { BdOracle } from '../model/BdOracle';
import { ErrorGeneral } from '../model/ErrorGeneral';
import criptografar from '../utils/criptografar';
import retornoPadrao from '../utils/retornoPadrao';
import CadUsuarioDB from '../modelDB/Cad_Usuario_DB';

export default class UsuarioController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    const usuario: UsuarioInterface = req.body;

    if (typeof usuario === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retor = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retor);
    }

    const cadUsuarioDB = new CadUsuarioDB();
    try {
      let senhaCrip;
      if (typeof usuario.senha !== 'undefined') {
        if (usuario.senha !== null) {
          senhaCrip = await criptografar.criptografarSenha(usuario.senha);
          usuario.senha = senhaCrip;
        }
      }
      const retorno = await cadUsuarioDB.insert(usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao inserir usuário ${usuario.cod_usuario}`,
        error,
      );
      return resp.status(400).json(resultErro);
      // return resp.status(400).json(error);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
  static async delete(req: Request, resp: Response): Promise<Response> {
    const { cod_usuario } = req.params;
    if (typeof cod_usuario === 'undefined') {
      return resp
        .status(400)
        .json(
          retornoPadrao(
            1,
            `Objeto recebido não é do tipo esperado ${cod_usuario}`,
          ),
        );
    }
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retor = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retor);
    }
    const cadUsuarioDB = new CadUsuarioDB();
    try {
      const retorno = await cadUsuarioDB.deleteObj(
        Number(cod_usuario),
        connection,
      );
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao deletar usuário ${cod_usuario}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    const usuario: Usuario = req.body;
    if (typeof usuario === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retor = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retor);
    }

    const cadUsuarioDB = new CadUsuarioDB();
    try {
      let senhaCrip;
      if (typeof usuario.senha !== 'undefined') {
        if (usuario.senha !== null) {
          senhaCrip = await criptografar.criptografarSenha(usuario.senha);
          usuario.senha = senhaCrip;
        }
      }
      const retorno = await cadUsuarioDB.update(usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao atualizar usuário ${usuario.cod_usuario}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
