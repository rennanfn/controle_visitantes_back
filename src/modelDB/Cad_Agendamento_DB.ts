import oracledb from 'oracledb';
import OracleDB from 'oracledb';
import { ReturnDefault } from '../Interfaces';
import convertLowerCase from '../utils/convertLowerCase';
import CreateBinds from '../utils/createBinds';
import createSqlCampos from '../utils/createSqlCampos';
import { convertDate2String } from '../utils/dateNow';
import retornoPadrao from '../utils/retornoPadrao';
import Cad_Agendamento, {
  Agendamento,
  AgendamentoInterface,
  cadAgendamentoOut,
  FormAgendamentoInterface,
} from './../model/Cad_agendamento';

export interface AgendamentoBindOut extends AgendamentoInterface {
  cadAgendamentoOut: string;
}

export default class CadAgendamentoDB extends Cad_Agendamento {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca oracledb
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no oracledb
    console.log(`Erro ao buscar agendamento, rows = undefined`, 1);
    return new Error(`Erro ao buscar agendamento, rows = undefined`);
  }

  async insert(
    obj: FormAgendamentoInterface,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const resumo: AgendamentoInterface = {
      cod_agendamento: obj.cod_agendamento,
      visitante: obj.visitante,
      data: obj.data,
      hora: obj.hora,
      observacao: obj.observacao,
      status: obj.status,
      data_criacao: obj.data_criacao,
      usuario_criacao: obj.usuario_criacao,
    };

    const new_data = convertDate2String(new Date(resumo.data));
    const [day, month, year] = new_data.split('/');
    const data = new Date(`${month}/${day}/${year}`);

    const { cod_agendamento, ...objAgendamento } = resumo;

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        objAgendamento,
        'visitantes_agendamento',
        'insert',
        'RETURNING cod_agendamento INTO :cadAgendamentoOut',
      );
      const binds = CreateBinds.createBinds(objAgendamento);
      binds.cadAgendamentoOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      delete binds.data;
      binds.data = {
        val: data,
        type: OracleDB.DATE,
      };

      delete binds.data_criacao;
      binds.data_criacao = {
        val: obj.data_criacao,
        type: OracleDB.DATE,
      };

      const connection = conn;
      try {
        const result = await connection.execute<AgendamentoBindOut>(sql, binds);

        if (typeof result.outBinds === 'undefined') {
          console.log(
            `Erro ao inserir ${obj.cod_agendamento}, rows = undefined`,
            1,
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir ${obj.cod_agendamento}, rows = undefined`,
            ),
          );
        }
        const agendamentoGeralOutReturn = result.outBinds.cadAgendamentoOut;
        if (agendamentoGeralOutReturn.length <= 0) {
          // Se não retornou o cadAgendamentoOut não deu certo o insert
          console.log(`Erro ao inserir agendamento ${obj.cod_agendamento}`, 1);
          return resolve(
            retornoPadrao(
              1,
              `Erro ao inserir agendamento ${obj.cod_agendamento}`,
            ),
          );
        }
        // Se retornou usuarioOut é porque inseriu
        console.log(
          `Agendamento Cód: ${agendamentoGeralOutReturn}, inserido com sucesso`,
          0,
        );
        return resolve(
          retornoPadrao(
            0,
            `Agendamento Cód: ${agendamentoGeralOutReturn}, inserido com sucesso`,
          ),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: FormAgendamentoInterface,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const resumo: AgendamentoInterface = {
      cod_agendamento: obj.cod_agendamento,
      visitante: obj.visitante,
      data: obj.data,
      hora: obj.hora,
      observacao: obj.observacao,
      status: obj.status,
      data_criacao: obj.data_criacao,
      usuario_criacao: obj.usuario_criacao,
    };

    const new_data = convertDate2String(new Date(resumo.data));
    const [day, month, year] = new_data.split('/');
    const data = new Date(`${month}/${day}/${year}`);

    const sql = createSqlCampos(
      obj,
      'visitantes_agendamento',
      'update',
      'where cod_agendamento = :cod_agendamento RETURNING cod_agendamento INTO :cadAgendamentoOut',
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadAgendamentoOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    delete binds.data;
    binds.data = {
      val: data,
      type: OracleDB.DATE,
    };

    const connection = conn;
    try {
      const result = await connection.execute<AgendamentoBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const returnAgendamento = result.outBinds.cadAgendamentoOut;
      if (returnAgendamento.length <= 0) {
        console.log(
          `Não encontrado nenhum agendamento ${obj.cod_agendamento}`,
          1,
        );
        return Promise.resolve(
          retornoPadrao(
            0,
            `Não encontrado nenhum agendamento ${obj.cod_agendamento}`,
          ),
        );
      }
      console.log(
        `Agendamento ${resumo.cod_agendamento} atualizado com sucesso`,
        0,
      );
      return Promise.resolve(
        retornoPadrao(
          0,
          `Agendamento ${resumo.cod_agendamento} atualizado com sucesso.`,
        ),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(
    cod_agendamento: number,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      console.log(`Tentando deletar o agendamento ${cod_agendamento}`, 0);
      let resposta = {} as ReturnDefault;
      const sql =
        'delete from visitantes_agendamento where cod_agendamento = :cod_agendamento';
      const connection = conn;
      try {
        const result = await connection.execute(sql, [cod_agendamento]);
        const deletedResult = result.rowsAffected;
        if (typeof deletedResult === 'undefined') {
          console.log(
            `Erro ao deletar ${cod_agendamento}, result = undefined`,
            1,
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao deletar ${cod_agendamento}, result = undefined`,
            ),
          );
        }
        if (deletedResult <= 0) {
          // Se retornar 0 é porque não deletou nenhuma linha.
          resposta = retornoPadrao(
            0,
            `Não encontrado nenhum nenhum agendamento ${cod_agendamento} para deletar.`,
          );
        } else {
          // Se retornar 1 ou mais em deletedResult é porque deletou alguma coisa
          resposta = retornoPadrao(
            0,
            `Agendamento ${cod_agendamento} deletado com sucesso.`,
          );
        }
        console.log(resposta.retorno.mensagem, 0);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async show(conn: OracleDB.Connection): Promise<cadAgendamentoOut[]> {
    const sql = `SELECT cod_agendamento,
                 visitante,
                 data,
                 hora,
                 observacao,
                 status,
                 data_criacao,
                 usuario_criacao
                 FROM visitantes_agendamento
                 ORDER BY cod_agendamento asc`;
    const result = await conn.execute<cadAgendamentoOut>(sql, [], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    const res_agenda = result.rows;
    if (typeof res_agenda === 'undefined') {
      return Promise.reject(this.rowsUndefined());
    }
    const agenda_lower = convertLowerCase(res_agenda);
    const agenda = agenda_lower.map(agenda => {
      const item_agenda = agenda;
      item_agenda.data_criacao = convertDate2String(
        new Date(agenda.data_criacao),
      );
      item_agenda.data = convertDate2String(new Date(agenda.data));

      return item_agenda;
    });
    return Promise.resolve(agenda);
  }

  async find(
    cod_agendamento: number,
    conn: oracledb.Connection,
  ): Promise<cadAgendamentoOut[]> {
    const sql = `SELECT cod_agendamento,
                  visitante,
                  data,
                  hora,
                  observacao,
                  status,
                  data_criacao,
                  usuario_criacao
                FROM visitantes_agendamento
                WHERE cod_agendamento = :cod_agendamento`;
    const result = await conn.execute<cadAgendamentoOut>(
      sql,
      [cod_agendamento],
      {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      },
    );
    const res_agenda = result.rows;
    if (typeof res_agenda === 'undefined') {
      return Promise.reject(this.rowsUndefined());
    }
    const agenda_lower = convertLowerCase(res_agenda);
    const agendamento = agenda_lower.map(agenda => {
      const item_agenda = agenda;
      item_agenda.data_criacao = convertDate2String(
        new Date(agenda.data_criacao),
      );
      item_agenda.data = convertDate2String(new Date(agenda.data));

      return item_agenda;
    });

    return Promise.resolve(agendamento);
  }
}
