export interface KpisData {
  total_lotes:       number;
  total_lts_ferm:    number;
  total_lts_env:     number;
  estilos_distintos: number;
  merma_global_pct:  number | null;
  avg_dias_ferm:     number | null;
  avg_lts_lote:      number;
}

export interface OcupacionData {
  total:   number;
  ocupados: number;
  pct:     number;
}

export interface MesMes {
  mes:    string;
  label:  string;
  lotes:  number;
  litros: number;
  estilos: Record<string, number>;
}

export interface EstiloData {
  nombre:      string;
  cantidad:    number;
  total_lts:   number;
  avg_lts:     number;
  avg_abv:     number;
  avg_ibu:     number;
  avg_lts_mes: number;
}

export interface LitrosData {
  nombre:           string;
  total_elaborados: number;
  total_envasados:  number;
}

export interface MermaData {
  nombre:       string;
  merma_avg_lts: number;
  merma_pct:    number;
}

export interface TiempoData {
  nombre:        string;
  dias_promedio: number;
  dias_min:      number;
  dias_max:      number;
  cantidad:      number;
}

export interface EstadisticasPayload {
  kpis:               KpisData | null;
  ocupacion:          OcupacionData;
  produccion_mensual: MesMes[];
  estilos:            EstiloData[];
  litros:             LitrosData[];
  merma:              MermaData[];
  tiempos:            TiempoData[];
}
