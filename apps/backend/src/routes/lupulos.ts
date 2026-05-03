import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listarLupulos, crearLupulo, actualizarLupulo, eliminarLupulo } from '../controllers/lupuloController';

const router = Router();
router.use(requireAuth);
router.get('/',       listarLupulos);
router.post('/',      crearLupulo);
router.put('/:id',    actualizarLupulo);
router.delete('/:id', eliminarLupulo);
export default router;
