import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LexicalError } from '../../models/lexical-error.model';

/**
 * Categoría de severidad del error
 */
type ErrorSeverity = 'critical' | 'warning' | 'info';

/**
 * Error extendido con información de severidad
 */
interface ExtendedError extends LexicalError {
  severity: ErrorSeverity;
  icon: string;
}

/**
 * Componente para mostrar panel de errores léxicos
 * 
 * Muestra errores con detalles de línea, columna, contexto
 * y clasificación por severidad
 * 
 * @date 2025
 */
@Component({
  selector: 'app-error-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './error-panel.component.html',
  styleUrl: './error-panel.component.css'
})
export class ErrorPanelComponent implements OnChanges {
  /**
   * Lista de errores léxicos encontrados
   */
  @Input() errors: LexicalError[] = [];

  /**
   * Lista de errores con información extendida
   */
  extendedErrors: ExtendedError[] = [];

  /**
   * Filtro de severidad seleccionado
   */
  selectedSeverity: string = '';

  /**
   * Errores filtrados según criterios
   */
  filteredErrors: ExtendedError[] = [];

  /**
   * Indicador de si el panel está expandido
   */
  isExpanded: boolean = true;

  /**
   * Indicador de si se muestran los detalles
   */
  showDetails: boolean = true;

  /**
   * Detecta cambios en los inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['errors']) {
      this.processErrors();
      this.applyFilters();
    }
  }

  /**
   * Procesa los errores y les asigna severidad
   */
  private processErrors(): void {
    this.extendedErrors = this.errors.map(error => ({
      ...error,
      severity: this.determineSeverity(error),
      icon: this.getErrorIcon(error)
    }));
  }

  /**
   * Determina la severidad de un error
   */
  private determineSeverity(error: LexicalError): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    // Errores críticos
    if (
      message.includes('carácter inválido') ||
      message.includes('no reconocido') ||
      message.includes('inesperado')
    ) {
      return 'critical';
    }
    
    // Advertencias
    if (
      message.includes('sin cerrar') ||
      message.includes('incompleto') ||
      message.includes('longitud')
    ) {
      return 'warning';
    }
    
    // Información
    return 'info';
  }

  /**
   * Obtiene el icono según el tipo de error
   */
  private getErrorIcon(error: LexicalError): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('cadena') || message.includes('comilla')) {
      return '📝';
    }
    if (message.includes('número') || message.includes('dígito')) {
      return '🔢';
    }
    if (message.includes('identificador')) {
      return '🏷️';
    }
    if (message.includes('comentario')) {
      return '';
    }
    if (message.includes('operador')) {
      return '';
    }
    
    return '';
  }

  /**
   * Aplica filtros a la lista de errores
   */
  applyFilters(): void {
    let result = [...this.extendedErrors];

    if (this.selectedSeverity) {
      result = result.filter(error => error.severity === this.selectedSeverity);
    }

    this.filteredErrors = result;
  }

  /**
   * Limpia los filtros
   */
  clearFilters(): void {
    this.selectedSeverity = '';
    this.applyFilters();
  }

  /**
   * Alterna la expansión del panel
   */
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Alterna la visualización de detalles
   */
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  /**
   * Obtiene el color según la severidad
   */
  getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case 'critical':
        return '#e53e3e';
      case 'warning':
        return '#ed8936';
      case 'info':
        return '#3182ce';
      default:
        return '#718096';
    }
  }

  /**
   * Obtiene el texto de severidad
   */
  getSeverityText(severity: ErrorSeverity): string {
    switch (severity) {
      case 'critical':
        return 'Crítico';
      case 'warning':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Cuenta errores por severidad
   */
  getErrorCountBySeverity(severity: ErrorSeverity): number {
    return this.extendedErrors.filter(e => e.severity === severity).length;
  }

  /**
   * Exporta errores a formato de texto
   */
  exportErrors(): void {
    const lines = [
      '='.repeat(60),
      'REPORTE DE ERRORES LÉXICOS',
      '='.repeat(60),
      '',
      `Total de errores: ${this.filteredErrors.length}`,
      `Críticos: ${this.getErrorCountBySeverity('critical')}`,
      `Advertencias: ${this.getErrorCountBySeverity('warning')}`,
      `Información: ${this.getErrorCountBySeverity('info')}`,
      '',
      '='.repeat(60),
      ''
    ];

    this.filteredErrors.forEach((error, index) => {
      lines.push(`Error #${index + 1} [${this.getSeverityText(error.severity).toUpperCase()}]`);
      lines.push(`  Mensaje: ${error.message}`);
      lines.push(`  Ubicación: Línea ${error.line}, Columna ${error.column}`);
      lines.push(`  Lexema: "${error.lexeme}"`);
      if (error.suggestion) {
        lines.push(`  Sugerencia: ${error.suggestion}`);
      }
      lines.push('');
    });

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `errores_lexicos_${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Copia errores al portapapeles
   */
  copyErrors(): void {
    const text = this.filteredErrors.map((error, index) => 
      `[${index + 1}] ${this.getSeverityText(error.severity)} - Línea ${error.line}:${error.column} - ${error.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Errores copiados al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }
}
