import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Token } from '../../models/token.model';
import { TokenType } from '../../models/token-type.enum';

/**
 * Tipo de columna para ordenamiento
 */
type SortColumn = 'position' | 'type' | 'lexeme' | 'line' | 'column';

/**
 * Dirección de ordenamiento
 */
type SortDirection = 'asc' | 'desc' | '';

/**
 * Componente para mostrar tabla de tokens con funcionalidad de ordenamiento y filtrado
 * 
 * @date 2025
 */
@Component({
  selector: 'app-token-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './token-table.component.html',
  styleUrl: './token-table.component.css'
})
export class TokenTableComponent implements OnChanges {
  /**
   * Lista de tokens a mostrar en la tabla
   */
  @Input() tokens: Token[] = [];

  /**
   * Lista de tokens filtrados según criterios de búsqueda
   */
  filteredTokens: Token[] = [];

  /**
   * Texto de búsqueda para filtrar tokens
   */
  searchText: string = '';

  /**
   * Tipo de token seleccionado para filtrar
   */
  selectedTokenType: string = '';

  /**
   * Columna actual por la cual se está ordenando
   */
  sortColumn: SortColumn = 'position';

  /**
   * Dirección del ordenamiento actual
   */
  sortDirection: SortDirection = 'asc';

  /**
   * Lista de tipos de token disponibles para el filtro
   */
  tokenTypes: string[] = [];

  /**
   * Índice de inicio para la paginación
   */
  pageStart: number = 0;

  /**
   * Tamaño de página para la paginación
   */
  pageSize: number = 100;

  /**
   * Indicador de si la tabla está expandida
   */
  isExpanded: boolean = true;

  /**
   * Referencia a Math para usar en el template
   */
  Math = Math;

  /**
   * Detecta cambios en los inputs del componente
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tokens']) {
      this.updateTokenTypes();
      this.applyFilters();
    }
  }

  /**
   * Actualiza la lista de tipos de token disponibles
   */
  private updateTokenTypes(): void {
    const typesSet = new Set(this.tokens.map(t => t.type));
    this.tokenTypes = Array.from(typesSet).sort();
  }

  /**
   * Aplica filtros y ordenamiento a la lista de tokens
   */
  applyFilters(): void {
    let result = [...this.tokens];

    // Filtrar por tipo de token
    if (this.selectedTokenType) {
      result = result.filter(token => token.type === this.selectedTokenType);
    }

    // Filtrar por texto de búsqueda
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase().trim();
      result = result.filter(token => 
        token.lexeme.toLowerCase().includes(search) ||
        token.type.toLowerCase().includes(search)
      );
    }

    // Aplicar ordenamiento
    this.sortTokens(result);

    this.filteredTokens = result;
    this.pageStart = 0; // Reiniciar paginación al filtrar
  }

  /**
   * Ordena la lista de tokens según la columna y dirección actual
   */
  private sortTokens(tokens: Token[]): void {
    if (!this.sortDirection) {
      return;
    }

    tokens.sort((a, b) => {
      let comparison = 0;

      switch (this.sortColumn) {
        case 'position':
          comparison = a.position - b.position;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'lexeme':
          comparison = a.lexeme.localeCompare(b.lexeme);
          break;
        case 'line':
          comparison = a.line - b.line;
          break;
        case 'column':
          comparison = a.column - b.column;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Cambia el ordenamiento por una columna específica
   */
  sortBy(column: SortColumn): void {
    if (this.sortColumn === column) {
      // Cambiar dirección: asc -> desc -> '' -> asc
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = '';
        this.sortColumn = 'position'; // Volver al orden original
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  /**
   * Obtiene el icono de ordenamiento para una columna
   */
  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column || !this.sortDirection) {
      return '↕️';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchText = '';
    this.selectedTokenType = '';
    this.sortColumn = 'position';
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  /**
   * Alterna la expansión/colapso de la tabla
   */
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Exporta los tokens a formato CSV
   */
  exportToCSV(): void {
    const headers = ['#', 'Tipo', 'Lexema', 'Línea', 'Columna', 'Posición'];
    const rows = this.filteredTokens.map((token, index) => [
      index + 1,
      token.type,
      `"${token.lexeme.replace(/"/g, '""')}"`, // Escapar comillas
      token.line,
      token.column,
      token.position
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tokens_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Copia la tabla al portapapeles en formato texto
   */
  copyToClipboard(): void {
    const headers = ['#', 'Tipo', 'Lexema', 'Línea', 'Columna'];
    const rows = this.filteredTokens.map((token, index) => 
      `${index + 1}\t${token.type}\t${token.lexeme}\t${token.line}\t${token.column}`
    );

    const text = [headers.join('\t'), ...rows].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Tabla copiada al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }

  /**
   * Obtiene el color de etiqueta según el tipo de token
   */
  getTokenTypeColor(type: string): string {
    // Palabras reservadas
    if (type.includes('KW_')) return '#9c27b0';
    
    // Tipos de datos
    if (['INTEGER', 'DECIMAL', 'BOOLEAN_LITERAL'].includes(type)) return '#2196f3';
    
    // Cadenas y caracteres
    if (type.includes('STRING') || type.includes('CHAR')) return '#4caf50';
    
    // Identificadores
    if (type === 'IDENTIFIER') return '#ff9800';
    
    // Operadores
    if (type.includes('OP_')) return '#f44336';
    
    // Delimitadores
    if (type.includes('DELIM_')) return '#795548';
    
    // Comentarios
    if (type.includes('COMMENT')) return '#9e9e9e';
    
    // Default
    return '#607d8b';
  }

  /**
   * Navega a la página anterior
   */
  previousPage(): void {
    if (this.pageStart > 0) {
      this.pageStart = Math.max(0, this.pageStart - this.pageSize);
    }
  }

  /**
   * Navega a la página siguiente
   */
  nextPage(): void {
    if (this.pageStart + this.pageSize < this.filteredTokens.length) {
      this.pageStart += this.pageSize;
    }
  }

  /**
   * Maneja el cambio de tamaño de página
   * Convierte a número para evitar concatenación de strings
   */
  onPageSizeChange(): void {
    // Convertir explícitamente a número
    this.pageSize = Number(this.pageSize);
    this.pageStart = 0; // Reiniciar a la primera página
  }

  /**
   * Obtiene la página actual
   */
  get currentPage(): number {
    return Math.floor(this.pageStart / this.pageSize) + 1;
  }

  /**
   * Obtiene el total de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.filteredTokens.length / this.pageSize);
  }

  /**
   * Obtiene los tokens de la página actual
   */
  get pagedTokens(): Token[] {
    return this.filteredTokens.slice(
      this.pageStart,
      this.pageStart + this.pageSize
    );
  }
}
