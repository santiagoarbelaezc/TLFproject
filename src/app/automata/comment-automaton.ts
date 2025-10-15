/**
 * @file comment-automaton.ts
 * @description Autómata Finito Determinista (AFD) para el reconocimiento de comentarios
 * en el lenguaje Kotlin, incluyendo comentarios de línea, bloque y documentación.
 * 
 * Gramática:
 * - Comentario de línea: dos barras seguidas de cualquier texto hasta fin de línea
 * - Comentario de bloque: barra-asterisco hasta asterisco-barra
 * - Comentario de documentación: barra-asterisco-asterisco hasta asterisco-barra
 * 
 * Estados del AFD:
 * - START: Estado inicial
 * - SLASH: Se encontró barra
 * - LINE_COMMENT: Dentro de comentario de línea
 * - BLOCK_COMMENT_START: Se encontró inicio de bloque
 * - BLOCK_COMMENT: Dentro de comentario de bloque
 * - BLOCK_COMMENT_STAR: Se encontró asterisco dentro de bloque
 * - DOC_COMMENT: Comentario de documentación
 * - ACCEPT: Comentario válido reconocido
 * - REJECT: Comentario inválido (bloque sin cerrar)
 */

import { BaseAutomaton } from './base-automaton';
import { Token } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';

/**
 * Estados posibles del autómata de comentarios
 */
enum CommentState {
  START = 'START',
  SLASH = 'SLASH',
  LINE_COMMENT = 'LINE_COMMENT',
  BLOCK_COMMENT_START = 'BLOCK_COMMENT_START',
  BLOCK_COMMENT = 'BLOCK_COMMENT',
  BLOCK_COMMENT_STAR = 'BLOCK_COMMENT_STAR',
  DOC_COMMENT = 'DOC_COMMENT',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

/**
 * Autómata para reconocer comentarios de línea, bloque y documentación de Kotlin
 */
export class CommentAutomaton extends BaseAutomaton {
  private state: CommentState = CommentState.START;

  /**
   * Método principal que reconoce comentarios carácter por carácter
   * @param input Texto completo de entrada
   * @param startPos Posición inicial donde comenzar el reconocimiento
   * @param line Línea actual en el código fuente
   * @param column Columna actual en el código fuente
   * @returns Token reconocido o null si no es un comentario válido
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

    // Un comentario debe empezar con /
    if (firstChar !== '/') {
      return null;
    }

    this.state = CommentState.SLASH;
    this.consume(input, pos);

    const secondChar = this.peek(input, pos.value);

    if (secondChar === '/') {
      // Comentario de línea
      return this.recognizeLineComment(input, pos, line, column, startPos);
    } else if (secondChar === '*') {
      // Comentario de bloque o documentación
      this.consume(input, pos); // Consumir *
      
      // Verificar si es comentario de documentación (**)
      if (this.peek(input, pos.value) === '*') {
        return this.recognizeDocComment(input, pos, line, column, startPos);
      } else {
        return this.recognizeBlockComment(input, pos, line, column, startPos);
      }
    }

    // No es un comentario válido
    return null;
  }

  /**
   * Reconoce un comentario de línea (// comentario)
   */
  private recognizeLineComment(
    input: string,
    pos: { value: number },
    line: number,
    column: number,
    startPos: number
  ): Token | null {
    this.state = CommentState.LINE_COMMENT;
    this.consume(input, pos); // Consumir el segundo /

    let commentContent = '';

    // Consumir hasta el final de la línea o del archivo
    while (pos.value < input.length) {
      const char = this.peek(input, pos.value);
      
      if (char === '\n' || char === '\r') {
        // Fin del comentario de línea (no consumimos el salto de línea)
        break;
      }

      commentContent += char;
      this.consume(input, pos);
    }

    this.state = CommentState.ACCEPT;
    const lexeme = input.substring(startPos, pos.value);
    
    return this.createToken(
      TokenType.LINE_COMMENT,
      lexeme,
      line,
      column,
      startPos,
      commentContent.trim()
    );
  }

  /**
   * Reconoce un comentario de bloque (/* comentario *\/)
   */
  private recognizeBlockComment(
    input: string,
    pos: { value: number },
    line: number,
    column: number,
    startPos: number
  ): Token | null {
    this.state = CommentState.BLOCK_COMMENT;

    let commentContent = '';
    let nestingLevel = 1; // Kotlin soporta comentarios anidados

    while (pos.value < input.length && nestingLevel > 0) {
      const char = this.peek(input, pos.value);

      if (char === '*' && this.peek(input, pos.value, 1) === '/') {
        // Posible cierre de comentario
        nestingLevel--;
        
        if (nestingLevel === 0) {
          // Fin del comentario
          this.consume(input, pos); // Consumir *
          this.consume(input, pos); // Consumir /
          this.state = CommentState.ACCEPT;
          
          const lexeme = input.substring(startPos, pos.value);
          return this.createToken(
            TokenType.BLOCK_COMMENT,
            lexeme,
            line,
            column,
            startPos,
            commentContent.trim()
          );
        } else {
          // Comentario anidado cerrado
          commentContent += char;
          this.consume(input, pos);
        }
      } else if (char === '/' && this.peek(input, pos.value, 1) === '*') {
        // Inicio de comentario anidado
        nestingLevel++;
        commentContent += char;
        this.consume(input, pos);
      } else {
        // Carácter normal del comentario
        commentContent += char;
        this.consume(input, pos);
      }
    }

    // Si llegamos aquí, el comentario no se cerró
    this.state = CommentState.REJECT;
    return null;
  }

  /**
   * Reconoce un comentario de documentación (/** comentario *\/)
   */
  private recognizeDocComment(
    input: string,
    pos: { value: number },
    line: number,
    column: number,
    startPos: number
  ): Token | null {
    this.state = CommentState.DOC_COMMENT;
    this.consume(input, pos); // Consumir el segundo *

    let commentContent = '';

    while (pos.value < input.length) {
      const char = this.peek(input, pos.value);

      if (char === '*' && this.peek(input, pos.value, 1) === '/') {
        // Fin del comentario de documentación
        this.consume(input, pos); // Consumir *
        this.consume(input, pos); // Consumir /
        this.state = CommentState.ACCEPT;
        
        const lexeme = input.substring(startPos, pos.value);
        return this.createToken(
          TokenType.DOC_COMMENT,
          lexeme,
          line,
          column,
          startPos,
          commentContent.trim()
        );
      } else {
        // Carácter normal del comentario
        commentContent += char;
        this.consume(input, pos);
      }
    }

    // Si llegamos aquí, el comentario no se cerró
    this.state = CommentState.REJECT;
    return null;
  }

  /**
   * Reinicia el estado del autómata
   */
  private reset(): void {
    this.state = CommentState.START;
  }

  /**
   * Verifica si el autómata está en estado de aceptación
   */
  public isAccepting(): boolean {
    return this.state === CommentState.ACCEPT;
  }

  /**
   * Verifica si el autómata está en estado de rechazo
   */
  public isRejecting(): boolean {
    return this.state === CommentState.REJECT;
  }

  /**
   * Obtiene el estado actual del autómata
   */
  public getState(): string {
    return this.state;
  }
}
