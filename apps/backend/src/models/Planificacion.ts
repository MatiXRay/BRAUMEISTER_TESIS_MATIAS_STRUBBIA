import { Schema, model, Document, Types } from 'mongoose';

interface ITarea {
  nombre:         string;
  fecha_estimada: Date | null;
  orden:          number;
}

export interface IPlanificacion extends Document {
  nombre:         string;
  estilo_id:      Types.ObjectId | null;
  estilo_nombre:  string;
  fermentador_id: Types.ObjectId | null;
  fermentador_nombre: string;
  fecha_coccion:  Date;
  fecha_fin:      Date;
  duracion_dias:  number;
  notas:          string;
  color:          string;
  estado:         string;
  orden:          number;
  tareas:         ITarea[];
}

const PlanificacionSchema = new Schema<IPlanificacion>(
  {
    nombre:             { type: String, required: true, trim: true, maxlength: 100 },
    estilo_id:          { type: Schema.Types.ObjectId, ref: 'Estilo',      default: null },
    estilo_nombre:      { type: String, default: '' },
    fermentador_id:     { type: Schema.Types.ObjectId, ref: 'Fermentador', default: null },
    fermentador_nombre: { type: String, default: '' },
    fecha_coccion:      { type: Date, required: true },
    fecha_fin:          { type: Date, required: true },
    duracion_dias:      { type: Number, default: 21, min: 1 },
    notas:              { type: String, default: '', maxlength: 2000 },
    color:              { type: String, default: '#4a8f4a' },
    estado:             { type: String, default: 'planificado' },
    orden:              { type: Number, default: 0 },
    tareas: [{
      nombre:         { type: String, required: true, maxlength: 150 },
      fecha_estimada: { type: Date, default: null },
      orden:          { type: Number, default: 0 },
    }],
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Planificacion = model<IPlanificacion>('Planificacion', PlanificacionSchema);
