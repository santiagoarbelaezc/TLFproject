/**
 * Enumeración de todos los tipos de tokens reconocidos
 * en el lenguaje Kotlin
 * 
 * @author Juan Sebastian Noreña
 * @date 2025
 */
export enum TokenType {
  // ==================== LITERALES ====================
  /** Número entero: 123, 456 */
  INTEGER = 'INTEGER',
  
  /** Número decimal: 3.14, 0.5 */
  DECIMAL = 'DECIMAL',
  
  /** Cadena de texto: "Hola mundo" */
  STRING = 'STRING',
  
  /** Carácter: 'A', 'b' */
  CHAR = 'CHAR',
  
  /** Raw string multilínea: """texto""" */
  RAW_STRING = 'RAW_STRING',
  
  /** String con template: "Valor: $x" */
  STRING_TEMPLATE = 'STRING_TEMPLATE',
  
  /** Literal booleano: true, false */
  BOOLEAN = 'BOOLEAN',
  
  /** Literal nulo: null */
  NULL = 'NULL',

  // ==================== IDENTIFICADORES ====================
  /** Identificador de variable, función, clase */
  IDENTIFIER = 'IDENTIFIER',
  
  /** Palabra reservada de Kotlin */
  KEYWORD = 'KEYWORD',

  // ==================== OPERADORES ARITMÉTICOS ====================
  /** Suma: + */
  PLUS = 'PLUS',
  
  /** Resta: - */
  MINUS = 'MINUS',
  
  /** Multiplicación: * */
  MULTIPLY = 'MULTIPLY',
  
  /** División: / */
  DIVIDE = 'DIVIDE',
  
  /** Módulo: % */
  MODULO = 'MODULO',

  // ==================== OPERADORES DE COMPARACIÓN ====================
  /** Igualdad: == */
  EQUALS = 'EQUALS',
  
  /** Desigualdad: != */
  NOT_EQUALS = 'NOT_EQUALS',
  
  /** Menor que: < */
  LESS_THAN = 'LESS_THAN',
  
  /** Mayor que: > */
  GREATER_THAN = 'GREATER_THAN',
  
  /** Menor o igual: <= */
  LESS_EQUALS = 'LESS_EQUALS',
  
  /** Mayor o igual: >= */
  GREATER_EQUALS = 'GREATER_EQUALS',
  
  /** Igualdad de identidad: === */
  IDENTITY_EQUALS = 'IDENTITY_EQUALS',
  
  /** Desigualdad de identidad: !== */
  IDENTITY_NOT_EQUALS = 'IDENTITY_NOT_EQUALS',

  // ==================== OPERADORES LÓGICOS ====================
  /** AND lógico: && */
  AND = 'AND',
  
  /** OR lógico: || */
  OR = 'OR',
  
  /** NOT lógico: ! */
  NOT = 'NOT',

  // ==================== OPERADORES DE ASIGNACIÓN ====================
  /** Asignación: = */
  ASSIGN = 'ASSIGN',
  
  /** Suma y asignación: += */
  PLUS_ASSIGN = 'PLUS_ASSIGN',
  
  /** Resta y asignación: -= */
  MINUS_ASSIGN = 'MINUS_ASSIGN',
  
  /** Multiplicación y asignación: *= */
  MULTIPLY_ASSIGN = 'MULTIPLY_ASSIGN',
  
  /** División y asignación: /= */
  DIVIDE_ASSIGN = 'DIVIDE_ASSIGN',
  
  /** Módulo y asignación: %= */
  MODULO_ASSIGN = 'MODULO_ASSIGN',

  // ==================== INCREMENTO/DECREMENTO ====================
  /** Incremento: ++ */
  INCREMENT = 'INCREMENT',
  
  /** Decremento: -- */
  DECREMENT = 'DECREMENT',

  // ==================== OPERADORES ESPECIALES DE KOTLIN ====================
  /** Safe call: ?. */
  SAFE_CALL = 'SAFE_CALL',
  
  /** Not-null assertion: !! */
  NOT_NULL_ASSERTION = 'NOT_NULL_ASSERTION',
  
  /** Elvis operator: ?: */
  ELVIS = 'ELVIS',
  
  /** Rango: .. */
  RANGE = 'RANGE',
  
  /** Arrow: -> */
  ARROW = 'ARROW',
  
  /** Double colon: :: */
  DOUBLE_COLON = 'DOUBLE_COLON',
  
  /** In operator: in */
  IN = 'IN',
  
  /** Not in operator: !in */
  NOT_IN = 'NOT_IN',
  
  /** Is operator: is */
  IS = 'IS',
  
  /** Not is operator: !is */
  NOT_IS = 'NOT_IS',
  
  /** As operator: as */
  AS = 'AS',
  
  /** Safe cast: as? */
  SAFE_CAST = 'SAFE_CAST',

  // ==================== DELIMITADORES ====================
  /** Paréntesis izquierdo: ( */
  LPAREN = 'LPAREN',
  
  /** Paréntesis derecho: ) */
  RPAREN = 'RPAREN',
  
  /** Llave izquierda: { */
  LBRACE = 'LBRACE',
  
  /** Llave derecha: } */
  RBRACE = 'RBRACE',
  
  /** Corchete izquierdo: [ */
  LBRACKET = 'LBRACKET',
  
  /** Corchete derecho: ] */
  RBRACKET = 'RBRACKET',

  // ==================== SEPARADORES ====================
  /** Punto y coma: ; */
  SEMICOLON = 'SEMICOLON',
  
  /** Coma: , */
  COMMA = 'COMMA',
  
  /** Punto: . */
  DOT = 'DOT',
  
  /** Dos puntos: : */
  COLON = 'COLON',

  // ==================== COMENTARIOS ====================
  /** Comentario de línea: // */
  LINE_COMMENT = 'LINE_COMMENT',
  
  /** Comentario de bloque: /* */ 
  BLOCK_COMMENT = 'BLOCK_COMMENT',
  
  /** Comentario de documentación: /** */ 
  DOC_COMMENT = 'DOC_COMMENT',

  // ==================== ESPACIOS EN BLANCO ====================
  /** Espacio en blanco */
  WHITESPACE = 'WHITESPACE',
  
  /** Salto de línea */
  NEWLINE = 'NEWLINE',

  // ==================== ESPECIALES ====================
  /** Fin de archivo */
  EOF = 'EOF',
  
  /** Token desconocido/inválido */
  UNKNOWN = 'UNKNOWN'
}
