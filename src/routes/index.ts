import { validaToken } from './../utils/token';
import { cadAgendamentoRoutes } from './cad_agendamento';
import { loginRoutes } from './login';
import { Router } from 'express';
import { cadUsuarioRoutes } from './cad_usuario';
import { cadVisitanteRoutes } from './cad_visitante';

export const routes = Router();

/*routes.get('/', validaToken, (req, res) => {
  res.json({ msg: 'OK' });
});*/

routes.use('/login', loginRoutes);
routes.use('/cadUsuario', cadUsuarioRoutes);
routes.use('/cadAgendamento', cadAgendamentoRoutes);
routes.use('/cadVisitante', cadVisitanteRoutes);
