import { sign } from 'jsonwebtoken';
import Cad_Usuario, {
  FormUsuarioInterface,
  Usuario,
  UsuarioInterface,
} from '../model/Cad_usuario';
import OracleDB, { outFormat } from 'oracledb';
import { ReturnDefault } from '../Interfaces';
import CreateBinds from '../utils/createBinds';
import createSqlCampos from '../utils/createSqlCampos';
import oracledb from 'oracledb';
import retornoPadrao from '../utils/retornoPadrao';
import convertLowerCase from '../utils/convertLowerCase';
import * as bcrypt from 'bcrypt';

interface UsuarioBindOut extends Usuario {
  cadUsuarioOut: string;
}

export default class CadUsuarioDB extends Cad_Usuario {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca oracledb
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no oracledb
    console.log(`Erro ao buscar usuário, rows = undefined`, 1);
    return new Error(`Erro ao buscar usuário, rows = undefined`);
  }

  async insert(
    obj: FormUsuarioInterface,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const resumo: UsuarioInterface = {
      cod_usuario: obj.cod_usuario,
      usuario: obj.usuario,
      senha: obj.senha,
    };

    const { cod_usuario, ...objUsuario } = resumo;

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        objUsuario,
        'visitantes_usuario',
        'insert',
        'RETURNING cod_usuario INTO :cadUsuarioOut',
      );
      const binds = CreateBinds.createBinds(objUsuario);
      binds.cadUsuarioOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };
      const connection = conn;
      try {
        const result = await connection.execute<UsuarioBindOut>(sql, binds);

        if (typeof result.outBinds === 'undefined') {
          console.log(`Erro ao inserir ${obj.usuario}, rows = undefined`, 1);
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir ${obj.usuario}, rows = undefined`,
            ),
          );
        }
        const usuarioGeralOutReturn = result.outBinds.cadUsuarioOut;
        if (usuarioGeralOutReturn.length <= 0) {
          // Se não retornou o cadUsuarioOut não deu certo o insert
          console.log(`Erro ao inserir usuário ${obj.usuario}`, 1);
          return resolve(
            retornoPadrao(1, `Erro ao inserir usuário ${obj.usuario}`),
          );
        }
        // Se retornou usuarioOut é porque inseriu
        console.log(
          `Usuário Cód: ${usuarioGeralOutReturn} - Login: ${obj.usuario}, inserido com sucesso`,
          0,
        );
        return resolve(
          retornoPadrao(
            0,
            `Usuário Cód: ${usuarioGeralOutReturn} - Login: ${obj.usuario}, inserido com sucesso`,
          ),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async deleteObj(
    cod_usuario: number,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      console.log(`Tentando deletar o Usuario ${cod_usuario}`, 0);
      let resposta = {} as ReturnDefault;
      const sql =
        'delete from visitantes_usuario where cod_usuario = :cod_usuario';
      const connection = conn;
      try {
        const result = await connection.execute(sql, [cod_usuario]);
        const deletedResult = result.rowsAffected;
        if (typeof deletedResult === 'undefined') {
          console.log(`Erro ao deletar ${cod_usuario}, result = undefined`, 1);
          return reject(
            retornoPadrao(
              1,
              `Erro ao deletar ${cod_usuario}, result = undefined`,
            ),
          );
        }
        if (deletedResult <= 0) {
          // Se retornar 0 é porque não deletou nenhuma linha.
          resposta = retornoPadrao(
            0,
            `Não encontrado nenhum nenhum Usuario ${cod_usuario} para deletar.`,
          );
        } else {
          // Se retornar 1 ou mais em deletedResult é porque deletou alguma coisa
          resposta = retornoPadrao(
            0,
            `Usuario ${cod_usuario} deletado com sucesso.`,
          );
        }
        console.log(resposta.retorno.mensagem, 0);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: Usuario,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    console.log(`Tentando atualizar Usuário ${obj.cod_usuario}`, 0);

    const sql = createSqlCampos(
      obj,
      'visitantes_usuario',
      'update',
      'where cod_usuario= :cod_usuario RETURNING cod_usuario INTO :cadUsuarioOut',
    );
    const binds = CreateBinds.createBinds(obj);
    binds.cadUsuarioOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    const connection = conn;
    try {
      const result = await connection.execute<UsuarioBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const returnUsuario = result.outBinds.cadUsuarioOut;
      if (returnUsuario.length <= 0) {
        console.log(`Não encontrado nenhum Usuario ${obj.cod_usuario}`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado nenhum usuário ${obj.cod_usuario}`),
        );
      }
      console.log(`Usuário ${obj.cod_usuario} atualizado com sucesso`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Usuário ${obj.cod_usuario} atualizado com sucesso.`),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findUsuario(
    cod_usuario: number,
    conn: oracledb.Connection,
  ): Promise<Usuario[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `select cod_usuario, usuario, senha from visitantes_usuario where usuario = :usuario`;
      const connection = conn;
      try {
        const result = await connection.execute<Usuario>(sql, [cod_usuario], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        const usuarios = result.rows;
        if (typeof usuarios === 'undefined') {
          console.log(
            `Erro ao buscar o usuário ${cod_usuario}, rows = undefined`,
            1,
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao buscar o usuário ${cod_usuario}, rows = undefined`,
            ),
          );
        }

        return resolve(convertLowerCase(usuarios));
      } catch (error) {
        return reject(error);
      }
    });
  }

  async find(usuario: string, conn: oracledb.Connection): Promise<Usuario[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `select cod_usuario, usuario, senha from visitantes_usuario where usuario = :usuario`;
      const connection = conn;
      try {
        const result = await connection.execute<Usuario>(sql, [usuario], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        const usuarios = result.rows;
        if (typeof usuarios === 'undefined') {
          console.log(
            `Erro ao buscar o usuário ${usuario}, rows = undefined`,
            1,
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao buscar o usuário ${usuario}, rows = undefined`,
            ),
          );
        }

        return resolve(convertLowerCase(usuarios));
      } catch (error) {
        return reject(error);
      }
    });
  }
}
