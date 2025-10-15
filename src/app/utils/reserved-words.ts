import { TokenType } from '../models/token-type.enum';

/**
 * Palabras reservadas del lenguaje Kotlin
 * 
 * Esta clase gestiona todas las palabras reservadas de Kotlin
 * y proporciona métodos para su identificación.
 * 
 * @author Juan Sebastian Noreña
 * @date 2025
 */
export class ReservedWords {
  
  /**
   * Set de palabras reservadas para búsqueda rápida O(1)
   */
  private static readonly KEYWORDS = new Set<string>([
    // Palabras clave de declaración
    'package',
    'import',
    'class',
    'interface',
    'object',
    'fun',
    'val',
    'var',
    'typealias',
    
    // Modificadores de visibilidad
    'public',
    'private',
    'protected',
    'internal',
    
    // Modificadores de clase/función
    'open',
    'final',
    'abstract',
    'sealed',
    'override',
    'lateinit',
    'inner',
    'data',
    'enum',
    'annotation',
    'companion',
    'inline',
    'infix',
    'operator',
    'suspend',
    'tailrec',
    'external',
    
    // Control de flujo
    'if',
    'else',
    'when',
    'for',
    'while',
    'do',
    'return',
    'break',
    'continue',
    'throw',
    'try',
    'catch',
    'finally',
    
    // Operadores especiales (palabras)
    'in',
    'is',
    'as',
    
    // Literales especiales
    'true',
    'false',
    'null',
    
    // Otros
    'this',
    'super',
    'where',
    'by',
    'get',
    'set',
    'constructor',
    'init',
    'field',
    'property',
    'receiver',
    'param',
    'setparam',
    'delegate',
    'file',
    'expect',
    'actual',
    'const',
    'dynamic',
    'reified'
  ]);

  /**
   * Verifica si una palabra es reservada de Kotlin
   * @param word Palabra a verificar
   * @returns true si es palabra reservada
   */
  static isKeyword(word: string): boolean {
    return this.KEYWORDS.has(word.toLowerCase());
  }

  /**
   * Obtiene el tipo de token para una palabra
   * Si es palabra reservada retorna KEYWORD, sino IDENTIFIER
   * @param word Palabra a clasificar
   * @returns TokenType correspondiente
   */
  static getTokenType(word: string): TokenType {
    return this.isKeyword(word) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
  }

  /**
   * Obtiene todas las palabras reservadas
   * @returns Array con todas las palabras reservadas
   */
  static getAllKeywords(): string[] {
    return Array.from(this.KEYWORDS).sort();
  }

  /**
   * Verifica si es un literal booleano
   * @param word Palabra a verificar
   * @returns true si es 'true' o 'false'
   */
  static isBooleanLiteral(word: string): boolean {
    return word === 'true' || word === 'false';
  }

  /**
   * Verifica si es literal null
   * @param word Palabra a verificar
   * @returns true si es 'null'
   */
  static isNullLiteral(word: string): boolean {
    return word === 'null';
  }

  /**
   * Obtiene el TokenType específico para literales especiales
   * @param word Palabra a clasificar
   * @returns TokenType.BOOLEAN, TokenType.NULL o TokenType.KEYWORD
   */
  static getSpecialLiteralType(word: string): TokenType {
    if (this.isBooleanLiteral(word)) return TokenType.BOOLEAN;
    if (this.isNullLiteral(word)) return TokenType.NULL;
    return TokenType.KEYWORD;
  }
}
