/**
 * @file identifier-automaton.ts
 * @description Autómata Finito Determinista (AFD) para el reconocimiento de identificadores
 * en el lenguaje Kotlin. Distingue entre identificadores válidos y palabras reservadas.
 * 
 * Gramática:
 * - Identificador: [a-zA-Z_][a-zA-Z0-9_]{0,14}
 * - Longitud máxima: 15 caracteres
 * - Si coincide con palabra reservada, el tipo será KEYWORD
 * 
 * Estados del AFD:
 * - START: Estado inicial
 * - IDENTIFIER: Reconociendo caracteres del identificador
 * - ACCEPT: Identificador válido reconocido
 * - REJECT: Identificador inválido (demasiado largo o carácter ilegal)
 */

import { BaseAutomaton } from './base-automaton';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';
import { CharacterUtils } from '../utils/character-utils';
import { ReservedWords } from '../utils/reserved-words';
import { Constants } from '../utils/constants';

/**
 * Estados posibles del autómata de identificadores
 */
enum IdentifierState {
  START = 'START',
  IDENTIFIER = 'IDENTIFIER',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

/**
 * Autómata para reconocer identificadores y palabras reservadas de Kotlin
 */
export class IdentifierAutomaton extends BaseAutomaton {
  private state: IdentifierState = IdentifierState.START;

  /**
   * Método principal que reconoce identificadores carácter por carácter
   * @param input Texto completo de entrada
   * @param startPos Posición inicial donde comenzar el reconocimiento
   * @param line Línea actual en el código fuente
   * @param column Columna actual en el código fuente
   * @returns Token reconocido o null si no es un identificador válido
   */
  public override recognize(
    input: string,
    startPos: number,
    line: number,
    column: number
  ): Token | null {
    this.reset();
    const pos = { value: startPos };
    let identifierLength = 0;

    // El primer carácter debe ser letra o guión bajo
    const firstChar = this.peek(input, pos.value);
    if (!CharacterUtils.isIdentifierStart(firstChar)) {
      return null;
    }

    // Cambiar al estado IDENTIFIER
    this.state = IdentifierState.IDENTIFIER;
    this.consume(input, pos);
    identifierLength = 1;
    let currentColumn = column + 1;

    // Consumir caracteres válidos del identificador
    while (pos.value < input.length) {
      const char = this.peek(input, pos.value);

      // Verificar si es un carácter válido para continuar el identificador
      if (CharacterUtils.isIdentifierPart(char)) {
        identifierLength++;

        // Verificar límite de longitud (15 caracteres máximo)
        if (identifierLength > Constants.MAX_IDENTIFIER_LENGTH) {
          this.state = IdentifierState.REJECT;
          
          // Consumir el resto del identificador inválido
          while (pos.value < input.length && CharacterUtils.isIdentifierPart(this.peek(input, pos.value))) {
            this.consume(input, pos);
            currentColumn++;
          }

          // Retornar null para indicar error (el lexer manejará el error)
          return null;
        }

        this.consume(input, pos);
        currentColumn++;
      } else {
        // Fin del identificador
        break;
      }
    }

    // Estado de aceptación
    this.state = IdentifierState.ACCEPT;
    const lexeme = input.substring(startPos, pos.value);

    // Determinar si es palabra reservada o identificador
    let tokenType: TokenType;
    
    if (ReservedWords.isKeyword(lexeme)) {
      // Es una palabra reservada de Kotlin
      tokenType = ReservedWords.getTokenType(lexeme);
    } else {
      // Es un identificador regular
      tokenType = TokenType.IDENTIFIER;
    }

    // Crear y retornar el token
    return this.createToken(
      tokenType,
      lexeme,
      line,
      column,
      startPos
    );
  }

  /**
   * Reinicia el estado del autómata
   */
  private reset(): void {
    this.state = IdentifierState.START;
  }

  /**
   * Verifica si el autómata está en estado de aceptación
   */
  public isAccepting(): boolean {
    return this.state === IdentifierState.ACCEPT;
  }

  /**
   * Verifica si el autómata está en estado de rechazo
   */
  public isRejecting(): boolean {
    return this.state === IdentifierState.REJECT;
  }

  /**
   * Obtiene el estado actual del autómata
   */
  public getState(): string {
    return this.state;
  }
}
