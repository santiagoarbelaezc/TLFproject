/**
 * @file lexer.service.ts
 * @description Servicio principal del analizador léxico para Kotlin.
 * Coordina todos los autómatas y realiza el análisis completo del código fuente.
 * 
 * @date 2025
 */

import { Injectable } from '@angular/core';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';
import { LexicalError, LexicalErrorType } from '../models/lexical-error.model';
import { AnalysisResult, AnalysisStatistics } from '../models/analysis-result.model';
import { CharacterUtils } from '../utils/character-utils';
import { Constants } from '../utils/constants';

// Importar todos los autómatas
import { NumberAutomaton } from '../automata/number-automaton';
import { IdentifierAutomaton } from '../automata/identifier-automaton';
import { StringAutomaton } from '../automata/string-automaton';
import { CommentAutomaton } from '../automata/comment-automaton';
import { OperatorAutomaton } from '../automata/operator-automaton';
import { DelimiterAutomaton } from '../automata/delimiter-automaton';

/**
 * Resultado del reconocimiento de un token
 */
interface RecognitionResult {
  token?: Token;
  error?: LexicalError;
  skipLength?: number;
}

/**
 * Servicio principal del analizador léxico
 * 
 * Este servicio coordina todos los autómatas finitos deterministas
 * para realizar el análisis léxico completo de código Kotlin.
 */
@Injectable({
  providedIn: 'root'
})
export class LexerService {
  // Autómatas para cada categoría de token
  private numberAutomaton: NumberAutomaton;
  private identifierAutomaton: IdentifierAutomaton;
  private stringAutomaton: StringAutomaton;
  private commentAutomaton: CommentAutomaton;
  private operatorAutomaton: OperatorAutomaton;
  private delimiterAutomaton: DelimiterAutomaton;

  constructor() {
    // Inicializar todos los autómatas
    this.numberAutomaton = new NumberAutomaton();
    this.identifierAutomaton = new IdentifierAutomaton();
    this.stringAutomaton = new StringAutomaton();
    this.commentAutomaton = new CommentAutomaton();
    this.operatorAutomaton = new OperatorAutomaton();
    this.delimiterAutomaton = new DelimiterAutomaton();
  }

