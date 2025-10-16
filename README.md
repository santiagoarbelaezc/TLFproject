# 🔍 Analizador Léxico para Kotlin - Teoría de Lenguajes Formales

[![Angular](https://img.shields.io/badge/Angular-18.2.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Proyecto Final - Universidad de Antioquia**  
*Implementación de un Analizador Léxico para Kotlin con Autómatas Finitos Deterministas (AFD)*

---

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características](#-características)
- [🛠 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🏗 Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [📁 Estructura de Carpetas](#-estructura-de-carpetas)
- [🎫 Tokens Reconocidos](#-tokens-reconocidos)
- [🚀 Instalación](#-instalación)
- [💻 Uso](#-uso)
- [🔧 Desarrollo](#-desarrollo)
- [🤖 Autómatas Finitos Deterministas](#-autómatas-finitos-deterministas)
- [⚠️ Manejo de Errores](#️-manejo-de-errores)
- [👥 Contribuidores](#-contribuidores)
- [📚 Referencias](#-referencias)
- [📄 Licencia](#-licencia)
- [🎓 Universidad](#-universidad)
- [📝 Ejemplos](#-ejemplos)

---

## 🎯 Descripción del Proyecto

Este proyecto implementa un **Analizador Léxico** (Lexer) completo basado en **Autómatas Finitos Deterministas (AFD)** para el reconocimiento de tokens del lenguaje de programación **Kotlin**. El analizador procesa código fuente Kotlin carácter por carácter, identificando y clasificando los elementos léxicos sin utilizar expresiones regulares nativas del lenguaje de programación.

### Objetivos Académicos

1. ✅ Diseñar e implementar AFDs para cada categoría de tokens
2. ✅ Crear una interfaz gráfica intuitiva para el análisis léxico
3. ✅ Detectar errores léxicos específicos del lenguaje
4. ✅ Generar una tabla de tokens con lexema, categoría y posición
5. ✅ Aplicar buenas prácticas de desarrollo y documentación

### Alcance del Proyecto

- **Lenguaje Objetivo**: Kotlin (sintaxis completa)
- **Método de Análisis**: Autómatas Finitos Deterministas (sin regex nativas)
- **Interfaz**: Aplicación web moderna con Angular
- **Características**: Análisis en tiempo real, detección de errores, exportación de resultados

---

## ✨ Características

- 🔤 **Reconocimiento de 15+ categorías de tokens** de Kotlin
- 🎨 **Interfaz gráfica moderna y responsive** construida con Angular Material
- ⚡ **Análisis en tiempo real** carácter por carácter
- 📊 **Tabla interactiva de tokens** con información detallada (tipo, lexema, posición)
- 🐛 **Detección de errores léxicos** con mensajes descriptivos y ubicación precisa
- 🎯 **Resaltado de sintaxis** según la categoría del token reconocido
- 💾 **Exportación de resultados** en formatos JSON y CSV
- 📱 **Diseño responsive** adaptable a diferentes dispositivos
- 🔍 **Vista detallada de AFDs** con diagramas de estados
- 📈 **Estadísticas del análisis** con métricas de rendimiento

---

## 🛠 Tecnologías Utilizadas

### Framework Frontend
- **Angular 18.2.0** - Framework principal para la aplicación web
- **TypeScript 5.5.2** - Lenguaje de programación con tipado estático
- **RxJS 7.8.0** - Programación reactiva para manejo de eventos asíncronos

### Herramientas de Desarrollo
- **Angular CLI 18.2.9** - Interfaz de línea de comandos para Angular
- **Karma & Jasmine** - Framework de testing unitario
- **ESLint** - Linter para mantener calidad y estándares del código

### Librerías Adicionales
- **Angular Material** - Componentes UI según Material Design
- **PrimeNG** - Componentes avanzados de tabla de datos (alternativa)
- **Monaco Editor** - Editor de código avanzado con resaltado de sintaxis

### Control de Versiones y Colaboración
- **Git & GitHub** - Sistema de control de versiones y plataforma de colaboración

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue una **arquitectura modular y orientada a servicios**, separando claramente las responsabilidades en diferentes capas:

```
┌─────────────────────────────────────────────────┐
│            PRESENTACIÓN (UI Layer)              │
│  ┌─────────────────────────────────────────────┐ │
│  │  • Componentes Angular (CodeEditor,         │ │
│  │    TokenTable, ErrorPanel, Statistics)      │ │
│  │  • Templates HTML y estilos CSS/SCSS       │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────┬─────────────────────────────────┘
                  │
┌─────────────────▼─────────────────────────────────┐
│        LÓGICA DE NEGOCIO (Service Layer)          │
│  ┌─────────────────────────────────────────────┐ │
│  │  • LexerService (Coordinador principal)     │ │
│  │  • TokenService (Gestión de tokens)         │ │
│  │  • ErrorService (Manejo de errores)         │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────┬─────────────────────────────────┘
                  │
┌─────────────────▼─────────────────────────────────┐
│          AUTÓMATAS (Automata Layer)               │
│  ┌─────────────────────────────────────────────┐ │
│  │  • BaseAutomaton (Clase abstracta)          │ │
│  │  • NumberAutomaton (Números enteros/dec)    │ │
│  │  • IdentifierAutomaton (IDs y keywords)     │ │
│  │  • StringAutomaton (Cadenas y chars)        │ │
│  │  • CommentAutomaton (Comentarios)           │ │
│  │  • OperatorAutomaton (Operadores)           │ │
│  │  • DelimiterAutomaton (Delimitadores)       │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────┬─────────────────────────────────┘
                  │
┌─────────────────▼─────────────────────────────────┐
│           MODELOS (Data Layer)                    │
│  ┌─────────────────────────────────────────────┐ │
│  │  • Token (Interface principal)              │ │
│  │  • LexicalError (Tipos de error)            │ │
│  │  • AnalysisResult (Resultado completo)      │ │
│  │  • TokenType (Enum de categorías)           │ │
│  └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### Principios de Diseño Aplicados

- **Separation of Concerns (SoC)**: Cada capa tiene responsabilidades bien definidas
- **Single Responsibility Principle (SRP)**: Cada autómata reconoce únicamente una categoría de tokens
- **Open/Closed Principle (OCP)**: Arquitectura extensible para agregar nuevos tipos de tokens
- **Dependency Injection**: Inyección de dependencias nativa de Angular
- **Modularidad**: Código organizado en módulos reutilizables y mantenibles

---

## 📁 Estructura de Carpetas

```
TLFproject/
│
├── 📄 README.md                          # Documentación del proyecto
├── 📄 package.json                       # Dependencias y configuración de Node.js
├── 📄 angular.json                       # Configuración específica de Angular
├── 📄 tsconfig.json                      # Configuración de TypeScript
├── 📄 tsconfig.app.json                  # Configuración de la aplicación
├── 📄 tsconfig.spec.json                 # Configuración de tests
│
├── 📁 public/                            # Recursos públicos estáticos
│   └── 📄 favicon.ico                    # Ícono de la aplicación
│
├── 📁 src/
│   ├── 📄 index.html                     # HTML principal de la aplicación
│   ├── 📄 main.ts                        # Punto de entrada de Angular
│   ├── 📄 styles.css                     # Estilos globales
│   │
│   └── 📁 app/
│       ├── 📄 app.component.ts           # Componente raíz de la aplicación
│       ├── 📄 app.component.html         # Template del componente raíz
│       ├── 📄 app.component.css          # Estilos del componente raíz
│       ├── 📄 app.config.ts              # Configuración de la aplicación
│       ├── 📄 app.routes.ts              # Definición de rutas
│       │
│       ├── 📁 components/                # Componentes de interfaz de usuario
│       │   ├── 📁 code-editor/           # Editor de código fuente
│       │   ├── 📁 token-table/           # Tabla de tokens reconocidos
│       │   ├── 📁 error-panel/           # Panel de errores léxicos
│       │   └── 📁 statistics/            # Estadísticas del análisis
│       │
│       ├── 📁 services/                  # Servicios de lógica de negocio
│       │   ├── 📄 lexer.service.ts       # Servicio principal del analizador
│       │   ├── 📄 token.service.ts       # Gestión y manipulación de tokens
│       │   └── 📄 error.service.ts       # Gestión de errores léxicos
│       │
│       ├── 📁 automata/                  # Implementación de AFDs
│       │   ├── 📄 base-automaton.ts      # Clase base abstracta para autómatas
│       │   ├── 📄 number-automaton.ts    # ✅ AFD para números (implementado)
│       │   ├── 📄 identifier-automaton.ts # AFD para identificadores
│       │   ├── 📄 string-automaton.ts    # AFD para cadenas de caracteres
│       │   ├── 📄 comment-automaton.ts   # AFD para comentarios
│       │   ├── 📄 operator-automaton.ts  # AFD para operadores
│       │   └── 📄 delimiter-automaton.ts # AFD para delimitadores
│       │
│       ├── 📁 models/                    # Interfaces y tipos de datos
│       │   ├── 📄 token.model.ts         # ✅ Interface Token (implementado)
│       │   ├── 📄 token-type.enum.ts     # ✅ Enum de tipos de tokens (implementado)
│       │   ├── 📄 lexical-error.model.ts # ✅ Interface de errores (implementado)
│       │   └── 📄 analysis-result.model.ts # ✅ Resultado del análisis (implementado)
│       │
│       ├── 📁 utils/                     # Utilidades y helpers
│       │   ├── 📄 character-utils.ts     # ✅ Utilidades para caracteres (implementado)
│       │   ├── 📄 reserved-words.ts      # ✅ Palabras reservadas de Kotlin (implementado)
│       │   └── 📄 constants.ts           # ✅ Constantes del proyecto (implementado)
│       │
│       └── 📁 pipes/                     # Pipes personalizados de Angular
│           └── 📄 token-highlight.pipe.ts # Resaltado de sintaxis de tokens
│
├── 📁 docs/                              # Documentación adicional
│   ├── 📄 AFD_Specification.md           # Especificación completa de AFDs
│   ├── 📄 User_Manual.md                 # Manual de usuario
│   └── 📁 diagrams/                      # Diagramas de autómatas
│       ├── 📄 number-automaton.png       # Diagrama del autómata de números
│       └── ...                           # Otros diagramas
│
└── 📁 tests/                             # Suite de pruebas
    ├── 📁 unit/                          # Pruebas unitarias
    │   ├── 📁 automata/                  # Pruebas de autómatas
    │   └── 📁 services/                  # Pruebas de servicios
    └── 📁 integration/                   # Pruebas de integración
```

**Estado Actual**: ✅ 10 archivos implementados | 🔄 6 autómatas pendientes | 📊 ~800+ líneas de código

---

## 🎫 Tokens Reconocidos

El analizador léxico reconoce las siguientes categorías de tokens:

### 1. **Números**
- **Enteros**: `0`, `123`, `4567`
- **Decimales**: `3.14`, `0.5`, `123.456`

### 2. **Identificadores**
- Variables, funciones, clases
- Límite: **15 caracteres máximo**
- Ejemplos: `nombre`, `calcularTotal`, `Usuario123`

### 3. **Palabras Reservadas** (mínimo 8)
```kotlin
// Palabras reservadas de Kotlin
val, var, fun, class, object, interface, if, else, when, while, 
for, return, break, continue, import, package, public, private, 
protected, internal, open, abstract, sealed, data, enum, annotation
```

### 4. **Operadores Aritméticos**
```
+  -  *  /  %
```

### 5. **Operadores de Comparación**
```
==  !=  <  >  <=  >=  ===  !==
```

### 6. **Operadores Lógicos**
```
&&  ||  !
```

### 7. **Operadores de Asignación**
```
=  +=  -=  *=  /=  %=
```

### 8. **Operadores de Incremento/Decremento**
```
++  --
```

### 9. **Operadores Especiales de Kotlin**
```
?.  !!  ?:  ::  ..  ->  =>  in  !in  is  !is  as  as?
```

### 10. **Delimitadores**
- **Paréntesis**: `(`, `)`
- **Llaves**: `{`, `}`
- **Corchetes**: `[`, `]`
- **Angulares**: `<`, `>` (para genéricos)

### 11. **Separadores**
- **Terminal**: `;` (fin de sentencia - opcional en Kotlin)
- **Coma**: `,`
- **Punto**: `.` (acceso a miembros)
- **Dos puntos**: `:` (declaración de tipos)

### 12. **Cadenas de Caracteres**
- **Comillas dobles**: `"Hola mundo"` (String)
- **Comillas simples**: `'A'` (Char - un solo carácter)
- **String templates**: `"Valor: $variable"` o `"Suma: ${a + b}"`
- **Raw strings**: `"""texto multilínea"""`
- Soporte para caracteres de escape: `\"`, `\'`, `\\`, `\n`, `\t`, `\$`

### 13. **Comentarios**
- **Línea**: `// comentario de línea`
- **Bloque**: `/* comentario de bloque multilínea */`
- **Documentación**: `/** comentario de documentación KDoc */`

---

## 🚀 Instalación

### Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** >= 18.x ([Descargar aquí](https://nodejs.org/))
- **npm** >= 9.x (incluido con Node.js)
- **Angular CLI** 18.x

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/santiagoarbelaezc/TLFproject.git
cd TLFproject
```

2. **Instalar Angular CLI globalmente** (si no lo tienes)
```powershell
npm install -g @angular/cli@18
```

3. **Instalar dependencias del proyecto**
```powershell
npm install
```

4. **Instalar Angular Material** (recomendado)
```powershell
ng add @angular/material
```

5. **Verificar instalación**
```powershell
ng version
```

---

## 💻 Uso

### Iniciar servidor de desarrollo

```powershell
npm start
# o
ng serve
```

Navega a `http://localhost:4200/` en tu navegador.

### Compilar para producción

```powershell
npm run build
# o
ng build --configuration production
```

Los archivos compilados estarán en `dist/`.

### Ejecutar pruebas

```powershell
# Pruebas unitarias
npm test

# Pruebas con cobertura
ng test --code-coverage
```

---

## 🔧 Desarrollo

### Crear nuevo componente

```powershell
ng generate component components/nombre-componente
```

### Crear nuevo servicio

```powershell
ng generate service services/nombre-servicio
```

### Crear nuevo autómata

```powershell
ng generate class automata/nombre-automaton
```

### Estándares de Código

- ✅ Usar **camelCase** para variables y funciones
- ✅ Usar **PascalCase** para clases e interfaces
- ✅ Usar **UPPER_SNAKE_CASE** para constantes
- ✅ Comentar código complejo con JSDoc
- ✅ Máximo 80-100 caracteres por línea
- ✅ Usar `const` por defecto, `let` solo cuando sea necesario
- ✅ Evitar `any`, usar tipado estricto

---

## 🤖 Autómatas Finitos Deterministas

Cada categoría de token es reconocida por un AFD específico. Los autómatas están implementados sin usar expresiones regulares nativas.

### Ejemplo de Estructura de un Autómata

```typescript
export class NumberAutomaton extends BaseAutomaton {
  private state: 'START' | 'INTEGER' | 'DECIMAL' | 'ACCEPT' | 'REJECT';
  
  public recognize(input: string): boolean {
    this.state = 'START';
    
    for (const char of input) {
      this.transition(char);
      if (this.state === 'REJECT') return false;
    }
    
    return this.state === 'ACCEPT';
  }
  
  private transition(char: string): void {
    // Implementación de transiciones del AFD
    // Procesa carácter por carácter
  }
}
```

### Expresiones Regulares Teóricas

Cada autómata se basa en una expresión regular formal adaptada a la sintaxis de Kotlin:

| Token | Expresión Regular | Ejemplo |
|-------|-------------------|---------|
| Entero | `[0-9]+` | `123` |
| Decimal | `[0-9]+\.[0-9]+` | `3.14` |
| Identificador | `[a-zA-Z_][a-zA-Z0-9_]{0,14}` | `variable1` |
| Cadena | `"([^"\\]|\\.)*"` | `"Hola"` |
| Char | `'([^'\\]|\\.)'` | `'A'` |
| String Template | `"([^"\\$]|\\.|\$\{[^}]*\})*"` | `"Valor: $x"` |
| Raw String | `""".*"""` | `"""texto"""` |

📄 **Documento completo de AFDs**: Ver `docs/AFD_Specification.pdf`

---

## ⚠️ Manejo de Errores

El analizador léxico detecta y reporta los siguientes tipos de errores léxicos específicos del lenguaje Kotlin:

### 1. **Cadena de caracteres sin cerrar**
```kotlin
val mensaje = "Hola mundo
              ^
ERROR: Cadena de caracteres no cerrada en línea 1, columna 15
```

### 2. **Comentario de bloque sin cerrar**
```kotlin
/* Este es un comentario
   que no se cierra
^
ERROR: Comentario de bloque no cerrado en línea 1, columna 1
```

### 3. **Identificador demasiado largo**
```kotlin
val nombreDeVariableMuyMuyLargaQueExcedeLimite = 10
    ^
ERROR: Identificador excede 15 caracteres en línea 1, columna 5
```

### 4. **Carácter no reconocido**
```kotlin
val x = 5 ¿ 3
          ^
ERROR: Token no reconocido '¿' en línea 1, columna 11
```

### 5. **String template mal formado**
```kotlin
val texto = "Valor: ${variable sin cerrar"
                                   ^
ERROR: String template mal formado en línea 1, columna 25
```

**Importante**: El analizador **solo detecta errores léxicos**. No realiza análisis sintáctico ni semántico.

---

## 👥 Contribuidores

| Nombre | Rol | GitHub | Contribución |
|--------|-----|--------|--------------|
| Santiago Arbeláez | Desarrollador | [@santiagoarbelaezc](https://github.com/santiagoarbelaezc) | Nada |
| Juan Sebastian Noreña | Desarrollador | [@JuanNorena](https://github.com/JuanNorena) | Desarrollador principal |
| Santiago Ovalle Cortez | Desarrollador | [@SantOvalle08](https://github.com/SantOvalle08) | Nada |

### Roles y Responsabilidades
- **Desarrollador Principal**: Diseño de arquitectura, implementación de AFDs, coordinación del proyecto
- **Desarrolladores**: Implementación de componentes específicos, testing, documentación
- **Revisores**: Control de calidad, validación de implementación

---

## 📚 Referencias

### Teoría de Lenguajes Formales
- Hopcroft, J. E., Motwani, R., & Ullman, J. D. (2006). *Introduction to Automata Theory, Languages, and Computation*
- Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. (2006). *Compilers: Principles, Techniques, and Tools* (2nd ed.)

### Documentación Técnica
- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Kotlin Language Documentation](https://kotlinlang.org/docs/home.html)
- [Kotlin Grammar Specification](https://kotlinlang.org/spec/syntax-and-grammar.html)
- [Lexical Analysis - Wikipedia](https://en.wikipedia.org/wiki/Lexical_analysis)

### Recursos Adicionales
- [Regular-Expressions.info](https://www.regular-expressions.info/)
- [Finite Automata Simulator](http://ivanzuzak.info/noam/webapps/fsm_simulator/)

---

## 📄 Licencia

Este proyecto es desarrollado con fines académicos para el curso de **Teoría de Lenguajes Formales**.

---

## 🎓 Información Académica

**Institución**: Universidad del quindio
**Facultad**: Ingeniería de Sistemas  
**Curso**: Teoría de Lenguajes Formales  
**Semestre**: Octavo Semestre - 2025  
**Profesor**: Carlos Andres Florez 
**Tipo**: Proyecto Final de Curso  

### Objetivos de Aprendizaje
- Aplicación práctica de Autómatas Finitos Deterministas
- Desarrollo de un analizador léxico completo
- Implementación de algoritmos de reconocimiento de patrones
- Diseño de interfaces de usuario para herramientas de desarrollo

---

## 📝 Ejemplos de Código Kotlin a Analizar

### Ejemplo 1: Variables y Operaciones Básicas
```kotlin
val nombre = "Juan"
var edad = 25
val suma = 10 + 20
println("Hola $nombre, tienes $edad años")
```

### Ejemplo 2: Funciones
```kotlin
fun calcularArea(base: Int, altura: Int): Int {
    return base * altura
}
```

### Ejemplo 3: Clases y Objetos
```kotlin
data class Persona(val nombre: String, var edad: Int)

class Calculadora {
    fun sumar(a: Int, b: Int) = a + b
}
```

### Ejemplo 4: Estructuras de Control
```kotlin
if (x > 10) {
    println("Mayor que 10")
} else {
    println("Menor o igual a 10")
}

for (i in 1..10) {
    println(i)
}

when (x) {
    1 -> println("Uno")
    2 -> println("Dos")
    else -> println("Otro")
}
```

---

<div align="center">

**⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub ⭐**

Made with ❤️ and ☕ by the TLF Team

</div>
