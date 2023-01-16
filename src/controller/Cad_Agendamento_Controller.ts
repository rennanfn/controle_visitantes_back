import { AgendamentoInterface } from './../model/Cad_agendamento';
import { BdOracle } from '../model/BdOracle';
import { ErrorGeneral } from '../model/ErrorGeneral';
import { Request, Response } from 'express';
import retornoPadrao from '../utils/retornoPadrao';
import CadAgendamentoDB from '../modelDB/Cad_Agendamento_DB';

export default class AgendamentoController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    const agendamento: AgendamentoInterface = req.body;

    if (typeof agendamento === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    agendamento.data_criacao = new Date();

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

    const cadAgendamentoDB = new CadAgendamentoDB();

    try {
      const retorno = await cadAgendamentoDB.insert(agendamento, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      console.log(error);
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao inserir agendamento ${agendamento.cod_agendamento}`,
        error,
      );

      return resp.status(400).json(resultErro);
      // return resp.status(400).json(error);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    const agendamento: AgendamentoInterface = req.body;
    if (typeof agendamento === 'undefined') {
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

    const cadAgendamentoDB = new CadAgendamentoDB();
    try {
      const retorno = await cadAgendamentoDB.update(agendamento, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao atualizar agendamento ${agendamento.cod_agendamento}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async delete(req: Request, resp: Response): Promise<Response> {
    const { cod_agendamento } = req.params;
    if (typeof cod_agendamento === 'undefined') {
      return resp
        .status(400)
        .json(
          retornoPadrao(
            1,
            `Objeto recebido não é do tipo esperado ${cod_agendamento}`,
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
    const cadAgendamentoDB = new CadAgendamentoDB();
    try {
      const retorno = await cadAgendamentoDB.delete(
        Number(cod_agendamento),
        connection,
      );
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao deletar agendamento ${cod_agendamento}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async show(req: Request, resp: Response): Promise<Response> {
    const { cod_agendamento } = req.body;

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

    const CadAgendamento = new CadAgendamentoDB();
    try {
      const retorno = await CadAgendamento.show(connection);
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
    const { cod_agendamento } = req.params;

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

    const CadAgendamento = new CadAgendamentoDB();
    try {
      const retorno = await CadAgendamento.find(
        Number(cod_agendamento),
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
