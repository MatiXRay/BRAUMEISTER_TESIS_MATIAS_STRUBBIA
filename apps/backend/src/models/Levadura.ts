import { Schema, model, Document } from 'mongoose';

export interface ILevadura extends Document {
  cepa: string;
  marca: string;
}

const LevaduraSchema = new Schema<ILevadura>(
  {
    cepa:  { type: String, required: true, trim: true },
    marca: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Levadura = model<ILevadura>('Levadura', LevaduraSchema);
