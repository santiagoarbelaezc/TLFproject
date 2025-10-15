import { TokenType } from './token-type.enum';

/**
 * Representa un token identificado por el analizador léxico
 * 
 * Un token es la unidad léxica básica del lenguaje, como
 * una palabra reservada, identificador, operador, etc.
 * 
 * @date 2025
 */
export interface Token {
  /** Tipo de token según la enumeración TokenType */
  type: TokenType;
  
  /** Valor literal del token (lexema) tal como aparece en el código */
  lexeme: string;
  
  /** Número de línea donde se encuentra el token (comienza en 1) */
  line: number;
  
  /** Columna donde comienza el token (comienza en 1) */
  column: number;
  
  /** Posición absoluta en el texto (comienza en 0) */
  position: number;
  
  /** Longitud del token en caracteres */
  length: number;
  
  /** 
   * Valor procesado del token (opcional)
   * Por ejemplo, para un INTEGER podría ser el número convertido
   */
  value?: any;
}
