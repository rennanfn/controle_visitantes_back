import oracledb from 'oracledb';
import { ReturnDefault } from '../Interfaces';

export interface Visitante {
  cod_visitante?: number | undefined;
  nome?: string | undefined;
  rg?: string | undefined;
  empresa?: string | undefined;
  foto?: Blob | undefined;
  data_criacao?: Date | undefined;
  usuario_criacao?: number | undefined;
}

export interface CadVisitanteOut {
  cod_visitante: number;
  nome: string;
  rg: string;
  empresa: string;
  foto: Blob;
  data_criacao: string;
  usuario_criacao: number;
}

export interface VisitanteInterface {
  cod_visitante: number;
  nome: string;
  rg: string;
  empresa: string;
  foto: Blob;
  data_criacao: Date;
  usuario_criacao: number;
}

export interface FormVisitanteInterface {
  cod_visitante: number;
  nome: string;
  rg: string;
  empresa: string;
  foto: Blob;
  data_criacao: Date;
  usuario_criacao: number;
}

export default abstract class Cad_Visitante {
  private visitante: Visitante;

  constructor(obj?: Visitante) {
    this.visitante =
      obj ||
      ({
        cod_visitante: undefined,
        nome: undefined,
        rg: undefined,
        empresa: undefined,
        foto: undefined,
        data_criacao: undefined,
        usuario_criacao: undefined,
      } as Visitante);
  }
  getVisitanteObj(): Visitante {
    return this.visitante;
  }
  getCodVisitante(): number | undefined {
    return this.visitante.cod_visitante;
  }
  getNome(): string | undefined {
    return this.visitante.nome;
  }
  getRg(): string | undefined {
    return this.visitante.rg;
  }
  getEmpresa(): string | undefined {
    return this.visitante.empresa;
  }
  getFoto(): Blob | undefined {
    return this.visitante.foto;
  }
  getDataCriacao(): Date | undefined {
    return this.visitante.data_criacao;
  }
  getUsuarioCriacao(): number | undefined {
    return this.visitante.usuario_criacao;
  }

  abstract insert(
    obj: Visitante,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract update(
    obj: Visitante,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract show(conn: oracledb.Connection): Promise<CadVisitanteOut[]>;

  abstract find(
    cod_visitante: number,
    conn: oracledb.Connection,
  ): Promise<CadVisitanteOut[]>;
}
