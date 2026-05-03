import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import {
  listarFermentadores, crearFermentador, actualizarFermentador,
  registrarLimpieza, eliminarFermentador,
} from '../controllers/fermentadorController';

const router = Router();
router.use(requireAuth);

router.get('/',                          listarFermentadores);
router.post('/',                         crearFermentador);
router.put('/:id',                       actualizarFermentador);
router.patch('/:id/limpieza/:tipo',      registrarLimpieza);
router.delete('/:id',                    eliminarFermentador);

export default router;
