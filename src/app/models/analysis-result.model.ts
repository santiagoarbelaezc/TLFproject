import { Token } from './token.model';
import { LexicalError } from './lexical-error.model';

/**
 * Resultado completo del análisis léxico
 * 
 * @author Juan Sebastian Noreña
 * @date 2025
 */
export interface AnalysisResult {
  /** Lista de tokens identificados durante el análisis */
  tokens: Token[];
  
  /** Lista de errores encontrados durante el análisis */
  errors: LexicalError[];
  
  /** Indica si el análisis fue exitoso (sin errores) */
  success: boolean;
  
  /** Tiempo de análisis en milisegundos */
  analysisTime: number;
  
  /** Estadísticas del análisis */
  statistics: AnalysisStatistics;
}

/**
 * Estadísticas del análisis léxico
 * 
 * @author TLF Team
 * @date 2025
 */
export interface AnalysisStatistics {
  /** Total de tokens encontrados (sin contar espacios) */
  totalTokens: number;
  
  /** Número de líneas analizadas */
  totalLines: number;
  
  /** Número de caracteres analizados */
  totalCharacters: number;
  
  /** Distribución de tokens por tipo (tipo -> cantidad) */
  tokenDistribution: { [key: string]: number };
  
  /** Número de palabras reservadas encontradas */
  keywordCount: number;
  
  /** Número de identificadores encontrados */
  identifierCount: number;
  
  /** Número de operadores encontrados */
  operatorCount: number;
  
  /** Número de literales encontrados (números, strings, etc) */
  literalCount: number;
  
  /** Número de comentarios encontrados */
  commentCount: number;
}
