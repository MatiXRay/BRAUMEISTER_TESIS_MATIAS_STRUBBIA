import { Request, Response } from 'express';
import { Lote } from '../models/Lote';
import { Fermentador } from '../models/Fermentador';

export const getEstadisticas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const haceDoce = new Date();
    haceDoce.setMonth(haceDoce.getMonth() - 12);

    // ── KPIs globales ────────────────────────────────────────
    const kpisRaw = await Lote.aggregate([
      { $match: { 'lecturas.litros_a_fermentador': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          total_lotes:      { $sum: 1 },
          total_lts_ferm:   { $sum: '$lecturas.litros_a_fermentador' },
          total_lts_env:    { $sum: '$lecturas.litros_envasados' },
          estilos_distintos:{ $addToSet: '$estilo_id' },
          avg_merma: {
            $avg: {
              $cond: [
                { $and: [
                  { $gt: ['$lecturas.litros_a_fermentador', 0] },
                  { $gt: ['$lecturas.litros_envasados', 0] },
                ]},
                { $multiply: [
                  { $divide: [
                    { $subtract: ['$lecturas.litros_a_fermentador', '$lecturas.litros_envasados'] },
                    '$lecturas.litros_a_fermentador',
                  ]},
                  100,
                ]},
                null,
              ],
            },
          },
          avg_dias: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$lecturas.dia_envasado', null] }, { $ne: ['$fecha_elaboracion', null] }]},
                { $divide: [
                  { $subtract: ['$lecturas.dia_envasado', '$fecha_elaboracion'] },
                  1000 * 60 * 60 * 24,
                ]},
                null,
              ],
            },
          },
        },
      },
    ]);

    const kpiRaw = kpisRaw[0] ?? null;
    const kpis = kpiRaw ? {
      total_lotes:       kpiRaw.total_lotes,
      total_lts_ferm:    Math.round(kpiRaw.total_lts_ferm),
      total_lts_env:     Math.round(kpiRaw.total_lts_env),
      estilos_distintos: kpiRaw.estilos_distintos.length,
      merma_global_pct:  kpiRaw.avg_merma ? +kpiRaw.avg_merma.toFixed(1) : null,
      avg_dias_ferm:     kpiRaw.avg_dias ? Math.round(kpiRaw.avg_dias) : null,
      avg_lts_lote:      kpiRaw.total_lotes > 0 ? Math.round(kpiRaw.total_lts_ferm / kpiRaw.total_lotes) : 0,
    } : null;

    // Ocupación de fermentadores
    const totalFVs = await Fermentador.countDocuments();
    const fvsOcupados = await Lote.distinct('fermentador_id', {
      fermentador_id: { $ne: null },
      estado: { $in: ['elaboracion', 'fermentando'] },
    });
    const pctOcupacion = totalFVs > 0 ? Math.round((fvsOcupados.length / totalFVs) * 100) : 0;

    // ── Producción por mes (últimos 12 meses) ────────────────
    const porMes = await Lote.aggregate([
      { $match: { fecha_elaboracion: { $gte: haceDoce } } },
      {
        $group: {
          _id: {
            anio:   { $year:  '$fecha_elaboracion' },
            mes:    { $month: '$fecha_elaboracion' },
            estilo: '$estilo_nombre',
          },
          lotes:  { $sum: 1 },
          litros: { $sum: '$lecturas.litros_a_fermentador' },
        },
      },
      { $sort: { '_id.anio': 1, '_id.mes': 1 } },
    ]);

    // Construir series por mes
    const mesesMap: Record<string, { mes: string; label: string; lotes: number; litros: number; estilos: Record<string, number> }> = {};
    const MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    for (const row of porMes) {
      const key = `${row._id.anio}-${String(row._id.mes).padStart(2,'0')}`;
      if (!mesesMap[key]) {
        mesesMap[key] = { mes: key, label: MESES_ES[row._id.mes - 1], lotes: 0, litros: 0, estilos: {} };
      }
      mesesMap[key].lotes  += row.lotes;
      mesesMap[key].litros += row.litros;
      mesesMap[key].estilos[row._id.estilo] = (mesesMap[key].estilos[row._id.estilo] ?? 0) + row.litros;
    }
    const produccionMensual = Object.values(mesesMap).sort((a, b) => a.mes.localeCompare(b.mes));

    // ── Estilos más elaborados ───────────────────────────────
    const estilosTop = await Lote.aggregate([
      { $match: { 'lecturas.litros_a_fermentador': { $gt: 0 } } },
      {
        $group: {
          _id:       '$estilo_nombre',
          cantidad:  { $sum: 1 },
          total_lts: { $sum: '$lecturas.litros_a_fermentador' },
          avg_lts:   { $avg: '$lecturas.litros_a_fermentador' },
          avg_abv:   { $avg: '$parametros.abv' },
          avg_ibu:   { $avg: '$parametros.ibu' },
          fecha_min: { $min: '$fecha_elaboracion' },
          fecha_max: { $max: '$fecha_elaboracion' },
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: 12 },
    ]);

    const estilosData = estilosTop.map((e) => {
      const meses = Math.max(1,
        (new Date(e.fecha_max).getFullYear() - new Date(e.fecha_min).getFullYear()) * 12 +
        (new Date(e.fecha_max).getMonth() - new Date(e.fecha_min).getMonth()) + 1
      );
      return {
        nombre:    e._id,
        cantidad:  e.cantidad,
        total_lts: Math.round(e.total_lts),
        avg_lts:   Math.round(e.avg_lts),
        avg_abv:   e.avg_abv ? +e.avg_abv.toFixed(2) : 0,
        avg_ibu:   e.avg_ibu ? Math.round(e.avg_ibu) : 0,
        avg_lts_mes: +(e.total_lts / meses).toFixed(1),
      };
    });

    // ── Litros elaborados vs envasados por estilo ────────────
    const litrosPorEstilo = await Lote.aggregate([
      { $match: { 'lecturas.litros_a_fermentador': { $gt: 0 } } },
      {
        $group: {
          _id:              '$estilo_nombre',
          total_elaborados: { $sum: '$lecturas.litros_a_fermentador' },
          total_envasados:  { $sum: '$lecturas.litros_envasados' },
        },
      },
      { $sort: { total_elaborados: -1 } },
      { $limit: 10 },
    ]);

    const litrosData = litrosPorEstilo.map((l) => ({
      nombre:           l._id,
      total_elaborados: Math.round(l.total_elaborados),
      total_envasados:  Math.round(l.total_envasados),
    }));

    // ── Merma por estilo ─────────────────────────────────────
    const mermaData = await Lote.aggregate([
      {
        $match: {
          'lecturas.litros_a_fermentador': { $gt: 0 },
          'lecturas.litros_envasados':     { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$estilo_nombre',
          merma_avg_lts: {
            $avg: { $subtract: ['$lecturas.litros_a_fermentador', '$lecturas.litros_envasados'] },
          },
          merma_pct: {
            $avg: {
              $multiply: [
                { $divide: [
                  { $subtract: ['$lecturas.litros_a_fermentador', '$lecturas.litros_envasados'] },
                  '$lecturas.litros_a_fermentador',
                ]},
                100,
              ],
            },
          },
        },
      },
      { $sort: { merma_pct: -1 } },
    ]);

    const merma = mermaData.map((m) => ({
      nombre:       m._id,
      merma_avg_lts: +m.merma_avg_lts.toFixed(1),
      merma_pct:    +m.merma_pct.toFixed(1),
    }));

    // ── Tiempos elaboración → envasado ───────────────────────
    const tiemposData = await Lote.aggregate([
      {
        $match: {
          'lecturas.dia_envasado':     { $ne: null },
          'fecha_elaboracion':         { $ne: null },
        },
      },
      {
        $project: {
          estilo_nombre: 1,
          dias: {
            $divide: [
              { $subtract: ['$lecturas.dia_envasado', '$fecha_elaboracion'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      { $match: { dias: { $gt: 0 } } },
      {
        $group: {
          _id:          '$estilo_nombre',
          dias_promedio:{ $avg: '$dias' },
          dias_min:     { $min: '$dias' },
          dias_max:     { $max: '$dias' },
          cantidad:     { $sum: 1 },
        },
      },
      { $sort: { dias_promedio: 1 } },
    ]);

    const tiempos = tiemposData.map((t) => ({
      nombre:       t._id,
      dias_promedio:Math.round(t.dias_promedio),
      dias_min:     Math.round(t.dias_min),
      dias_max:     Math.round(t.dias_max),
      cantidad:     t.cantidad,
    }));

    res.json({
      kpis,
      ocupacion: { total: totalFVs, ocupados: fvsOcupados.length, pct: pctOcupacion },
      produccion_mensual: produccionMensual,
      estilos:    estilosData,
      litros:     litrosData,
      merma,
      tiempos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
