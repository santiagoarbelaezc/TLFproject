import { BaseAutomaton } from './base-automaton';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';
import { CharacterUtils } from '../utils/character-utils';

/**
 * Estados posibles del autómata de números
 */
enum NumberState {
  START = 'START',
  INTEGER = 'INTEGER',
  DOT = 'DOT',
  DECIMAL = 'DECIMAL',
  REJECT = 'REJECT'
}

/**
 * Autómata Finito Determinista para reconocer números
 * 
 * Este autómata reconoce:
 * - Números enteros: 0, 123, 4567
 * - Números decimales: 3.14, 0.5, 123.456
 * 
 * Expresión Regular:
 * - Enteros: [0-9]+
 * - Decimales: [0-9]+\.[0-9]+
 * 
 * Estados del AFD:
 * - START: Estado inicial
 * - INTEGER: Reconociendo dígitos de la parte entera
 * - DOT: Se encontró un punto decimal
 * - DECIMAL: Reconociendo dígitos de la parte decimal
 * 
 * @author TLF Team
 * @date 2025
 */
export class NumberAutomaton extends BaseAutomaton {

  /**
   * Reconoce un número (entero o decimal) desde la posición actual
   * 
   * @param input Texto de entrada
   * @param startPos Posición inicial
   * @param line Línea actual
   * @param column Columna actual
   * @returns Token de tipo INTEGER o DECIMAL, o null si no reconoce
   */
  recognize(input: string, startPos: number, line: number, column: number): Token | null {
    let state = NumberState.START;
    let pos = startPos;
    let lexeme = '';
    let hasDecimalPoint = false;

    // Procesar carácter por carácter
    while (pos < input.length) {
      const char = input[pos];

      switch (state) {
        case NumberState.START:
          // Estado inicial: debe comenzar con un dígito
          if (CharacterUtils.isDigit(char)) {
            lexeme += char;
            state = NumberState.INTEGER;
            pos++;
          } else {
            // No es un número
            return null;
          }
          break;

        case NumberState.INTEGER:
          // Reconociendo la parte entera
          if (CharacterUtils.isDigit(char)) {
            // Continuar reconociendo dígitos
            lexeme += char;
            pos++;
          } else if (char === '.' && this.peek(input, pos, 1) !== '.') {
            // Encontramos un punto decimal (pero no es operador rango ..)
            // Verificar que después del punto hay un dígito
            const nextChar = this.peek(input, pos, 1);
            if (CharacterUtils.isDigit(nextChar)) {
              lexeme += char;
              state = NumberState.DOT;
              hasDecimalPoint = true;
              pos++;
            } else {
              // El punto no está seguido de un dígito
              // Retornar el entero reconocido hasta ahora
              return this.createIntegerToken(lexeme, line, column, startPos);
            }
          } else {
            // Fin del número entero
            return this.createIntegerToken(lexeme, line, column, startPos);
          }
          break;

        case NumberState.DOT:
          // Acabamos de reconocer el punto decimal
          if (CharacterUtils.isDigit(char)) {
            lexeme += char;
            state = NumberState.DECIMAL;
            pos++;
          } else {
            // Error: punto sin dígitos después
            // Esto no debería pasar por la validación anterior
            state = NumberState.REJECT;
          }
          break;

        case NumberState.DECIMAL:
          // Reconociendo la parte decimal
          if (CharacterUtils.isDigit(char)) {
            lexeme += char;
            pos++;
          } else {
            // Fin del número decimal
            return this.createDecimalToken(lexeme, line, column, startPos);
          }
          break;

        case NumberState.REJECT:
          return null;
      }
    }

    // Fin del input: verificar si estamos en un estado de aceptación
    if (state === NumberState.INTEGER) {
      return this.createIntegerToken(lexeme, line, column, startPos);
    } else if (state === NumberState.DECIMAL) {
      return this.createDecimalToken(lexeme, line, column, startPos);
    }

    return null;
  }

  /**
   * Crea un token de tipo INTEGER
   * 
   * @param lexeme Lexema del número
   * @param line Línea
   * @param column Columna
   * @param position Posición
   * @returns Token INTEGER
   */
  private createIntegerToken(
    lexeme: string,
    line: number,
    column: number,
    position: number
  ): Token {
    const value = parseInt(lexeme, 10);
    return this.createToken(
      TokenType.INTEGER,
      lexeme,
      line,
      column,
      position,
      value
    );
  }

  /**
   * Crea un token de tipo DECIMAL
   * 
   * @param lexeme Lexema del número
   * @param line Línea
   * @param column Columna
   * @param position Posición
   * @returns Token DECIMAL
   */
  private createDecimalToken(
    lexeme: string,
    line: number,
    column: number,
    position: number
  ): Token {
    const value = parseFloat(lexeme);
    return this.createToken(
      TokenType.DECIMAL,
      lexeme,
      line,
      column,
      position,
      value
    );
  }
}
