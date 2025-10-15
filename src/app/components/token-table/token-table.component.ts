import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Token } from '../../models/token.model';
import { TokenType } from '../../models/token-type.enum';
import * as XLSX from 'xlsx';

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
      return ''; // Sin icono si no está ordenado por esta columna
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
   * Exporta los tokens a formato Excel con estilos profesionales
   */
  exportToExcel(): void {
    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos para la hoja
    const worksheetData: any[][] = [];
    
    // ENCABEZADOS CON ESTILOS
    const headers = ['#', 'Tipo', 'Lexema', 'Línea', 'Columna', 'Posición'];
    worksheetData.push(headers);
    
    // DATOS DE LOS TOKENS
    this.filteredTokens.forEach((token, index) => {
      worksheetData.push([
        index + 1,
        token.type,
        token.lexeme,
        token.line,
        token.column,
        token.position
      ]);
    });
    
    // Crear hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // CONFIGURAR ANCHOS DE COLUMNA
    worksheet['!cols'] = [
      { wch: 8 },   // # - número de token
      { wch: 25 },  // Tipo - ancho para nombres de tipos
      { wch: 30 },  // Lexema - ancho para código
      { wch: 10 },  // Línea
      { wch: 12 },  // Columna
      { wch: 12 }   // Posición
    ];
    
    // APLICAR ESTILOS A LOS ENCABEZADOS (primera fila)
    const headerStyle = {
      font: { 
        bold: true, 
        color: { rgb: "FFFFFF" },
        sz: 12
      },
      fill: { 
        fgColor: { rgb: "4F46E5" } // Color azul índigo
      },
      alignment: { 
        horizontal: "center", 
        vertical: "center" 
      },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
    
    // Aplicar estilo a cada celda del encabezado
    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellAddress]) return;
      worksheet[cellAddress].s = headerStyle;
    });
    
    // APLICAR ESTILOS A LAS CELDAS DE DATOS
    this.filteredTokens.forEach((token, rowIndex) => {
      const actualRow = rowIndex + 1; // +1 porque la fila 0 son los encabezados
      
      // Estilo base para todas las celdas de datos
      const dataStyle = {
        alignment: { 
          vertical: "center" 
        },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          left: { style: "thin", color: { rgb: "E5E7EB" } },
          right: { style: "thin", color: { rgb: "E5E7EB" } }
        }
      };
      
      // Estilo para filas alternadas (zebra striping)
      const fillColor = rowIndex % 2 === 0 
        ? { rgb: "FFFFFF" }  // Blanco para filas pares
        : { rgb: "F9FAFB" }; // Gris muy claro para filas impares
      
      // Aplicar estilo a cada celda de la fila
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: actualRow, c: colIndex });
        if (!worksheet[cellAddress]) continue;
        
        const cellStyle: any = {
          ...dataStyle,
          fill: { fgColor: fillColor }
        };
        
        // Estilos específicos por columna
        switch (colIndex) {
          case 0: // Número
            cellStyle.alignment = { horizontal: "center", vertical: "center" };
            cellStyle.font = { bold: true, sz: 10 };
            break;
          case 1: // Tipo
            cellStyle.alignment = { horizontal: "left", vertical: "center" };
            cellStyle.font = { 
              bold: true, 
              sz: 10,
              color: { rgb: this.getColorForTokenType(token.type) }
            };
            break;
          case 2: // Lexema
            cellStyle.alignment = { horizontal: "left", vertical: "center" };
            cellStyle.font = { name: "Consolas", sz: 10 };
            break;
          case 3: // Línea
          case 4: // Columna
          case 5: // Posición
            cellStyle.alignment = { horizontal: "center", vertical: "center" };
            cellStyle.font = { sz: 10 };
            break;
        }
        
        worksheet[cellAddress].s = cellStyle;
      }
    });
    
    // CONFIGURAR ALTURA DE FILAS
    worksheet['!rows'] = [
      { hpt: 25 }, // Altura del encabezado
      ...this.filteredTokens.map(() => ({ hpt: 20 })) // Altura de filas de datos
    ];
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tokens');
    
    // CREAR HOJA DE RESUMEN/ESTADÍSTICAS
    this.addStatisticsSheet(workbook);
    
    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `analisis_lexico_${timestamp}.xlsx`;
    
    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
  }
  
  /**
   * Agrega una hoja de estadísticas al libro de Excel
   */
  private addStatisticsSheet(workbook: XLSX.WorkBook): void {
    // Calcular estadísticas
    const totalTokens = this.filteredTokens.length;
    const uniqueTypes = new Set(this.filteredTokens.map(t => t.type)).size;
    
    // Contar tokens por tipo
    const tokenCounts = new Map<string, number>();
    this.filteredTokens.forEach(token => {
      tokenCounts.set(token.type, (tokenCounts.get(token.type) || 0) + 1);
    });
    
    // Ordenar por frecuencia
    const sortedTypes = Array.from(tokenCounts.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Preparar datos de la hoja de estadísticas
    const statsData: any[][] = [
      ['RESUMEN DEL ANÁLISIS LÉXICO'],
      [],
      ['Métrica', 'Valor'],
      ['Total de Tokens', totalTokens],
      ['Tipos Únicos', uniqueTypes],
      ['Tokens Filtrados', this.filteredTokens.length],
      ['Tokens Totales', this.tokens.length],
      [],
      ['DISTRIBUCIÓN POR TIPO DE TOKEN'],
      [],
      ['Tipo', 'Cantidad', 'Porcentaje']
    ];
    
    // Agregar distribución
    sortedTypes.forEach(([type, count]) => {
      const percentage = ((count / totalTokens) * 100).toFixed(2) + '%';
      statsData.push([type, count, percentage]);
    });
    
    // Crear hoja
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    
    // Configurar anchos
    statsSheet['!cols'] = [
      { wch: 35 },  // Tipo/Métrica
      { wch: 15 },  // Cantidad/Valor
      { wch: 15 }   // Porcentaje
    ];
    
    // Estilo del título principal
    if (statsSheet['A1']) {
      statsSheet['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: "1E3A8A" } },
        alignment: { horizontal: "left", vertical: "center" }
      };
    }
    
    // Combinar celdas del título
    statsSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];
    
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');
  }
  
  /**
   * Obtiene el color RGB hexadecimal para un tipo de token (para Excel)
   */
  private getColorForTokenType(type: string): string {
    // Palabras reservadas - Púrpura
    if (type.includes('KW_')) return '9C27B0';
    
    // Tipos de datos - Azul
    if (['TYPE_INT', 'TYPE_DOUBLE', 'TYPE_STRING', 'TYPE_BOOLEAN', 
         'TYPE_CHAR', 'TYPE_FLOAT', 'TYPE_LONG', 'TYPE_SHORT',
         'TYPE_BYTE', 'TYPE_UNIT', 'TYPE_ANY'].includes(type)) {
      return '2196F3';
    }
    
    // Operadores - Naranja
    if (type.includes('OP_')) return 'FF9800';
    
    // Identificadores - Verde
    if (type === TokenType.IDENTIFIER) return '4CAF50';
    
    // Literales - Cyan
    if (type.includes('LIT_')) return '00BCD4';
    
    // Delimitadores - Gris
    if (type.includes('DELIM_')) return '607D8B';
    
    // Comentarios - Gris oscuro
    if (type.includes('COMMENT')) return '9E9E9E';
    
    // Default - Negro
    return '000000';
  }

  /**
   * Exporta los tokens a formato CSV (método simple alternativo)
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
