import { Request, Response } from 'express';
import { Lupulo } from '../models/Lupulo';

export const listarLupulos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const lupulos = await Lupulo.find().sort({ nombre: 1 });
    res.json(lupulos);
  } catch {
    res.status(500).json({ error: 'Error al obtener lúpulos' });
  }
};

export const crearLupulo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, marca } = req.body;
    if (!nombre?.trim() || !marca?.trim()) {
      res.status(400).json({ error: 'Nombre y marca son requeridos' });
      return;
    }
    const lupulo = await Lupulo.create({ nombre: nombre.trim(), marca: marca.trim() });
    res.status(201).json(lupulo);
  } catch {
    res.status(500).json({ error: 'Error al crear lúpulo' });
  }
};

export const actualizarLupulo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, marca } = req.body;
    if (!nombre?.trim() || !marca?.trim()) {
      res.status(400).json({ error: 'Nombre y marca son requeridos' });
      return;
    }
    const lupulo = await Lupulo.findByIdAndUpdate(
      req.params.id,
      { nombre: nombre.trim(), marca: marca.trim() },
      { new: true, runValidators: true }
    );
    if (!lupulo) { res.status(404).json({ error: 'Lúpulo no encontrado' }); return; }
    res.json(lupulo);
  } catch {
    res.status(500).json({ error: 'Error al actualizar lúpulo' });
  }
};

export const eliminarLupulo = async (req: Request, res: Response): Promise<void> => {
  try {
    const lupulo = await Lupulo.findByIdAndDelete(req.params.id);
    if (!lupulo) { res.status(404).json({ error: 'Lúpulo no encontrado' }); return; }
    res.json({ mensaje: 'Lúpulo eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar lúpulo' });
  }
};
