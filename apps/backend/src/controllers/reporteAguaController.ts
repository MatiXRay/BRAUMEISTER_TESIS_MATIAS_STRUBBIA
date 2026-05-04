import { Request, Response } from 'express';
import { ReporteAgua } from '../models/ReporteAgua';

export const listarReportes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reportes = await ReporteAgua.find().sort({ fecha: -1 });
    res.json(reportes);
  } catch {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
};

export const obtenerReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const reporte = await ReporteAgua.findById(req.params.id);
    if (!reporte) { res.status(404).json({ error: 'Reporte no encontrado' }); return; }
    res.json(reporte);
  } catch {
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
};

export const crearReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, origen, laboratorio } = req.body;
    if (!fecha) { res.status(400).json({ error: 'La fecha es requerida' }); return; }
    if (!['RED', 'OSMOSIS'].includes(origen)) { res.status(400).json({ error: 'Origen inválido' }); return; }
    if (!laboratorio?.trim()) { res.status(400).json({ error: 'El laboratorio es requerido' }); return; }
    const reporte = await ReporteAgua.create(req.body);
    res.status(201).json(reporte);
  } catch {
    res.status(500).json({ error: 'Error al crear reporte' });
  }
};

export const actualizarReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, origen, laboratorio } = req.body;
    if (!fecha) { res.status(400).json({ error: 'La fecha es requerida' }); return; }
    if (!['RED', 'OSMOSIS'].includes(origen)) { res.status(400).json({ error: 'Origen inválido' }); return; }
    if (!laboratorio?.trim()) { res.status(400).json({ error: 'El laboratorio es requerido' }); return; }
    const reporte = await ReporteAgua.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reporte) { res.status(404).json({ error: 'Reporte no encontrado' }); return; }
    res.json(reporte);
  } catch {
    res.status(500).json({ error: 'Error al actualizar reporte' });
  }
};

export const eliminarReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const reporte = await ReporteAgua.findByIdAndDelete(req.params.id);
    if (!reporte) { res.status(404).json({ error: 'Reporte no encontrado' }); return; }
    res.json({ mensaje: 'Reporte eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar reporte' });
  }
};
