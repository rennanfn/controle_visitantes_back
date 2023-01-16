import { routes } from './routes/index';
import express, { request, response } from 'express';
import oracledb from 'oracledb';
import dbconfig from './DB/dbconfig';
import cors from 'cors';

async function init() {
  try {
    // oracledb.fetchAsString = [oracledb.NUMBER];
    console.log('Aguarde, criando pool');
    await oracledb.createPool(dbconfig);
    console.log('Pool Oracle criado');
  } catch (error) {
    // consoleLog(`Erro ao iniciar pool do Oracle ${error.message}`, 1);
    console.log(`Erro ao iniciar pool do Oracle`);
  }
}
const app = express();
app.use(cors());
app.use(express.json());

app.use(routes);

app.listen(3333, () => {
  console.log('Servidor iniciado na porta 3333');
  init();
});
