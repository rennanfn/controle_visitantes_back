import { Router } from 'express';
import Cad_Usuario_Controller from '../controller/Cad_Usuario_Controller';
import { validaToken } from '../utils/token';

export const cadUsuarioRoutes = Router();

cadUsuarioRoutes.post('/', validaToken, Cad_Usuario_Controller.insert);
cadUsuarioRoutes.put('/', validaToken, Cad_Usuario_Controller.update);
cadUsuarioRoutes.delete(
  '/:cod_usuario',
  validaToken,
  Cad_Usuario_Controller.delete,
);
