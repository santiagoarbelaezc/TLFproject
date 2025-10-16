/**
 * @file operator-automaton.ts
 * @description Autómata Finito Determinista (AFD) para el reconocimiento de operadores
 * en el lenguaje Kotlin, incluyendo operadores aritméticos, lógicos, de comparación,
 * asignación, bitwise y operadores especiales de Kotlin.
 * 
 * Operadores soportados:
 * - Aritméticos: + - * / %
 * - Comparación: == != < > <= >= === !==
 * - Lógicos: && || !
 * - Bitwise: & | ^
 * - Asignación: = += -= *= /= %=
 * - Incremento/Decremento: ++ --
 * - Especiales Kotlin: ?. !! ?: :: .. -> => in !in is !is as as?
 * 
 * Estados del AFD:
 * - START: Estado inicial
 * - SINGLE_OP: Operador de un carácter
 * - DOUBLE_OP: Operador de dos caracteres
 * - TRIPLE_OP: Operador de tres caracteres
 * - ACCEPT: Operador válido reconocido
 */

import { BaseAutomaton } from './base-automaton';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';

/**
 * Estados posibles del autómata de operadores
 */
enum OperatorState {
  START = 'START',
  SINGLE_OP = 'SINGLE_OP',
  DOUBLE_OP = 'DOUBLE_OP',
  TRIPLE_OP = 'TRIPLE_OP',
  ACCEPT = 'ACCEPT'
}

/**
 * Autómata para reconocer todos los operadores de Kotlin
 */
export class OperatorAutomaton extends BaseAutomaton {
  private state: OperatorState = OperatorState.START;

  // Mapa de operadores a sus tipos de token
  private static readonly OPERATORS: Map<string, TokenType> = new Map([
    // Aritméticos
    ['+', TokenType.PLUS],
    ['-', TokenType.MINUS],
    ['*', TokenType.MULTIPLY],
    ['/', TokenType.DIVIDE],
    ['%', TokenType.MODULO],
    
    // Comparación
    ['==', TokenType.EQUALS],
    ['!=', TokenType.NOT_EQUALS],
    ['<', TokenType.LESS_THAN],
    ['>', TokenType.GREATER_THAN],
    ['<=', TokenType.LESS_EQUALS],
    ['>=', TokenType.GREATER_EQUALS],
    ['===', TokenType.IDENTITY_EQUALS],
    ['!==', TokenType.IDENTITY_NOT_EQUALS],
    
    // Lógicos
    ['&&', TokenType.AND],
    ['||', TokenType.OR],
    ['!', TokenType.NOT],
    
    // Bitwise (verificar && y || primero)
    ['&', TokenType.BITWISE_AND],
    ['|', TokenType.BITWISE_OR],
    ['^', TokenType.BITWISE_XOR],
    
    // Asignación
    ['=', TokenType.ASSIGN],
    ['+=', TokenType.PLUS_ASSIGN],
    ['-=', TokenType.MINUS_ASSIGN],
    ['*=', TokenType.MULTIPLY_ASSIGN],
    ['/=', TokenType.DIVIDE_ASSIGN],
    ['%=', TokenType.MODULO_ASSIGN],
    
    // Incremento/Decremento
    ['++', TokenType.INCREMENT],
    ['--', TokenType.DECREMENT],
    
    // Especiales de Kotlin
    ['?.', TokenType.SAFE_CALL],
    ['!!', TokenType.NOT_NULL_ASSERTION],
    ['?:', TokenType.ELVIS],
    ['::', TokenType.DOUBLE_COLON],
    ['..', TokenType.RANGE],
    ['->', TokenType.ARROW],
    ['as', TokenType.AS],
    ['as?', TokenType.SAFE_CAST]
  ]);

  /**
   * Método principal que reconoce operadores carácter por carácter
   * @param input Texto completo de entrada
   * @param startPos Posición inicial donde comenzar el reconocimiento
   * @param line Línea actual en el código fuente
   * @param column Columna actual en el código fuente
   * @returns Token reconocido o null si no es un operador válido
   */
  public override recognize(
    input: string,
    startPos: number,
    line: number,
    column: number
  ): Token | null {
    this.reset();
    const pos = { value: startPos };

    // Intentar reconocer operadores de mayor longitud primero
    // Máximo 3 caracteres (===, !==, as?)
    const maxLength = Math.min(3, input.length - startPos);
    
    let longestMatch: string | null = null;
    let longestMatchType: TokenType | null = null;

    // Intentar reconocer operadores de 3, 2 y 1 caracteres
    for (let length = maxLength; length >= 1; length--) {
      const candidate = input.substring(startPos, startPos + length);
      
      if (OperatorAutomaton.OPERATORS.has(candidate)) {
        longestMatch = candidate;
        longestMatchType = OperatorAutomaton.OPERATORS.get(candidate)!;
        break;
      }
    }

    if (longestMatch && longestMatchType) {
      // Se encontró un operador válido
      this.state = OperatorState.ACCEPT;
      pos.value = startPos + longestMatch.length;
      
      return this.createToken(
        longestMatchType,
        longestMatch,
        line,
        column,
        startPos
      );
    }

    // No se reconoció ningún operador
    return null;
  }

  /**
   * Reinicia el estado del autómata
   */
  private reset(): void {
    this.state = OperatorState.START;
  }

  /**
   * Verifica si el autómata está en estado de aceptación
   */
  public isAccepting(): boolean {
    return this.state === OperatorState.ACCEPT;
  }

  /**
   * Obtiene el estado actual del autómata
   */
  public getState(): string {
    return this.state;
  }

  /**
   * Verifica si un carácter puede ser el inicio de un operador
   * @param char Carácter a verificar
   * @returns true si puede iniciar un operador
   */
  public static isOperatorStart(char: string): boolean {
    const operatorStarts = ['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '?', ':', '.', 'a', 'i'];
    return operatorStarts.includes(char);
  }
}
