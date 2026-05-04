import { Request, Response } from 'express';
import { Planificacion } from '../models/Planificacion';

export const listar = async (_req: Request, res: Response): Promise<void> => {
  try {
    const planes = await Planificacion.find().sort({ fecha_coccion: 1 });
    res.json(planes);
  } catch {
    res.status(500).json({ error: 'Error al obtener planes' });
  }
};

export const obtener = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Planificacion.findById(req.params.id);
    if (!plan) { res.status(404).json({ error: 'Plan no encontrado' }); return; }
    res.json(plan);
  } catch {
    res.status(500).json({ error: 'Error al obtener plan' });
  }
};

export const crear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, fecha_coccion, duracion_dias } = req.body;
    if (!nombre?.trim())   { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    if (!fecha_coccion)    { res.status(400).json({ error: 'La fecha de cocción es requerida' }); return; }

    const inicio = new Date(fecha_coccion);
    const dias   = parseInt(duracion_dias) || 21;
    const fin    = req.body.fecha_fin
      ? new Date(req.body.fecha_fin)
      : new Date(inicio.getTime() + dias * 86400000);

    const plan = await Planificacion.create({ ...req.body, fecha_coccion: inicio, fecha_fin: fin, duracion_dias: dias });
    res.status(201).json(plan);
  } catch {
    res.status(500).json({ error: 'Error al crear plan' });
  }
};

export const actualizar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, fecha_coccion, duracion_dias } = req.body;
    if (!nombre?.trim()) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    if (!fecha_coccion)  { res.status(400).json({ error: 'La fecha de cocción es requerida' }); return; }

    const inicio = new Date(fecha_coccion);
    const dias   = parseInt(duracion_dias) || 21;
    const fin    = req.body.fecha_fin
      ? new Date(req.body.fecha_fin)
      : new Date(inicio.getTime() + dias * 86400000);

    const plan = await Planificacion.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fecha_coccion: inicio, fecha_fin: fin, duracion_dias: dias },
      { new: true }
    );
    if (!plan) { res.status(404).json({ error: 'Plan no encontrado' }); return; }
    res.json(plan);
  } catch {
    res.status(500).json({ error: 'Error al actualizar plan' });
  }
};

// Endpoint para drag en el timeline — solo actualiza fechas y fermentador
export const moverTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_coccion, fecha_fin, duracion_dias, fermentador_id, fermentador_nombre } = req.body;
    if (!fecha_coccion) { res.status(400).json({ error: 'fecha_coccion requerida' }); return; }
    const plan = await Planificacion.findByIdAndUpdate(
      req.params.id,
      { fecha_coccion: new Date(fecha_coccion), fecha_fin: new Date(fecha_fin), duracion_dias, fermentador_id: fermentador_id || null, fermentador_nombre: fermentador_nombre || '' },
      { new: true }
    );
    if (!plan) { res.status(404).json({ error: 'Plan no encontrado' }); return; }
    res.json(plan);
  } catch {
    res.status(500).json({ error: 'Error al mover plan' });
  }
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Planificacion.findByIdAndDelete(req.params.id);
    if (!plan) { res.status(404).json({ error: 'Plan no encontrado' }); return; }
    res.json({ mensaje: 'Plan eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar plan' });
  }
};
