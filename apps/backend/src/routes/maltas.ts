import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listarMaltas, crearMalta, actualizarMalta, eliminarMalta } from '../controllers/maltaController';

const router = Router();

router.use(requireAuth);

router.get('/',       listarMaltas);
router.post('/',      crearMalta);
router.put('/:id',    actualizarMalta);
router.delete('/:id', eliminarMalta);

export default router;
