import { Request, Response } from 'express';
import { Estilo } from '../models/Estilo';

export const listarEstilos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estilos = await Estilo.find().sort({ nombre: 1 });
    res.json(estilos);
  } catch {
    res.status(500).json({ error: 'Error al obtener estilos' });
  }
};

export const obtenerEstilo = async (req: Request, res: Response): Promise<void> => {
  try {
    const estilo = await Estilo.findById(req.params.id);
    if (!estilo) { res.status(404).json({ error: 'Estilo no encontrado' }); return; }
    res.json(estilo);
  } catch {
    res.status(500).json({ error: 'Error al obtener estilo' });
  }
};

export const crearEstilo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, duracion_dias } = req.body;
    if (!nombre?.trim()) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    if (!duracion_dias || Number(duracion_dias) < 1) {
      res.status(400).json({ error: 'La duración debe ser mayor a 0' }); return;
    }
    const estilo = await Estilo.create(req.body);
    res.status(201).json(estilo);
  } catch {
    res.status(500).json({ error: 'Error al crear estilo' });
  }
};

export const actualizarEstilo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, duracion_dias } = req.body;
    if (!nombre?.trim()) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    if (!duracion_dias || Number(duracion_dias) < 1) {
      res.status(400).json({ error: 'La duración debe ser mayor a 0' }); return;
    }
    const estilo = await Estilo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!estilo) { res.status(404).json({ error: 'Estilo no encontrado' }); return; }
    res.json(estilo);
  } catch {
    res.status(500).json({ error: 'Error al actualizar estilo' });
  }
};

export const eliminarEstilo = async (req: Request, res: Response): Promise<void> => {
  try {
    const estilo = await Estilo.findByIdAndDelete(req.params.id);
    if (!estilo) { res.status(404).json({ error: 'Estilo no encontrado' }); return; }
    res.json({ mensaje: 'Estilo eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar estilo' });
  }
};
