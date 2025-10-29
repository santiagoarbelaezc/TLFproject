/**
 * @file string-automaton.ts
 * @description Autómata Finito Determinista (AFD) para el reconocimiento de cadenas de caracteres
 * en el lenguaje Kotlin, incluyendo strings normales, chars, string templates y raw strings.
 * 
 * Gramática:
 * - String normal: "([^"\\]|\\.)*"
 * - Char: '([^'\\]|\\.)'
 * - String template: "([^"\\$]|\\.|\$\{[^}]*\}|\$[a-zA-Z_][a-zA-Z0-9_]*)*"
 * - Raw string: """.*"""
 * 
 * Estados del AFD:
 * - START: Estado inicial
 * - IN_STRING: Dentro de una cadena normal (")
 * - IN_CHAR: Dentro de un carácter (')
 * - IN_RAW_STRING: Dentro de un raw string (""")
 * - ESCAPE: Procesando carácter de escape (\)
 * - TEMPLATE_START: Inicio de template ($)
 * - TEMPLATE_BRACE: Dentro de template con llaves (${})
 * - RAW_QUOTE_1: Primer " de cierre en raw string
 * - RAW_QUOTE_2: Segundo " de cierre en raw string
 * - ACCEPT: Cadena válida reconocida
 * - REJECT: Cadena inválida (no cerrada o error)
 */

import { BaseAutomaton } from './base-automaton';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';
import { CharacterUtils } from '../utils/character-utils';

/**
 * Estados posibles del autómata de strings
 */
enum StringState {
  START = 'START',
  IN_STRING = 'IN_STRING',
  IN_CHAR = 'IN_CHAR',
  IN_RAW_STRING = 'IN_RAW_STRING',
  ESCAPE = 'ESCAPE',
  TEMPLATE_START = 'TEMPLATE_START',
  TEMPLATE_BRACE = 'TEMPLATE_BRACE',
  RAW_QUOTE_1 = 'RAW_QUOTE_1',
  RAW_QUOTE_2 = 'RAW_QUOTE_2',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

/**
 * Autómata para reconocer strings, chars, templates y raw strings de Kotlin
 */
export class StringAutomaton extends BaseAutomaton {
  private state: StringState = StringState.START;

  /**
   * Método principal que reconoce strings carácter por carácter
   * @param input Texto completo de entrada
   * @param startPos Posición inicial donde comenzar el reconocimiento
   * @param line Línea actual en el código fuente
   * @param column Columna actual en el código fuente
   * @returns Token reconocido o null si no es un string válido
   */
  public override recognize(
    input: string,
    startPos: number,
    line: number,
    column: number
  ): Token | null {
    this.reset();
    const pos = { value: startPos };
    const firstChar = this.peek(input, pos.value);

    // Verificar si comienza con comilla simple o doble
    if (firstChar === "'") {
      return this.recognizeChar(input, pos, line, column, startPos);
    } else if (firstChar === '"') {
      // Verificar si es raw string (""")
      if (this.peek(input, pos.value, 1) === '"' && this.peek(input, pos.value, 2) === '"') {
        return this.recognizeRawString(input, pos, line, column, startPos);
      } else {
        return this.recognizeString(input, pos, line, column, startPos);
      }
    }

    return null;
  }

  /**
   * Reconoce un carácter individual ('x')
   */
  private recognizeChar(
    input: string,
    pos: { value: number },
    line: number,
    column: number,
    startPos: number
  ): Token | null {
    this.state = StringState.IN_CHAR;
    this.consume(input, pos); // Consumir '

    let charContent = '';
    let escaped = false;

    while (pos.value < input.length) {
      const char = this.peek(input, pos.value);

      if (escaped) {
        // Procesar carácter escapado
        const escapedValue = CharacterUtils.escapeCharToValue(char);
        
        if (escapedValue === null) {
          // Escape inválido - rechazar
          this.state = StringState.REJECT;
          return null;
        }
        
        charContent += escapedValue;
        this.consume(input, pos);
        escaped = false;
      } else if (char === '\\') {
        // Inicio de escape
        this.consume(input, pos);
        escaped = true;
      } else if (char === "'") {
        // Fin del char
        this.consume(input, pos);
        this.state = StringState.ACCEPT;
        
        const lexeme = input.substring(startPos, pos.value);
        return this.createToken(
          TokenType.CHAR,
          lexeme,
          line,
          column,
          startPos,
          charContent
        );
      } else if (char === '\n' || char === '\r') {
        // Carácter sin cerrar (salto de línea)
        this.state = StringState.REJECT;
        return null;
      } else {
        // Validar que sea un carácter Unicode válido
        if (!CharacterUtils.isValidUnicodeChar(char)) {
          // Carácter inválido detectado (como �)
          this.state = StringState.REJECT;
          return null;
        }
        
        // Carácter normal
        charContent += char;
        this.consume(input, pos);
      }
    }

    // Llegó al final sin cerrar
    this.state = StringState.REJECT;
    return null;
  }

