import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  loadDashboard(): void {
    this.loading = true;
    this.http.get('http://localhost:5000/api/reportes/dashboard').subscribe({
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

  exportPdf(): void {
    if (!this.dashboardContent) return;
    
    this.exporting = true;
    this.cdr.detectChanges(); // Forzar render de UI por si hay algo condicional (loaders)

    const data = this.dashboardContent.nativeElement;

    html2canvas(data, {
      scale: 2, // Mejor calidad
      useCORS: true,
      logging: false
    }).then((canvas) => {
      const imgWidth = 208; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      let position = 0;

      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Crear paginación si el dashboard es más largo que una hoja A4
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const today = new Date();
      pdf.save(`Reporte_Dashboard_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`);
      
      this.exporting = false;
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Error exportando PDF:', err);
      this.exporting = false;
      this.cdr.detectChanges();
    });
  }
}
