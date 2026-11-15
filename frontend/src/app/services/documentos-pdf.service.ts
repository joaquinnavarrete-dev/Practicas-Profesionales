import { Injectable } from '@angular/core';

export interface ReporteKpi {
  totalTurnos: number;
  atendidos: number;
  ausentes: number;
  efectividad: number;
}

export interface ReporteItemEspecialidadPdf {
  nombre: string;
  totalTurnos: number;
  atendidos: number;
  ausentes: number;
  efectividad: number;
}

export interface ReporteItemMedicoPdf {
  nombre: string;
  especialidad: string;
  totalTurnos: number;
  atendidos: number;
  ausentes: number;
  efectividad: number;
}

export interface ReporteItemObraSocialPdf {
  nombre: string;
  totalTurnos: number;
  porcentaje: number;
}

export interface HistoriaClinicaPacientePdf {
  nombreCompleto: string;
  dni: string;
  numHistoriaClinica: string;
  telefono: string;
  obraSocial: string;
}

export interface HistoriaClinicaRegistroPdf {
  fecha: string;
  medicoNombre: string;
  medicoEspecialidad: string;
  medicoMatricula: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}

export interface PlanillaTurnoPacientePdf {
  hora: string;
  nombre: string;
  dni: string;
  obraSocial: string;
  plan?: string;
  motivo?: string;
  estado: string;
}

export interface PlanillaMedicoInfoPdf {
  nombre: string;
  especialidad: string;
  matricula: string;
  consultorio: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosPdfService {

  private abrirVentanaImpresion(titulo: string, contenidoHtml: string, orientacion: 'portrait' | 'landscape' = 'portrait'): void {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert('Por favor, permita las ventanas emergentes en su navegador para generar el documento PDF.');
      return;
    }

    const htmlCompleto = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
          @page {
            size: A4 ${orientacion};
            margin: 12mm 10mm 15mm 10mm;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background-color: #f1f5f9;
            padding: 20px 0;
            line-height: 1.4;
          }

          .no-print-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #0f172a;
            color: #ffffff;
            padding: 10px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
          }

          .no-print-bar .title {
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .no-print-bar .btn-group {
            display: flex;
            gap: 10px;
          }

          .btn-print {
            background: #004b93;
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.15s;
          }

          .btn-print:hover {
            background: #0284c7;
          }

          .btn-close {
            background: #334155;
            color: #ffffff;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
          }

          .btn-close:hover {
            background: #475569;
          }

          .document-page {
            background: #ffffff;
            width: ${orientacion === 'landscape' ? '297mm' : '210mm'};
            min-height: ${orientacion === 'landscape' ? '210mm' : '297mm'};
            margin: 45px auto 30px auto;
            padding: 16mm 18mm;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border-radius: 2px;
            position: relative;
          }

          /* Header Institucional */
          .doc-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 12px;
            border-bottom: 2.5px solid #004b93;
            margin-bottom: 16px;
          }

          .clinic-brand {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .clinic-cross {
            font-size: 38px;
            color: #004b93;
            line-height: 1;
            font-weight: 900;
          }

          .clinic-names {
            display: flex;
            flex-direction: column;
          }

          .clinic-title {
            font-size: 20px;
            font-weight: 900;
            color: #004b93;
            letter-spacing: 0.5px;
          }

          .clinic-sub {
            font-size: 10px;
            font-weight: 700;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .clinic-legal {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 2px;
          }

          .doc-meta {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .meta-badge {
            background: #004b93;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 4px;
            letter-spacing: 0.5px;
            display: inline-block;
            align-self: flex-end;
            margin-bottom: 3px;
          }

          .meta-line {
            font-size: 10.5px;
            color: #334155;
          }

          /* Título Principal del Documento */
          .doc-title-block {
            text-align: center;
            margin-bottom: 16px;
          }

          .doc-main-title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }

          .doc-subtitle {
            font-size: 11px;
            color: #64748b;
          }

          /* Estilos de Tabla */
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
          }

          .data-table th,
          .data-table td {
            border: 1px solid #94a3b8;
            padding: 7px 9px;
            text-align: left;
          }

          .data-table th {
            background-color: #004b93;
            color: #ffffff;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }

          .data-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }

          .text-right {
            text-align: right;
          }

          .text-center {
            text-align: center;
          }

          .font-bold {
            font-weight: 700;
          }

          /* KPI Grid */
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }

