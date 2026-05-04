export interface NotaCata {
  _id:        string;
  lote_id:    string;
  lote_numero: string;
  usuario_id: string;
  creadoEn:   string;

  color_cerveza:         string;
  color_espuma:          string;
  claridad_intensidad:   number;
  retencion_intensidad:  number;
  apariencia_comentario: string;
  apariencia_puntaje:    number;

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

  cuerpo_intensidad:        number;
  carbonatacion_intensidad: number;
  calentamiento_intensidad: number;
  cremosidad_intensidad:    number;
  astringencia_intensidad:  number;
  mouthfeel_final:          string;
  mouthfeel_fallas:         string;
  mouthfeel_comentario:     string;
  mouthfeel_puntaje:        number;

  def_diacetilo:    number;
  def_acetaldehido: number;
  def_dms:          number;
  def_oxidacion:    number;
  def_fenoles:      number;
  def_astringencia: number;
  def_alcohol:      number;
  def_hopburn:      number;

  desvio_perfil:     boolean;
  desvio_desc:       string;
  causa:             string;
  accion:            string;
  impresion_libre:   string;
  impresion_puntaje: number;
}

export type NotaCataForm = Omit<NotaCata, '_id' | 'creadoEn'>;

export const notaCataVacia = (lote_id: string, lote_numero: string): NotaCataForm => ({
  lote_id, lote_numero, usuario_id: '',
  color_cerveza: '', color_espuma: '',
  claridad_intensidad: 0, retencion_intensidad: 0,
  apariencia_comentario: '', apariencia_puntaje: 3,
  malta_intensidad: 0, lupulo_intensidad: 0, esteres_intensidad: 0,
  fenoles_intensidad: 0, alcohol_intensidad: 0, dulzor_intensidad: 0,
  acidez_intensidad: 0, otros_intensidad: 0,
  maltas_atributos: '', lupulo_atributos: '', esteres_atributos: '', otros_atributos: '',
  aroma_comentario: '', aroma_puntaje: 3,
  sabor_malta_intensidad: 0, sabor_lupulo_intensidad: 0, sabor_esteres_intensidad: 0,
  sabor_fenoles_intensidad: 0, sabor_alcohol_intensidad: 0, sabor_dulzor_intensidad: 0,
  sabor_acidez_intensidad: 0, sabor_otros_intensidad: 0,
  sabor_malta_atributos: '', sabor_lupulo_atributos: '', sabor_esteres_atributos: '', sabor_otros_atributos: '',
  balance: 'Balanceado', sabor_comentario: '', sabor_puntaje: 3,
  cuerpo_intensidad: 0, carbonatacion_intensidad: 3, calentamiento_intensidad: 0,
  cremosidad_intensidad: 0, astringencia_intensidad: 0,
  mouthfeel_final: 'Medio', mouthfeel_fallas: '', mouthfeel_comentario: '', mouthfeel_puntaje: 3,
  def_diacetilo: 0, def_acetaldehido: 0, def_dms: 0, def_oxidacion: 0,
  def_fenoles: 0, def_astringencia: 0, def_alcohol: 0, def_hopburn: 0,
  desvio_perfil: false, desvio_desc: '', causa: '', accion: '',
  impresion_libre: '', impresion_puntaje: 5,
});

export interface LoteConCata {
  _id:               string;
  numero_lote:       string;
  estilo_nombre:     string;
  fecha_elaboracion: string;
  estado:            string;
  parametros:        { og: number; fg: number; ibu: number; abv: number };
  catas:             { total: number; avg_puntaje: number | null };
}

export const PUNTAJE_LABEL: Record<number, string> = {
  1: 'Defectuosa', 2: 'Defectuosa', 3: 'Defectuosa',
  4: 'Mejorable', 5: 'Mejorable',
  6: 'Aceptable', 7: 'Aceptable',
  8: 'Buena', 9: 'Buena',
  10: 'Excelente',
};
