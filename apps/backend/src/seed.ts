/**
 * Seed script — datos reales de Bialystok Brewing Co
 * Uso: npx ts-node src/seed.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Malta }        from './models/Malta';
import { Lupulo }       from './models/Lupulo';
import { Levadura }     from './models/Levadura';
import { Fermentador }  from './models/Fermentador';
import { Estilo }       from './models/Estilo';
import { ReporteAgua }  from './models/ReporteAgua';
import { Lote }         from './models/Lote';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Conectado a MongoDB');

  // Limpiar colecciones
  await Promise.all([
    Malta.deleteMany({}),
    Lupulo.deleteMany({}),
    Levadura.deleteMany({}),
    Fermentador.deleteMany({}),
    Estilo.deleteMany({}),
    ReporteAgua.deleteMany({}),
    Lote.deleteMany({}),
  ]);
  console.log('Colecciones limpiadas');

  // ── MALTAS ──────────────────────────────────────────────────
  const maltas = await Malta.insertMany([
    { nombre: 'Pale Ale 2-Row', marca: 'Crisp'     },
    { nombre: 'Munich I',       marca: 'Weyermann'  },
    { nombre: 'Caramunich I',   marca: 'Weyermann'  },
    { nombre: 'Chocolate',      marca: 'Crisp'      },
    { nombre: 'Crystal 60L',    marca: 'Briess'     },
    { nombre: 'Pilsner',        marca: 'Best Malz'  },
    { nombre: 'Wheat Malt',     marca: 'Weyermann'  },
    { nombre: 'Black Patent',   marca: 'Crisp'      },
  ]);
  console.log(`${maltas.length} maltas insertadas`);

  // ── LÚPULOS ─────────────────────────────────────────────────
  const lupulos = await Lupulo.insertMany([
    { nombre: 'Cascade',    marca: 'Hopunion'     },
    { nombre: 'Centennial', marca: 'Hopunion'     },
    { nombre: 'Citra',      marca: 'Yakima Chief' },
    { nombre: 'Mosaic',     marca: 'Yakima Chief' },
    { nombre: 'Magnum',     marca: 'HVG'          },
    { nombre: 'Saaz',       marca: 'Czech'        },
    { nombre: 'Hallertau',  marca: 'HVG'          },
  ]);
  console.log(`${lupulos.length} lúpulos insertados`);

  // ── LEVADURAS ───────────────────────────────────────────────
  const levaduras = await Levadura.insertMany([
    { cepa: 'US-05 American Ale',    marca: 'Fermentis' },
    { cepa: 'S-04 English Ale',      marca: 'Fermentis' },
    { cepa: 'W-34/70 Lager',         marca: 'Fermentis' },
    { cepa: 'BRY-97 West Coast Ale', marca: 'Lallemand' },
    { cepa: 'WB-06 Weizen',          marca: 'Fermentis' },
  ]);
  console.log(`${levaduras.length} levaduras insertadas`);

  // ── FERMENTADORES ────────────────────────────────────────────
  const fermentadores = await Fermentador.insertMany([
    { nombre: 'FV-01',  capacidad: 300,  limpiezas: { alcalina: new Date('2026-03-15'), acida: new Date('2026-03-15'), oxidativa: new Date('2026-02-20'), exterior: new Date('2026-04-01') } },
    { nombre: 'FV-02',  capacidad: 300,  limpiezas: { alcalina: new Date('2026-02-10'), acida: new Date('2026-02-10'), oxidativa: new Date('2026-01-20'), exterior: new Date('2026-03-01') } },
    { nombre: 'FV-03',  capacidad: 150,  limpiezas: { alcalina: new Date('2026-04-01'), acida: new Date('2026-04-01'), oxidativa: new Date('2026-03-15'), exterior: new Date('2026-04-10') } },
    { nombre: 'FV-04',  capacidad: 300,  limpiezas: { alcalina: new Date('2026-04-01'), acida: new Date('2026-04-01'), oxidativa: new Date('2026-03-15'), exterior: new Date('2026-04-10') } },
    { nombre: 'FV-05',  capacidad: 300,  limpiezas: { alcalina: new Date('2026-03-20'), acida: new Date('2026-03-20'), oxidativa: new Date('2026-02-28'), exterior: new Date('2026-04-05') } },
    { nombre: 'FV-06',  capacidad: 150,  limpiezas: { alcalina: new Date('2026-04-10'), acida: new Date('2026-04-10'), oxidativa: new Date('2026-03-25'), exterior: new Date('2026-04-15') } },
    { nombre: 'FV-07',  capacidad: 500,  limpiezas: { alcalina: new Date('2026-02-15'), acida: new Date('2026-02-15'), oxidativa: new Date('2026-01-20'), exterior: new Date('2026-03-01') } },
    { nombre: 'FV-08',  capacidad: 500,  limpiezas: { alcalina: new Date('2026-04-05'), acida: new Date('2026-04-05'), oxidativa: new Date('2026-03-10'), exterior: new Date('2026-04-12') } },
    { nombre: 'FV-09',  capacidad: 200,  limpiezas: { alcalina: new Date('2026-03-10'), acida: new Date('2026-03-10'), oxidativa: new Date('2026-02-15'), exterior: new Date('2026-03-20') } },
    { nombre: 'FV-10',  capacidad: 200,  limpiezas: { alcalina: new Date('2026-04-15'), acida: new Date('2026-04-15'), oxidativa: new Date('2026-03-30'), exterior: new Date('2026-04-20') } },
    { nombre: 'FV-11',  capacidad: 100,  limpiezas: { alcalina: new Date('2026-01-20'), acida: new Date('2026-01-20'), oxidativa: new Date('2025-12-15'), exterior: new Date('2026-02-01') } },
    { nombre: 'FV-12',  capacidad: 100,  limpiezas: { alcalina: new Date('2026-04-20'), acida: new Date('2026-04-20'), oxidativa: new Date('2026-04-05'), exterior: new Date('2026-04-22') } },
    { nombre: 'FV-13',  capacidad: 600,  limpiezas: { alcalina: new Date('2026-03-01'), acida: new Date('2026-03-01'), oxidativa: new Date('2026-02-05'), exterior: new Date('2026-03-10') } },
    { nombre: 'FV-14',  capacidad: 600,  limpiezas: { alcalina: new Date('2026-04-08'), acida: new Date('2026-04-08'), oxidativa: new Date('2026-03-20'), exterior: new Date('2026-04-15') } },
    { nombre: 'FV-15',  capacidad: 1000, limpiezas: { alcalina: new Date('2026-02-01'), acida: new Date('2026-02-01'), oxidativa: new Date('2026-01-10'), exterior: new Date('2026-02-15') } },
  ]);
  console.log(`${fermentadores.length} fermentadores insertados`);

  // ── ESTILOS ──────────────────────────────────────────────────
  const estilos = await Estilo.insertMany([
    {
      nombre: 'American IPA',
      descripcion: 'Hoppy, bitter, citrus and pine notes. High aroma.',
      duracion_dias: 21,
      parametros: { og: 1.065, fg: 1.012, ibu: 65, abv: 6.90, carb_level: 2.40 },
      maltas: [
        { malta: maltas[0]._id, nombre: 'Pale Ale 2-Row', cantidad: 5.5,  tiempo: 60 },
        { malta: maltas[2]._id, nombre: 'Caramunich I',   cantidad: 0.5,  tiempo: 60 },
        { malta: maltas[4]._id, nombre: 'Crystal 60L',    cantidad: 0.45, tiempo: 60 },
      ],
      lupulos: [
        { lupulo: lupulos[4]._id, nombre: 'Magnum',  cantidad: 30, tiempo: 60, ibu_aporte: 30.0 },
        { lupulo: lupulos[0]._id, nombre: 'Cascade', cantidad: 40, tiempo: 15, ibu_aporte: 20.0 },
        { lupulo: lupulos[2]._id, nombre: 'Citra',   cantidad: 60, tiempo:  5, ibu_aporte:  8.0 },
        { lupulo: lupulos[3]._id, nombre: 'Mosaic',  cantidad: 60, tiempo:  0, ibu_aporte:  0.0 },
      ],
      levadura: { levadura: levaduras[0]._id, cepa: 'US-05 American Ale', temp_inoculacion: 19.0 },
    },
    {
      nombre: 'American Stout',
      descripcion: 'Roasty, dark, chocolate and coffee notes.',
      duracion_dias: 28,
      parametros: { og: 1.060, fg: 1.014, ibu: 40, abv: 6.00, carb_level: 2.20 },
      maltas: [
        { malta: maltas[0]._id, nombre: 'Pale Ale 2-Row', cantidad: 4.5, tiempo: 60 },
        { malta: maltas[3]._id, nombre: 'Chocolate',      cantidad: 0.5, tiempo: 60 },
        { malta: maltas[2]._id, nombre: 'Caramunich I',   cantidad: 0.6, tiempo: 60 },
        { malta: maltas[7]._id, nombre: 'Black Patent',   cantidad: 0.3, tiempo: 60 },
      ],
      lupulos: [
        { lupulo: lupulos[4]._id, nombre: 'Magnum',  cantidad: 35, tiempo: 60, ibu_aporte: 35.0 },
        { lupulo: lupulos[0]._id, nombre: 'Cascade', cantidad: 20, tiempo: 10, ibu_aporte:  5.0 },
      ],
      levadura: { levadura: levaduras[1]._id, cepa: 'S-04 English Ale', temp_inoculacion: 18.0 },
    },
    {
      nombre: 'Pale Ale',
      descripcion: 'Balanced malt and hops, fruity esters.',
      duracion_dias: 18,
      parametros: { og: 1.052, fg: 1.010, ibu: 35, abv: 5.50, carb_level: 2.50 },
      maltas: [
        { malta: maltas[0]._id, nombre: 'Pale Ale 2-Row', cantidad: 4.2, tiempo: 60 },
        { malta: maltas[1]._id, nombre: 'Munich I',        cantidad: 0.5, tiempo: 60 },
        { malta: maltas[2]._id, nombre: 'Caramunich I',   cantidad: 0.4, tiempo: 60 },
      ],
      lupulos: [
        { lupulo: lupulos[0]._id, nombre: 'Cascade',    cantidad: 25, tiempo: 60, ibu_aporte: 20.0 },
        { lupulo: lupulos[1]._id, nombre: 'Centennial', cantidad: 30, tiempo: 10, ibu_aporte: 10.0 },
        { lupulo: lupulos[2]._id, nombre: 'Citra',      cantidad: 40, tiempo:  0, ibu_aporte:  0.0 },
      ],
      levadura: { levadura: levaduras[0]._id, cepa: 'US-05 American Ale', temp_inoculacion: 19.0 },
    },
    {
      nombre: 'German Lager',
      descripcion: 'Clean, crisp, light malt body, low bitterness.',
      duracion_dias: 42,
      parametros: { og: 1.048, fg: 1.008, ibu: 18, abv: 5.20, carb_level: 2.60 },
      maltas: [
        { malta: maltas[5]._id, nombre: 'Pilsner',  cantidad: 4.8, tiempo: 60 },
        { malta: maltas[1]._id, nombre: 'Munich I', cantidad: 0.5, tiempo: 60 },
      ],
      lupulos: [
        { lupulo: lupulos[4]._id, nombre: 'Magnum', cantidad: 20, tiempo: 60, ibu_aporte: 15.0 },
        { lupulo: lupulos[5]._id, nombre: 'Saaz',   cantidad: 30, tiempo: 10, ibu_aporte:  3.0 },
      ],
      levadura: { levadura: levaduras[2]._id, cepa: 'W-34/70 Lager', temp_inoculacion: 10.0 },
    },
  ]);
  console.log(`${estilos.length} estilos insertados`);

  // ── REPORTES DE AGUA ────────────────────────────────────────
  const reportes = await ReporteAgua.insertMany([
    { fecha: new Date('2026-04-01'), laboratorio: 'Lab Municipal BKS', origen: 'RED',    ph: 7.2, ca: 62,  mg: 14, na: 20, cl: 50,  so4: 45, dureza_total: 180, dureza_carbonato: 120, alcalinidad: 98  },
    { fecha: new Date('2026-04-01'), laboratorio: 'Lab Municipal BKS', origen: 'OSMOSIS',ph: 6.8, ca: 10,  mg:  3, na:  5, cl:  8,  so4:  8, dureza_total:  30, dureza_carbonato:  20, alcalinidad: 16  },
    { fecha: new Date('2026-03-01'), laboratorio: 'Lab Municipal BKS', origen: 'RED',    ph: 7.3, ca: 64,  mg: 15, na: 22, cl: 52,  so4: 48, dureza_total: 185, dureza_carbonato: 125, alcalinidad: 102 },
    { fecha: new Date('2026-03-01'), laboratorio: 'Lab Municipal BKS', origen: 'OSMOSIS',ph: 6.9, ca:  9,  mg:  3, na:  4, cl:  7,  so4:  9, dureza_total:  28, dureza_carbonato:  18, alcalinidad: 15  },
  ]);
  console.log(`${reportes.length} reportes de agua insertados`);

  // ── LOTES ────────────────────────────────────────────────────
  const lotes = await Lote.insertMany([
    {
      numero_lote:        'BBC-2026-001',
      estilo_id:          estilos[0]._id,
      estilo_nombre:      'American IPA',
      fermentador_id:     fermentadores[0]._id,
      fermentador_nombre: 'FV-01',
      fecha_elaboracion:  new Date('2026-01-15'),
      estado:             'envasado',
      comentarios:        'IPA de arranque de temporada. Muy buena retención de espuma.',
      maltas: [
        { malta_id: maltas[0]._id, nombre: 'Pale Ale 2-Row', cantidad: 5.5,  tiempo: '60', lote_malta: 'L001-M01' },
        { malta_id: maltas[2]._id, nombre: 'Caramunich I',   cantidad: 0.5,  tiempo: '60', lote_malta: 'L001-M02' },
        { malta_id: maltas[4]._id, nombre: 'Crystal 60L',    cantidad: 0.45, tiempo: '60', lote_malta: 'L001-M03' },
      ],
      lupulos: [
        { lupulo_id: lupulos[4]._id, nombre: 'Magnum',  cantidad: 30, ibu: 30.0, tiempo: '60', lote_lupulo: 'L001-H01' },
        { lupulo_id: lupulos[0]._id, nombre: 'Cascade', cantidad: 40, ibu: 20.0, tiempo: '15', lote_lupulo: 'L001-H02' },
        { lupulo_id: lupulos[2]._id, nombre: 'Citra',   cantidad: 60, ibu:  8.0, tiempo: '5',  lote_lupulo: 'L001-H03' },
        { lupulo_id: lupulos[3]._id, nombre: 'Mosaic',  cantidad: 60, ibu:  0.0, tiempo: '0',  lote_lupulo: 'L001-H04' },
      ],
      levadura: { cepa_id: levaduras[0]._id, nombre: 'US-05 American Ale', gen: 2, temp_inoculacion: 19.0, tasa_inoculacion: 1.25, viabilidad: 92.5, kilos_biomasa: 2.5, oxigenacion: 10 },
      parametros:  { og: 1.066, fg: 1.013, ibu: 64, abv: 6.95, co2: 0, carb_level: 2.40 },
      lecturas:    { ph_mosto: 5.4, ph_fin_fermentacion: 4.1, litros_a_fermentador: 280, dia_envasado: new Date('2026-02-12'), litros_envasados: 245 },
      agua_mash:   { total_agua: 160, porcentaje_ro: 40, temperatura: 67.0, ph: 5.4, fosforico: 1.5,  caso4: 1.5,  cacl2: 1.2,  mgcl: 0.3, otro: '' },
      agua_sparge: { total_agua: 140, porcentaje_ro: 30, temperatura: 76.0, ph: 5.8, fosforico: 0,    caso4: 1.0,  cacl2: 0.8,  mgcl: 0,   otro: '' },
    },
    {
      numero_lote:        'BBC-2026-002',
      estilo_id:          estilos[1]._id,
      estilo_nombre:      'American Stout',
      fermentador_id:     fermentadores[1]._id,
      fermentador_nombre: 'FV-02',
      fecha_elaboracion:  new Date('2026-02-10'),
      estado:             'envasado',
      comentarios:        'Stout invernal. Aromas a chocolate y café bien pronunciados.',
      maltas: [
        { malta_id: maltas[0]._id, nombre: 'Pale Ale 2-Row', cantidad: 4.5, tiempo: '60', lote_malta: 'L002-M01' },
        { malta_id: maltas[3]._id, nombre: 'Chocolate',      cantidad: 0.5, tiempo: '60', lote_malta: 'L002-M02' },
        { malta_id: maltas[2]._id, nombre: 'Caramunich I',   cantidad: 0.6, tiempo: '60', lote_malta: 'L002-M03' },
        { malta_id: maltas[7]._id, nombre: 'Black Patent',   cantidad: 0.3, tiempo: '60', lote_malta: 'L002-M04' },
      ],
      lupulos: [
        { lupulo_id: lupulos[4]._id, nombre: 'Magnum',  cantidad: 35, ibu: 35.0, tiempo: '60', lote_lupulo: 'L002-H01' },
        { lupulo_id: lupulos[0]._id, nombre: 'Cascade', cantidad: 20, ibu:  5.0, tiempo: '10', lote_lupulo: 'L002-H02' },
      ],
      levadura: { cepa_id: levaduras[1]._id, nombre: 'S-04 English Ale', gen: 1, temp_inoculacion: 18.0, tasa_inoculacion: 1.0, viabilidad: 98.0, kilos_biomasa: 2.2, oxigenacion: 8 },
      parametros:  { og: 1.061, fg: 1.015, ibu: 41, abv: 5.98, co2: 0, carb_level: 2.20 },
      lecturas:    { ph_mosto: 5.3, ph_fin_fermentacion: 4.2, litros_a_fermentador: 290, dia_envasado: new Date('2026-03-10'), litros_envasados: 260 },
      agua_mash:   { total_agua: 155, porcentaje_ro: 35, temperatura: 66.0, ph: 5.3, fosforico: 1.2,  caso4: 1.2,  cacl2: 1.0,  mgcl: 0.2, otro: '' },
      agua_sparge: { total_agua: 145, porcentaje_ro: 25, temperatura: 76.0, ph: 5.7, fosforico: 0,    caso4: 0.8,  cacl2: 0.6,  mgcl: 0,   otro: '' },
    },
    {
      numero_lote:        'BBC-2026-003',
      estilo_id:          estilos[2]._id,
      estilo_nombre:      'Pale Ale',
      fermentador_id:     fermentadores[2]._id,
      fermentador_nombre: 'FV-03',
      fecha_elaboracion:  new Date('2026-03-05'),
      estado:             'fermentando',
      comentarios:        'Pale Ale primaveral. En carbonatación.',
      maltas: [
        { malta_id: maltas[0]._id, nombre: 'Pale Ale 2-Row', cantidad: 4.2, tiempo: '60', lote_malta: 'L003-M01' },
        { malta_id: maltas[1]._id, nombre: 'Munich I',        cantidad: 0.5, tiempo: '60', lote_malta: 'L003-M02' },
        { malta_id: maltas[2]._id, nombre: 'Caramunich I',   cantidad: 0.4, tiempo: '60', lote_malta: 'L003-M03' },
      ],
      lupulos: [
        { lupulo_id: lupulos[0]._id, nombre: 'Cascade',    cantidad: 25, ibu: 20.0, tiempo: '60', lote_lupulo: 'L003-H01' },
        { lupulo_id: lupulos[1]._id, nombre: 'Centennial', cantidad: 30, ibu: 10.0, tiempo: '10', lote_lupulo: 'L003-H02' },
        { lupulo_id: lupulos[2]._id, nombre: 'Citra',      cantidad: 40, ibu:  0.0, tiempo: '0',  lote_lupulo: 'L003-H03' },
      ],
      levadura: { cepa_id: levaduras[0]._id, nombre: 'US-05 American Ale', gen: 3, temp_inoculacion: 19.0, tasa_inoculacion: 1.25, viabilidad: 88.0, kilos_biomasa: 2.5, oxigenacion: 10 },
      parametros:  { og: 1.053, fg: 1.011, ibu: 34, abv: 5.51, co2: 0, carb_level: 2.50 },
      lecturas:    { ph_mosto: 5.4, ph_fin_fermentacion: 4.1, litros_a_fermentador: 285, dia_envasado: null, litros_envasados: 0 },
      agua_mash:   { total_agua: 158, porcentaje_ro: 40, temperatura: 67.5, ph: 5.4, fosforico: 1.4,  caso4: 1.4,  cacl2: 1.1,  mgcl: 0.25, otro: '' },
      agua_sparge: { total_agua: 142, porcentaje_ro: 30, temperatura: 76.0, ph: 5.8, fosforico: 0,    caso4: 0.9,  cacl2: 0.7,  mgcl: 0,    otro: '' },
    },
    {
      numero_lote:        'BBC-2026-004',
      estilo_id:          estilos[0]._id,
      estilo_nombre:      'American IPA',
      fermentador_id:     fermentadores[3]._id,
      fermentador_nombre: 'FV-04',
      fecha_elaboracion:  new Date('2026-04-15'),
      estado:             'planificado',
      comentarios:        'IPA planificada.',
      maltas:   [],
      lupulos:  [],
      levadura: null,
      parametros:  { og: 0, fg: 0, ibu: 0, abv: 0, co2: 0, carb_level: 2.40 },
      lecturas:    { ph_mosto: 0, ph_fin_fermentacion: 0, litros_a_fermentador: 0, dia_envasado: null, litros_envasados: 0 },
      agua_mash:   { total_agua: 0, porcentaje_ro: 0, temperatura: 0, ph: 0, fosforico: 0, caso4: 0, cacl2: 0, mgcl: 0, otro: '' },
      agua_sparge: { total_agua: 0, porcentaje_ro: 0, temperatura: 0, ph: 0, fosforico: 0, caso4: 0, cacl2: 0, mgcl: 0, otro: '' },
    },
  ]);
  console.log(`${lotes.length} lotes insertados`);

  console.log('\n✅ Seed completado');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
