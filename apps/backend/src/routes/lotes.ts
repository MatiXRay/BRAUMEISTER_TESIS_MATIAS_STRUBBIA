import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listarLotes, obtenerLote, crearLote, actualizarLote, eliminarLote, actualizarEstado } from '../controllers/loteController';

const router = Router();
router.use(requireAuth);

router.get('/',           listarLotes);
router.get('/:id',        obtenerLote);
router.post('/',          crearLote);
router.put('/:id',        actualizarLote);
router.delete('/:id',     eliminarLote);
router.patch('/:id/estado', actualizarEstado);

export default router;
