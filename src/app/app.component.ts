import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { TokenTableComponent } from './components/token-table/token-table.component';
import { ErrorPanelComponent } from './components/error-panel/error-panel.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AnalysisResult } from './models/analysis-result.model';

/**
 * Componente principal de la aplicación
 * 
 * Coordina todos los componentes de análisis léxico:
 * - Editor de código
 * - Tabla de tokens
 * - Panel de errores
 * - Estadísticas del análisis
 * 
 * @date 2025
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CodeEditorComponent,
    TokenTableComponent,
    ErrorPanelComponent,
    StatisticsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /**
   * Título de la aplicación
   */
  title = 'Analizador Léxico de Kotlin';

  /**
   * Resultado del último análisis
   */
  analysisResult: AnalysisResult | null = null;

  /**
   * Maneja el evento de análisis completado
   */
  onAnalysisComplete(result: AnalysisResult): void {
    this.analysisResult = result;
    
    // Scroll suave hacia los resultados
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Obtiene el año actual
   */
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
