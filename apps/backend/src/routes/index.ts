import { Router } from 'express';
import maltasRouter from './maltas';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Braumeister API' });
});

router.use('/maltas', maltasRouter);

export default router;
