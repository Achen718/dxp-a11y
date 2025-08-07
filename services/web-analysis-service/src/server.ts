import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { scanWebsite } from './controllers/scan-controller';
import path from 'node:path';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve basic test UI from /public if present
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/health', (_req: Request, res: Response) =>
  res.json({ status: 'OK', service: 'web-analysis-service' })
);
app.post('/scan', scanWebsite);

const PORT = Number(process.env.PORT) || 3003;
app.listen(PORT, () =>
  console.log(`web-analysis-service on http://localhost:${PORT}`)
);
