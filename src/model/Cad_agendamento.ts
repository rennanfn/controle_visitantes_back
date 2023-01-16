import oracledb from 'oracledb';
import { ReturnDefault } from '../Interfaces';

export interface Agendamento {
  cod_agendamento?: number | undefined;
  visitante?: string | undefined;
  data?: string | undefined;
  hora?: string | undefined;
  observacao?: string | undefined;
  status?: string | undefined;
  data_criacao?: Date | undefined;
  usuario_criacao?: number | undefined;
}

export interface AgendamentoInterface {
  cod_agendamento: number;
  visitante: string;
  data: string;
  hora: string;
  observacao: string;
  status: string;
  data_criacao: Date;
  usuario_criacao: number;
}

export interface cadAgendamentoOut {
  cod_agendamento: number;
  visitante: string;
  data: string;
  hora: string;
  observacao: string;
  status: string;
  data_criacao: string;
  usuario_criacao: number;
}

export interface FormVisitanteInterface {
  visitante: string;
}

export interface FormAgendamentoInterface {
  cod_agendamento: number;
  visitante: string;
  data: string;
  hora: string;
  observacao: string;
  status: string;
  data_criacao: Date;
  usuario_criacao: number;
}

export default abstract class Cad_Agendamento {
  private agendamento: Agendamento;

  constructor(obj?: Agendamento) {
    this.agendamento =
      obj ||
      ({
        cod_agendamento: undefined,
        visitante: undefined,
        data: undefined,
        hora: undefined,
        observacao: undefined,
        status: undefined,
        data_criacao: undefined,
        usuario_criacao: undefined,
      } as Agendamento);
  }
  getAgendamentoObj(): Agendamento {
    return this.agendamento;
  }
  getCodAgendamento(): number | undefined {
    return this.agendamento.cod_agendamento;
  }
  getVisitante(): string | undefined {
    return this.agendamento.visitante;
  }
  getData(): string | undefined {
    return this.agendamento.data;
  }
  getHora(): string | undefined {
    return this.agendamento.hora;
  }
  getObervacao(): string | undefined {
    return this.agendamento.observacao;
  }
  getStatus(): string | undefined {
    return this.agendamento.status;
  }
  getDataCriacao(): Date | undefined {
    return this.agendamento.data_criacao;
  }
  getUsuarioCriacao(): number | undefined {
    return this.agendamento.usuario_criacao;
  }

  abstract insert(
    obj: Agendamento,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract update(
    obj: Agendamento,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract delete(
    cod_agendamento: number,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault>;

  abstract show(conn: oracledb.Connection): Promise<cadAgendamentoOut[]>;

  abstract find(
    cod_agendamento: number,
    conn: oracledb.Connection,
  ): Promise<cadAgendamentoOut[]>;
}