  /**
   * Reconoce una cadena normal con soporte para templates ("texto $variable")
   */
  private recognizeString(
    input: string,
    pos: { value: number },
    line: number,
    column: number,
    startPos: number
  ): Token | null {
    this.state = StringState.IN_STRING;
    this.consume(input, pos); // Consumir "

    let stringContent = '';
    let hasTemplate = false;
    let escaped = false;

    while (pos.value < input.length) {
      const char = this.peek(input, pos.value);

      if (escaped) {
        // Procesar carácter escapado
        const escapedValue = CharacterUtils.escapeCharToValue(char);
        
        if (escapedValue === null) {
          // Escape inválido - rechazar
          this.state = StringState.REJECT;
          return null;
        }
        
        stringContent += escapedValue;
        this.consume(input, pos);
        escaped = false;
      } else if (char === '\\') {
        // Inicio de escape
        this.consume(input, pos);
        escaped = true;
      } else if (char === '$') {
        // Inicio de string template
        hasTemplate = true;
        stringContent += char;
        this.consume(input, pos);

        // Verificar si es ${} o $variable
        if (this.peek(input, pos.value) === '{') {
          stringContent += this.consumeTemplateBrace(input, pos);
        } else {
          stringContent += this.consumeTemplateVariable(input, pos);
        }
      } else if (char === '"') {
        // Fin del string
        this.consume(input, pos);
        this.state = StringState.ACCEPT;
        
        const lexeme = input.substring(startPos, pos.value);
        const tokenType = hasTemplate ? TokenType.STRING_TEMPLATE : TokenType.STRING;
        
        return this.createToken(
          tokenType,
          lexeme,
          line,
          column,
          startPos,
          stringContent
        );
      } else if (char === '\n' || char === '\r') {
        // String sin cerrar (salto de línea)
        this.state = StringState.REJECT;
        return null;
      } else {
        // Validar que sea un carácter Unicode válido
        if (!CharacterUtils.isValidUnicodeChar(char)) {
          // Carácter inválido detectado (como �)
          this.state = StringState.REJECT;
          return null;
        }
        
        // Carácter normal
        stringContent += char;
        this.consume(input, pos);
      }
    }

    // Llegó al final sin cerrar
    this.state = StringState.REJECT;
    return null;
  }

  /**
   * Reconoce un raw string ("""texto""")
   */
  private recognizeRawString(
    input: string,
    pos: { value: number },
    line: number,
    column: number,
    startPos: number
  ): Token | null {
    this.state = StringState.IN_RAW_STRING;
    
    // Consumir las tres comillas de apertura
    this.consume(input, pos); // "
    this.consume(input, pos); // "
    this.consume(input, pos); // "

    let stringContent = '';

    while (pos.value < input.length) {
      const char = this.peek(input, pos.value);

      if (char === '"') {
        // Verificar si son tres comillas seguidas
        if (this.peek(input, pos.value, 1) === '"' && 
            this.peek(input, pos.value, 2) === '"') {
          // Fin del raw string
          this.consume(input, pos); // "
          this.consume(input, pos); // "
          this.consume(input, pos); // "
          this.state = StringState.ACCEPT;
          
          const lexeme = input.substring(startPos, pos.value);
          return this.createToken(
            TokenType.RAW_STRING,
            lexeme,
            line,
            column,
            startPos,
            stringContent
          );
        } else {
          // Una sola comilla dentro del raw string
          stringContent += char;
          this.consume(input, pos);
        }
      } else {
        // Cualquier carácter (incluidos saltos de línea) es válido en raw string
        stringContent += char;
        this.consume(input, pos);
      }
    }

    // Llegó al final sin cerrar
    this.state = StringState.REJECT;
    return null;
  }

  /**
   * Consume un template con llaves ${expresion}
   */
  private consumeTemplateBrace(input: string, pos: { value: number }): string {
    let content = '';
    this.consume(input, pos); // Consumir {
    content += '{';

    let braceCount = 1;

    while (pos.value < input.length && braceCount > 0) {
      const char = this.peek(input, pos.value);
      
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }

      content += char;
      this.consume(input, pos);
    }

    return content;
  }

  /**
   * Consume una variable en template $variable
   */
  private consumeTemplateVariable(input: string, pos: { value: number }): string {
    let content = '';

    // El primer carácter debe ser letra o _
    if (CharacterUtils.isIdentifierStart(this.peek(input, pos.value))) {
      while (pos.value < input.length && 
             CharacterUtils.isIdentifierPart(this.peek(input, pos.value))) {
        content += this.peek(input, pos.value);
        this.consume(input, pos);
      }
    }

    return content;
  }

  /**
   * Reinicia el estado del autómata
   */
  private reset(): void {
    this.state = StringState.START;
  }

  /**
   * Verifica si el autómata está en estado de aceptación
   */
  public isAccepting(): boolean {
    return this.state === StringState.ACCEPT;
  }

  /**
   * Verifica si el autómata está en estado de rechazo
   */
  public isRejecting(): boolean {
    return this.state === StringState.REJECT;
  }

  /**
   * Obtiene el estado actual del autómata
   */
  public getState(): string {
    return this.state;
  }
}
