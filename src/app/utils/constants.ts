/**
 * Constantes globales del analizador léxico
 * 
 * @date 2025
 */
export class Constants {
  
  // ==================== LÍMITES ====================
  /** Longitud máxima permitida para identificadores */
  static readonly MAX_IDENTIFIER_LENGTH = 15;
  
  // ==================== DELIMITADORES DE COMENTARIOS ====================
  /** Inicio de comentario de línea */
  static readonly LINE_COMMENT_START = '//';
  
  /** Inicio de comentario de bloque */
  static readonly BLOCK_COMMENT_START = '/*';
  
  /** Fin de comentario de bloque */
  static readonly BLOCK_COMMENT_END = '*/';
  
  /** Inicio de comentario de documentación KDoc */
  static readonly DOC_COMMENT_START = '/**';
  
  // ==================== DELIMITADORES DE STRINGS ====================
  /** Comillas dobles para strings */
  static readonly DOUBLE_QUOTE = '"';
  
  /** Comilla simple para char */
  static readonly SINGLE_QUOTE = "'";
  
  /** Delimitador de raw string */
  static readonly RAW_STRING_DELIMITER = '"""';
  
  // ==================== CARACTERES ESPECIALES ====================
  /** Carácter de escape */
  static readonly ESCAPE_CHAR = '\\';
  
  /** Carácter para templates de string */
  static readonly TEMPLATE_CHAR = '$';
  
  /** Fin de archivo */
  static readonly EOF_CHAR = '\0';
  
  // ==================== MENSAJES DE ERROR ====================
  static readonly ERROR_MESSAGES = {
    UNCLOSED_STRING: 'Cadena de caracteres sin cerrar',
    UNCLOSED_BLOCK_COMMENT: 'Comentario de bloque sin cerrar',
    UNCLOSED_RAW_STRING: 'Raw string sin cerrar (falta """)',
    IDENTIFIER_TOO_LONG: `Identificador excede el límite de ${Constants.MAX_IDENTIFIER_LENGTH} caracteres`,
    UNRECOGNIZED_TOKEN: 'Token no reconocido',
    INVALID_NUMBER: 'Formato de número inválido',
    INVALID_CHAR: 'Literal de carácter inválido (debe ser un solo carácter)',
    CHAR_NOT_CLOSED: 'Literal de carácter sin cerrar'
  };
  
  // ==================== CATEGORÍAS PARA UI ====================
  static readonly CATEGORY_NAMES: { [key: string]: string } = {
    // Literales
    INTEGER: 'Número Entero',
    DECIMAL: 'Número Decimal',
    STRING: 'Cadena de Texto',
    CHAR: 'Carácter',
    RAW_STRING: 'Raw String',
    STRING_TEMPLATE: 'String Template',
    BOOLEAN: 'Booleano',
    NULL: 'Null',
    
    // Identificadores
    IDENTIFIER: 'Identificador',
    KEYWORD: 'Palabra Reservada',
    
    // Operadores aritméticos
    PLUS: 'Suma (+)',
    MINUS: 'Resta (-)',
    MULTIPLY: 'Multiplicación (*)',
    DIVIDE: 'División (/)',
    MODULO: 'Módulo (%)',
    
    // Operadores de comparación
    EQUALS: 'Igual (==)',
    NOT_EQUALS: 'No igual (!=)',
    LESS_THAN: 'Menor que (<)',
    GREATER_THAN: 'Mayor que (>)',
    LESS_EQUALS: 'Menor o igual (<=)',
    GREATER_EQUALS: 'Mayor o igual (>=)',
    IDENTITY_EQUALS: 'Identidad igual (===)',
    IDENTITY_NOT_EQUALS: 'Identidad no igual (!==)',
    
    // Operadores lógicos
    AND: 'AND lógico (&&)',
    OR: 'OR lógico (||)',
    NOT: 'NOT lógico (!)',
    
    // Asignación
    ASSIGN: 'Asignación (=)',
    PLUS_ASSIGN: 'Suma y asigna (+=)',
    MINUS_ASSIGN: 'Resta y asigna (-=)',
    MULTIPLY_ASSIGN: 'Multiplica y asigna (*=)',
    DIVIDE_ASSIGN: 'Divide y asigna (/=)',
    MODULO_ASSIGN: 'Módulo y asigna (%=)',
    
    // Incremento/Decremento
    INCREMENT: 'Incremento (++)',
    DECREMENT: 'Decremento (--)',
    
    // Operadores especiales
    SAFE_CALL: 'Safe Call (?.)',
    NOT_NULL_ASSERTION: 'Not-null (!!)',
    ELVIS: 'Elvis (?:)',
    RANGE: 'Rango (..)',
    ARROW: 'Flecha (->)',
    DOUBLE_COLON: 'Referencia (::)',
    
    // Delimitadores
    LPAREN: 'Paréntesis Izq. (',
    RPAREN: 'Paréntesis Der. )',
    LBRACE: 'Llave Izq. {',
    RBRACE: 'Llave Der. }',
    LBRACKET: 'Corchete Izq. [',
    RBRACKET: 'Corchete Der. ]',
    
    // Separadores
    SEMICOLON: 'Punto y coma (;)',
    COMMA: 'Coma (,)',
    DOT: 'Punto (.)',
    COLON: 'Dos puntos (:)',
    
    // Comentarios
    LINE_COMMENT: 'Comentario de Línea',
    BLOCK_COMMENT: 'Comentario de Bloque',
    DOC_COMMENT: 'Comentario de Documentación',
    
    // Otros
    WHITESPACE: 'Espacio',
    NEWLINE: 'Nueva Línea',
    EOF: 'Fin de Archivo',
    UNKNOWN: 'Desconocido'
  };

  /**
   * Obtiene el nombre legible de una categoría de token
   * @param tokenType Tipo de token
   * @returns Nombre legible
   */
  static getCategoryName(tokenType: string): string {
    return this.CATEGORY_NAMES[tokenType] || tokenType;
  }
}
