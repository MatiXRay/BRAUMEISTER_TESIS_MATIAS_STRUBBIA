import { Schema, model, Document } from 'mongoose';

export interface ILupulo extends Document {
  nombre: string;
  marca: string;
}

const LupuloSchema = new Schema<ILupulo>(
  {
    nombre: { type: String, required: true, trim: true },
    marca:  { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Lupulo = model<ILupulo>('Lupulo', LupuloSchema);
