# ProductHub - Aplicación Web de Gestión de Productos con JWT

Aplicación web fullstack para la gestión integral de productos e inventarios con sistema CRUD completo, autenticación basada en JSON Web Tokens (JWT), base de datos MongoDB con Mongoose, pruebas unitarias automatizadas con Jest y configuración para despliegue continuo con GitHub Actions y plataformas SaaS (Vercel).

---

## 🚀 Características Principales

- **Autenticación y Autorización con JWT:**
  - Registro de usuarios con validación de correo único.
  - Almacenamiento seguro de contraseñas mediante hash unidireccional con `bcryptjs` (salt 10).
  - Emisión de token JWT con expiración configurada.
  - Protección de rutas privadas mediante middleware `protect`.
  - Endpoint de consulta de perfil de usuario autenticado (`/api/auth/profile`).
- **Gestión CRUD de Productos:**
  - **Crear (POST):** Validación de campos obligatorios, tipos y valores positivos (precio, stock).
  - **Leer (GET):** Listado general y consulta individual por identificador (`_id`).
  - **Actualizar (PUT):** Modificación parcial o total de atributos con validaciones activas.
  - **Eliminar (DELETE):** Eliminación controlada de registros.
- **Frontend Estático Integrado:**
  - Vista de autenticación (`public/index.html`) con pestañas para Login y Registro.
  - Panel de control (`public/dashboard.html`) para gestión de productos, estadísticas en tiempo real (total, unidades, valor monetario), filtro de búsqueda y modal interactivo de creación/edición.
  - Manejo de estado en cliente con `localStorage` y redirección automática según estado de la sesión.
- **Calidad de Código y Pruebas Automatizadas:**
  - 27 pruebas unitarias y de integración desarrolladas con **Jest** y **Supertest**.
  - Aislamiento completo mediante mocks para controladores, middlewares y modelos Mongoose.
- **DevOps y Despliegue:**
  - Pipeline de Integración Continua con **GitHub Actions** (`.github/workflows/ci.yml`).
  - Configuración lista para despliegue en **Vercel** (`vercel.json` y `api/index.js`).

---

## 📁 Estructura del Proyecto

```text
ACTIVIDAD 4 FULLSTACK/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline de GitHub Actions (CI)
├── api/
│   └── index.js                # Handler serverless para despliegue en Vercel
├── docs/
│   └── requerimientos.md       # Documento de requerimientos funcionales y no funcionales
├── public/
│   ├── css/
│   │   └── style.css           # Estilos modernos y responsivos
│   ├── js/
│   │   ├── auth.js             # Lógica de cliente para login y registro
│   │   └── app.js              # Lógica de cliente para CRUD de productos y métricas
│   ├── dashboard.html          # Vista de panel de administración de productos
│   └── index.html              # Vista de inicio de sesión y registro
├── src/
│   ├── config/
│   │   └── db.js               # Conexión a MongoDB con Mongoose
│   ├── controllers/
│   │   ├── authController.js   # Lógica de negocio de autenticación
│   │   └── productController.js# Lógica de negocio de productos (CRUD)
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Middleware de validación de token JWT
│   │   └── errorMiddleware.js  # Middleware de rutas 404 y errores globales
│   ├── models/
│   │   ├── Product.js          # Esquema de producto Mongoose
│   │   └── User.js             # Esquema de usuario Mongoose con bcrypt hooks
│   ├── routes/
│   │   ├── authRoutes.js       # Definición de rutas /api/auth
│   │   └── productRoutes.js    # Definición de rutas /api/products (Protegidas)
│   ├── app.js                  # Configuración de Express y middlewares
│   └── server.js               # Arranque del servidor HTTP y conexión DB
├── tests/
│   ├── auth.test.js            # Pruebas unitarias de autenticación y JWT
│   ├── product.test.js         # Pruebas unitarias de operaciones CRUD de productos
│   └── middleware.test.js      # Pruebas de middlewares, 404 y métodos de modelo
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Exclusiones de Git
├── jest.config.js              # Configuración del framework Jest
├── package.json                # Dependencias y scripts del proyecto
├── vercel.json                 # Configuración de despliegue en Vercel
└── README.md                   # Documentación principal
```

---

## 🛠️ Tecnologías Empleadas

