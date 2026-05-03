import { Request, Response } from 'express';
import { Levadura } from '../models/Levadura';

export const listarLevaduras = async (_req: Request, res: Response): Promise<void> => {
  try {
    const levaduras = await Levadura.find().sort({ cepa: 1 });
    res.json(levaduras);
  } catch {
    res.status(500).json({ error: 'Error al obtener levaduras' });
  }
};

export const crearLevadura = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cepa, marca } = req.body;
    if (!cepa?.trim() || !marca?.trim()) {
      res.status(400).json({ error: 'Cepa y marca son requeridas' });
      return;
    }
    const levadura = await Levadura.create({ cepa: cepa.trim(), marca: marca.trim() });
    res.status(201).json(levadura);
  } catch {
    res.status(500).json({ error: 'Error al crear levadura' });
  }
};

export const actualizarLevadura = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cepa, marca } = req.body;
    if (!cepa?.trim() || !marca?.trim()) {
      res.status(400).json({ error: 'Cepa y marca son requeridas' });
      return;
    }
    const levadura = await Levadura.findByIdAndUpdate(
      req.params.id,
      { cepa: cepa.trim(), marca: marca.trim() },
      { new: true, runValidators: true }
    );
    if (!levadura) { res.status(404).json({ error: 'Levadura no encontrada' }); return; }
    res.json(levadura);
  } catch {
    res.status(500).json({ error: 'Error al actualizar levadura' });
  }
};

export const eliminarLevadura = async (req: Request, res: Response): Promise<void> => {
  try {
    const levadura = await Levadura.findByIdAndDelete(req.params.id);
    if (!levadura) { res.status(404).json({ error: 'Levadura no encontrada' }); return; }
    res.json({ mensaje: 'Levadura eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar levadura' });
  }
};
