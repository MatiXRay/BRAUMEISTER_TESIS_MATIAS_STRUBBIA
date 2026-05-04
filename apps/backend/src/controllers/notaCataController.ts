import { Request, Response } from 'express';
import { NotaCata } from '../models/NotaCata';
import { Lote } from '../models/Lote';
import { getAuth } from '@clerk/express';

export const listarPorLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const notas = await NotaCata.find({ lote_id: req.params.loteId }).sort({ creadoEn: -1 });
    res.json(notas);
  } catch {
    res.status(500).json({ error: 'Error al obtener notas de cata' });
  }
};

export const obtenerNota = async (req: Request, res: Response): Promise<void> => {
  try {
    const nota = await NotaCata.findById(req.params.id);
    if (!nota) { res.status(404).json({ error: 'Nota no encontrada' }); return; }
    res.json(nota);
  } catch {
    res.status(500).json({ error: 'Error al obtener nota' });
  }
};

export const crearNota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { lote_id } = req.body;
    if (!lote_id) { res.status(400).json({ error: 'El lote es requerido' }); return; }

    const lote = await Lote.findById(lote_id).select('numero_lote');
    if (!lote) { res.status(404).json({ error: 'Lote no encontrado' }); return; }

    const nota = await NotaCata.create({
      ...req.body,
      lote_id,
      lote_numero: lote.numero_lote,
      usuario_id:  userId ?? 'anon',
    });
    res.status(201).json(nota);
  } catch {
    res.status(500).json({ error: 'Error al crear nota de cata' });
  }
};

export const actualizarNota = async (req: Request, res: Response): Promise<void> => {
  try {
    const nota = await NotaCata.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!nota) { res.status(404).json({ error: 'Nota no encontrada' }); return; }
    res.json(nota);
  } catch {
    res.status(500).json({ error: 'Error al actualizar nota' });
  }
};

export const eliminarNota = async (req: Request, res: Response): Promise<void> => {
  try {
    const nota = await NotaCata.findByIdAndDelete(req.params.id);
    if (!nota) { res.status(404).json({ error: 'Nota no encontrada' }); return; }
    res.json({ mensaje: 'Nota eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar nota' });
  }
};

export const listarLotesConCata = async (_req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.find({ estado: { $in: ['fermentando', 'envasado', 'finalizado'] } })
      .select('numero_lote estilo_nombre fecha_elaboracion estado parametros')
      .sort({ fecha_elaboracion: -1 });

    const ids = lotes.map((l) => l._id);
    const conteos = await NotaCata.aggregate([
      { $match: { lote_id: { $in: ids } } },
      { $group: { _id: '$lote_id', total: { $sum: 1 }, avg_puntaje: { $avg: '$impresion_puntaje' } } },
    ]);

    const conteosMap = Object.fromEntries(
      conteos.map((c) => [c._id.toString(), { total: c.total, avg_puntaje: +(c.avg_puntaje?.toFixed(1) ?? 0) }])
    );

    res.json(lotes.map((l) => ({
      ...l.toObject(),
      catas: conteosMap[l._id.toString()] ?? { total: 0, avg_puntaje: null },
    })));
  } catch {
    res.status(500).json({ error: 'Error al listar lotes' });
  }
};
