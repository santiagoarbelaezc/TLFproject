/**
 * Utilidades para clasificación y validación de caracteres
 * 
 * Esta clase proporciona métodos estáticos para identificar
 * diferentes tipos de caracteres durante el análisis léxico.
 * 
 * @author Juan Sebastian Noreña
 * @date 2025
 */
export class CharacterUtils {
  
  /**
   * Verifica si un carácter es un dígito (0-9)
   * @param char Carácter a verificar
   * @returns true si es un dígito
   */
  static isDigit(char: string): boolean {
    if (!char || char.length === 0) return false;
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57; // '0' a '9'
  }

  /**
   * Verifica si un carácter es una letra (a-z, A-Z)
   * @param char Carácter a verificar
   * @returns true si es una letra
   */
  static isLetter(char: string): boolean {
    if (!char || char.length === 0) return false;
    const code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122); // A-Z, a-z
  }

  /**
   * Verifica si un carácter puede iniciar un identificador
   * En Kotlin: letra (a-z, A-Z) o guión bajo (_)
   * @param char Carácter a verificar
   * @returns true si puede iniciar un identificador
   */
  static isIdentifierStart(char: string): boolean {
    if (!char || char.length === 0) return false;
    return this.isLetter(char) || char === '_';
  }

  /**
   * Verifica si un carácter puede estar en un identificador
   * En Kotlin: letra, dígito o guión bajo
   * @param char Carácter a verificar
   * @returns true si puede estar en un identificador
   */
  static isIdentifierPart(char: string): boolean {
    if (!char || char.length === 0) return false;
    return this.isLetter(char) || this.isDigit(char) || char === '_';
  }

  /**
   * Verifica si un carácter es un espacio en blanco
   * @param char Carácter a verificar
   * @returns true si es espacio en blanco
   */
  static isWhitespace(char: string): boolean {
    if (!char || char.length === 0) return false;
    return char === ' ' || char === '\t' || char === '\r';
  }

  /**
   * Verifica si un carácter es un salto de línea
   * @param char Carácter a verificar
   * @returns true si es salto de línea
   */
  static isNewline(char: string): boolean {
    if (!char || char.length === 0) return false;
    return char === '\n';
  }

  /**
   * Verifica si un carácter es un operador aritmético simple
   * @param char Carácter a verificar
   * @returns true si es operador aritmético
   */
  static isArithmeticOperator(char: string): boolean {
    if (!char || char.length === 0) return false;
    return char === '+' || char === '-' || char === '*' || 
           char === '/' || char === '%';
  }

  /**
   * Verifica si un carácter es un delimitador
   * @param char Carácter a verificar
   * @returns true si es delimitador
   */
  static isDelimiter(char: string): boolean {
    if (!char || char.length === 0) return false;
    return char === '(' || char === ')' || char === '{' || 
           char === '}' || char === '[' || char === ']';
  }

  /**
   * Verifica si un carácter es un separador
   * @param char Carácter a verificar
   * @returns true si es separador
   */
  static isSeparator(char: string): boolean {
    if (!char || char.length === 0) return false;
    return char === ';' || char === ',' || char === '.';
  }

  /**
   * Verifica si un carácter puede ser parte de un operador
   * @param char Carácter a verificar
   * @returns true si puede ser parte de un operador
   */
  static isOperatorChar(char: string): boolean {
    if (!char || char.length === 0) return false;
    return char === '+' || char === '-' || char === '*' || 
           char === '/' || char === '%' || char === '=' || 
           char === '!' || char === '<' || char === '>' || 
           char === '&' || char === '|' || char === '?' || 
           char === ':';
  }

  /**
   * Convierte un carácter de escape a su valor real
   * @param char Carácter después de la barra invertida
   * @returns Valor real del carácter de escape
   */
  static escapeCharToValue(char: string): string {
    const escapeMap: { [key: string]: string } = {
      'n': '\n',
      't': '\t',
      'r': '\r',
      'b': '\b',
      'f': '\f',
      '\\': '\\',
      '"': '"',
      "'": "'",
      '$': '$',
      '0': '\0'
    };
    return escapeMap[char] || char;
  }

  /**
   * Verifica si un carácter es válido para un literal de carácter
   * @param char Carácter a verificar
   * @returns true si es válido
   */
  static isValidCharLiteral(char: string): boolean {
    if (!char || char.length === 0) return false;
    // No puede ser comilla simple, salto de línea o retorno de carro
    return char !== "'" && char !== '\n' && char !== '\r';
  }

  /**
   * Verifica si el carácter es el fin de archivo
   * @param char Carácter a verificar
   * @returns true si es fin de archivo
   */
  static isEOF(char: string): boolean {
    return char === '\0' || char === undefined || char === null;
  }
}
