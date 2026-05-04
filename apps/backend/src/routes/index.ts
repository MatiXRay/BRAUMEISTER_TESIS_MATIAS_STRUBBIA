import { Router } from 'express';
import maltasRouter        from './maltas';
import lupulosRouter       from './lupulos';
import levaduraRouter      from './levaduras';
import fermentadoresRouter from './fermentadores';
import estilosRouter       from './estilos';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Braumeister API' });
});

router.use('/maltas',        maltasRouter);
router.use('/lupulos',       lupulosRouter);
router.use('/levaduras',     levaduraRouter);
router.use('/fermentadores', fermentadoresRouter);
router.use('/estilos',       estilosRouter);

export default router;
