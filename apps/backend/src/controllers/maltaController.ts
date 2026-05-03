import { Request, Response } from 'express';
import { Malta } from '../models/Malta';

export const listarMaltas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const maltas = await Malta.find().sort({ nombre: 1 });
    res.json(maltas);
  } catch {
    res.status(500).json({ error: 'Error al obtener maltas' });
  }
};

export const crearMalta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, marca } = req.body;
    if (!nombre?.trim() || !marca?.trim()) {
      res.status(400).json({ error: 'Nombre y marca son requeridos' });
      return;
    }
    const malta = await Malta.create({ nombre: nombre.trim(), marca: marca.trim() });
    res.status(201).json(malta);
  } catch {
    res.status(500).json({ error: 'Error al crear malta' });
  }
};

export const actualizarMalta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, marca } = req.body;
    if (!nombre?.trim() || !marca?.trim()) {
      res.status(400).json({ error: 'Nombre y marca son requeridos' });
      return;
    }
    const malta = await Malta.findByIdAndUpdate(
      req.params.id,
      { nombre: nombre.trim(), marca: marca.trim() },
      { new: true, runValidators: true }
    );
    if (!malta) { res.status(404).json({ error: 'Malta no encontrada' }); return; }
    res.json(malta);
  } catch {
    res.status(500).json({ error: 'Error al actualizar malta' });
  }
};

export const eliminarMalta = async (req: Request, res: Response): Promise<void> => {
  try {
    const malta = await Malta.findByIdAndDelete(req.params.id);
    if (!malta) { res.status(404).json({ error: 'Malta no encontrada' }); return; }
    res.json({ mensaje: 'Malta eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar malta' });
  }
};
