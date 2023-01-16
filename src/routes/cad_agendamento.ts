import { validaToken } from './../utils/token';
import { Router } from 'express';
import Cad_Agendamento_Controller from '../controller/Cad_Agendamento_Controller';

export const cadAgendamentoRoutes = Router();

cadAgendamentoRoutes.post('/', validaToken, Cad_Agendamento_Controller.insert);
cadAgendamentoRoutes.put('/', validaToken, Cad_Agendamento_Controller.update);
cadAgendamentoRoutes.get('/', validaToken, Cad_Agendamento_Controller.show);
cadAgendamentoRoutes.get(
  '/:cod_agendamento',
  validaToken,
  Cad_Agendamento_Controller.find,
);
cadAgendamentoRoutes.delete(
  '/:cod_agendamento',
  validaToken,
  Cad_Agendamento_Controller.delete,
);
