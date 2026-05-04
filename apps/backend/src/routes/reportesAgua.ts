import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listarReportes, obtenerReporte, crearReporte, actualizarReporte, eliminarReporte } from '../controllers/reporteAguaController';

const router = Router();
router.use(requireAuth);

router.get('/',     listarReportes);
router.get('/:id',  obtenerReporte);
router.post('/',    crearReporte);
router.put('/:id',  actualizarReporte);
router.delete('/:id', eliminarReporte);

export default router;
