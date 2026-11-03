export const MESES_COMPLETOS: string[] = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export const MESES_ABREVIADOS: string[] = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
];

export const DIAS_SEMANA_COMPLETOS: string[] = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export type FormatoFecha = 'corta' | 'larga' | 'completa' | 'mesAbrev' | 'dia' | 'mesAnio';

export interface FechaPartes {
  anio: number;
  mes: number;
  dia: number;
}

export function parsearFechaString(fecha: string): FechaPartes | null {
  if (!fecha) return null;
  const fechaLimpia = fecha.includes('T') ? fecha.split('T')[0] : fecha.trim();
  const partes = fechaLimpia.split('-');
  if (partes.length < 3) return null;

  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const dia = parseInt(partes[2], 10);

  if (isNaN(anio) || isNaN(mes) || isNaN(dia)) return null;
  return { anio, mes, dia };
}

export function formatearFecha(
  fecha: string | Date | null | undefined,
  formato: FormatoFecha = 'corta'
): string {
  if (!fecha) return '';

  let anio: number;
  let mes: number; // 1-indexed (1..12)
  let dia: number;

  if (fecha instanceof Date) {
    anio = fecha.getFullYear();
    mes = fecha.getMonth() + 1;
    dia = fecha.getDate();
  } else {
    const parsed = parsearFechaString(fecha);
    if (!parsed) return fecha;
    anio = parsed.anio;
    mes = parsed.mes;
    dia = parsed.dia;
  }

  // Objeto local seguro para determinar el día de la semana sin desviación por huso horario UTC
  const fechaObj = new Date(anio, mes - 1, dia);
  const diaSemana = DIAS_SEMANA_COMPLETOS[fechaObj.getDay()] || '';
  const mesNombre = MESES_COMPLETOS[mes - 1] || '';
  const mesAbrev = MESES_ABREVIADOS[mes - 1] || '';
  const diaStr = String(dia).padStart(2, '0');
  const mesStr = String(mes).padStart(2, '0');

  switch (formato) {
    case 'corta':
      // DD/MM/AAAA
      return `${diaStr}/${mesStr}/${anio}`;
    case 'larga':
      // D de mes de AAAA (ej. 3 de noviembre de 2026)
      return `${dia} de ${mesNombre} de ${anio}`;
    case 'completa':
      // Martes, 3 de noviembre de 2026
      return `${diaSemana}, ${dia} de ${mesNombre} de ${anio}`;
    case 'mesAbrev':
      // NOV
      return mesAbrev;
    case 'dia':
      // 03
      return diaStr;
    case 'mesAnio':
      // Noviembre 2026
      return `${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${anio}`;
    default:
      return `${diaStr}/${mesStr}/${anio}`;
  }
}

export function obtenerDia(fecha: string | null | undefined): string {
  return formatearFecha(fecha, 'dia');
}

export function obtenerMesAbreviado(fecha: string | null | undefined): string {
  return formatearFecha(fecha, 'mesAbrev');
}

export function formatearFechaLegible(fecha: string | null | undefined): string {
  return formatearFecha(fecha, 'completa');
}

