import { Router } from 'express';
import maltasRouter        from './maltas';
import lupulosRouter       from './lupulos';
import levaduraRouter      from './levaduras';
import fermentadoresRouter from './fermentadores';
import estilosRouter       from './estilos';
import reportesAguaRouter  from './reportesAgua';
import lotesRouter         from './lotes';
import estadisticasRouter  from './estadisticas';
import notasCataRouter     from './notasCata';
import planificacionRouter from './planificacion';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Braumeister API' });
});

router.use('/maltas',        maltasRouter);
router.use('/lupulos',       lupulosRouter);
router.use('/levaduras',     levaduraRouter);
router.use('/fermentadores', fermentadoresRouter);
router.use('/estilos',        estilosRouter);
router.use('/reportes-agua', reportesAguaRouter);
router.use('/lotes',         lotesRouter);
router.use('/estadisticas',  estadisticasRouter);
router.use('/notas-cata',    notasCataRouter);
router.use('/planificacion', planificacionRouter);

export default router;
