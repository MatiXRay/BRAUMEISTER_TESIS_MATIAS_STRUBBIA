import { Schema, model, Document, Types } from 'mongoose';

export type EstadoLote = 'planificado' | 'elaboracion' | 'fermentando' | 'envasado' | 'finalizado';

interface MaltaLote {
  malta_id: Types.ObjectId;
  nombre:   string;
  cantidad: number;
  tiempo:   string;
  lote_malta: string;
}

interface LupuloLote {
  lupulo_id:   Types.ObjectId;
  nombre:      string;
  cantidad:    number;
  ibu:         number;
  tiempo:      string;
  lote_lupulo: string;
}

interface LevaduraLote {
  cepa_id:          Types.ObjectId;
  nombre:           string;
  gen:              number;
  temp_inoculacion: number;
  tasa_inoculacion: number;
  viabilidad:       number;
  kilos_biomasa:    number;
  oxigenacion:      number;
}

interface Parametros {
  og:          number;
  fg:          number;
  ibu:         number;
  abv:         number;
  co2:         number;
  carb_level:  number;
}

interface Lecturas {
  ph_mosto:              number;
  ph_fin_fermentacion:   number;
  litros_a_fermentador:  number;
  dia_envasado:          Date | null;
  litros_envasados:      number;
}

interface AguaTratamiento {
  total_agua:      number;
  porcentaje_ro:   number;
  temperatura:     number;
  ph:              number;
  fosforico:       number;
  caso4:           number;
  cacl2:           number;
  mgcl:            number;
  otro:            string;
}

export interface ILote extends Document {
  numero_lote:  string;
  estilo_id:    Types.ObjectId;
  estilo_nombre: string;
  fermentador_id:    Types.ObjectId;
  fermentador_nombre: string;
  fecha_elaboracion: Date;
  estado:       EstadoLote;
  comentarios:  string;
  maltas:       MaltaLote[];
  lupulos:      LupuloLote[];
  levadura:     LevaduraLote | null;
  parametros:   Parametros;
  lecturas:     Lecturas;
  agua_mash:    AguaTratamiento;
  agua_sparge:  AguaTratamiento;
}

const AguaSchema = new Schema<AguaTratamiento>({
  total_agua:    { type: Number, default: 0 },
  porcentaje_ro: { type: Number, default: 0 },
  temperatura:   { type: Number, default: 0 },
  ph:            { type: Number, default: 0 },
  fosforico:     { type: Number, default: 0 },
  caso4:         { type: Number, default: 0 },
  cacl2:         { type: Number, default: 0 },
  mgcl:          { type: Number, default: 0 },
  otro:          { type: String, default: '' },
}, { _id: false });

const LoteSchema = new Schema<ILote>(
  {
    numero_lote:        { type: String, required: true, trim: true },
    estilo_id:          { type: Schema.Types.ObjectId, ref: 'Estilo', required: true },
    estilo_nombre:      { type: String, required: true },
    fermentador_id:     { type: Schema.Types.ObjectId, ref: 'Fermentador', required: true },
    fermentador_nombre: { type: String, required: true },
    fecha_elaboracion:  { type: Date, required: true },
    estado:             { type: String, enum: ['planificado','elaboracion','fermentando','envasado','finalizado'], default: 'planificado' },
    comentarios:        { type: String, default: '' },

    maltas: [{
      malta_id:   { type: Schema.Types.ObjectId, ref: 'Malta' },
      nombre:     String,
      cantidad:   { type: Number, default: 0 },
      tiempo:     { type: String, default: '' },
      lote_malta: { type: String, default: '' },
      _id: false,
    }],

    lupulos: [{
      lupulo_id:   { type: Schema.Types.ObjectId, ref: 'Lupulo' },
      nombre:      String,
      cantidad:    { type: Number, default: 0 },
      ibu:         { type: Number, default: 0 },
      tiempo:      { type: String, default: '' },
      lote_lupulo: { type: String, default: '' },
      _id: false,
    }],

    levadura: {
      cepa_id:          { type: Schema.Types.ObjectId, ref: 'Levadura' },
      nombre:           String,
      gen:              { type: Number, default: 1 },
      temp_inoculacion: { type: Number, default: 0 },
      tasa_inoculacion: { type: Number, default: 0 },
      viabilidad:       { type: Number, default: 100 },
      kilos_biomasa:    { type: Number, default: 0 },
      oxigenacion:      { type: Number, default: 0 },
    },

    parametros: {
      og:         { type: Number, default: 0 },
      fg:         { type: Number, default: 0 },
      ibu:        { type: Number, default: 0 },
      abv:        { type: Number, default: 0 },
      co2:        { type: Number, default: 0 },
      carb_level: { type: Number, default: 0 },
      _id: false,
    },

    lecturas: {
      ph_mosto:             { type: Number, default: 0 },
      ph_fin_fermentacion:  { type: Number, default: 0 },
      litros_a_fermentador: { type: Number, default: 0 },
      dia_envasado:         { type: Date, default: null },
      litros_envasados:     { type: Number, default: 0 },
      _id: false,
    },

    agua_mash:   { type: AguaSchema, default: () => ({}) },
    agua_sparge: { type: AguaSchema, default: () => ({}) },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Lote = model<ILote>('Lote', LoteSchema);
