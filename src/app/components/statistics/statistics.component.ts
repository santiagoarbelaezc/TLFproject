import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../../models/analysis-result.model';
import { Token } from '../../models/token.model';
import { TokenType } from '../../models/token-type.enum';

/**
 * Estadística de tipo de token
 */
interface TokenTypeStatistic {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Estadística de categoría de tokens
 */
interface CategoryStatistic {
  category: string;
  count: number;
  percentage: number;
  icon: string;
  color: string;
}

/**
 * Componente para mostrar estadísticas del análisis léxico
 * 
 * Muestra métricas como total de tokens, distribución por tipo,
 * categorías, errores y tiempo de análisis
 * 
 * @date 2025
 */
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnChanges {
  /**
   * Resultado del análisis léxico
   */
  @Input() analysisResult: AnalysisResult | null = null;

  /**
   * Estadísticas por tipo de token
   */
  tokenTypeStats: TokenTypeStatistic[] = [];

  /**
   * Estadísticas por categoría
   */
  categoryStats: CategoryStatistic[] = [];

  /**
   * Top 10 tokens más frecuentes
   */
  topTokens: TokenTypeStatistic[] = [];

  /**
   * Indicador de si el panel está expandido
   */
  isExpanded: boolean = true;

  /**
   * Vista actual (tipos, categorías, top)
   */
  currentView: 'types' | 'categories' | 'top' = 'categories';

  /**
   * Detecta cambios en los inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analysisResult'] && this.analysisResult) {
      this.calculateStatistics();
    }
  }

  /**
   * Calcula todas las estadísticas
   */
  private calculateStatistics(): void {
    if (!this.analysisResult) return;

    this.calculateTokenTypeStats();
    this.calculateCategoryStats();
    this.calculateTopTokens();
  }

  /**
   * Calcula estadísticas por tipo de token
   */
  private calculateTokenTypeStats(): void {
    if (!this.analysisResult) return;

    const tokens = this.analysisResult.tokens;
    const typeCounts = new Map<string, number>();

    // Contar tokens por tipo
    tokens.forEach(token => {
      const count = typeCounts.get(token.type) || 0;
      typeCounts.set(token.type, count + 1);
    });

    // Convertir a array de estadísticas
    this.tokenTypeStats = Array.from(typeCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / tokens.length) * 100,
        color: this.getTokenTypeColor(type)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calcula estadísticas por categoría
   */
  private calculateCategoryStats(): void {
    if (!this.analysisResult) return;

    const tokens = this.analysisResult.tokens;
    const categories = new Map<string, number>();

    // Contar tokens por categoría
    tokens.forEach(token => {
      const category = this.getTokenCategory(token.type);
      const count = categories.get(category) || 0;
      categories.set(category, count + 1);
    });

    // Convertir a array de estadísticas
    this.categoryStats = Array.from(categories.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / tokens.length) * 100,
        icon: this.getCategoryIcon(category),
        color: this.getCategoryColor(category)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calcula todos los tokens ordenados por frecuencia
   * Para fines académicos, se muestran TODOS los tipos sin límite
   */
  private calculateTopTokens(): void {
    // Mostrar TODOS los tokens, no solo top 10 (requisito académico)
    this.topTokens = this.tokenTypeStats;
  }

  /**
   * Obtiene la categoría de un tipo de token
   * Clasificación completa para fines académicos
   */
  private getTokenCategory(type: string): string {
    // Palabras reservadas
    if (type.startsWith('KW_')) return 'Palabras Reservadas';
    
    // Identificadores
    if (type === 'IDENTIFIER') return 'Identificadores';
    if (type === 'KEYWORD') return 'Palabras Reservadas';
    
    // Literales
    if (['INTEGER', 'DECIMAL', 'BOOLEAN', 'NULL'].includes(type)) return 'Literales Numéricos y Booleanos';
    if (type.includes('STRING') || type.includes('CHAR') || type === 'RAW_STRING' || type === 'STRING_TEMPLATE') 
      return 'Literales de Cadena';
    
    // Operadores aritméticos
    if (['PLUS', 'MINUS', 'MULTIPLY', 'DIVIDE', 'MODULO', 'INCREMENT', 'DECREMENT'].includes(type)) 
      return 'Operadores Aritméticos';
    
    // Operadores de comparación
    if (['EQUALS', 'NOT_EQUALS', 'LESS_THAN', 'GREATER_THAN', 'LESS_EQUALS', 'GREATER_EQUALS', 
         'IDENTITY_EQUALS', 'IDENTITY_NOT_EQUALS'].includes(type)) 
      return 'Operadores de Comparación';
    
    // Operadores lógicos
    if (['AND', 'OR', 'NOT'].includes(type)) return 'Operadores Lógicos';
    
    // Operadores de asignación
    if (['ASSIGN', 'PLUS_ASSIGN', 'MINUS_ASSIGN', 'MULTIPLY_ASSIGN', 'DIVIDE_ASSIGN', 'MODULO_ASSIGN'].includes(type)) 
      return 'Operadores de Asignación';
    
    // Operadores especiales de Kotlin
    if (['SAFE_CALL', 'NOT_NULL_ASSERTION', 'ELVIS', 'RANGE', 'ARROW', 'DOUBLE_COLON', 
         'IN', 'NOT_IN', 'IS', 'NOT_IS', 'AS', 'AS_SAFE'].includes(type)) 
      return 'Operadores Especiales Kotlin';
    
    // Delimitadores
    if (['LPAREN', 'RPAREN', 'LBRACE', 'RBRACE', 'LBRACKET', 'RBRACKET', 
         'SEMICOLON', 'COMMA', 'DOT', 'COLON', 'QUESTION'].includes(type)) 
      return 'Delimitadores';
    
    // Comentarios
    if (type.includes('COMMENT')) return 'Comentarios';
    
    // Anotaciones
    if (type === 'ANNOTATION') return 'Anotaciones';
    
    // Fin de archivo
    if (type === 'EOF') return 'Control';
    
    // Otros (si existe alguno no clasificado)
    return 'Otros';
  }

  /**
   * Obtiene el icono de una categoría
   */
  private getCategoryIcon(category: string): string {
    switch (category) {
      case 'Palabras Reservadas': return '🔑';
      case 'Identificadores': return '🏷️';
      case 'Literales': return '🔢';
      case 'Cadenas': return '📝';
      case 'Operadores': return '➕';
      case 'Delimitadores': return '📌';
      case 'Comentarios': return '💬';
      default: return '📦';
    }
  }

  /**
   * Obtiene el color de una categoría
   * Colores específicos para cada categoría académica
   */
  private getCategoryColor(category: string): string {
    switch (category) {
      case 'Palabras Reservadas': return '#9c27b0'; // Morado
      case 'Identificadores': return '#ff9800'; // Naranja
      case 'Literales Numéricos y Booleanos': return '#2196f3'; // Azul
      case 'Literales de Cadena': return '#4caf50'; // Verde
      case 'Operadores Aritméticos': return '#f44336'; // Rojo
      case 'Operadores de Comparación': return '#e91e63'; // Rosa
      case 'Operadores Lógicos': return '#673ab7'; // Morado oscuro
      case 'Operadores de Asignación': return '#ff5722'; // Naranja oscuro
      case 'Operadores Especiales Kotlin': return '#00bcd4'; // Cyan
      case 'Delimitadores': return '#795548'; // Marrón
      case 'Comentarios': return '#9e9e9e'; // Gris
      case 'Anotaciones': return '#cddc39'; // Lima
      case 'Control': return '#607d8b'; // Gris azulado
      default: return '#607d8b'; // Gris azulado (Otros)
    }
  }

  /**
   * Obtiene el color de un tipo de token
   */
  private getTokenTypeColor(type: string): string {
    if (type.startsWith('KW_')) return '#9c27b0';
    if (['INTEGER', 'DECIMAL', 'BOOLEAN_LITERAL'].includes(type)) return '#2196f3';
    if (type.includes('STRING') || type.includes('CHAR')) return '#4caf50';
    if (type === 'IDENTIFIER') return '#ff9800';
    if (type.startsWith('OP_')) return '#f44336';
    if (type.startsWith('DELIM_')) return '#795548';
    if (type.includes('COMMENT')) return '#9e9e9e';
    return '#607d8b';
  }

  /**
   * Alterna la expansión del panel
   */
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Cambia la vista actual
   */
  changeView(view: 'types' | 'categories' | 'top'): void {
    this.currentView = view;
  }

  /**
   * Obtiene el total de tokens
   */
  get totalTokens(): number {
    return this.analysisResult?.tokens.length || 0;
  }

  /**
   * Obtiene el total de errores
   */
  get totalErrors(): number {
    return this.analysisResult?.errors.length || 0;
  }

  /**
   * Obtiene el total de líneas
   */
  get totalLines(): number {
    return this.analysisResult?.statistics.totalLines || 0;
  }

  /**
   * Obtiene el tiempo de análisis en ms
   */
  get analysisTime(): number {
    return this.analysisResult?.analysisTime || 0;
  }

  /**
   * Obtiene si el análisis fue exitoso
   */
  get isSuccessful(): boolean {
    return this.totalErrors === 0;
  }

  /**
   * Exporta estadísticas a formato texto
   */
  exportStatistics(): void {
    if (!this.analysisResult) return;

    const lines = [
      '='.repeat(60),
      'ESTADÍSTICAS DEL ANÁLISIS LÉXICO',
      '='.repeat(60),
      '',
      'RESUMEN GENERAL',
      '-'.repeat(60),
      `Total de Tokens: ${this.totalTokens}`,
      `Total de Errores: ${this.totalErrors}`,
      `Total de Líneas: ${this.totalLines}`,
      `Tiempo de Análisis: ${this.analysisTime.toFixed(2)} ms`,
      `Estado: ${this.isSuccessful ? 'Exitoso' : 'Con errores'}`,
      '',
      'ESTADÍSTICAS POR CATEGORÍA',
      '-'.repeat(60)
    ];

    this.categoryStats.forEach(stat => {
      lines.push(
        `${stat.icon} ${stat.category}: ${stat.count} (${stat.percentage.toFixed(2)}%)`
      );
    });

    lines.push('');
    lines.push(`RANKING COMPLETO DE TOKENS (${this.topTokens.length} tipos)`);
    lines.push('-'.repeat(60));

    this.topTokens.forEach((stat, index) => {
      lines.push(
        `${index + 1}. ${stat.type}: ${stat.count} (${stat.percentage.toFixed(2)}%)`
      );
    });

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `estadisticas_${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Copia estadísticas al portapapeles
   */
  copyStatistics(): void {
    if (!this.analysisResult) return;

    const text = [
      `Tokens: ${this.totalTokens}`,
      `Errores: ${this.totalErrors}`,
      `Líneas: ${this.totalLines}`,
      `Tiempo: ${this.analysisTime.toFixed(2)} ms`,
      '',
      'Categorías:',
      ...this.categoryStats.map(s => `  ${s.icon} ${s.category}: ${s.count}`)
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Estadísticas copiadas al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }
}
