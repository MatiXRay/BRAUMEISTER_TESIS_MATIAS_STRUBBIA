import { Request, Response } from 'express';
import { Malta } from '../models/Malta';

export const listarMaltas = async (_req: Request, res: Response): Promise<void> => {
  const maltas = await Malta.find().sort({ nombre: 1 });
  res.json(maltas);
};

export const crearMalta = async (req: Request, res: Response): Promise<void> => {
  const { nombre, marca } = req.body;
  if (!nombre?.trim() || !marca?.trim()) {
    res.status(400).json({ error: 'Nombre y marca son requeridos' });
    return;
  }
  const malta = await Malta.create({ nombre: nombre.trim(), marca: marca.trim() });
  res.status(201).json(malta);
};

export const actualizarMalta = async (req: Request, res: Response): Promise<void> => {
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
};

export const eliminarMalta = async (req: Request, res: Response): Promise<void> => {
  const malta = await Malta.findByIdAndDelete(req.params.id);
  if (!malta) { res.status(404).json({ error: 'Malta no encontrada' }); return; }
  res.json({ mensaje: 'Malta eliminada' });
};