- **Entorno de ejecución:** [Node.js](https://nodejs.org/) (v18+)
- **Framework Web:** [Express.js](https://expressjs.com/) (v4.x)
- **Base de Datos & ODM:** [MongoDB](https://www.mongodb.com/) con [Mongoose](https://mongoosejs.com/)
- **Seguridad & Token:** [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) y [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Testing:** [Jest](https://jestjs.io/) y [Supertest](https://github.com/ladjs/supertest)
- **Frontend:** HTML5 semántico, CSS3 moderno (Custom Properties / Flexbox / Grid) y JavaScript ES6+ Vanilla
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)
- **Plataforma SaaS:** [Vercel](https://vercel.com/)

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js instalado (versión 18 o superior).
- Servidor MongoDB local activo o una URI de conexión en [MongoDB Atlas](https://www.mongodb.com/atlas).

### Pasos de Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd "ACTIVIDAD 4 FULLSTACK"
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
   Ajusta los valores en `.env` según corresponda:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/gestion_productos
   JWT_SECRET=tu_clave_secreta_super_segura_2026
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Iniciar en modo producción:**
   ```bash
   npm start
   ```

6. **Acceder a la aplicación:**
   Abre tu navegador web en: `http://localhost:3000`

---

## 🧪 Pruebas Unitarias Automatizadas

Las pruebas están estructuradas con Jest y Supertest, simulando el ciclo completo de peticiones y respuestas HTTP sin depender de una base de datos externa:

- **Ejecutar todas las pruebas:**
  ```bash
  npm test
  ```

- **Ejecutar pruebas con reporte de cobertura:**
  ```bash
  npm run test:coverage
  ```

### Casos de Prueba Cubiertos (27 tests):
1. **Autenticación:**
   - Registro exitoso con hash de contraseña y emisión de JWT.
   - Rechazo de registro ante campos faltantes.
   - Validación de longitud mínima de contraseña ($\ge 6$ caracteres).
   - Detección y rechazo de correos electrónicos duplicados.
   - Login correcto y generación de token.
   - Login fallido por correo inexistente o contraseña incorrecta.
   - Consulta de perfil `/api/auth/profile` con token válido, sin token y con token expirado/alterado.
2. **Productos (CRUD):**
   - Rechazo de acceso (401) en rutas de productos sin token de autorización.
   - Listado de productos con población de usuario creador.
   - Creación exitosa de producto vinculado al usuario autenticado.
   - Validación de campos requeridos y rechazo de valores negativos (precio y stock).
   - Búsqueda por ID, actualización y eliminación con manejo de casos 404 (no encontrado).
3. **Middlewares y Modelos:**
   - Enrutador 404 para URLs no registradas.
   - Endpoint de salud `/api/health`.
   - Método `matchPassword` del modelo `User`.

---

## 📡 Referencia de la API REST

### Autenticación (`/api/auth`)

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra un usuario `{ name, email, password }` |
| `POST` | `/api/auth/login` | Público | Autentica un usuario `{ email, password }` |
| `GET` | `/api/auth/profile` | Privado (JWT) | Retorna los datos del usuario autenticado |

### Productos (`/api/products`)

> **Nota:** Todos los endpoints de productos requieren la cabecera `Authorization: Bearer <TOKEN_JWT>`.

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Privado | Obtiene la lista completa de productos |
| `GET` | `/api/products/:id` | Privado | Obtiene un producto por su ID |
| `POST` | `/api/products` | Privado | Crea un nuevo producto |
| `PUT` | `/api/products/:id` | Privado | Modifica un producto existente |
| `DELETE` | `/api/products/:id` | Privado | Elimina un producto por su ID |

#### Ejemplo de Cuerpo de Petición (Crear Producto):
```json
{
  "name": "Teclado Mecánico RGB",
  "description": "Switches mecánicos rojos con retroiluminación",
  "price": 64.99,
  "category": "Periféricos",
  "stock": 20
}
```

---

## 🌐 Despliegue en Plataformas SaaS (Vercel)

El proyecto incluye soporte nativo para despliegue en Vercel mediante funciones serverless:

1. **Configuración en Vercel:**
   - Conecta tu repositorio de GitHub a Vercel.
   - Configura las variables de entorno en el panel de Vercel:
     - `MONGODB_URI`: Cadena de conexión de MongoDB Atlas.
     - `JWT_SECRET`: Clave secreta para la firma de tokens.
     - `JWT_EXPIRES_IN`: Tiempo de expiración (ej. `24h`).
     - `NODE_ENV`: `production`.
2. El archivo [vercel.json](file:///c:/Users/PC/Desktop/ACTIVIDAD%204%20FULLSTACK/vercel.json) enruta automáticamente las peticiones de la API a [api/index.js](file:///c:/Users/PC/Desktop/ACTIVIDAD%204%20FULLSTACK/api/index.js) y entrega los recursos estáticos de la carpeta `public/`.

---

## 🤖 Integración de Herramientas de IA y Ajustes Realizados

En concordancia con los incisos **f.2** y **f.3** de la actividad:
1. **Generación Asistida:** Se utilizó asistencia de inteligencia artificial para estructurar los casos base de prueba para controladores y rutas Express.
2. **Ajustes y Refinamiento Manual:**
   - Se ajustó el mockeo de las cadenas de métodos encadenados de Mongoose (`populate()`, `sort()`, `select()`).
   - Se incorporaron aserciones estrictas para la captura de errores 400 por validaciones de negocio (precios negativos, contraseñas cortas).
   - Se implementó aislamiento en las pruebas para que puedan ejecutarse en entornos de integración continua sin requerir un cluster de base de datos en ejecución física.
