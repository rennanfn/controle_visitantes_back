import { ReturnDefault } from '../Interfaces';
import oracledb from 'oracledb';

export interface Usuario {
  cod_usuario?: number | undefined;
  usuario?: string | undefined;
  senha?: string | undefined;
}

export interface CadUsuarioOut {
  cod_usuario?: number;
  usuario?: string;
  senha?: string;
}

export interface FormUsuarioInterface {
  cod_usuario: number;
  usuario: string;
  senha: string;
}

export interface UsuarioInterface {
  cod_usuario: number;
  usuario: string;
  senha: string;
}

export interface ParamAutorizUsu {
  cod_usuario: number;
  objeto: string;
  acao: string;
}

export default abstract class Cad_Usuario {
  private usuario: Usuario;

  constructor(obj?: Usuario) {
    this.usuario =
      obj ||
      ({
        cod_usuario: undefined,
        usuario: undefined,
        senha: undefined,
      } as Usuario);
  }
  getUsuarioObj(): Usuario {
    return this.usuario;
  }
  getCodUsuario(): number | undefined {
    return this.usuario.cod_usuario;
  }
  getUsuario(): string | undefined {
    return this.usuario.usuario;
  }
  getSenha(): string | undefined {
    return this.usuario.senha;
  }

  abstract insert(
    obj: Usuario,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract deleteObj(
    cod_usuario: number,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract update(
    obj: Usuario,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;
}
