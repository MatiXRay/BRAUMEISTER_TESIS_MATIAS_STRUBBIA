import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getEstadisticas } from '../controllers/estadisticasController';

const router = Router();
router.use(requireAuth);
router.get('/', getEstadisticas);

export default router;
