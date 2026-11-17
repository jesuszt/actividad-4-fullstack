# Documento de Requerimientos del Sistema - Gestión de Productos

**Proyecto:** Aplicación Web de Gestión de Productos con Autenticación JWT  
**Tecnologías:** Node.js, Express.js, MongoDB (Mongoose), JWT, Jest, HTML5, CSS3, JavaScript Vanilla  
**Versión:** 1.0.0  

---

## 1. Introducción y Propósito

El propósito de este proyecto es desarrollar una aplicación web completa y segura para la administración y gestión de inventario/productos. La solución permite a usuarios registrados gestionar el ciclo de vida completo de un producto (Crear, Leer, Actualizar y Eliminar - CRUD), garantizando la seguridad y el control de acceso mediante tokens JSON Web Tokens (JWT).

---

## 2. Requerimientos Funcionales (RF)

Los requerimientos funcionales definen los servicios, funcionalidades y comportamientos específicos que el sistema debe proporcionar a los usuarios.

### Módulo 1: Gestión de Usuarios y Autenticación
* **RF-01 - Registro de Usuarios:**
  * El sistema debe permitir a nuevos usuarios registrarse proporcionando nombre, correo electrónico y contraseña.
  * El sistema debe validar que el correo electrónico no esté registrado previamente.
  * La contraseña debe almacenarse de forma segura mediante encriptación unidireccional con sal (*salt*) utilizando algoritmos robustos (bcrypt).

* **RF-02 - Inicio de Sesión (Login):**
  * El sistema debe permitir a los usuarios autenticarse mediante correo electrónico y contraseña.
  * Ante credenciales válidas, el sistema debe emitir un token JWT con tiempo de expiración definido (por ejemplo, 24 horas).
  * Ante credenciales inválidas, el sistema debe retornar un mensaje de error genérico para evitar divulgación de información sensible.

* **RF-03 - Cierre de Sesión (Logout):**
  * El sistema en la capa cliente debe permitir la invalidación o remoción del token JWT almacenado (`localStorage` o cookie) y redireccionar a la vista de login.

* **RF-04 - Obtención de Perfil de Usuario:**
  * El sistema debe proveer un endpoint protegido para consultar los datos del usuario autenticado a partir de su token JWT.

### Módulo 2: Gestión de Productos (CRUD)
* **RF-05 - Creación de Producto (Create):**
  * Un usuario autenticado debe poder crear un nuevo producto indicando:
    * Nombre (requerido, cadena de texto).
    * Descripción (opcional, cadena de texto).
    * Precio (requerido, numérico positivo).
    * Categoría (requerido, cadena de texto).
    * Stock/Cantidad disponible (requerido, número entero $\ge 0$).
  * El producto debe quedar vinculado al identificador del usuario creador.

* **RF-06 - Listado de Productos (Read All):**
  * El sistema debe permitir a los usuarios autenticados consultar todos los productos registrados en la base de datos o aquellos creados por el usuario.

* **RF-07 - Consulta de Producto por ID (Read One):**
  * El sistema debe permitir consultar el detalle de un producto específico mediante su identificador único (`id`/`_id`).

* **RF-08 - Actualización de Producto (Update):**
  * Un usuario autenticado debe poder modificar los campos de un producto existente (nombre, descripción, precio, categoría, stock).
  * El sistema debe verificar la existencia del producto y validar los tipos de datos enviados.

* **RF-09 - Eliminación de Producto (Delete):**
  * Un usuario autenticado debe poder eliminar un producto existente del sistema.

### Módulo 3: Interfaz de Usuario (Frontend)
* **RF-10 - Vista de Login y Registro:**
  * Interfaz gráfica web con formularios limpios y responsivos para iniciar sesión o registrar una nueva cuenta.
* **RF-11 - Panel de Control (Dashboard) de Productos:**
  * Vista donde se visualiza la tabla/tarjetas de productos, modal o formulario para agregar/editar productos y botones para eliminar con confirmación.
  * Indicador del usuario activo y botón de cierre de sesión.

