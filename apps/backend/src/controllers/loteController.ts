import { Request, Response } from 'express';
import { Lote } from '../models/Lote';

export const listarLotes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const lotes = await Lote.find().sort({ fecha_elaboracion: -1 }).select('-agua_mash -agua_sparge -maltas -lupulos -levadura');
    res.json(lotes);
  } catch {
    res.status(500).json({ error: 'Error al obtener lotes' });
  }
};

export const obtenerLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) { res.status(404).json({ error: 'Lote no encontrado' }); return; }
    res.json(lote);
  } catch {
    res.status(500).json({ error: 'Error al obtener lote' });
  }
};

export const crearLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numero_lote, estilo_id, estilo_nombre, fermentador_id, fermentador_nombre, fecha_elaboracion } = req.body;
    if (!numero_lote?.trim())        { res.status(400).json({ error: 'El número de lote es requerido' }); return; }
    if (!estilo_id)                  { res.status(400).json({ error: 'El estilo es requerido' }); return; }
    if (!fermentador_id)             { res.status(400).json({ error: 'El fermentador es requerido' }); return; }
    if (!fecha_elaboracion)          { res.status(400).json({ error: 'La fecha de elaboración es requerida' }); return; }
    if (!estilo_nombre?.trim())      { res.status(400).json({ error: 'El nombre del estilo es requerido' }); return; }
    if (!fermentador_nombre?.trim()) { res.status(400).json({ error: 'El nombre del fermentador es requerido' }); return; }

    const existe = await Lote.findOne({ numero_lote: numero_lote.trim() });
    if (existe) { res.status(400).json({ error: 'Ya existe un lote con ese número' }); return; }

    const lote = await Lote.create(req.body);
    res.status(201).json(lote);
  } catch {
    res.status(500).json({ error: 'Error al crear lote' });
  }
};

export const actualizarLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numero_lote, estilo_id, fermentador_id, fecha_elaboracion } = req.body;
    if (!numero_lote?.trim())   { res.status(400).json({ error: 'El número de lote es requerido' }); return; }
    if (!estilo_id)             { res.status(400).json({ error: 'El estilo es requerido' }); return; }
    if (!fermentador_id)        { res.status(400).json({ error: 'El fermentador es requerido' }); return; }
    if (!fecha_elaboracion)     { res.status(400).json({ error: 'La fecha de elaboración es requerida' }); return; }

    const existe = await Lote.findOne({ numero_lote: numero_lote.trim(), _id: { $ne: req.params.id } });
    if (existe) { res.status(400).json({ error: 'Ya existe un lote con ese número' }); return; }

    const lote = await Lote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lote) { res.status(404).json({ error: 'Lote no encontrado' }); return; }
    res.json(lote);
  } catch {
    res.status(500).json({ error: 'Error al actualizar lote' });
  }
};

export const eliminarLote = async (req: Request, res: Response): Promise<void> => {
  try {
    const lote = await Lote.findByIdAndDelete(req.params.id);
    if (!lote) { res.status(404).json({ error: 'Lote no encontrado' }); return; }
    res.json({ mensaje: 'Lote eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar lote' });
  }
};

export const actualizarEstado = async (req: Request, res: Response): Promise<void> => {
  const estados = ['planificado','elaboracion','fermentando','envasado','finalizado'];
  try {
    const { estado } = req.body;
    if (!estados.includes(estado)) { res.status(400).json({ error: 'Estado inválido' }); return; }
    const lote = await Lote.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!lote) { res.status(404).json({ error: 'Lote no encontrado' }); return; }
    res.json(lote);
  } catch {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
