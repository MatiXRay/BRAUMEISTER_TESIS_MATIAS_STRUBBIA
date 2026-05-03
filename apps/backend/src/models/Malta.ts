import { Schema, model, Document } from 'mongoose';

export interface IMalta extends Document {
  nombre: string;
  marca: string;
  creadoEn: Date;
}

const MaltaSchema = new Schema<IMalta>(
  {
    nombre: { type: String, required: true, trim: true },
    marca:  { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Malta = model<IMalta>('Malta', MaltaSchema);
