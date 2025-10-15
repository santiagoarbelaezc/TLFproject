import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';

/**
 * Clase base abstracta para todos los autómatas finitos deterministas
 * 
 * Esta clase define la estructura común que deben seguir todos
 * los autómatas del analizador léxico. Cada autómata reconoce
 * una categoría específica de tokens.
 * 
 * @date 2025
 */
export abstract class BaseAutomaton {
  
  /**
   * Reconoce un token a partir de la posición actual en el input
   * 
   * Este método debe ser implementado por cada autómata específico.
   * El autómata procesará el input carácter por carácter desde startPos
   * hasta reconocer un token válido o determinar que no puede reconocer
   * el patrón.
   * 
   * @param input Texto completo de entrada
   * @param startPos Posición inicial donde comenzar el reconocimiento
   * @param line Línea actual en el código fuente
   * @param column Columna actual en el código fuente
   * @returns Token reconocido o null si no puede reconocer
   */
  abstract recognize(
    input: string,
    startPos: number,
    line: number,
    column: number
  ): Token | null;

  /**
   * Crea un token con los parámetros dados
   * 
   * Método utilitario para crear tokens de manera consistente
   * 
   * @param type Tipo del token
   * @param lexeme Lexema (valor literal) del token
   * @param line Línea donde se encuentra
   * @param column Columna donde comienza
   * @param position Posición absoluta en el texto
   * @param value Valor procesado (opcional)
   * @returns Token creado
   */
  protected createToken(
    type: TokenType,
    lexeme: string,
    line: number,
    column: number,
    position: number,
    value?: any
  ): Token {
    return {
      type,
      lexeme,
      line,
      column,
      position,
      length: lexeme.length,
      value
    };
  }

  /**
   * Obtiene un carácter sin avanzar la posición
   * 
   * Permite "mirar adelante" en el input sin consumir caracteres
   * 
   * @param input Texto de entrada
   * @param pos Posición actual
   * @param offset Desplazamiento desde la posición actual (default 0)
   * @returns Carácter en la posición especificada o '\0' si es EOF
   */
  protected peek(input: string, pos: number, offset: number = 0): string {
    const index = pos + offset;
    return index < input.length ? input[index] : '\0';
  }

  /**
   * Obtiene el carácter actual y avanza la posición
   * 
   * @param input Texto de entrada
   * @param pos Posición actual (se modificará por referencia)
   * @returns Carácter consumido o '\0' si es EOF
   */
  protected consume(input: string, pos: { value: number }): string {
    if (pos.value < input.length) {
      return input[pos.value++];
    }
    return '\0';
  }

  /**
   * Verifica si hemos llegado al final del input
   * 
   * @param input Texto de entrada
   * @param pos Posición actual
   * @returns true si estamos en EOF
   */
  protected isEOF(input: string, pos: number): boolean {
    return pos >= input.length;
  }

  /**
   * Verifica si el siguiente carácter coincide con el esperado
   * 
   * @param input Texto de entrada
   * @param pos Posición actual
   * @param expected Carácter esperado
   * @returns true si coincide
   */
  protected match(input: string, pos: number, expected: string): boolean {
    return this.peek(input, pos) === expected;
  }

  /**
   * Verifica si los siguientes caracteres coinciden con el patrón esperado
   * 
   * @param input Texto de entrada
   * @param pos Posición actual
   * @param expected Cadena esperada
   * @returns true si coincide
   */
  protected matchString(input: string, pos: number, expected: string): boolean {
    for (let i = 0; i < expected.length; i++) {
      if (this.peek(input, pos, i) !== expected[i]) {
        return false;
      }
    }
    return true;
  }
}
