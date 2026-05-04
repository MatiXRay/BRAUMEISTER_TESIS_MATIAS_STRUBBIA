import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listarEstilos, obtenerEstilo, crearEstilo, actualizarEstilo, eliminarEstilo } from '../controllers/estiloController';

const router = Router();
router.use(requireAuth);

router.get('/',     listarEstilos);
router.get('/:id',  obtenerEstilo);
router.post('/',    crearEstilo);
router.put('/:id',  actualizarEstilo);
router.delete('/:id', eliminarEstilo);

export default router;
