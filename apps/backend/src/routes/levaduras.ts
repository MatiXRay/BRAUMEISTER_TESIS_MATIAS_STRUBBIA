import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listarLevaduras, crearLevadura, actualizarLevadura, eliminarLevadura } from '../controllers/levaduraController';

const router = Router();
router.use(requireAuth);
router.get('/',       listarLevaduras);
router.post('/',      crearLevadura);
router.put('/:id',    actualizarLevadura);
router.delete('/:id', eliminarLevadura);
export default router;
