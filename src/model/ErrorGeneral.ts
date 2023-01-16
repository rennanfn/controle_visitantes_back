/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import { ErroType, ReturnDefault } from '../Interfaces';

export class ErrorGeneral extends ReturnDefault {
  static getErrorGeneral(arg0: string, error: unknown) {
    throw new Error('Method not implemented.');
  }
  retorno: { erro: ErroType; mensagem: string };

  constructor(retorno: ReturnDefault) {
    super();
    this.retorno = retorno.retorno;
  }
}