  /**
   * Analiza el código fuente completo y retorna todos los tokens y errores
   * @param input Código fuente a analizar
   * @returns Resultado completo del análisis léxico
   */
  public analyze(input: string): AnalysisResult {
    const startTime = performance.now();
    const tokens: Token[] = [];
    const errors: LexicalError[] = [];
    
    // Pila para validar balanceo de delimitadores
    const delimiterStack: Array<{token: Token, type: string}> = [];
    
    let position = 0;
    let line = 1;
    let column = 1;

    while (position < input.length) {
      const currentChar = input[position];

      // Saltar espacios en blanco y tabulaciones
      if (CharacterUtils.isWhitespace(currentChar) && currentChar !== '\n' && currentChar !== '\r') {
        position++;
        column++;
        continue;
      }

      // Manejar saltos de línea
      if (currentChar === '\n') {
        position++;
        line++;
        column = 1;
        continue;
      }

      if (currentChar === '\r') {
        position++;
        // Verificar si es \r\n
        if (position < input.length && input[position] === '\n') {
          position++;
        }
        line++;
        column = 1;
        continue;
      }

      // Intentar reconocer un token
      const result = this.recognizeToken(input, position, line, column);

      if (result && result.token) {
        // Token reconocido exitosamente
        tokens.push(result.token);
        
        // Validar balanceo de delimitadores
        this.checkDelimiterBalance(result.token, delimiterStack, errors);
        
        const tokenLength = result.token.length;
        position += tokenLength;
        column += tokenLength;
      } else if (result && result.error) {
        // Error específico detectado por un autómata
        errors.push(result.error);
        // Avanzar según el contexto del error
        if (result.skipLength && result.skipLength > 0) {
          position += result.skipLength;
          column += result.skipLength;
        } else {
          position++;
          column++;
        }
      } else {
        // Error: carácter no reconocido
        errors.push({
          type: LexicalErrorType.UNRECOGNIZED_TOKEN,
          message: `Carácter no reconocido: '${currentChar}'`,
          line,
          column,
          lexeme: currentChar
        });
        position++;
        column++;
      }
    }
    
    // Verificar delimitadores sin cerrar al final del archivo
    this.checkUnclosedDelimiters(delimiterStack, errors);

    // Agregar token EOF (End Of File)
    tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      line,
      column,
      position,
      length: 0
    });

    // Calcular tiempo de análisis
    const endTime = performance.now();
    const analysisTime = endTime - startTime;

    // Calcular estadísticas
    const statistics = this.calculateStatistics(tokens, errors, input);

    return {
      tokens,
      errors,
      success: errors.length === 0,
      analysisTime,
      statistics
    };
  }

  /**
   * Intenta reconocer un token en la posición actual usando todos los autómatas
   * @param input Texto de entrada
   * @param position Posición actual
   * @param line Línea actual
   * @param column Columna actual
   * @returns Resultado del reconocimiento (token exitoso o error específico)
   */
  private recognizeToken(
    input: string,
    position: number,
    line: number,
    column: number
  ): RecognitionResult | null {
    const currentChar = input[position];
    
    // Intentar con cada autómata en orden de prioridad
    
    // 1. Comentarios (deben ir antes de operadores para evitar confusión con /)
    if (currentChar === '/') {
      const token = this.commentAutomaton.recognize(input, position, line, column);
      if (token) {
        return { token };
      }
      
      // Si empieza con / y el segundo carácter es *, pero no es un comentario válido
      if (position + 1 < input.length && input[position + 1] === '*') {
        // Verificar si el comentario está sin cerrar
        const restOfInput = input.substring(position);
        if (!restOfInput.includes('*/')) {
          return {
            error: {
              type: LexicalErrorType.UNCLOSED_BLOCK_COMMENT,
              message: 'Comentario de bloque sin cerrar (falta */)',
              line,
              column,
              lexeme: input.substring(position, Math.min(position + 50, input.length))
            },
            skipLength: input.length - position // Saltar hasta el final
          };
        }
      }
    }

    // 2. Strings, chars, templates (ANTES de números para detectar errores)
    if (currentChar === '"' || currentChar === "'") {
      const token = this.stringAutomaton.recognize(input, position, line, column);
      if (token) {
        return { token };
      }
      
      // Si no se reconoció, puede ser por varias razones
      const quoteType = currentChar === '"' ? 'cadena' : 'carácter';
      const closingQuote = currentChar;
      
      // Buscar hasta el final de línea o comilla de cierre
      let endPos = position + 1;
      let lexeme = currentChar;
      let foundInvalidChar = false;
      let invalidChar = '';
      let invalidCharPos = -1;
      let foundClosingQuote = false;
      let foundInvalidEscape = false;
      let invalidEscapeChar = '';
      let invalidEscapePos = -1;
      let inEscape = false;
      
      while (endPos < input.length) {
        const char = input[endPos];
        
        // Detectar escape inválido
        if (inEscape) {
          if (!foundInvalidEscape && !CharacterUtils.isValidEscapeChar(char)) {
            foundInvalidEscape = true;
            invalidEscapeChar = char;
            invalidEscapePos = endPos - position;
          }
          inEscape = false;
        } else if (char === '\\') {
          inEscape = true;
        }
        
        // Detectar carácter Unicode inválido (pero continuar capturando)
        if (!foundInvalidChar && !CharacterUtils.isValidUnicodeChar(char)) {
          foundInvalidChar = true;
          invalidChar = char;
          invalidCharPos = endPos - position;
        }
        
        // Salto de línea termina el string
        if (char === '\n' || char === '\r') {
          break;
        }
        
        // Comilla de cierre termina el string
        if (char === closingQuote && !inEscape) {
          lexeme += char;
          endPos++;
          foundClosingQuote = true;
          break;
        }
        
        lexeme += char;
        endPos++;
      }
      
      // PRIORIDAD 1: Reportar escape inválido (más específico)
      if (foundInvalidEscape && foundClosingQuote) {
        const validEscapes = '\\n, \\t, \\r, \\b, \\\\, \\", \\\', \\$, \\uXXXX';
        return {
          error: {
            type: LexicalErrorType.INVALID_ESCAPE_SEQUENCE,
            message: `Secuencia de escape inválida: \\${invalidEscapeChar}. Solo se permiten: ${validEscapes}`,
            line,
            column: column + invalidEscapePos - 1,
            lexeme,
            suggestion: `Verifica la secuencia de escape. ¿Quisiste usar \\\\${invalidEscapeChar}?`
          },
          skipLength: lexeme.length
        };
      }
      
      // PRIORIDAD 2: Si encontramos un carácter inválido
      if (foundInvalidChar) {
        return {
          error: {
            type: LexicalErrorType.INVALID_UNICODE_CHAR,
            message: `Carácter Unicode inválido en ${quoteType}: '${invalidChar}' (U+${invalidChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`,
            line,
            column: column + invalidCharPos,
            lexeme
          },
          skipLength: lexeme.length
        };
      }
      
      // PRIORIDAD 3: String/char sin cerrar
      if (!foundClosingQuote) {
        return {
          error: {
            type: LexicalErrorType.UNCLOSED_STRING,
            message: `${quoteType.charAt(0).toUpperCase() + quoteType.slice(1)} sin cerrar (falta ${closingQuote})`,
            line,
            column,
            lexeme
          },
          skipLength: lexeme.length
        };
      }
      
      // Si llegamos aquí, el string estaba cerrado pero tenía algún error
      // que el autómata detectó. No deberíamos llegar aquí normalmente.
      return null;
    }    // 3. Números
    let token = this.numberAutomaton.recognize(input, position, line, column);
    if (token) return { token };

    // 4. Operadores (antes de delimitadores para reconocer operadores compuestos)
    token = this.operatorAutomaton.recognize(input, position, line, column);
    if (token) return { token };

    // 5. Identificadores y palabras reservadas
    token = this.identifierAutomaton.recognize(input, position, line, column);
    if (token) return { token };

    // 6. Delimitadores
    token = this.delimiterAutomaton.recognize(input, position, line, column);
    if (token) return { token };

    // No se pudo reconocer el token
    return null;
  }

  /**
   * Calcula estadísticas del análisis léxico
   * @param tokens Array de tokens reconocidos
   * @param errors Array de errores encontrados
   * @param input Código fuente original
   * @returns Estadísticas del análisis
   */
  private calculateStatistics(
    tokens: Token[],
    errors: LexicalError[],
    input: string
  ): AnalysisStatistics {
    // Contar tokens por tipo
    const tokenDistribution: { [key: string]: number } = {};
    
    tokens.forEach(token => {
      const typeName = token.type;
      tokenDistribution[typeName] = (tokenDistribution[typeName] || 0) + 1;
    });

    // Calcular número de líneas
    const lines = input.split('\n').length;

    // Contar palabras reservadas
    const keywordCount = tokens.filter(t => t.type === TokenType.KEYWORD).length;

    // Contar identificadores
    const identifierCount = tokens.filter(t => t.type === TokenType.IDENTIFIER).length;

    return {
      totalTokens: tokens.length - 1, // Restar EOF
      totalLines: lines,
      totalCharacters: input.length,
      tokenDistribution,
      keywordCount,
      identifierCount,
      operatorCount: tokens.filter(t => this.isOperator(t.type)).length,
      literalCount: tokens.filter(t => this.isLiteral(t.type)).length,
      commentCount: tokens.filter(t => this.isComment(t.type)).length
    };
  }

  /**
   * Verifica si un tipo de token es un operador
   */
  private isOperator(type: TokenType): boolean {
    const operators = [
      TokenType.PLUS, TokenType.MINUS, TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO,
      TokenType.EQUALS, TokenType.NOT_EQUALS, TokenType.LESS_THAN, TokenType.GREATER_THAN,
      TokenType.LESS_EQUALS, TokenType.GREATER_EQUALS, TokenType.IDENTITY_EQUALS, TokenType.IDENTITY_NOT_EQUALS,
      TokenType.AND, TokenType.OR, TokenType.NOT,
      TokenType.ASSIGN, TokenType.PLUS_ASSIGN, TokenType.MINUS_ASSIGN, TokenType.MULTIPLY_ASSIGN,
      TokenType.DIVIDE_ASSIGN, TokenType.MODULO_ASSIGN,
      TokenType.INCREMENT, TokenType.DECREMENT,
      TokenType.SAFE_CALL, TokenType.NOT_NULL_ASSERTION, TokenType.ELVIS, TokenType.RANGE,
      TokenType.ARROW, TokenType.DOUBLE_COLON, TokenType.AS, TokenType.SAFE_CAST
    ];
    return operators.includes(type);
  }

  /**
   * Verifica si un tipo de token es un literal
   */
  private isLiteral(type: TokenType): boolean {
    return [
      TokenType.INTEGER, TokenType.DECIMAL, TokenType.STRING, TokenType.CHAR,
      TokenType.RAW_STRING, TokenType.STRING_TEMPLATE, TokenType.BOOLEAN, TokenType.NULL
    ].includes(type);
  }

  /**
   * Verifica si un tipo de token es un comentario
   */
  private isComment(type: TokenType): boolean {
    return [
      TokenType.LINE_COMMENT, TokenType.BLOCK_COMMENT, TokenType.DOC_COMMENT
    ].includes(type);
  }

  /**
   * Verifica si un tipo de token es un delimitador
   */
  private isDelimiter(type: TokenType): boolean {
    return [
      TokenType.LPAREN, TokenType.RPAREN, TokenType.LBRACE, TokenType.RBRACE,
      TokenType.LBRACKET, TokenType.RBRACKET, TokenType.SEMICOLON, TokenType.COMMA,
      TokenType.DOT, TokenType.COLON
    ].includes(type);
  }

  /**
   * Verifica el balanceo de delimitadores (paréntesis, llaves, corchetes)
   * Agrega el delimitador de apertura a la pila o valida el de cierre
   * @param token Token a verificar
   * @param stack Pila de delimitadores abiertos
   * @param errors Array de errores donde agregar errores de balanceo
   */
  private checkDelimiterBalance(
    token: Token,
    stack: Array<{token: Token, type: string}>,
    errors: LexicalError[]
  ): void {
    // Solo procesar delimitadores de apertura y cierre
    const openDelimiters = [TokenType.LPAREN, TokenType.LBRACE, TokenType.LBRACKET];
    const closeDelimiters = [TokenType.RPAREN, TokenType.RBRACE, TokenType.RBRACKET];
    
    if (openDelimiters.includes(token.type)) {
      // Delimitador de apertura: agregar a la pila
      const delimiterType = this.getDelimiterType(token.type);
      stack.push({ token, type: delimiterType });
    } else if (closeDelimiters.includes(token.type)) {
      // Delimitador de cierre: verificar que coincida con el último abierto
      const delimiterType = this.getDelimiterType(token.type);
      
      if (stack.length === 0) {
        // Error: delimitador de cierre sin apertura
        errors.push({
          type: LexicalErrorType.UNEXPECTED_CLOSING_DELIMITER,
          message: `Delimitador de cierre '${token.lexeme}' sin apertura correspondiente`,
          line: token.line,
          column: token.column,
          lexeme: token.lexeme,
          suggestion: `Verifica que exista un '${this.getOpeningDelimiter(token.lexeme)}' antes de este cierre`
        });
      } else {
        const lastOpen = stack[stack.length - 1];
        
        if (lastOpen.type === delimiterType) {
          // Correcto: coincide con el último abierto
          stack.pop();
        } else {
          // Error: el cierre no coincide con el último abierto
          errors.push({
            type: LexicalErrorType.UNEXPECTED_CLOSING_DELIMITER,
            message: `Se esperaba '${this.getClosingDelimiter(lastOpen.type)}' pero se encontró '${token.lexeme}'`,
            line: token.line,
            column: token.column,
            lexeme: token.lexeme,
            suggestion: `El '${lastOpen.token.lexeme}' en línea ${lastOpen.token.line}:${lastOpen.token.column} debe cerrarse con '${this.getClosingDelimiter(lastOpen.type)}'`
          });
        }
      }
    }
  }

  /**
   * Verifica si quedan delimitadores sin cerrar al final del archivo
   * @param stack Pila de delimitadores abiertos
   * @param errors Array de errores donde agregar errores de delimitadores sin cerrar
   */
  private checkUnclosedDelimiters(
    stack: Array<{token: Token, type: string}>,
    errors: LexicalError[]
  ): void {
    // Reportar todos los delimitadores que quedaron sin cerrar
    while (stack.length > 0) {
      const unclosed = stack.pop()!;
      const errorType = this.getUnclosedErrorType(unclosed.type);
      const closingDelimiter = this.getClosingDelimiter(unclosed.type);
      
      errors.push({
        type: errorType,
        message: `${this.getDelimiterName(unclosed.type)} sin cerrar (falta '${closingDelimiter}')`,
        line: unclosed.token.line,
        column: unclosed.token.column,
        lexeme: unclosed.token.lexeme,
        suggestion: `Agrega '${closingDelimiter}' para cerrar el '${unclosed.token.lexeme}' de la línea ${unclosed.token.line}`
      });
    }
  }

  /**
   * Obtiene el tipo de delimitador (paren, brace, bracket)
   */
  private getDelimiterType(tokenType: TokenType): string {
    switch (tokenType) {
      case TokenType.LPAREN:
      case TokenType.RPAREN:
        return 'paren';
      case TokenType.LBRACE:
      case TokenType.RBRACE:
        return 'brace';
      case TokenType.LBRACKET:
      case TokenType.RBRACKET:
        return 'bracket';
      default:
        return 'unknown';
    }
  }

  /**
   * Obtiene el tipo de error para un delimitador sin cerrar
   */
  private getUnclosedErrorType(delimiterType: string): LexicalErrorType {
    switch (delimiterType) {
      case 'paren':
        return LexicalErrorType.UNMATCHED_PAREN;
      case 'brace':
        return LexicalErrorType.UNMATCHED_BRACE;
      case 'bracket':
        return LexicalErrorType.UNMATCHED_BRACKET;
      default:
        return LexicalErrorType.UNRECOGNIZED_TOKEN;
    }
  }

  /**
   * Obtiene el delimitador de cierre correspondiente
   */
  private getClosingDelimiter(delimiterType: string): string {
    switch (delimiterType) {
      case 'paren':
        return ')';
      case 'brace':
        return '}';
      case 'bracket':
        return ']';
      default:
        return '';
    }
  }

  /**
   * Obtiene el delimitador de apertura correspondiente
   */
  private getOpeningDelimiter(closingDelimiter: string): string {
    switch (closingDelimiter) {
      case ')':
        return '(';
      case '}':
        return '{';
      case ']':
        return '[';
      default:
        return '';
    }
  }

  /**
   * Obtiene el nombre descriptivo del delimitador
   */
  private getDelimiterName(delimiterType: string): string {
    switch (delimiterType) {
      case 'paren':
        return 'Paréntesis';
      case 'brace':
        return 'Llave';
      case 'bracket':
        return 'Corchete';
      default:
        return 'Delimitador';
    }
  }

  /**
   * Valida un identificador individual
   * @param identifier Identificador a validar
   * @returns true si es válido, false si excede la longitud máxima
   */
  public validateIdentifier(identifier: string): boolean {
    return identifier.length <= Constants.MAX_IDENTIFIER_LENGTH;
  }
}
