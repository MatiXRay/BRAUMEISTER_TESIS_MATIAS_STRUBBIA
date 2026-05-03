import { Schema, model, Document } from 'mongoose';

export interface ILimpiezas {
  alcalina:  Date | null;
  acida:     Date | null;
  oxidativa: Date | null;
  exterior:  Date | null;
}

export interface IFermentador extends Document {
  nombre:    string;
  capacidad: number;
  limpiezas: ILimpiezas;
}

const FermentadorSchema = new Schema<IFermentador>(
  {
    nombre:    { type: String, required: true, trim: true },
    capacidad: { type: Number, required: true, min: 1 },
    limpiezas: {
      alcalina:  { type: Date, default: null },
      acida:     { type: Date, default: null },
      oxidativa: { type: Date, default: null },
      exterior:  { type: Date, default: null },
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Fermentador = model<IFermentador>('Fermentador', FermentadorSchema);
