import { Schema, model, Document, Types } from 'mongoose';

export interface INotaCata extends Document {
  lote_id:    Types.ObjectId;
  lote_numero: string;
  usuario_id: string;

  // Apariencia
  color_cerveza:        string;
  color_espuma:         string;
  claridad_intensidad:  number;
  retencion_intensidad: number;
  apariencia_comentario: string;
  apariencia_puntaje:   number;

  // Aroma
  malta_intensidad:    number;
  lupulo_intensidad:   number;
  esteres_intensidad:  number;
  fenoles_intensidad:  number;
  alcohol_intensidad:  number;
  dulzor_intensidad:   number;
  acidez_intensidad:   number;
  otros_intensidad:    number;
  maltas_atributos:    string;
  lupulo_atributos:    string;
  esteres_atributos:   string;
  otros_atributos:     string;
  aroma_comentario:    string;
  aroma_puntaje:       number;

  // Sabor
  sabor_malta_intensidad:    number;
  sabor_lupulo_intensidad:   number;
  sabor_esteres_intensidad:  number;
  sabor_fenoles_intensidad:  number;
  sabor_alcohol_intensidad:  number;
  sabor_dulzor_intensidad:   number;
  sabor_acidez_intensidad:   number;
  sabor_otros_intensidad:    number;
  sabor_malta_atributos:     string;
  sabor_lupulo_atributos:    string;
  sabor_esteres_atributos:   string;
  sabor_otros_atributos:     string;
  balance:                   string;
  sabor_comentario:          string;
  sabor_puntaje:             number;

  // Mouthfeel
  cuerpo_intensidad:        number;
  carbonatacion_intensidad: number;
  calentamiento_intensidad: number;
  cremosidad_intensidad:    number;
  astringencia_intensidad:  number;
  mouthfeel_final:          string;
  mouthfeel_fallas:         string;
  mouthfeel_comentario:     string;
  mouthfeel_puntaje:        number;

  // Defectos (0-3: ninguno, leve, moderado, marcado)
  def_diacetilo:    number;
  def_acetaldehido: number;
  def_dms:          number;
  def_oxidacion:    number;
  def_fenoles:      number;
  def_astringencia: number;
  def_alcohol:      number;
  def_hopburn:      number;

  // Impresión final
  desvio_perfil:       boolean;
  desvio_desc:         string;
  causa:               string;
  accion:              string;
  impresion_libre:     string;
  impresion_puntaje:   number;
}

const n = (def = 0) => ({ type: Number, default: def, min: 0, max: 10 });
const s = () => ({ type: String, default: '' });

const NotaCataSchema = new Schema<INotaCata>(
  {
    lote_id:     { type: Schema.Types.ObjectId, ref: 'Lote', required: true },
    lote_numero: { type: String, required: true },
    usuario_id:  { type: String, required: true },

    // Apariencia
    color_cerveza:         s(),
    color_espuma:          s(),
    claridad_intensidad:   { ...n(), max: 5 },
    retencion_intensidad:  { ...n(), max: 5 },
    apariencia_comentario: s(),
    apariencia_puntaje:    { ...n(3), max: 10 },

    // Aroma
    malta_intensidad:   { ...n(), max: 5 },
    lupulo_intensidad:  { ...n(), max: 5 },
    esteres_intensidad: { ...n(), max: 5 },
    fenoles_intensidad: { ...n(), max: 5 },
    alcohol_intensidad: { ...n(), max: 5 },
    dulzor_intensidad:  { ...n(), max: 5 },
    acidez_intensidad:  { ...n(), max: 5 },
    otros_intensidad:   { ...n(), max: 5 },
    maltas_atributos:   s(),
    lupulo_atributos:   s(),
    esteres_atributos:  s(),
    otros_atributos:    s(),
    aroma_comentario:   s(),
    aroma_puntaje:      { ...n(3), max: 10 },

    // Sabor
    sabor_malta_intensidad:   { ...n(), max: 5 },
    sabor_lupulo_intensidad:  { ...n(), max: 5 },
    sabor_esteres_intensidad: { ...n(), max: 5 },
    sabor_fenoles_intensidad: { ...n(), max: 5 },
    sabor_alcohol_intensidad: { ...n(), max: 5 },
    sabor_dulzor_intensidad:  { ...n(), max: 5 },
    sabor_acidez_intensidad:  { ...n(), max: 5 },
    sabor_otros_intensidad:   { ...n(), max: 5 },
    sabor_malta_atributos:    s(),
    sabor_lupulo_atributos:   s(),
    sabor_esteres_atributos:  s(),
    sabor_otros_atributos:    s(),
    balance:                  { type: String, default: 'Balanceado' },
    sabor_comentario:         s(),
    sabor_puntaje:            { ...n(3), max: 10 },

    // Mouthfeel
    cuerpo_intensidad:        { ...n(), max: 5 },
    carbonatacion_intensidad: { ...n(), max: 5 },
    calentamiento_intensidad: { ...n(), max: 5 },
    cremosidad_intensidad:    { ...n(), max: 5 },
    astringencia_intensidad:  { ...n(), max: 5 },
    mouthfeel_final:          { type: String, default: 'Medio' },
    mouthfeel_fallas:         s(),
    mouthfeel_comentario:     s(),
    mouthfeel_puntaje:        { ...n(3), max: 10 },

    // Defectos
    def_diacetilo:    { ...n(), max: 3 },
    def_acetaldehido: { ...n(), max: 3 },
    def_dms:          { ...n(), max: 3 },
    def_oxidacion:    { ...n(), max: 3 },
    def_fenoles:      { ...n(), max: 3 },
    def_astringencia: { ...n(), max: 3 },
    def_alcohol:      { ...n(), max: 3 },
    def_hopburn:      { ...n(), max: 3 },

    // Impresión
    desvio_perfil:     { type: Boolean, default: false },
    desvio_desc:       s(),
    causa:             s(),
    accion:            s(),
    impresion_libre:   s(),
    impresion_puntaje: { ...n(5), max: 10 },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const NotaCata = model<INotaCata>('NotaCata', NotaCataSchema);
