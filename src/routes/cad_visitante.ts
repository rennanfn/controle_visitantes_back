import { Router } from 'express';
import Cad_Visitante_Controller from '../controller/Cad_Visitante_Controller';
import { validaToken } from '../utils/token';

export const cadVisitanteRoutes = Router();

cadVisitanteRoutes.post('/', validaToken, Cad_Visitante_Controller.insert);
cadVisitanteRoutes.put('/', validaToken, Cad_Visitante_Controller.update);
cadVisitanteRoutes.get('/', validaToken, Cad_Visitante_Controller.show);
cadVisitanteRoutes.get(
  '/:cod_visitante',
  validaToken,
  Cad_Visitante_Controller.find,
);
