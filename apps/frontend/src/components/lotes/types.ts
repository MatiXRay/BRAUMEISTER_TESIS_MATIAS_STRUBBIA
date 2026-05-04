export type EstadoLote = 'planificado' | 'elaboracion' | 'fermentando' | 'envasado' | 'finalizado';

export interface MaltaLote {
  malta_id:   string;
  nombre:     string;
  cantidad:   number;
  tiempo:     string;
  lote_malta: string;
}

export interface LupuloLote {
  lupulo_id:   string;
  nombre:      string;
  cantidad:    number;
  ibu:         number;
  tiempo:      string;
  lote_lupulo: string;
}

export interface LevaduraLote {
  cepa_id:          string;
  nombre:           string;
  gen:              number;
  temp_inoculacion: number;
  tasa_inoculacion: number;
  viabilidad:       number;
  kilos_biomasa:    number;
  oxigenacion:      number;
}

export interface Parametros {
  og:         number;
  fg:         number;
  ibu:        number;
  abv:        number;
  co2:        number;
  carb_level: number;
}

export interface Lecturas {
  ph_mosto:             number;
  ph_fin_fermentacion:  number;
  litros_a_fermentador: number;
  dia_envasado:         string;
  litros_envasados:     number;
}

export interface AguaTratamiento {
  total_agua:    number;
  porcentaje_ro: number;
  temperatura:   number;
  ph:            number;
  fosforico:     number;
  caso4:         number;
  cacl2:         number;
  mgcl:          number;
  otro:          string;
}

export interface Lote {
  _id:               string;
  numero_lote:       string;
  estilo_id:         string;
  estilo_nombre:     string;
  fermentador_id:    string;
  fermentador_nombre: string;
  fecha_elaboracion: string;
  estado:            EstadoLote;
  comentarios:       string;
  maltas:            MaltaLote[];
  lupulos:           LupuloLote[];
  levadura:          LevaduraLote | null;
  parametros:        Parametros;
  lecturas:          Lecturas;
  agua_mash:         AguaTratamiento;
  agua_sparge:       AguaTratamiento;
}

export type LoteFormData = Omit<Lote, '_id'>;

const aguaVacia = (): AguaTratamiento => ({
  total_agua: 0, porcentaje_ro: 0, temperatura: 0, ph: 0,
  fosforico: 0, caso4: 0, cacl2: 0, mgcl: 0, otro: '',
});

export const loteVacio = (): LoteFormData => ({
  numero_lote:        '',
  estilo_id:          '',
  estilo_nombre:      '',
  fermentador_id:     '',
  fermentador_nombre: '',
  fecha_elaboracion:  new Date().toISOString().split('T')[0],
  estado:             'planificado',
  comentarios:        '',
  maltas:             [],
  lupulos:            [],
  levadura:           null,
  parametros:         { og: 0, fg: 0, ibu: 0, abv: 0, co2: 0, carb_level: 0 },
  lecturas:           { ph_mosto: 0, ph_fin_fermentacion: 0, litros_a_fermentador: 0, dia_envasado: '', litros_envasados: 0 },
  agua_mash:          aguaVacia(),
  agua_sparge:        aguaVacia(),
});

export const ESTADO_CONFIG: Record<EstadoLote, { label: string; color: string }> = {
  planificado: { label: 'Planificado',  color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  elaboracion: { label: 'Elaboración',  color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  fermentando: { label: 'Fermentando',  color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  envasado:    { label: 'Envasado',     color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  finalizado:  { label: 'Finalizado',   color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};
