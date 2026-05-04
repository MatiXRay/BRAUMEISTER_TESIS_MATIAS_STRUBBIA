import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import {
  listarLotesConCata, listarPorLote, obtenerNota,
  crearNota, actualizarNota, eliminarNota,
} from '../controllers/notaCataController';

const router = Router();
router.use(requireAuth);

router.get('/lotes',              listarLotesConCata);
router.get('/lote/:loteId',       listarPorLote);
router.get('/:id',                obtenerNota);
router.post('/',                  crearNota);
router.put('/:id',                actualizarNota);
router.delete('/:id',             eliminarNota);

export default router;
