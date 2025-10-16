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
      
      // Si no se reconoció, es un string/char sin cerrar
      const quoteType = currentChar === '"' ? 'cadena' : 'carácter';
      const closingQuote = currentChar;
      
      // Buscar hasta el final de línea o fin de archivo
      let endPos = position + 1;
      let lexeme = currentChar;
      while (endPos < input.length) {
        const char = input[endPos];
        if (char === '\n' || char === '\r') {
          break;
        }
        lexeme += char;
        endPos++;
      }
      
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

    // 3. Números
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
   * Valida un identificador individual
   * @param identifier Identificador a validar
   * @returns true si es válido, false si excede la longitud máxima
   */
  public validateIdentifier(identifier: string): boolean {
    return identifier.length <= Constants.MAX_IDENTIFIER_LENGTH;
  }
}
