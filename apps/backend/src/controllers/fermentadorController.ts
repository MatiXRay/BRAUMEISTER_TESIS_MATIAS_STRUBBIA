import { Request, Response } from 'express';
import { Fermentador } from '../models/Fermentador';

export const listarFermentadores = async (_req: Request, res: Response): Promise<void> => {
  try {
    const fermentadores = await Fermentador.find().sort({ nombre: 1 });
    res.json(fermentadores);
  } catch {
    res.status(500).json({ error: 'Error al obtener fermentadores' });
  }
};

export const crearFermentador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, capacidad } = req.body;
    if (!nombre?.trim()) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    if (!capacidad || isNaN(Number(capacidad)) || Number(capacidad) < 1) {
      res.status(400).json({ error: 'La capacidad debe ser un número mayor a 0' }); return;
    }
    const fermentador = await Fermentador.create({
      nombre: nombre.trim(),
      capacidad: Number(capacidad),
      limpiezas: { alcalina: null, acida: null, oxidativa: null, exterior: null },
    });
    res.status(201).json(fermentador);
  } catch {
    res.status(500).json({ error: 'Error al crear fermentador' });
  }
};

export const actualizarFermentador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, capacidad } = req.body;
    if (!nombre?.trim()) { res.status(400).json({ error: 'El nombre es requerido' }); return; }
    if (!capacidad || isNaN(Number(capacidad)) || Number(capacidad) < 1) {
      res.status(400).json({ error: 'La capacidad debe ser un número mayor a 0' }); return;
    }
    const fermentador = await Fermentador.findByIdAndUpdate(
      req.params.id,
      { nombre: nombre.trim(), capacidad: Number(capacidad) },
      { new: true, runValidators: true }
    );
    if (!fermentador) { res.status(404).json({ error: 'Fermentador no encontrado' }); return; }
    res.json(fermentador);
  } catch {
    res.status(500).json({ error: 'Error al actualizar fermentador' });
  }
};

export const registrarLimpieza = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo } = req.params;
    const tiposValidos = ['alcalina', 'acida', 'oxidativa', 'exterior'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({ error: 'Tipo de limpieza inválido' }); return;
    }
    const fecha = req.body.fecha ? new Date(req.body.fecha) : new Date();
    const fermentador = await Fermentador.findByIdAndUpdate(
      req.params.id,
      { [`limpiezas.${tipo}`]: fecha },
      { new: true }
    );
    if (!fermentador) { res.status(404).json({ error: 'Fermentador no encontrado' }); return; }
    res.json(fermentador);
  } catch {
    res.status(500).json({ error: 'Error al registrar limpieza' });
  }
};

export const eliminarFermentador = async (req: Request, res: Response): Promise<void> => {
  try {
    const fermentador = await Fermentador.findByIdAndDelete(req.params.id);
    if (!fermentador) { res.status(404).json({ error: 'Fermentador no encontrado' }); return; }
    res.json({ mensaje: 'Fermentador eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar fermentador' });
  }
};
