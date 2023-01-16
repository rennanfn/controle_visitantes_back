import {
  CadVisitanteOut,
  FormVisitanteInterface,
  VisitanteInterface,
} from './../model/Cad_visitante';
import oracledb from 'oracledb';
import OracleDB from 'oracledb';
import { ReturnDefault } from '../Interfaces';
import Cad_Visitante, { Visitante } from '../model/Cad_visitante';
import CreateBinds from '../utils/createBinds';
import createSqlCampos from '../utils/createSqlCampos';
import retornoPadrao from '../utils/retornoPadrao';
import convertLowerCase from '../utils/convertLowerCase';
import { convertDate2String } from '../utils/dateNow';

interface VisitanteBindOut extends Visitante {
  cadVisitanteOut: string;
}

export default class CadVisitanteDB extends Cad_Visitante {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca oracledb
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no oracledb
    console.log(`Erro ao buscar visitante, rows = undefined`, 1);
    return new Error(`Erro ao buscar visitante, rows = undefined`);
  }

  async insert(
    obj: FormVisitanteInterface,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const resumo: VisitanteInterface = {
      cod_visitante: obj.cod_visitante,
      nome: obj.nome,
      rg: obj.rg,
      empresa: obj.empresa,
      foto: obj.foto,
      data_criacao: obj.data_criacao,
      usuario_criacao: obj.usuario_criacao,
    };

    const { cod_visitante, ...objAgendamento } = resumo;

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        objAgendamento,
        'visitantes_cadastro',
        'insert',
        'RETURNING cod_visitante INTO :cadVisitanteOut',
      );
      const binds = CreateBinds.createBinds(objAgendamento);

      binds.cadVisitanteOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      delete binds.data_criacao;
      binds.data_criacao = {
        val: obj.data_criacao,
        type: OracleDB.DATE,
      };

      const connection = conn;
      try {
        const result = await connection.execute<VisitanteBindOut>(sql, binds);

        if (typeof result.outBinds === 'undefined') {
          console.log(`Erro ao inserir ${obj.nome}, rows = undefined`, 1);
          return reject(
            retornoPadrao(1, `Erro ao inserir ${obj.nome}, rows = undefined`),
          );
        }
        const visitanteGeralOutReturn = result.outBinds.cadVisitanteOut;
        if (visitanteGeralOutReturn.length <= 0) {
          // Se não retornou o cadUsuarioOut não deu certo o insert
          console.log(`Erro ao inserir visitante ${obj.nome}`, 1);
          return resolve(
            retornoPadrao(1, `Erro ao inserir visitante ${obj.nome}`),
          );
        }
        // Se retornou usuarioOut é porque inseriu
        console.log(
          `Visitante Cód: ${visitanteGeralOutReturn} - Nome: ${obj.nome}, inserido com sucesso`,
          0,
        );
        return resolve(
          retornoPadrao(
            0,
            `Visitante Cód: ${visitanteGeralOutReturn} - Nome: ${obj.nome}, inserido com sucesso`,
          ),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: FormVisitanteInterface,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    const resumo: VisitanteInterface = {
      cod_visitante: obj.cod_visitante,
      nome: obj.nome,
      rg: obj.rg,
      empresa: obj.empresa,
      foto: obj.foto,
      data_criacao: obj.data_criacao,
      usuario_criacao: obj.usuario_criacao,
    };

    const sql = createSqlCampos(
      obj,
      'visitantes_cadastro',
      'update',
      'where cod_visitante = :cod_visitante RETURNING cod_visitante INTO :cadVisitanteOut',
    );
    const binds = CreateBinds.createBinds(obj);
    binds.cadVisitanteOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    const connection = conn;
    try {
      const result = await connection.execute<VisitanteBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const returnVisitante = result.outBinds.cadVisitanteOut;
      if (returnVisitante.length <= 0) {
        console.log(`Não encontrado nenhum visitante ${obj.cod_visitante}`, 1);
        return Promise.resolve(
          retornoPadrao(
            0,
            `Não encontrado nenhum visitante ${obj.cod_visitante}`,
          ),
        );
      }
      console.log(`Visitante ${obj.cod_visitante} atualizado com sucesso`, 0);
      return Promise.resolve(
        retornoPadrao(
          0,
          `Visitante ${obj.cod_visitante} atualizado com sucesso.`,
        ),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: OracleDB.Connection): Promise<CadVisitanteOut[]> {
    const sql = `SELECT cod_visitante,
                 nome,
                 rg,
                 empresa,
                 data_criacao,
                 usuario_criacao
                 FROM visitantes_cadastro
                 ORDER BY cod_visitante asc`;
    const result = await conn.execute<CadVisitanteOut>(sql, [], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    const res_visita = result.rows;
    if (typeof res_visita === 'undefined') {
      return Promise.reject(this.rowsUndefined());
    }
    const visita_lower = convertLowerCase(res_visita);
    const visitas = visita_lower.map(visita => {
      const item_visita = visita;
      item_visita.data_criacao = convertDate2String(
        new Date(visita.data_criacao),
      );

      return item_visita;
    });
    return Promise.resolve(visitas);
  }

  async find(
    cod_visitante: number,
    conn: oracledb.Connection,
  ): Promise<CadVisitanteOut[]> {
    const sql = `SELECT cod_visitante,
                  nome,
                  rg,
                  empresa,
                  data_criacao,
                  usuario_criacao
                FROM visitantes_cadastro
                WHERE cod_visitante = :cod_visitante`;
    const result = await conn.execute<CadVisitanteOut>(sql, [cod_visitante], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    const res_visita = result.rows;
    if (typeof res_visita === 'undefined') {
      return Promise.reject(this.rowsUndefined());
    }
    const visita_lower = convertLowerCase(res_visita);
    const visitantes = visita_lower.map(visita => {
      const item_visita = visita;
      item_visita.data_criacao = convertDate2String(
        new Date(visita.data_criacao),
      );

      return item_visita;
    });

    return Promise.resolve(visitantes);
  }
}
