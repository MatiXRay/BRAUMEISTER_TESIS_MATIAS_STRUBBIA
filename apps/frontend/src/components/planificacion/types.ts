export interface Tarea {
  _id?:           string;
  nombre:         string;
  fecha_estimada: string;
  orden:          number;
}

export interface PlanItem {
  _id:               string;
  nombre:            string;
  estilo_id:         string;
  estilo_nombre:     string;
  fermentador_id:    string;
  fermentador_nombre: string;
  fecha_coccion:     string;
  fecha_fin:         string;
  duracion_dias:     number;
  notas:             string;
  color:             string;
  estado:            string;
  tareas:            Tarea[];
}

export type PlanFormData = Omit<PlanItem, '_id'>;

export const TAREAS_PREDEFINIDAS = [
  'Dry hop', 'Gelatina', 'Gasificado', 'Enfriado',
  'Purga', 'Muestra QC', 'Filtrado', 'Carbonatación', 'Trasvase',
];

export const COLORES_PLAN = [
  '#4a8f4a', '#2e7db5', '#8b5e3c', '#7b5ea7',
  '#c8922a', '#3a9e8a', '#b54a4a', '#5a7a9e',
];

export const planVacio = (): PlanFormData => ({
  nombre:             '',
  estilo_id:          '',
  estilo_nombre:      '',
  fermentador_id:     '',
  fermentador_nombre: '',
  fecha_coccion:      new Date().toISOString().split('T')[0],
  fecha_fin:          '',
  duracion_dias:      21,
  notas:              '',
  color:              '#4a8f4a',
  estado:             'planificado',
  tareas:             [],
});
