import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
// pdfMake and pdfFonts will be loaded dynamically or via require to avoid esbuild strict import errors
declare var require: any;

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('dashboardContent', { static: false }) dashboardContent!: ElementRef;

  dashboardData: any = null;
  loading: boolean = true;
  exporting: boolean = false;
  error: string = '';

  showEmailModal: boolean = false;
  sendingEmail: boolean = false;
  emailDestinatarios: string = '';

  dateFilterOptions = [
    { label: 'Últimos 30 días', value: '30days' },
    { label: `Año Actual (${new Date().getFullYear()})`, value: new Date().getFullYear().toString() },
    { label: `Año Pasado (${new Date().getFullYear() - 1})`, value: (new Date().getFullYear() - 1).toString() },
    { label: 'Histórico Completo', value: 'all' },
    { label: 'Rango Personalizado', value: 'custom' }
  ];
  selectedDateFilter: string = '30days';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Quick select emails
  quickEmails = [
    { email: 'admin@panaderia-otto.shop', selected: false },
    { email: 'compra@panaderia-otto.shop', selected: false },
    { email: 'dennis@panaderia-otto.shop', selected: false },
    { email: 'empleado@panaderia-otto.shop', selected: false },
    { email: 'produccion@panaderia-otto.shop', selected: false }
  ];

  // Chart data
  pieData: any;
  pieOptions: any;

  barData: any;
  barOptions: any;

  lineData: any;
  lineOptions: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.pieData = {
      labels: ['Ventas', 'Compras', 'Producciones'],
      datasets: [
        {
          data: [
            this.dashboardData.totalVentas || 0, 
            this.dashboardData.totalCompras || 0, 
            this.dashboardData.produccionesCompletadas || 0
          ],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500') || '#3B82F6',
            documentStyle.getPropertyValue('--green-500') || '#10B981',
            documentStyle.getPropertyValue('--purple-500') || '#8B5CF6'
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400') || '#60A5FA',
            documentStyle.getPropertyValue('--green-400') || '#34D399',
            documentStyle.getPropertyValue('--purple-400') || '#A78BFA'
          ]
        }
      ]
    };

    this.pieOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { usePointStyle: true, color: textColor } } }
    };

    this.barData = {
      labels: ['Métricas Generales'],
      datasets: [
        {
          label: 'Insumos / Lotes Registrados',
          backgroundColor: documentStyle.getPropertyValue('--orange-500') || '#F97316',
          data: [this.dashboardData.insumosBajoStock || 0]
        },
        {
          label: 'Total Ventas',
          backgroundColor: documentStyle.getPropertyValue('--blue-500') || '#3B82F6',
          data: [this.dashboardData.totalVentas || 0]
        }
      ]
    };

    this.barOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder }, beginAtZero: true }
      }
    };

    // --- Line Chart para Ventas y Compras ---
    const operaciones = this.dashboardData.operacionesPorFecha || [];
    const labels = operaciones.map((o: any) => o.fecha);
    const dataVentas = operaciones.map((o: any) => o.cantidadVentas);
    const dataCompras = operaciones.map((o: any) => o.cantidadCompras);

    this.lineData = {
      labels: labels,
      datasets: [
        {
          label: 'Ventas',
          data: dataVentas,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500') || '#3B82F6',
          tension: 0.4
        },
        {
          label: 'Compras',
          data: dataCompras,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500') || '#10B981',
          tension: 0.4
        }
      ]
    };

    this.lineOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder }, beginAtZero: true }
      }
    };
  }

  onDateFilterChange() {
    if (this.selectedDateFilter !== 'custom') {
      this.loadDashboard();
    }
  }

  applyCustomFilter() {
    if (this.startDate && this.endDate) {
      this.loadDashboard();
    } else {
      alert('Por favor selecciona Fecha Inicio y Fecha Fin');
    }
  }

  loadDashboard(): void {
    this.loading = true;
    let url = `${environment.URL_SERVICIOS}/reportes/dashboard`;
    
    let queryParams = [];
    if (this.selectedDateFilter === '30days') {
       const end = new Date();
       const start = new Date();
       start.setDate(end.getDate() - 30);
       queryParams.push(`startDate=${start.toISOString()}`, `endDate=${end.toISOString()}`);
    } else if (this.selectedDateFilter === new Date().getFullYear().toString()) {
       queryParams.push(`startDate=${new Date().getFullYear()}-01-01T00:00:00Z`, `endDate=${new Date().getFullYear()}-12-31T23:59:59Z`);
    } else if (this.selectedDateFilter === (new Date().getFullYear() - 1).toString()) {
       queryParams.push(`startDate=${new Date().getFullYear() - 1}-01-01T00:00:00Z`, `endDate=${new Date().getFullYear() - 1}-12-31T23:59:59Z`);
    } else if (this.selectedDateFilter === 'all') {
       queryParams.push(`startDate=2000-01-01T00:00:00Z`, `endDate=2100-12-31T23:59:59Z`);
    } else if (this.selectedDateFilter === 'custom' && this.startDate && this.endDate) {
       queryParams.push(`startDate=${this.startDate.toISOString()}`, `endDate=${this.endDate.toISOString()}`);
    }

    if (queryParams.length > 0) {
       url += '?' + queryParams.join('&');
    }

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.dashboardData = data;
        this.initCharts();
        this.loading = false;
        this.cdr.detectChanges(); // <-- FIX BUG DE CARGA UI
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Error al cargar el dashboard';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Método extraído para reutilizar lógica de PDF (retorna Promise con Base64)
  generatePdfBase64(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const pdfMake = require('pdfmake/build/pdfmake');
        const pdfFonts = require('pdfmake/build/vfs_fonts');
        pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth()+1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        
        // Extraer imágenes de los gráficos (son elementos canvas puros)
        const canvases = this.dashboardContent.nativeElement.querySelectorAll('canvas');
        let lineChartImg = null;
        let pieChartImg = null;
        let barChartImg = null;
        
        if (canvases.length >= 3) {
          // Usar PNG para preservar la transparencia y evitar fondos negros
          lineChartImg = canvases[0].toDataURL('image/png', 1.0);
          pieChartImg = canvases[1].toDataURL('image/png', 1.0);
          barChartImg = canvases[2].toDataURL('image/png', 1.0);
        }

        // Crear tabla de operaciones por fecha (30 días)
        const operacionesBody: any[] = [
          [{ text: 'Fecha', style: 'tableHeader' }, { text: 'Cant. Ventas', style: 'tableHeader', alignment: 'center' }, { text: 'Cant. Compras', style: 'tableHeader', alignment: 'center' }]
        ];

        if (this.dashboardData.operacionesPorFecha && this.dashboardData.operacionesPorFecha.length > 0) {
          // Solo mostrar días que tuvieron alguna operación para no llenar de ceros
          const opsFiltradas = this.dashboardData.operacionesPorFecha.filter((o: any) => o.cantidadVentas > 0 || o.cantidadCompras > 0);
          if (opsFiltradas.length > 0) {
            opsFiltradas.forEach((o: any) => {
              operacionesBody.push([
                o.fecha,
                { text: o.cantidadVentas.toString(), alignment: 'center' },
                { text: o.cantidadCompras.toString(), alignment: 'center' }
              ]);
            });
          } else {
            operacionesBody.push([{ text: `No hay operaciones en este rango (${this.getFilterLabel()}).`, colSpan: 3, alignment: 'center' }, '', '']);
          }
        } else {
          operacionesBody.push([{ text: 'No hay registros.', colSpan: 3, alignment: 'center' }, '', '']);
        }

        // Crear tabla de vencimientos
        const vencimientosBody: any[] = [
          [{ text: 'Lote / Almacén', style: 'tableHeader' }, { text: 'Vencimiento', style: 'tableHeader' }, { text: 'Stock', style: 'tableHeader' }, { text: 'Estado', style: 'tableHeader' }]
        ];
        
        if (this.dashboardData.productosPorVencer && this.dashboardData.productosPorVencer.length > 0) {
          this.dashboardData.productosPorVencer.forEach((p: any) => {
            const fechaStr = new Date(p.fechaVencimiento).toLocaleDateString('es-ES');
            vencimientosBody.push([
              `Lote ${p.idLote} (${p.nombreAlmacen})`,
              fechaStr,
              p.cantidadDisponible.toString(),
              p.estado
            ]);
          });
        } else {
          vencimientosBody.push([{ text: 'No hay productos próximos a vencer.', colSpan: 4, alignment: 'center', margin: [0, 10, 0, 10] }, '', '', '']);
        }

        // Crear tabla de items más vendidos
        const topItemsBody: any[] = [
          [{ text: '#', style: 'tableHeader' }, { text: 'Ítem / Producto', style: 'tableHeader' }, { text: 'Cantidad Vendida', style: 'tableHeader', alignment: 'right' }]
        ];

        if (this.dashboardData.itemsMasUsados && this.dashboardData.itemsMasUsados.length > 0) {
          this.dashboardData.itemsMasUsados.forEach((item: any, i: number) => {
            topItemsBody.push([
              (i + 1).toString(),
              item.nombreItem,
              { text: '+' + item.cantidadVendida, alignment: 'right', color: '#10B981', bold: true }
            ]);
          });
        } else {
          topItemsBody.push([{ text: 'No hay registros de ventas.', colSpan: 3, alignment: 'center', margin: [0, 10, 0, 10] }, '', '']);
        }

        // Crear tabla de Poco Stock
        const pocoStockBody: any[] = [
          [{ text: 'Ítem / Producto', style: 'tableHeader' }, { text: 'Stock Total', style: 'tableHeader', alignment: 'right' }]
        ];

        if (this.dashboardData.productosConPocoStock && this.dashboardData.productosConPocoStock.length > 0) {
          this.dashboardData.productosConPocoStock.forEach((p: any) => {
            pocoStockBody.push([
              p.nombreItem,
              { text: p.stockTotal.toString(), alignment: 'right', color: '#EF4444', bold: true }
            ]);
          });
        } else {
          pocoStockBody.push([{ text: 'No hay productos con poco stock.', colSpan: 2, alignment: 'center', margin: [0, 10, 0, 10] }, '']);
        }

        const docDefinition: any = {
          pageSize: 'A4',
          pageMargins: [40, 60, 40, 60],
          content: [
            { text: 'Panadería Otto', style: 'mainHeader' },
            { text: `Reporte Analítico y Operativo - ${dateStr}`, style: 'subHeader' },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#E5E7EB' }] },
            { text: '\n' },
            
            // Metricas clave
            { text: `1. Resumen Ejecutivo (${this.getFilterLabel()})`, style: 'sectionHeader' },
            {
              columns: [
                { text: `Total Ventas:\n${this.dashboardData.totalVentas}`, style: 'metricCard' },
                { text: `Total Compras:\n${this.dashboardData.totalCompras}`, style: 'metricCard' },
                { text: `Prod. Completadas:\n${this.dashboardData.produccionesCompletadas}`, style: 'metricCard' },
                { text: `Insumos/Lotes Bajo Stock:\n${this.dashboardData.insumosBajoStock}`, style: 'metricCard' }
              ],
              columnGap: 10
            },
            { text: '\n' }
          ],
          styles: {
            mainHeader: { fontSize: 26, bold: true, color: '#2563EB', alignment: 'center' },
            subHeader: { fontSize: 14, italics: true, alignment: 'center', margin: [0, 5, 0, 15], color: '#4B5563' },
            sectionHeader: { fontSize: 16, bold: true, margin: [0, 15, 0, 10], color: '#1F2937' },
            metricCard: { fontSize: 12, bold: true, margin: [5, 10, 5, 10], alignment: 'center', color: '#374151', fillColor: '#F3F4F6' },
            tableHeader: { bold: true, fontSize: 11, color: 'white', fillColor: '#3B82F6', margin: [0, 5, 0, 5] },
            tableCell: { margin: [0, 5, 0, 5] }
          },
          defaultStyle: {
            fontSize: 10,
            color: '#374151'
          }
        };

        // Añadir Gráficos si existen (Gráficos)
        if (lineChartImg || pieChartImg || barChartImg) {
          docDefinition.content.push({ text: '2. Análisis Gráfico', style: 'sectionHeader' });
          if (lineChartImg) {
            docDefinition.content.push({ text: 'Flujo de Operaciones', margin: [0, 0, 0, 5], bold: true });
            docDefinition.content.push({ image: lineChartImg, width: 480, alignment: 'center', margin: [0, 0, 0, 15] });
          }
          if (pieChartImg || barChartImg) {
            const chartCols = [];
            if (pieChartImg) chartCols.push({ image: pieChartImg, width: 230 });
            if (barChartImg) chartCols.push({ image: barChartImg, width: 230 });
            docDefinition.content.push({ text: 'Distribución y Comparativa', margin: [0, 0, 0, 5], bold: true });
            docDefinition.content.push({ columns: chartCols, columnGap: 10, margin: [0, 0, 0, 20] });
          }
        }

        // Añadir Tablas de Datos Detallados
        docDefinition.content.push({ text: '3. Tablas de Datos (Detalle Operativo)', style: 'sectionHeader', pageBreak: 'before' });
        
        docDefinition.content.push({ text: 'Detalle de Operaciones Diarias', margin: [0, 0, 0, 5], bold: true });
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            body: operacionesBody
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 25]
        });

        docDefinition.content.push({ text: 'Productos Próximos a Vencer', margin: [0, 0, 0, 5], bold: true });
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: vencimientosBody
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 25]
        });

        docDefinition.content.push({ text: 'Ítems Más Vendidos (Top 5)', margin: [0, 0, 0, 5], bold: true });
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: topItemsBody
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 25]
        });

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBase64((data: any) => {
          resolve('data:application/pdf;base64,' + data);
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  exportPdf(): void {
    this.exporting = true;
    this.cdr.detectChanges();

    this.generatePdfBase64().then(base64 => {
      // Create a link to download the base64 string
      const link = document.createElement('a');
      link.href = base64;
      const today = new Date();
      link.download = `Reporte_Dashboard_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`;
      link.click();
      
      this.exporting = false;
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Error exportando PDF:', err);
      this.exporting = false;
      this.cdr.detectChanges();
    });
  }

  openEmailModal() {
    this.showEmailModal = true;
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.emailDestinatarios = '';
  }

  toggleQuickEmail(qEmail: any) {
    qEmail.selected = !qEmail.selected;
  }

  sendEmailReport() {
    // Collect selected quick emails
    const selectedQuickEmails = this.quickEmails.filter(q => q.selected).map(q => q.email);
    
    // Collect custom emails
    const customEmails = this.emailDestinatarios.split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    // Combine them without duplicates
    const allEmails = Array.from(new Set([...selectedQuickEmails, ...customEmails]));

    if (allEmails.length === 0) {
      alert('Debes seleccionar o ingresar al menos un correo.');
      return;
    }

    // Validate that all emails end with @panaderia-otto.shop
    const invalidEmails = allEmails.filter(e => !e.endsWith('@panaderia-otto.shop'));
    if (invalidEmails.length > 0) {
      alert('Todos los correos deben terminar en @panaderia-otto.shop');
      return;
    }

    this.sendingEmail = true;
    this.cdr.detectChanges();

    // Generar el PDF antes de enviar
    this.generatePdfBase64().then(base64 => {
      this.http.post(`${environment.URL_SERVICIOS}/reportes/enviar-dashboard`, {
        destinatarios: allEmails,
        asunto: 'Reporte del Sistema - Panadería Otto',
        base64Pdf: base64,
        startDate: this.getStartDateForEmail(),
        endDate: this.getEndDateForEmail()
      }).subscribe({
        next: (res: any) => {
          this.sendingEmail = false;
          this.closeEmailModal();
          alert('Reporte enviado por correo exitosamente.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error enviando correo', err);
          this.sendingEmail = false;
          alert('Hubo un error al enviar el correo.');
          this.cdr.detectChanges();
        }
      });
    }).catch(err => {
      console.error('Error generando PDF para correo:', err);
      this.sendingEmail = false;
      alert('Hubo un error generando el PDF para el correo.');
      this.cdr.detectChanges();
    });
  }

  getFilterLabel(): string {
    const opt = this.dateFilterOptions.find(o => o.value === this.selectedDateFilter);
    if (this.selectedDateFilter === 'custom' && this.startDate && this.endDate) {
      return `Del ${this.startDate.toLocaleDateString()} al ${this.endDate.toLocaleDateString()}`;
    }
    return opt ? opt.label : '';
  }

  getStartDateForEmail(): string | null {
    if (this.selectedDateFilter === '30days') { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString(); }
    if (this.selectedDateFilter === new Date().getFullYear().toString()) return `${new Date().getFullYear()}-01-01T00:00:00Z`;
    if (this.selectedDateFilter === (new Date().getFullYear() - 1).toString()) return `${new Date().getFullYear() - 1}-01-01T00:00:00Z`;
    if (this.selectedDateFilter === 'all') return '2000-01-01T00:00:00Z';
    if (this.selectedDateFilter === 'custom' && this.startDate) return this.startDate.toISOString();
    return null;
  }
  
  getEndDateForEmail(): string | null {
    if (this.selectedDateFilter === '30days') return new Date().toISOString();
    if (this.selectedDateFilter === new Date().getFullYear().toString()) return `${new Date().getFullYear()}-12-31T23:59:59Z`;
    if (this.selectedDateFilter === (new Date().getFullYear() - 1).toString()) return `${new Date().getFullYear() - 1}-12-31T23:59:59Z`;
    if (this.selectedDateFilter === 'all') return '2100-12-31T23:59:59Z';
    if (this.selectedDateFilter === 'custom' && this.endDate) return this.endDate.toISOString();
    return null;
  }
}
