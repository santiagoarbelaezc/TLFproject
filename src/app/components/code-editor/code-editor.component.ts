import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LexerService } from '../../services/lexer.service';
import { AnalysisResult } from '../../models/analysis-result.model';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

/**
 * Componente editor de código para el analizador léxico
 * 
 * Características:
 * - Editor de código con números de línea sincronizados
 * - Botón de análisis léxico
 * - Contador de líneas y caracteres
 * - Limpieza de código con confirmación modal
 * - Ejemplos predefinidos
 * 
 * @date 2025
 */
@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.css'
})
export class CodeEditorComponent {
  /** Código fuente a analizar */
  sourceCode: string = '';

  /** Indica si se está analizando el código */
  isAnalyzing: boolean = false;

  /** Resultado del último análisis */
  lastAnalysisResult: AnalysisResult | null = null;

  /** Estado del modal de confirmación de limpieza */
  showClearModal: boolean = false;

  /** Valor seleccionado del selector de ejemplos */
  selectedExample: string = '';

  /** Emite el resultado del análisis al componente padre */
  @Output() analysisComplete = new EventEmitter<AnalysisResult>();

  /** Referencias a elementos del DOM */
  @ViewChild('lineNumbers') lineNumbers!: ElementRef<HTMLDivElement>;
  @ViewChild('codeTextarea') codeTextarea!: ElementRef<HTMLTextAreaElement>;

  constructor(private lexerService: LexerService) {
    this.loadDefaultExample();
  }

