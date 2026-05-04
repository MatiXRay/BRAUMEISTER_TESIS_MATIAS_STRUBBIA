import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listar, obtener, crear, actualizar, moverTimeline, eliminar } from '../controllers/planificacionController';

const router = Router();
router.use(requireAuth);

router.get('/',              listar);
router.get('/:id',           obtener);
router.post('/',             crear);
router.put('/:id',           actualizar);
router.patch('/:id/mover',   moverTimeline);
router.delete('/:id',        eliminar);

export default router;