---

## 3. Requerimientos No Funcionales (RNF)

Los requerimientos no funcionales definen los atributos de calidad, restricciones técnicas y estándares de rendimiento del sistema.

### RNF-01 - Seguridad
* **Protección de Rutas:** Todas las rutas de gestión de productos (`/api/products/*`) y perfiles deben estar protegidas mediante el middleware de verificación de firma JWT.
* **Cifrado de Credenciales:** Ninguna contraseña debe almacenarse en texto plano. Se debe emplear `bcryptjs` con un factor de costo (*work factor*) mínimo de 10 rondas.
* **Manejo de Errores Seguro:** Las respuestas de error no deben exponer trazas de la pila (*stack traces*) ni datos internos de la infraestructura en entornos de producción.
* **Políticas CORS:** Configuración adecuada de CORS (*Cross-Origin Resource Sharing*) para restringir orígenes no autorizados si aplica.

### RNF-02 - Rendimiento y Escalabilidad
* **Tiempos de Respuesta:** Las respuestas de las solicitudes API deben resolverse en un tiempo promedio menor a 300 ms en condiciones normales de red.
* **Concurrencia:** La arquitectura asíncrona no bloqueante de Node.js debe permitir atender múltiples peticiones concurrentes eficientemente.

### RNF-03 - Mantenibilidad y Arquitectura de Código
* **Patrón Arquitectónico:** El backend debe seguir el patrón de diseño MVC / Arquitectura por Capas:
  * `config/`: Configuración de base de datos y variables de entorno.
  * `models/`: Esquemas de datos con Mongoose.
  * `controllers/`: Lógica de negocio y manejo de peticiones/respuestas.
  * `routes/`: Definición de endpoints y asociación de middlewares.
  * `middlewares/`: Autenticación, validación y manejo centralizado de errores.
* **Código Limpio:** Cumplimiento de estándares ECMAScript modernos (ES6+), nombres descriptivos y separación clara de responsabilidades.

### RNF-04 - Disponibilidad y Despliegue (DevOps / CI/CD)
* **Integración Continua:** Configuración de un pipeline automatizado con **GitHub Actions** que ejecute las pruebas unitarias en cada evento de *push* o *pull request* a la rama principal.
* **Despliegue Serverless / SaaS:** Preparación y configuración de la aplicación para despliegue en plataformas como **Vercel** o servicios en la nube compatibles con Node.js y MongoDB Atlas.

### RNF-05 - Calidad de Software y Cobertura de Pruebas
* **Pruebas Automatizadas:** Implementación de pruebas con **Jest** y **Supertest** para verificar:
  * Endpoints de autenticación (registro, login exitoso, login fallido por credenciales inválidas, usuario duplicado).
  * Operaciones CRUD de productos (creación, lectura, actualización, eliminación).
  * Control de acceso (rechazo de peticiones sin token o con token inválido con código HTTP 401 Unauthorized).
* **Entorno de Pruebas Aislado:** Uso de base de datos en memoria (`mongodb-memory-server`) o base de pruebas para garantizar que los tests se ejecuten de manera determinista e independiente del estado de producción.

---

## 4. Matriz de Trazabilidad de Endpoints API

| Recurso | Método HTTP | Ruta | Descripción | Requiere Autenticación (JWT) |
| :--- | :--- | :--- | :--- | :---: |
| Auth | POST | `/api/auth/register` | Registrar nuevo usuario | No |
| Auth | POST | `/api/auth/login` | Iniciar sesión y obtener token | No |
| Auth | GET | `/api/auth/profile` | Obtener perfil del usuario autenticado | Sí |
| Productos | GET | `/api/products` | Obtener todos los productos | Sí |
| Productos | GET | `/api/products/:id` | Obtener un producto por ID | Sí |
| Productos | POST | `/api/products` | Crear un nuevo producto | Sí |
| Productos | PUT | `/api/products/:id` | Actualizar un producto existente | Sí |
| Productos | DELETE | `/api/products/:id` | Eliminar un producto | Sí |