          .kpi-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 12px;
            text-align: center;
          }

          .kpi-label {
            font-size: 9px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .kpi-val {
            font-size: 19px;
            font-weight: 900;
            color: #0f172a;
            margin: 2px 0;
          }

          .kpi-foot {
            font-size: 9px;
            color: #64748b;
          }

          /* Cédula de Paciente / Médico */
          .info-card {
            border: 1.5px solid #004b93;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 16px;
          }

          .info-card-header {
            background: #004b93;
            color: #ffffff;
            padding: 6px 12px;
            font-size: 10.5px;
            font-weight: 800;
            display: flex;
            justify-content: space-between;
          }

          .info-card-body {
            background: #f8fafc;
            padding: 10px 14px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }

          .info-item-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          }

          .info-item-value {
            font-size: 11.5px;
            color: #0f172a;
            font-weight: 600;
            margin-top: 2px;
          }

          /* Evoluciones de Historia Clínica */
          .evo-item {
            border: 1px solid #94a3b8;
            border-left: 4px solid #004b93;
            border-radius: 6px;
            padding: 12px 14px;
            margin-bottom: 14px;
            background: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .evo-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }

          .evo-date {
            background: #004b93;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 4px;
          }

          .evo-doctor {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
          }

          .evo-section-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            margin-top: 6px;
          }

          .evo-text {
            font-size: 11.5px;
            color: #1e293b;
            margin-top: 2px;
          }

          .diag-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-left: 3px solid #0284c7;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 11.5px;
            font-weight: 600;
            color: #0369a1;
            margin-top: 3px;
          }

          .evo-sign-space {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-top: 10px;
          }

          .evo-sign-line {
            border-bottom: 1px dotted #64748b;
            width: 160px;
            margin-bottom: 3px;
          }

          .evo-sign-caption {
            font-size: 8.5px;
            color: #64748b;
            width: 160px;
            text-align: center;
          }

          /* Footer de firmas */
          .doc-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 26px;
            padding-top: 14px;
            border-top: 1.5px solid #004b93;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .legal-notice {
            max-width: 55%;
          }

          .legal-notice p {
            font-size: 9px;
            color: #475569;
            line-height: 1.35;
          }

          .legal-notice .ts {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 4px;
            display: block;
          }

          .signatures-group {
            display: flex;
            gap: 20px;
          }

          .sig-box {
            text-align: center;
            min-width: 160px;
          }

          .sig-line {
            border-bottom: 1px solid #000000;
            margin-bottom: 5px;
            width: 100%;
          }

          .sig-title {
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
          }

          .sig-sub {
            font-size: 9px;
            color: #64748b;
          }

          /* Badges de estado */
          .badge-st {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 700;
            border: 1px solid #94a3b8;
            background: #f1f5f9;
            color: #0f172a;
          }

          .stat-pill {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 3px 7px;
            border-radius: 4px;
            font-size: 9.5px;
            color: #334155;
          }

          /* Estilos de Impresión */
          @media print {
            body {
              background: #ffffff !important;
              padding: 0 !important;
            }

            .no-print-bar {
              display: none !important;
            }

            .document-page {
              width: 100% !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          }
        </style>
      </head>
      <body>

        <div class="no-print-bar">
          <div class="title">
            <span>📄 ${titulo}</span>
          </div>
          <div class="btn-group">
            <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
            <button class="btn-close" onclick="window.close()">✖ Cerrar</button>
          </div>
        </div>

        <div class="document-page">
          ${contenidoHtml}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    ventana.document.open();
    ventana.document.write(htmlCompleto);
    ventana.document.close();
  }

  imprimirReporteEstadistico(datos: {
    modulo: string;
    fechaEmision: string;
    kpi: ReporteKpi;
    tipo: 'especialidades' | 'medicos' | 'obrasSociales';
    itemsEspecialidades?: ReporteItemEspecialidadPdf[];
    itemsMedicos?: ReporteItemMedicoPdf[];
    itemsObrasSociales?: ReporteItemObraSocialPdf[];
  }): void {

    let tablaHtml = '';

    if (datos.tipo === 'especialidades' && datos.itemsEspecialidades) {
      tablaHtml = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Especialidad Médica</th>
              <th class="text-right">Total Turnos</th>
              <th class="text-right">Consultas Atendidas</th>
              <th class="text-right">Ausencias / Bajas</th>
              <th class="text-right">Tasa Asistencia</th>
            </tr>
          </thead>
          <tbody>
            ${datos.itemsEspecialidades.map(e => `
              <tr>
                <td class="font-bold">${e.nombre}</td>
                <td class="text-right">${e.totalTurnos} citas</td>
                <td class="text-right" style="color: #15803d; font-weight: 700;">✓ ${e.atendidos}</td>
                <td class="text-right" style="color: #b91c1c; font-weight: 700;">${e.ausentes}</td>
                <td class="text-right"><span class="badge-st font-bold">${e.efectividad}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (datos.tipo === 'medicos' && datos.itemsMedicos) {
      tablaHtml = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Profesional Médico</th>
              <th>Especialidad</th>
              <th class="text-right">Total Turnos</th>
              <th class="text-right">Atendidos</th>
              <th class="text-right">Ausencias</th>
              <th class="text-right">Efectividad</th>
            </tr>
          </thead>
          <tbody>
            ${datos.itemsMedicos.map(m => `
              <tr>
                <td class="font-bold">${m.nombre}</td>
                <td>${m.especialidad}</td>
                <td class="text-right">${m.totalTurnos} citas</td>
                <td class="text-right" style="color: #15803d; font-weight: 700;">✓ ${m.atendidos}</td>
                <td class="text-right" style="color: #b91c1c; font-weight: 700;">${m.ausentes}</td>
                <td class="text-right"><span class="badge-st font-bold">${m.efectividad}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (datos.tipo === 'obrasSociales' && datos.itemsObrasSociales) {
      tablaHtml = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Obra Social / Cobertura</th>
              <th class="text-right">Total Turnos Asignados</th>
              <th class="text-right">Participación Relativa</th>
            </tr>
          </thead>
          <tbody>
            ${datos.itemsObrasSociales.map(o => `
              <tr>
                <td class="font-bold">${o.nombre}</td>
                <td class="text-right">${o.totalTurnos} citas</td>
                <td class="text-right"><span class="badge-st font-bold">${o.porcentaje}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const contenido = `
      <div class="doc-header">
        <div class="clinic-brand">
          <span class="clinic-cross">✚</span>
          <div class="clinic-names">
            <h1 class="clinic-title">CLÍNICA SAN GABRIEL S.A.</h1>
            <span class="clinic-sub">DIRECCIÓN MÉDICA • AUDITORÍA DE GESTIÓN Y CONTROL DE CALIDAD</span>
            <span class="clinic-legal">CUIT: 30-71489234-5 • Av. San Martín 1420, Ciudad • Tel: (011) 4890-5500</span>
          </div>
        </div>
        <div class="doc-meta">
          <span class="meta-badge">INFORME DE AUDITORÍA</span>
          <span class="meta-line"><strong>Fecha:</strong> ${datos.fechaEmision}</span>
          <span class="meta-line"><strong>Módulo:</strong> ${datos.modulo}</span>
          <span class="meta-line"><strong>N° Control:</strong> REP-AUD-${datos.kpi.totalTurnos}</span>
        </div>
      </div>

      <div class="doc-title-block">
        <h2 class="doc-main-title">${datos.modulo.toUpperCase()}</h2>
        <p class="doc-subtitle">Consolidado institucional del período actual con discriminación analítica de demanda y efectividad asistencial.</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-box">
          <span class="kpi-label">Total Turnos Auditados</span>
          <div class="kpi-val">${datos.kpi.totalTurnos}</div>
          <span class="kpi-foot">Citas registradas</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Consultas Efectivas</span>
          <div class="kpi-val" style="color: #15803d;">${datos.kpi.atendidos}</div>
          <span class="kpi-foot">Pacientes atendidos</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Ausencias / Bajas</span>
          <div class="kpi-val" style="color: #b91c1c;">${datos.kpi.ausentes}</div>
          <span class="kpi-foot">Sin concreción</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Tasa Asistencia Global</span>
          <div class="kpi-val" style="color: #004b93;">${datos.kpi.efectividad}%</div>
          <span class="kpi-foot">Efectividad global</span>
        </div>
      </div>

      ${tablaHtml}

      <div class="doc-footer">
        <div class="legal-notice">
          <p><strong>Aviso de Auditoría y Confidencialidad:</strong> El presente informe consolida información médica y operativa de la Clínica San Gabriel S.A. con fines exclusivos de control de gestión, auditoría interna y optimización del servicio asistencial.</p>
          <span class="ts">Generado por el Sistema Informático • Clínica San Gabriel • Emisión: ${datos.fechaEmision}</span>
        </div>
        <div class="signatures-group">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong class="sig-title">Dirección Médica</strong>
            <span class="sig-sub">Clínica San Gabriel S.A.</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong class="sig-title">Auditoría y Control</strong>
            <span class="sig-sub">Firma de Conformidad</span>
          </div>
        </div>
      </div>
    `;

    this.abrirVentanaImpresion(`Reporte Estadístico - ${datos.modulo}`, contenido, 'portrait');
  }

  imprimirHistoriaClinica(datos: {
    fechaEmision: string;
    paciente: HistoriaClinicaPacientePdf;
    registros: HistoriaClinicaRegistroPdf[];
  }): void {

    const registrosHtml = datos.registros.length > 0 ? datos.registros.map(r => `
      <div class="evo-item">
        <div class="evo-top">
          <span class="evo-date">📅 ${r.fecha}</span>
          <span class="evo-doctor">👨‍⚕️ ${r.medicoNombre} (${r.medicoEspecialidad} - Mat. ${r.medicoMatricula})</span>
        </div>

        <div class="evo-section-title">Motivo de Consulta:</div>
        <div class="evo-text">${r.motivoConsulta || 'Consulta médica de control'}</div>

        <div class="evo-section-title">Diagnóstico Facultativo:</div>
        <div class="diag-box">${r.diagnostico}</div>

        ${r.tratamiento ? `
          <div class="evo-section-title">💊 Tratamiento / Prescripciones:</div>
          <div class="evo-text">${r.tratamiento}</div>
        ` : ''}

        ${r.observaciones ? `
          <div class="evo-section-title">📝 Observaciones Adicionales:</div>
          <div class="evo-text">${r.observaciones}</div>
        ` : ''}

        <div class="evo-sign-space">
          <div class="evo-sign-line"></div>
          <span class="evo-sign-caption">Firma y Sello del Profesional</span>
        </div>
      </div>
    `).join('') : `
      <div style="text-align: center; padding: 30px; color: #64748b; font-size: 12px; border: 1px dashed #cbd5e1; border-radius: 6px;">
        No se registran antecedentes clínicos ni evoluciones asentadas para este paciente.
      </div>
    `;

    const contenido = `
      <div class="doc-header">
        <div class="clinic-brand">
          <span class="clinic-cross">✚</span>
          <div class="clinic-names">
            <h1 class="clinic-title">CLÍNICA SAN GABRIEL S.A.</h1>
            <span class="clinic-sub">DEPARTAMENTO DE ARCHIVO Y DOCUMENTACIÓN CLÍNICA</span>
            <span class="clinic-legal">Av. San Martín 1420, Ciudad • Tel: (011) 4890-5500 • CUIT: 30-71489234-5</span>
          </div>
        </div>
        <div class="doc-meta">
          <span class="meta-badge">HISTORIA CLÍNICA OFICIAL</span>
          <span class="meta-line"><strong>Fecha:</strong> ${datos.fechaEmision}</span>
          <span class="meta-line"><strong>Expediente N°:</strong> ${datos.paciente.numHistoriaClinica}</span>
          <span class="meta-line"><strong>Carácter:</strong> Confidencial / Ley 26.529</span>
        </div>
      </div>

      <div class="doc-title-block">
        <h2 class="doc-main-title">EXPEDIENTE DE HISTORIA CLÍNICA</h2>
        <p class="doc-subtitle">Evolución diagnóstica, cronología facultativa y prescripciones terapéuticas del paciente.</p>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <span>DATOS FILIATORIOS Y COBERTURA DEL PACIENTE</span>
          <span>${datos.paciente.numHistoriaClinica}</span>
        </div>
        <div class="info-card-body">
          <div>
            <div class="info-item-label">Paciente:</div>
            <div class="info-item-value font-bold" style="color: #004b93;">${datos.paciente.nombreCompleto}</div>
          </div>
          <div>
            <div class="info-item-label">Documento Nacional:</div>
            <div class="info-item-value">DNI ${datos.paciente.dni}</div>
          </div>
          <div>
            <div class="info-item-label">Teléfono de Contacto:</div>
            <div class="info-item-value">📞 ${datos.paciente.telefono}</div>
          </div>
          <div>
            <div class="info-item-label">Obra Social / Cobertura:</div>
            <div class="info-item-value font-bold">${datos.paciente.obraSocial}</div>
          </div>
        </div>
      </div>

      <h3 style="font-size: 13px; font-weight: 800; color: #004b93; margin-bottom: 10px; text-transform: uppercase;">Cronología de Evoluciones Médicas</h3>

      ${registrosHtml}

      <div class="doc-footer">
        <div class="legal-notice">
          <p><strong>Aviso de Confidencialidad y Validez Legal:</strong> El presente documento contiene datos sensibles de salud protegidos por la Ley 26.529 de Derechos del Paciente e Historia Clínica. Su contenido es estrictamente confidencial y reservado para el paciente y el equipo facultativo interviniente.</p>
          <span class="ts">Generado por el Sistema Informático • Clínica San Gabriel S.A. • Emisión: ${datos.fechaEmision}</span>
        </div>
        <div class="signatures-group">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong class="sig-title">Dirección Médica</strong>
            <span class="sig-sub">Clínica San Gabriel S.A.</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong class="sig-title">Profesional Tratante</strong>
            <span class="sig-sub">Firma y Sello Facultativo</span>
          </div>
        </div>
      </div>
    `;

    this.abrirVentanaImpresion(`Historia Clínica - ${datos.paciente.nombreCompleto}`, contenido, 'portrait');
  }

  imprimirPlanillaTurnos(datos: {
    medico: PlanillaMedicoInfoPdf;
    turnos: PlanillaTurnoPacientePdf[];
    resumen: {
      total: number;
      atendidos: number;
      enEspera: number;
      ausentes: number;
    };
  }): void {

    const filasHtml = datos.turnos.map((t, index) => `
      <tr>
        <td class="text-center font-bold">${index + 1}</td>
        <td class="font-bold" style="white-space: nowrap;">🕒 ${t.hora}</td>
        <td>
          <div class="font-bold">${t.nombre}</div>
          <div style="font-size: 9.5px; color: #64748b;">DNI ${t.dni}</div>
        </td>
        <td>
          <div class="font-bold">${t.obraSocial}</div>
          <div style="font-size: 9px; color: #64748b;">${t.plan || 'Estándar'}</div>
        </td>
        <td>${t.motivo || 'Control de rutina'}</td>
        <td class="text-center">
          <span class="badge-st font-bold">${t.estado}</span>
        </td>
        <td style="width: 170px; min-width: 170px;">
          <div style="height: 28px; border-bottom: 1px dashed #64748b; margin-bottom: 2px;"></div>
          <div style="font-size: 8px; color: #94a3b8; text-align: center;">Firma / Observación</div>
        </td>
      </tr>
    `).join('');

    const contenido = `
      <div class="doc-header">
        <div class="clinic-brand">
          <span class="clinic-cross">✚</span>
          <div class="clinic-names">
            <h1 class="clinic-title">CLÍNICA SAN GABRIEL S.A.</h1>
            <span class="clinic-sub">CONSULTORIOS EXTERNOS • PLANILLA DIARIA DE CITACIONES</span>
            <span class="clinic-legal">Av. San Martín 1420, Ciudad • Tel: (011) 4890-5500 • CUIT: 30-71489234-5</span>
          </div>
        </div>
        <div class="doc-meta">
          <span class="meta-badge">PLANILLA DIARIA DE TRABAJO</span>
          <span class="meta-line"><strong>Fecha:</strong> ${datos.medico.fecha}</span>
          <span class="meta-line"><strong>Consultorio:</strong> ${datos.medico.consultorio}</span>
          <span class="meta-line"><strong>Profesional:</strong> ${datos.medico.nombre}</span>
          <span class="meta-line"><strong>Especialidad:</strong> ${datos.medico.especialidad} (Mat. ${datos.medico.matricula})</span>
        </div>
      </div>

      <div class="doc-title-block">
        <h2 class="doc-main-title">NÓMINA DE PACIENTES CITADOS Y CONTROL DE ASISTENCIA</h2>
        <p class="doc-subtitle">Consultorios Externos • Registro de consultas, concurrencia y conformidades de la jornada.</p>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 35px;">#</th>
            <th style="width: 75px;">Hora</th>
            <th>Paciente / DNI</th>
            <th>Cobertura / Obra Social</th>
            <th>Motivo de Consulta</th>
            <th class="text-center" style="width: 85px;">Estado</th>
            <th class="text-center" style="width: 170px;">Firma / Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${datos.turnos.length > 0 ? filasHtml : `
            <tr>
              <td colspan="7" class="text-center" style="padding: 24px; color: #64748b;">
                No hay pacientes citados agendados para este profesional médico en la fecha indicada.
              </td>
            </tr>
          `}
        </tbody>
      </table>

      <div class="doc-footer">
        <div class="legal-notice">
          <div style="font-size: 10px; font-weight: 800; color: #004b93; margin-bottom: 5px;">BALANCE DE ASISTENCIA DE LA JORNADA</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 5px;">
            <span class="stat-pill"><strong>Total Citados:</strong> ${datos.resumen.total}</span>
            <span class="stat-pill" style="background: #dcfce7; border-color: #86efac; color: #166534;"><strong>Atendidos:</strong> ${datos.resumen.atendidos}</span>
            <span class="stat-pill" style="background: #fef3c7; border-color: #fde68a; color: #92400e;"><strong>En Espera / Confirmados:</strong> ${datos.resumen.enEspera}</span>
            <span class="stat-pill" style="background: #fee2e2; border-color: #fca5a5; color: #991b1b;"><strong>Ausentes:</strong> ${datos.resumen.ausentes}</span>
          </div>
          <span class="ts">Generado por el Sistema Informático • Clínica San Gabriel S.A.</span>
        </div>
        <div class="signatures-group">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong class="sig-title">Firma y Sello del Médico</strong>
            <span class="sig-sub">${datos.medico.nombre}</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong class="sig-title">Recepción / Check-In</strong>
            <span class="sig-sub">Mesa de Entradas</span>
          </div>
        </div>
      </div>
    `;

    this.abrirVentanaImpresion(`Planilla de Turnos - ${datos.medico.nombre}`, contenido, 'landscape');
  }
}
