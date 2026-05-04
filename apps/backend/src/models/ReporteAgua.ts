import { Schema, model, Document } from 'mongoose';

export type OrigenAgua = 'RED' | 'OSMOSIS';

export interface IReporteAgua extends Document {
  fecha:             Date;
  origen:            OrigenAgua;
  laboratorio:       string;
  ca:                number;
  mg:                number;
  na:                number;
  cl:                number;
  so4:               number;
  ph:                number;
  dureza_total:      number;
  dureza_carbonato:  number;
  alcalinidad:       number;
}

const ReporteAguaSchema = new Schema<IReporteAgua>(
  {
    fecha:            { type: Date,   required: true },
    origen:           { type: String, required: true, enum: ['RED', 'OSMOSIS'] },
    laboratorio:      { type: String, required: true, trim: true },
    ca:               { type: Number, default: 0 },
    mg:               { type: Number, default: 0 },
    na:               { type: Number, default: 0 },
    cl:               { type: Number, default: 0 },
    so4:              { type: Number, default: 0 },
    ph:               { type: Number, default: 0 },
    dureza_total:     { type: Number, default: 0 },
    dureza_carbonato: { type: Number, default: 0 },
    alcalinidad:      { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const ReporteAgua = model<IReporteAgua>('ReporteAgua', ReporteAguaSchema);
