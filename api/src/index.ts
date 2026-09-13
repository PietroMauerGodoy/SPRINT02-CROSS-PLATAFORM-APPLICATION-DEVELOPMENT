import express, { Request, Response } from 'express';
import cors from 'cors';
import { ehLeituraValida, LeituraSensorRaw } from './types';
import { registrarLeitura, consumirLeiturasPendentes, contarLeiturasPendentes } from './armazenamento';

const app = express();

// CORS liberado pra qualquer origem — o app roda em Web (navegador) e faz
// fetch direto pra essa API; sem isso o navegador bloqueia a requisição.
// Suficiente pro escopo do projeto (sem autenticação hoje).
app.use(cors());
app.use(express.json());

// Health-check — útil pra confirmar que o deploy no Render/Railway está de
// pé (e pra saber quantas leituras estão esperando um GET).
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', leiturasPendentes: contarLeiturasPendentes() });
});

// ESP32 chama isso a cada leitura (uma por vez) — ou, se preferir mandar
// várias de uma vez, aceita um array no corpo também.
app.post('/sensores/leituras', (req: Request, res: Response) => {
  const corpo: unknown = req.body;
  const candidatas = Array.isArray(corpo) ? corpo : [corpo];

  const validas = candidatas.filter(ehLeituraValida) as LeituraSensorRaw[];
  const invalidas = candidatas.length - validas.length;

  if (validas.length === 0) {
    res.status(400).json({
      erro: 'Corpo inválido. Esperado { "id": string, "altura": number } ou um array desses objetos.',
    });
    return;
  }

  validas.forEach(registrarLeitura);
  res.status(201).json({ registradas: validas.length, ignoradas: invalidas });
});

// O app Motiva chama isso quando alguém aperta "Atualizar" no Kanban —
// devolve tudo que se acumulou desde a última chamada (ver armazenamento.ts).
app.get('/sensores/leituras', (_req: Request, res: Response) => {
  res.json(consumirLeiturasPendentes());
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API de sensores Motiva rodando na porta ${PORT}`);
});
