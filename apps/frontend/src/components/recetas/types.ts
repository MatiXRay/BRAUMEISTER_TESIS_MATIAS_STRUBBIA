export interface MaltaItem {
  malta_id: string;
  nombre:   string;
  cantidad: number;
  tiempo:   number;
}

export interface LupuloItem {
  lupulo_id:  string;
  nombre:     string;
  cantidad:   number;
  tiempo:     number;
  ibu_aporte: number;
}

export interface LevaduraItem {
  levadura_id:      string;
  cepa:             string;
  temp_inoculacion: number;
  tasa_inoculacion: number;
  viabilidad:       number;
  kilos_biomasa:    number;
  oxigenacion:      number;
}

export interface AguaParams {
  total:         number;
  porcentaje_ro: number;
  temperatura:   number;
  ph:            number;
  caso4:         number;
  cacl2:         number;
  mgcl:          number;
  fosforico:     number;
  otro:          number;
}

export const aguaVacia = (): AguaParams => ({
  total: 0, porcentaje_ro: 0, temperatura: 0, ph: 0,
  caso4: 0, cacl2: 0, mgcl: 0, fosforico: 0, otro: 0,
});

export interface EstiloFormData {
  nombre:        string;
  descripcion:   string;
  duracion_dias: number;
  parametros: {
    og:         number;
    fg:         number;
    ibu:        number;
    abv:        number;
    carb_level: number;
  };
  maltas:      MaltaItem[];
  lupulos:     LupuloItem[];
  levadura:    LevaduraItem | null;
  agua_mash:   AguaParams;
  agua_sparge: AguaParams;
}

export interface Estilo extends EstiloFormData {
  _id: string;
  maltas: (MaltaItem & { _id?: string })[];
  lupulos: (LupuloItem & { _id?: string })[];
}

export const estiloVacio = (): EstiloFormData => ({
  nombre: '', descripcion: '', duracion_dias: 21,
  parametros: { og: 0, fg: 0, ibu: 0, abv: 0, carb_level: 0 },
  maltas: [], lupulos: [], levadura: null,
  agua_mash: aguaVacia(), agua_sparge: aguaVacia(),
});
