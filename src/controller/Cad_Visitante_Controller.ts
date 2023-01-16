import { BdOracle } from '../model/BdOracle';
import { ErrorGeneral } from '../model/ErrorGeneral';
import retornoPadrao from '../utils/retornoPadrao';
import { Visitante, VisitanteInterface } from './../model/Cad_visitante';
import CadVisitanteDB from '../modelDB/Cad_Visitante_DB';
import { Request, Response } from 'express';

export default class VisitanteController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    const visitante: VisitanteInterface = req.body;

    if (typeof visitante === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    visitante.data_criacao = new Date();

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

    const cadVisitanteDB = new CadVisitanteDB();
    try {
      const retorno = await cadVisitanteDB.insert(visitante, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao inserir visitante ${visitante.cod_visitante}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
  static async update(req: Request, resp: Response): Promise<Response> {
    const visitante: VisitanteInterface = req.body;
    if (typeof visitante === 'undefined') {
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

    const cadVisitanteDB = new CadVisitanteDB();
    try {
      const retorno = await cadVisitanteDB.update(visitante, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao inserir usuário ${visitante.cod_visitante}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async show(req: Request, resp: Response): Promise<Response> {
    const { cod_visitante } = req.body;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erroG = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(erroG);
    }

    const CadVisitante = new CadVisitanteDB();
    try {
      const retorno = await CadVisitante.show(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async find(req: Request, resp: Response): Promise<Response> {
    const { cod_visitante } = req.params;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erroG = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(erroG);
    }

    const CadVisitante = new CadVisitanteDB();
    try {
      const retorno = await CadVisitante.find(
        Number(cod_visitante),
        connection,
      );
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
