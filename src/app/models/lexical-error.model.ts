/**
 * Tipos de errores léxicos que puede detectar el analizador
 * 
 * @date 2025
 */
export enum LexicalErrorType {
  /** Cadena de caracteres sin cerrar: "hola */
  UNCLOSED_STRING = 'UNCLOSED_STRING',
  
  /** Comentario de bloque sin cerrar: /* comentario */
  UNCLOSED_BLOCK_COMMENT = 'UNCLOSED_BLOCK_COMMENT',
  
  /** Identificador que excede los 15 caracteres */
  IDENTIFIER_TOO_LONG = 'IDENTIFIER_TOO_LONG',
  
  /** Token que no se reconoce: ¿ */
  UNRECOGNIZED_TOKEN = 'UNRECOGNIZED_TOKEN',
  
  /** Formato de número inválido: 3.14.15 */
  INVALID_NUMBER = 'INVALID_NUMBER',
  
  /** Literal de carácter inválido: 'ab' */
  INVALID_CHAR = 'INVALID_CHAR',
  
  /** Raw string sin cerrar: """texto */
  UNCLOSED_RAW_STRING = 'UNCLOSED_RAW_STRING',
  
  /** Carácter Unicode inválido o mal codificado: � */
  INVALID_UNICODE_CHAR = 'INVALID_UNICODE_CHAR'
}

/**
 * Representa un error léxico encontrado durante el análisis
 * 
 * @author TLF Team
 * @date 2025
 */
export interface LexicalError {
  /** Tipo de error léxico */
  type: LexicalErrorType;
  
  /** Mensaje descriptivo del error */
  message: string;
  
  /** Línea donde ocurrió el error */
  line: number;
  
  /** Columna donde ocurrió el error */
  column: number;
  
  /** Lexema que causó el error (si aplica) */
  lexeme: string;
  
  /** Sugerencia para corregir el error (opcional) */
  suggestion?: string;
}