  /**
   * Sincroniza el scroll de los números de línea con el textarea
   */
  syncScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (this.lineNumbers) {
      this.lineNumbers.nativeElement.scrollTop = textarea.scrollTop;
    }
  }

  /**
   * Carga un ejemplo de código Kotlin por defecto
   */
  loadDefaultExample(): void {
    this.sourceCode = `// Ejemplo de código Kotlin
fun calcularArea(base: Int, altura: Int): Int {
    return base * altura
}

val nombre = "Juan"
var edad = 25
val suma = 10 + 20

// String template
println("Hola \$nombre, tienes \$edad años")

// Estructuras de control
if (edad > 18) {
    println("Mayor de edad")
} else {
    println("Menor de edad")
}

/* Comentario
   multilínea */
for (i in 1..10) {
    println(i)
}`;
  }

  /**
   * Analiza el código fuente usando el LexerService
   */
  analyzeCode(): void {
    if (this.sourceCode.trim() === '') {
      alert('Por favor ingrese código para analizar');
      return;
    }

    this.isAnalyzing = true;

    // Simular un pequeño delay para mostrar el estado de carga
    setTimeout(() => {
      const result = this.lexerService.analyze(this.sourceCode);
      this.lastAnalysisResult = result;
      this.analysisComplete.emit(result);
      this.isAnalyzing = false;

      console.log('Análisis completado:', result);
    }, 300);
  }

  /**
   * Muestra el modal de confirmación para limpiar código
   */
  clearCode(): void {
    this.showClearModal = true;
  }

  /**
   * Confirma y ejecuta la limpieza del código
   */
  confirmClear(): void {
    this.sourceCode = '';
    this.lastAnalysisResult = null;
    this.showClearModal = false;
  }

  /**
   * Cancela la limpieza del código
   */
  cancelClear(): void {
    this.showClearModal = false;
  }

  /**
   * Obtiene el número de líneas del código
   */
  get lineCount(): number {
    return this.sourceCode.split('\n').length;
  }

  /**
   * Obtiene el número de caracteres del código
   */
  get charCount(): number {
    return this.sourceCode.length;
  }

  /**
   * Inserta un ejemplo de código específico
   */
  insertExample(exampleType: string): void {
    if (!exampleType) return; // No hacer nada si está vacío
    
    switch (exampleType) {
      case 'variables':
        this.sourceCode = `// Variables en Kotlin
val nombre = "María"
var edad = 30
val pi = 3.14159
var activo = true`;
        break;

      case 'functions':
        this.sourceCode = `// Funciones en Kotlin
fun sumar(a: Int, b: Int): Int {
    return a + b
}

fun saludar(nombre: String) {
    println("Hola \$nombre")
}`;
        break;

      case 'classes':
        this.sourceCode = `// Clases en Kotlin
data class Persona(val nombre: String, var edad: Int)

class Calculadora {
    fun sumar(a: Int, b: Int) = a + b
    fun restar(a: Int, b: Int) = a - b
}`;
        break;

      case 'control':
        this.sourceCode = `// Estructuras de control
if (x > 10) {
    println("Mayor que 10")
}

when (x) {
    1 -> println("Uno")
    2 -> println("Dos")
    else -> println("Otro")
}

for (i in 1..5) {
    println(i)
}`;
        break;

      case 'operators':
        this.sourceCode = `// Operadores de Kotlin
val suma = 10 + 20
val producto = 5 * 3
val comparacion = x == y
val logico = a && b
val elvis = nombre ?: "Desconocido"
val safeCall = persona?.nombre`;
        break;

      case 'escape-valid':
        this.sourceCode = `// EJEMPLO CORRECTO - Caracteres especiales válidos
// Solo estos escapes son válidos en Kotlin:
// \\n \\t \\r \\b \\\\ \\" \\' \\$ \\uXXXX

fun main() {
    // Salto de línea (\\n)
    val mensaje1 = "Primera línea\\nSegunda línea"
    
    // Tabulación (\\t)
    val columnas = "Nombre\\tEdad\\tCiudad"
    
    // Retorno de carro (\\r)
    val retorno = "Texto\\rInicio"
    
    // Backspace (\\b)
    val borrar = "ABC\\bD"
    
    // Barra invertida (\\\\)
    val ruta = "C:\\\\Users\\\\Documents"
    
    // Comilla doble (\\")
    val cita = "Él dijo: \\"Hola\\""
    
    // Comilla simple (\\')
    val char1 = '\\''
    
    // Signo de dólar (\\$)
    val precio = "Costo: \\$100"
    
    // Combinados
    val complejo = "Línea 1\\n\\tNombre: Juan\\n\\tEdad: 25"
    
    println("Todos los escapes son válidos")
}`;
        break;

      case 'escape-error1':
        this.sourceCode = `// ERROR 1: Secuencia de escape \\f (form feed) - NO VÁLIDA
// Solo se permiten: \\n \\t \\r \\b \\\\ \\" \\' \\$ \\uXXXX

fun main() {
    val texto = "Hola\\fMundo"
    
    // ERROR: \\f no es un escape válido en Kotlin
    // El analizador debe reportar:
    // "Secuencia de escape inválida: \\f"
    
    println(texto)
}`;
        break;

      case 'escape-error2':
        this.sourceCode = `// ERROR 2: Secuencia de escape \\v (vertical tab) - NO VÁLIDA
// Solo se permiten: \\n \\t \\r \\b \\\\ \\" \\' \\$ \\uXXXX

fun main() {
    val texto = "Columna1\\vColumna2"
    
    // ERROR: \\v no es un escape válido en Kotlin
    // El analizador debe reportar:
    // "Secuencia de escape inválida: \\v"
    
    println(texto)
}`;
        break;

      case 'escape-error3':
        this.sourceCode = `// ERROR 3: Secuencia de escape \\x (hex) - NO VÁLIDA
// Solo se permiten: \\n \\t \\r \\b \\\\ \\" \\' \\$ \\uXXXX
// Nota: \\xHH NO es válido, debe usar \\uXXXX (4 dígitos)

fun main() {
    val texto = "Carácter: \\xFF"
    
    // ERROR: \\x no es un escape válido en Kotlin
    // El analizador debe reportar:
    // "Secuencia de escape inválida: \\x"
    
    println(texto)
}`;
        break;

      case 'escape-error4':
        this.sourceCode = `// ERROR 4: Múltiples secuencias de escape inválidas
// Solo se permiten: \\n \\t \\r \\b \\\\ \\" \\' \\$ \\uXXXX

fun main() {
    val error1 = "Texto\\aConAlarma"     // \\a = alarma (NO VÁLIDO)
    val error2 = "Texto\\0ConNull"       // \\0 = null (NO VÁLIDO)
    val error3 = "Texto\\eConEscape"     // \\e = escape (NO VÁLIDO)
    
    // ERRORES: \\a, \\0, \\e no son escapes válidos
    // El analizador debe reportar cada uno:
    // - "Secuencia de escape inválida: \\a"
    // - "Secuencia de escape inválida: \\0"
    // - "Secuencia de escape inválida: \\e"
         �
    
    println(error1)
    println(error2)
    println(error3)
}`;
        break;

      case 'delimiter-valid':
        this.sourceCode = `// EJEMPLO CORRECTO - Delimitadores balanceados
// Todos los paréntesis, llaves y corchetes están correctamente balanceados

fun calcular(a: Int, b: Int): Int {
    val resultado = (a + b) * 2
    val lista = listOf(1, 2, 3)
    val array = arrayOf(1, 2, 3)
    
    if (a > 0) {
        println("Positivo")
    } else {
        println("Negativo o cero")
    }
    
    val map = mapOf("uno" to 1, "dos" to 2)
    
    return resultado
}

class Ejemplo {
    fun metodo() {
        val x = (1 + 2) * (3 + 4)
        val y = listOf(arrayOf(1, 2), arrayOf(3, 4))
    }
}`;
        break;

      case 'delimiter-error1':
        this.sourceCode = `// ERROR 1: Paréntesis sin cerrar
// Falta cerrar un paréntesis

fun main() {
    val resultado = (10 + 20
    
    // ERROR: Paréntesis '(' en línea 4 sin cerrar
    // El analizador debe reportar:
    // "Paréntesis sin cerrar (falta ')')"
    
    println(resultado)
}`;
        break;

      case 'delimiter-error2':
        this.sourceCode = `// ERROR 2: Llave sin cerrar
// Falta cerrar una llave

fun main() {
    if (true) {
        println("Hola")
    
    // ERROR: Llave '{' en línea 5 sin cerrar
    // El analizador debe reportar:
    // "Llave sin cerrar (falta '}')"
    
    println("Mundo")
}`;
        break;

      case 'delimiter-error3':
        this.sourceCode = `// ERROR 3: Corchete sin cerrar
// Falta cerrar un corchete

fun main() {
    val lista = listOf(1, 2, 3)
    val elemento = lista[0
    
    // ERROR: Corchete '[' en línea 5 sin cerrar
    // El analizador debe reportar:
    // "Corchete sin cerrar (falta ']')"
    
    println(elemento)
}`;
        break;

      case 'delimiter-error4':
        this.sourceCode = `// ERROR 4: Delimitador de cierre sin apertura
// Hay un paréntesis de cierre sin su correspondiente apertura

fun main() {
    val x = 10 + 20)
    
    // ERROR: Paréntesis ')' en línea 4 sin apertura
    // El analizador debe reportar:
    // "Delimitador de cierre ')' sin apertura correspondiente"
    
    println(x)
}`;
        break;

      case 'delimiter-error5':
        this.sourceCode = `// ERROR 5: Delimitadores desbalanceados (mixtos)
// Se abre con un tipo y se cierra con otro

fun main() {
    val resultado = (10 + 20]
    
    // ERROR: Se esperaba ')' pero se encontró ']'
    // El analizador debe reportar:
    // "Se esperaba ')' pero se encontró ']'"
    
    val lista = [1, 2, 3)
    
    // ERROR: Se esperaba ']' pero se encontró ')'
    
    println(resultado)
}`;
        break;
    }
    
    // Resetear el selector a la opción por defecto
    this.selectedExample = '';
  }
}
