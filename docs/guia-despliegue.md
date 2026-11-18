# Guía de Despliegue en Plataforma SaaS y Automatización CI/CD

Esta guía detalla los pasos para desplegar la aplicación de **Gestión de Productos** en una plataforma SaaS (Vercel), configurar la base de datos en la nube con **MongoDB Atlas** y automatizar el ciclo de vida de entrega continua mediante **GitHub Actions**.

---

## 1. Configuración de Base de Datos en MongoDB Atlas

### Paso 1: Crear una cuenta y clúster gratuito
1. Ingresa a [MongoDB Atlas](https://www.mongodb.com/atlas) e inicia sesión o regístrate.
2. Crea una nueva organización y proyecto (ej. `ProductHub-Project`).
3. En la sección **Database**, selecciona **Build a Database** y elige el plan **M0 Free (Shared)**.
4. Selecciona un proveedor de nube (AWS recomendado) y la región más cercana a tu ubicación geográfica.

### Paso 2: Crear el usuario de la base de datos (Database Access)
1. En el menú lateral izquierdo, ve a **Security > Database Access**.
2. Haz clic en **Add New Database User**.
3. Selecciona el método de autenticación **Password**.
4. Define un nombre de usuario (ej. `admin_producthub`) y genera una contraseña segura (ej. `ClaveSegura2026!`).
5. En **Database User Privileges**, asigna el rol **Read and write to any database**.
6. Haz clic en **Add User**.

> [!WARNING]
> Si tu contraseña contiene caracteres especiales como `@`, `:`, `/`, o `%`, debes codificarlos en formato URL (por ejemplo, `@` se convierte en `%40`).

### Paso 3: Configurar el acceso de red (Network Access)
1. En el menú lateral, dirígete a **Security > Network Access**.
2. Haz clic en **Add IP Address**.
3. Selecciona la opción **Allow Access From Anywhere** (`0.0.0.0/0`).
   - *¿Por qué?* Plataformas SaaS serverless como Vercel utilizan direcciones IP dinámicas para ejecutar las funciones.
4. Confirma haciendo clic en **Confirm**.

### Paso 4: Obtener la cadena de conexión (Connection String)
1. Regresa a **Database > Clusters** y haz clic en **Connect**.
2. Elige la opción **Drivers** (Node.js).
3. Copia la cadena de conexión generada, que tendrá un formato como:
   ```text
   mongodb+srv://admin_producthub:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Agrega el nombre de la base de datos antes de los parámetros de consulta (`gestion_productos`):
   ```text
   mongodb+srv://admin_producthub:<password>@cluster0.abcde.mongodb.net/gestion_productos?retryWrites=true&w=majority
   ```

### Paso 5: Probar la conexión localmente
Configura la cadena en tu archivo `.env`:
```env
MONGODB_URI=mongodb+srv://admin_producthub:TuPassword@cluster0.abcde.mongodb.net/gestion_productos?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_fullstack_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3000
```

Ejecuta el script de prueba automatizado incluido en el proyecto:
```bash
npm run test:db
```
El script verificará:
- Estado del enlace (`readyState == 1`).
- Ping de latencia al cluster de Atlas.
- Conteo e inspección de colecciones activas.
- Ocultación automática de credenciales en terminal para evitar filtración de contraseñas.

---

## 2. Despliegue en Vercel (SaaS)

Vercel aloja las rutas API mediante funciones serverless en `/api/index.js` y entrega las vistas HTML/CSS/JS estáticas desde la raíz según la configuración establecida en `vercel.json`.

### Opción A: Despliegue mediante la interfaz web de Vercel (Recomendado)
1. Sube tu código a un repositorio en **GitHub**.
2. Entra a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **Add New... > Project**.
4. Importa tu repositorio `ACTIVIDAD 4 FULLSTACK`.
5. En la sección **Environment Variables**, añade las siguientes variables:
   - `MONGODB_URI`: Tu cadena de conexión completa de MongoDB Atlas.
   - `JWT_SECRET`: Tu clave secreta para la firma de tokens JWT.
   - `JWT_EXPIRES_IN`: `24h`
   - `NODE_ENV`: `production`
6. Haz clic en **Deploy**.
7. En cuestión de segundos, Vercel te proporcionará una URL pública con certificado SSL automático (ej. `https://tu-proyecto.vercel.app`).

### Opción B: Despliegue mediante Vercel CLI
1. Instala la herramienta de línea de comandos de Vercel:
   ```bash
   npm i -g vercel
   ```
2. Inicia sesión:
   ```bash
   vercel login
   ```
3. Ejecuta el despliegue a producción:
   ```bash
   vercel --prod
   ```

---

## 3. Automatización CI/CD con GitHub Actions

El pipeline configurado en `.github/workflows/ci.yml` automatiza la integración y despliegue continuo en dos fases:

```mermaid
flowchart LR
    A["Push / PR a main"] --> B["Fase CI: Test Matrix"]
    B --> C["Node.js 18.x"]
    B --> D["Node.js 20.x"]
    B --> E["Node.js 22.x"]
    C & D & E --> F{"¿Todas las pruebas pasaron?"}
    F -- No --> G["Bloquear Despliegue"]
    F -- Sí --> H["Fase CD: Deploy Vercel"]
    H --> I["Vercel Build --prod"]
    I --> J["Producción Actualizada"]
```

### Configuración de Secretos en GitHub:
Para habilitar el despliegue automático en GitHub Actions, configura las credenciales de Vercel en tu repositorio de GitHub:

1. Ve a tu repositorio en GitHub: **Settings > Secrets and variables > Actions**.
2. Crea los siguientes **Repository Secrets**:
   - `VERCEL_TOKEN`: Generado en tu cuenta de Vercel en **Account Settings > Tokens > Create**.
   - `VERCEL_ORG_ID`: Encontrado en tu proyecto local en `.vercel/project.json` tras ejecutar `vercel link`, o en la configuración del equipo de Vercel.
   - `VERCEL_PROJECT_ID`: ID del proyecto en Vercel (ubicado en **Project Settings > General**).

3. Cada vez que hagas un `git push` a la rama `main` o `master`:
   - Se ejecutarán las 27 pruebas unitarias automatizadas con Jest.
   - Si ninguna prueba falla, GitHub Actions compilará y desplegará la última versión automáticamente en Vercel.

