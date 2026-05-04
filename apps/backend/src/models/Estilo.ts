import { Schema, model, Document, Types } from 'mongoose';

interface IMaltaItem {
  malta:    Types.ObjectId;
  nombre:   string;
  cantidad: number;
  tiempo:   number;
}

interface ILupuloItem {
  lupulo:     Types.ObjectId;
  nombre:     string;
  cantidad:   number;
  tiempo:     number;
  ibu_aporte: number;
}

interface ILevaduraItem {
  levadura:         Types.ObjectId;
  cepa:             string;
  temp_inoculacion: number;
  tasa_inoculacion: number;
  viabilidad:       number;
  kilos_biomasa:    number;
  oxigenacion:      number;
}

interface IAguaParams {
  total:        number;
  porcentaje_ro: number;
  temperatura:  number;
  ph:           number;
  caso4:        number;
  cacl2:        number;
  mgcl:         number;
  fosforico:    number;
  otro:         number;
}

export interface IEstilo extends Document {
  nombre:       string;
  descripcion:  string;
  duracion_dias: number;
  parametros: {
    og:         number;
    fg:         number;
    ibu:        number;
    abv:        number;
    carb_level: number;
  };
  maltas:   IMaltaItem[];
  lupulos:  ILupuloItem[];
  levadura: ILevaduraItem | null;
  agua_mash:   IAguaParams;
  agua_sparge: IAguaParams;
}

const aguaSchema = new Schema<IAguaParams>({
  total:         { type: Number, default: 0 },
  porcentaje_ro: { type: Number, default: 0 },
  temperatura:   { type: Number, default: 0 },
  ph:            { type: Number, default: 0 },
  caso4:         { type: Number, default: 0 },
  cacl2:         { type: Number, default: 0 },
  mgcl:          { type: Number, default: 0 },
  fosforico:     { type: Number, default: 0 },
  otro:          { type: Number, default: 0 },
}, { _id: false });

const EstiloSchema = new Schema<IEstilo>(
  {
    nombre:        { type: String, required: true, trim: true },
    descripcion:   { type: String, default: '' },
    duracion_dias: { type: Number, required: true, min: 1 },
    parametros: {
      og:         { type: Number, default: 0 },
      fg:         { type: Number, default: 0 },
      ibu:        { type: Number, default: 0 },
      abv:        { type: Number, default: 0 },
      carb_level: { type: Number, default: 0 },
    },
    maltas: [{
      malta:    { type: Schema.Types.ObjectId, ref: 'Malta', required: true },
      nombre:   { type: String, required: true },
      cantidad: { type: Number, required: true },
      tiempo:   { type: Number, required: true },
    }],
    lupulos: [{
      lupulo:     { type: Schema.Types.ObjectId, ref: 'Lupulo', required: true },
      nombre:     { type: String, required: true },
      cantidad:   { type: Number, required: true },
      tiempo:     { type: Number, required: true },
      ibu_aporte: { type: Number, default: 0 },
    }],
    levadura: {
      levadura:         { type: Schema.Types.ObjectId, ref: 'Levadura' },
      cepa:             String,
      temp_inoculacion: { type: Number, default: 0 },
      tasa_inoculacion: { type: Number, default: 0 },
      viabilidad:       { type: Number, default: 0 },
      kilos_biomasa:    { type: Number, default: 0 },
      oxigenacion:      { type: Number, default: 0 },
    },
    agua_mash:   { type: aguaSchema, default: () => ({}) },
    agua_sparge: { type: aguaSchema, default: () => ({}) },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Estilo = model<IEstilo>('Estilo', EstiloSchema);
