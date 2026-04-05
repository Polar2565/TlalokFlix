<p align="center">
  <img src="./assets/images/tla.png" alt="TlalokFlix Logo" width="180" />
</p>

<h1 align="center">TlalokFlix</h1>

<p align="center">
  Aplicación móvil de recomendación de películas basada en el estado de ánimo del usuario.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-Mobile-25C7C1?style=for-the-badge" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-Router-0B1F27?style=for-the-badge" alt="Expo Router" />
  <img src="https://img.shields.io/badge/Node.js-Backend-127C85?style=for-the-badge" alt="Node.js" />
  <img src="https://img.shields.io/badge/SQL%20Server-Database-D4A24A?style=for-the-badge" alt="SQL Server" />
  <img src="https://img.shields.io/badge/TMDB-Movie%20Data-7DD3FC?style=for-the-badge" alt="TMDB" />
  <img src="https://img.shields.io/badge/Ollama-Local%20AI-55D6A3?style=for-the-badge" alt="Ollama" />
</p>

---

# Índice

- [Descripción](#descripción)
- [Objetivo](#objetivo)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Software utilizado y para qué sirve](#software-utilizado-y-para-qué-sirve)
- [Arquitectura general](#arquitectura-general)
- [Cómo funciona la aplicación](#cómo-funciona-la-aplicación)
- [Rol de la IA en el proyecto](#rol-de-la-ia-en-el-proyecto)
- [Lógica de recomendaciones](#lógica-de-recomendaciones)
- [Estructura general del proyecto](#estructura-general-del-proyecto)
- [Endpoints principales](#endpoints-principales)
- [Variables de entorno](#variables-de-entorno)
- [Requisitos para ejecutar el proyecto](#requisitos-para-ejecutar-el-proyecto)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Generación del APK](#generación-del-apk)
- [Cómo probar la aplicación](#cómo-probar-la-aplicación)
- [Aviso de privacidad](#aviso-de-privacidad)
- [Seguridad implementada](#seguridad-implementada)
- [Problemas comunes y soluciones](#problemas-comunes-y-soluciones)
- [Derechos de autor](#derechos-de-autor)
- [Licencia](#licencia)
- [Créditos](#créditos)
- [English Summary](#english-summary)

---

# Descripción

**TlalokFlix** es una aplicación móvil desarrollada para recomendar películas según el estado de ánimo del usuario.

La propuesta del proyecto es mejorar la forma en que una persona descubre contenido audiovisual, evitando que solo navegue por listas genéricas y permitiendo que responda una encuesta breve para detectar su mood actual y mostrarle opciones más alineadas con cómo se siente.

Además del sistema de recomendaciones, la aplicación integra una arquitectura completa de desarrollo móvil con:

- registro de nuevos usuarios
- inicio de sesión
- persistencia de sesión
- aviso de privacidad
- consumo de API REST
- detalle de películas
- integración con TMDB
- apoyo de IA local con Ollama

TlalokFlix no fue pensado como una plataforma de streaming propia, sino como una aplicación de descubrimiento, consulta y recomendación de películas con una experiencia visual personalizada.

---

# Objetivo

El objetivo principal de TlalokFlix es construir una aplicación móvil funcional que combine recomendación de películas, autenticación segura y arquitectura cliente-servidor real.

También busca demostrar la integración de varias tecnologías en un mismo proyecto:

- frontend móvil
- backend REST
- base de datos
- autenticación segura
- servicio externo de películas
- apoyo de IA local

---

# Características principales

## 1. Registro de nuevos usuarios

La aplicación permite que un usuario nuevo cree una cuenta dentro del sistema.  
Estos datos se envían al backend y se almacenan de manera segura en la base de datos.

## 2. Inicio de sesión

Los usuarios registrados pueden autenticarse con sus credenciales.  
Después del login, la aplicación guarda la sesión para no pedir acceso cada vez.

## 3. Aviso de privacidad

Dentro del flujo de acceso y/o registro se contempla el aviso de privacidad, ya que se manejan datos del usuario necesarios para el funcionamiento de la app.

## 4. Persistencia de sesión

El token de autenticación se guarda de forma segura en el dispositivo para mantener la sesión iniciada.

## 5. Navegación protegida

Las vistas privadas de la aplicación solo están disponibles si el usuario tiene una sesión válida.

## 6. Home dinámico

La pantalla principal puede mostrar:

- saludo personalizado
- texto breve de apoyo
- acceso rápido a encuesta, explorar y favoritos

## 7. Encuesta de mood

El usuario responde una encuesta rápida para definir su estado emocional actual.

## 8. Recomendaciones por mood

La app sugiere películas según el mood detectado, usando lógica propia y datos de TMDB.

## 9. Explorar películas

El usuario puede buscar películas, revisar catálogos, géneros y descubrir nuevo contenido.

## 10. Detalle de película

Cada película puede mostrar:

- título
- año
- calificación
- poster
- overview
- géneros
- trailer

## 11. Favoritos

La app contempla una sección de favoritos para guardar contenido de interés.

## 12. IA local con Ollama

Se integró una capa ligera de IA local para generar:

- saludos breves
- texto corto para Home
- observaciones breves después de la encuesta

---

# Stack tecnológico

| Tecnología | Uso principal |
|---|---|
| React Native | Desarrollo de la app móvil |
| Expo | Entorno de desarrollo y ejecución |
| Expo Router | Navegación basada en archivos |
| TypeScript | Tipado estático y organización del frontend |
| Node.js | Entorno de ejecución del backend |
| Express | Construcción de la API REST |
| SQL Server | Base de datos principal |
| mssql / msnodesqlv8 | Conexión entre backend y SQL Server |
| bcrypt | Cifrado de contraseñas |
| jsonwebtoken | Autenticación con JWT |
| dotenv | Variables de entorno |
| cors | Comunicación entre frontend y backend |
| helmet | Seguridad básica del backend |
| TMDB API | Información real de películas |
| Ollama | IA local |
| qwen2.5:3b | Modelo usado para texto corto |
| expo-secure-store | Almacenamiento seguro del token |
| expo-build-properties | Configuración nativa de build para Android |

---

# Software utilizado y para qué sirve

## Frontend

### React Native
Se utilizó para construir la interfaz móvil de la aplicación.  
Sirve para desarrollar una app moderna con una sola base de código.

### Expo
Se utilizó como entorno de desarrollo.  
Sirve para ejecutar el proyecto fácilmente en emulador, Expo Go o navegador.

### Expo Router
Se utilizó para manejar la navegación de la app.  
Sirve para organizar pantallas como login, register, survey, home, explore y movie detail.

### TypeScript
Se utilizó para mejorar la calidad del código.  
Sirve para reducir errores, definir tipos y mantener mejor la estructura del proyecto.

### expo-secure-store
Se utilizó para guardar el token de sesión.  
Sirve para almacenar información sensible de forma más segura en el dispositivo.

### expo-build-properties
Se utilizó para ajustar propiedades nativas del build de Android.  
Sirve para habilitar configuración como `usesCleartextTraffic` cuando la app se conecta a un backend local por HTTP durante pruebas con APK.

---

## Backend

### Node.js
Se utilizó como entorno de ejecución del servidor.  
Sirve para correr la lógica del backend y exponer los endpoints.

### Express
Se utilizó para construir la API REST.  
Sirve para manejar rutas de autenticación, IA y películas.

### bcrypt
Se utilizó para cifrar contraseñas.  
Sirve para evitar guardar contraseñas en texto plano.

### jsonwebtoken (JWT)
Se utilizó para generar y validar tokens.  
Sirve para mantener sesiones autenticadas de forma segura.

### dotenv
Se utilizó para manejar configuraciones sensibles fuera del código.  
Sirve para separar secretos, tokens, puertos y datos de conexión.

### cors
Se utilizó para permitir la comunicación entre frontend y backend.  
Sirve principalmente en entorno de desarrollo cuando la app y la API corren por separado.

### helmet
Se utilizó para reforzar seguridad básica en el backend.  
Sirve para agregar encabezados HTTP que ayudan a proteger la API.

---

## Base de datos

### SQL Server
Se utilizó como base de datos principal del proyecto.  
Sirve para almacenar usuarios, credenciales y datos de autenticación.

### mssql / msnodesqlv8
Se utilizaron para conectar Node.js con SQL Server.  
Sirven para ejecutar consultas y trabajar con la base de datos desde el backend.

### ODBC Driver 17 for SQL Server
Se utilizó para habilitar la conexión en entorno Windows.  
Es una pieza importante para que el backend pueda comunicarse correctamente con SQL Server.

---

## Servicios externos

### TMDB
Se utilizó como proveedor de información de películas.  
Sirve para obtener:

- títulos
- posters
- descripciones
- ratings
- géneros
- videos y trailers

### Ollama
Se utilizó para correr IA de forma local.  
Sirve para generar texto corto dentro de la app sin depender de un servicio externo de pago.

### qwen2.5:3b
Se utilizó como modelo para Ollama.  
Sirve mejor para texto breve y UI que modelos más pesados o más lentos.

---

# Arquitectura general

La arquitectura del proyecto sigue un modelo cliente-servidor:

```text
[ Usuario ]
     |
     v
[ App móvil - React Native / Expo ]
     |
     |---- solicitudes HTTP ---->
     |
[ API REST - Node.js / Express ]
     |
     |---- consultas SQL ---->
     |
[ SQL Server ]
     |
     |---- consumo externo ---->
     |
[ TMDB API ]
     |
     |---- texto corto opcional ---->
     |
[ Ollama local ]
```

## Explicación de la arquitectura

### Cliente móvil

Es la parte que usa directamente el usuario.  
Aquí se muestran las pantallas, formularios, encuestas, resultados y detalle de películas.

### Backend

Se encarga de:

- autenticación
- validación de credenciales
- conexión con la base de datos
- consumo de servicios externos
- integración con IA local
- entrega de respuestas normalizadas al frontend

### Base de datos

Guarda información persistente del sistema, principalmente usuarios y credenciales.

### Servicios externos

TMDB aporta datos reales de películas y Ollama aporta texto breve para enriquecer la experiencia.

---

# Cómo funciona la aplicación

## Flujo de registro

1. El usuario entra a la pantalla de registro.
2. Captura sus datos.
3. El frontend envía la información al backend.
4. El backend valida los datos.
5. La contraseña se cifra con bcrypt.
6. El usuario se guarda en SQL Server.

## Flujo de login

1. El usuario ingresa sus credenciales.
2. El frontend manda la solicitud al backend.
3. El backend valida correo y contraseña.
4. Si es correcto, genera un token JWT.
5. El token se guarda de forma segura en el dispositivo.
6. El usuario entra a las pantallas privadas.

## Flujo de privacidad

1. El usuario visualiza el aviso de privacidad dentro del flujo de acceso o registro.
2. La app deja claro qué datos se usan y para qué.
3. Esto da una base mínima de transparencia y formalidad al sistema.

## Flujo de mood

1. El usuario responde una encuesta breve.
2. La aplicación calcula el mood dominante.
3. A partir de ese resultado se generan recomendaciones.

## Flujo de recomendaciones

1. La app consulta películas usando perfiles por mood.
2. El backend y/o frontend filtran resultados adecuados.
3. Se muestran películas relevantes con sus posters y detalles.

## Flujo de detalle

1. El usuario toca una película.
2. Se abre la vista de detalle.
3. Se muestran overview, rating, géneros y trailer.

---

# Rol de la IA en el proyecto

La IA en TlalokFlix tiene una función complementaria, no central.

## La IA sí hace

- saludo corto en Home
- mensaje breve
- observación corta tras la encuesta
- copy ligero para que la experiencia se sienta menos rígida

## La IA no hace

- decidir toda la lógica del sistema
- reemplazar el motor de recomendaciones
- hacer análisis emocional profundo
- generar textos largos para toda la aplicación

Esta decisión se tomó para evitar:

- lentitud
- respuestas incoherentes
- dependencia excesiva del modelo
- variabilidad innecesaria en la experiencia

---

# Lógica de recomendaciones

La aplicación usa una combinación de:

- lógica propia por mood
- filtros controlados
- datos reales de TMDB

## Ejemplo de moods contemplados

- calm
- happy
- sad
- angry

## Ejemplo de lógica

- **calm**: géneros más suaves o ligeros
- **happy**: comedia, aventura, animación
- **sad**: drama, romance, historias introspectivas
- **angry**: acción, thriller, crimen

Después se aplican reglas como:

- películas con poster
- rating aceptable
- mínimo de votos
- fallbacks si una consulta trae pocos resultados

---

# Estructura general del proyecto

```text
TlalokFlix/
├── app/
│   ├── login.tsx
│   ├── register.tsx
│   ├── privacy-modal.tsx
│   ├── survey.tsx
│   ├── recommendations.tsx
│   ├── movie/
│   │   └── [id].tsx
│   └── (tabs)/
│       ├── index.tsx
│       ├── explore.tsx
│       └── favorites.tsx
│
├── src/
│   ├── auth/
│   ├── services/
│   ├── styles/
│   ├── ui/
│   ├── data/
│   └── utils/
│
├── assets/
│   └── images/
│
├── tlalokflix-api/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── auth/
│       ├── ai/
│       ├── movies/
│       ├── services/
│       └── db/
│
├── eas.json
├── app.json
└── README.md
```

> La estructura exacta puede variar un poco según la versión del proyecto, pero esta es la organización general.

---

# Endpoints principales

## Health

```http
GET /api/health
```

## Auth

```http
POST /api/auth/register
POST /api/auth/login
```

## AI

```http
POST /api/ai/home-greeting
POST /api/ai/analyze-mood
```

## Movies

```http
GET /api/movies/popular
GET /api/movies/search
GET /api/movies/genres
GET /api/movies/discover
GET /api/movies/:id
GET /api/movies/:id/videos
```

---

# Variables de entorno

## Backend `.env`

```env
PORT=4000

DB_SERVER=TU_SERVIDOR_SQL
DB_DATABASE=TlalokFlix
DB_PORT=1433
DB_USER=TU_USUARIO_SQL
DB_PASSWORD=TU_PASSWORD_SQL
DB_TRUST_SERVER_CERT=true
DB_ENCRYPT=false

JWT_ACCESS_SECRET=TU_ACCESS_SECRET
JWT_REFRESH_SECRET=TU_REFRESH_SECRET
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30

TMDB_TOKEN=TU_TOKEN_TMDB

OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_TIMEOUT_MS=35000
TMDB_TIMEOUT_MS=12000
```

## Frontend `.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LOCAL:4000
EXPO_PUBLIC_API_TIMEOUT_MS=15000
```

> No subas secretos reales ni credenciales válidas al repositorio.

---

# Requisitos para ejecutar el proyecto

## General

- Node.js 18 o superior
- npm
- Git

## Frontend

- Expo
- Expo Go o emulador Android
- Visual Studio Code o editor compatible

## Backend

- SQL Server
- ODBC Driver 17 for SQL Server

## IA local

- Ollama instalado
- modelo `qwen2.5:3b` descargado

---

# Instalación y ejecución

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd TlalokFlix
```

## 2. Instalar dependencias del backend

```bash
cd tlalokflix-api
npm install
```

## 3. Instalar dependencias del frontend

```bash
cd ..
npm install
```

## 4. Configurar base de datos

Asegúrate de:

- tener creada la base de datos `TlalokFlix`
- contar con SQL Server activo
- tener permisos de acceso
- revisar que el backend apunte al servidor correcto

## 5. Configurar variables de entorno

Crea los archivos `.env` necesarios para frontend y backend.

## 6. Descargar el modelo de Ollama

```bash
ollama pull qwen2.5:3b
```

## 7. Levantar backend

```bash
cd tlalokflix-api
npm run dev
```

O si tu proyecto usa inicio normal:

```bash
npm start
```

## 8. Levantar frontend

```bash
npx expo start
```

---

# Generación del APK

Para generar el APK de Android se utilizó **EAS Build**.

## Requisitos previos

- cuenta de Expo
- `eas-cli` instalado
- `eas.json` configurado
- `app.json` con `android.package`
- plugin `expo-build-properties` para configuración nativa de Android

## Comandos principales

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

## Notas importantes

- El perfil `preview` fue configurado para generar APK.
- Para pruebas en red local con backend HTTP se habilitó `usesCleartextTraffic` mediante `expo-build-properties`.
- Si instalas un APK nuevo, conviene desinstalar la versión anterior antes de probar nuevamente.
- El backend debe permanecer activo en la misma red local para que el login y el registro funcionen desde el APK.

---

# Cómo probar la aplicación

1. iniciar SQL Server
2. iniciar Ollama
3. verificar que el modelo `qwen2.5:3b` esté instalado
4. iniciar backend
5. iniciar frontend o instalar el APK
6. abrir la app en emulador, Expo Go o APK
7. registrarse como usuario nuevo
8. iniciar sesión
9. revisar el aviso de privacidad
10. entrar al Home
11. responder la encuesta
12. revisar recomendaciones
13. abrir detalle de película
14. probar búsqueda y favoritos

---

# Aviso de privacidad

TlalokFlix contempla un aviso de privacidad porque el sistema maneja información del usuario necesaria para el funcionamiento de la app.

## Datos tratados

- nombre o identificador
- correo electrónico
- contraseña cifrada
- preferencias básicas o contexto de uso
- información mínima de autenticación

## Finalidad

- registrar usuarios nuevos
- permitir inicio de sesión
- mantener sesiones activas
- personalizar parte de la experiencia
- dar acceso a funcionalidades privadas de la app

## Buenas prácticas

- no guardar contraseñas en texto plano
- separar secretos mediante `.env`
- proteger sesiones con JWT
- usar almacenamiento seguro para el token
- limitar la recolección de datos a lo necesario

---

# Seguridad implementada

La app integra varias medidas de seguridad:

- contraseñas cifradas con **bcrypt**
- autenticación mediante **JWT**
- rutas privadas protegidas
- token almacenado con **expo-secure-store**
- secretos fuera del código con **dotenv**
- hardening básico del backend con **helmet**
- comunicación controlada con **cors**

---

# Problemas comunes y soluciones

## 1. El backend no inicia

Revisa:

- que `npm install` se haya ejecutado
- que el archivo `.env` exista
- que `server.js` o tu archivo principal esté correcto

## 2. Error de conexión con SQL Server

Verifica:

- `DB_SERVER`
- `DB_DATABASE`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`

También confirma que SQL Server esté corriendo.

## 3. Ollama responde con timeout

Aumenta el tiempo en `.env`:

```env
OLLAMA_TIMEOUT_MS=45000
```

## 4. El frontend o APK no llegan al backend

Revisa:

- `EXPO_PUBLIC_API_BASE_URL`
- que el backend esté activo en el puerto correcto
- que el celular y la PC estén en la misma red
- que el APK haya sido regenerado después de cambios nativos
- que `usesCleartextTraffic` esté habilitado vía `expo-build-properties`

## 5. No aparecen recomendaciones

Verifica:

- el token de TMDB
- conectividad del backend
- que los endpoints de movies estén funcionando
- que el mood enviado exista y se procese correctamente

## 6. Ollama no encuentra el modelo

Corre:

```bash
ollama list
```

Si no aparece, instala:

```bash
ollama pull qwen2.5:3b
```

---


# Derechos de autor

© Javier Solís. Todos los derechos reservados.

El código fuente, diseño, estructura, documentación y materiales asociados a este proyecto pertenecen a su autor, salvo los recursos de terceros utilizados bajo sus respectivas licencias.

Queda prohibida la copia, distribución, modificación o explotación comercial total o parcial de este proyecto sin autorización previa y por escrito del autor.

Los nombres, marcas, logos, imágenes o datos provenientes de servicios de terceros como TMDB, Expo, React Native, Node.js, SQL Server u Ollama pertenecen a sus respectivos propietarios y se utilizan únicamente con fines académicos, de desarrollo o demostración.

---

# Licencia

Este proyecto es de uso académico y de portafolio personal.  
No se autoriza su uso comercial sin permiso explícito del autor.

Si deseas reutilizar parte del proyecto con fines educativos, se recomienda conservar el crédito correspondiente y no eliminar la autoría original.

---

# Créditos

Proyecto desarrollado por:

**Javier Solís**

Tecnologías principales utilizadas:

- React Native
- Expo
- Node.js
- Express
- SQL Server
- TMDB
- Ollama

---

# English Summary

**TlalokFlix** is a mobile app that recommends movies based on the user’s current mood.

The project includes:

- user registration
- login
- privacy notice
- secure session handling
- mood survey
- movie recommendations
- movie details
- favorites
- TMDB integration
- local AI support with Ollama

It combines a mobile frontend, a backend API, a SQL Server database, and local AI support to create a more personalized movie discovery experience.
