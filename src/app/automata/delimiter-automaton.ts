/**
 * @file delimiter-automaton.ts
 * @description Autómata Finito Determinista (AFD) para el reconocimiento de delimitadores
 * y separadores en el lenguaje Kotlin.
 * 
 * Delimitadores soportados:
 * - Paréntesis: ( )
 * - Llaves: { }
 * - Corchetes: [ ]
 * - Punto y coma: ;
 * - Coma: ,
 * - Punto: .
 * - Dos puntos: :
 * 
 * Estados del AFD:
 * - START: Estado inicial
 * - ACCEPT: Delimitador válido reconocido
 */

import { BaseAutomaton } from './base-automaton';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';

/**
 * Estados posibles del autómata de delimitadores
 */
enum DelimiterState {
  START = 'START',
  ACCEPT = 'ACCEPT'
}

/**
 * Autómata para reconocer delimitadores y separadores de Kotlin
 */
export class DelimiterAutomaton extends BaseAutomaton {
  private state: DelimiterState = DelimiterState.START;

  // Mapa de delimitadores a sus tipos de token
  private static readonly DELIMITERS: Map<string, TokenType> = new Map([
    // Paréntesis
    ['(', TokenType.LPAREN],
    [')', TokenType.RPAREN],
    
    // Llaves
    ['{', TokenType.LBRACE],
    ['}', TokenType.RBRACE],
    
    // Corchetes
    ['[', TokenType.LBRACKET],
    [']', TokenType.RBRACKET],
    
    // Separadores
    [';', TokenType.SEMICOLON],
    [',', TokenType.COMMA],
    ['.', TokenType.DOT],
    [':', TokenType.COLON]
  ]);

  /**
   * Método principal que reconoce delimitadores
   * @param input Texto completo de entrada
   * @param startPos Posición inicial donde comenzar el reconocimiento
   * @param line Línea actual en el código fuente
   * @param column Columna actual en el código fuente
   * @returns Token reconocido o null si no es un delimitador válido
   */
  public override recognize(
    input: string,
    startPos: number,
    line: number,
    column: number
  ): Token | null {
    this.reset();
    
    const char = this.peek(input, startPos);
    const tokenType = DelimiterAutomaton.DELIMITERS.get(char);

    if (tokenType) {
      // Se encontró un delimitador válido
      this.state = DelimiterState.ACCEPT;
      
      return this.createToken(
        tokenType,
        char,
        line,
        column,
        startPos
      );
    }

    // No es un delimitador válido
    return null;
  }

  /**
   * Reinicia el estado del autómata
   */
  private reset(): void {
    this.state = DelimiterState.START;
  }

  /**
   * Verifica si el autómata está en estado de aceptación
   */
  public isAccepting(): boolean {
    return this.state === DelimiterState.ACCEPT;
  }

  /**
   * Obtiene el estado actual del autómata
   */
  public getState(): string {
    return this.state;
  }

  /**
   * Verifica si un carácter es un delimitador
   * @param char Carácter a verificar
   * @returns true si es un delimitador
   */
  public static isDelimiter(char: string): boolean {
    return DelimiterAutomaton.DELIMITERS.has(char);
  }
}
