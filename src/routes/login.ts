import { validaToken } from './../utils/token';
import { Router } from 'express';

import { Login } from '../controller/Login';

export const loginRoutes = Router();

loginRoutes.post('/', Login.autenticar);

loginRoutes.get('/', Login.autenticar);

/*loginRoutes.get('/', validaToken, (req, res) => {
  res.json({});
});*/
