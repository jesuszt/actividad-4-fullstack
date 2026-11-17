// Redireccionar si ya existe token
if (localStorage.getItem('token')) {
  window.location.href = '/dashboard.html';
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authAlert = document.getElementById('auth-alert');

  authAlert.style.display = 'none';

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authTitle.textContent = 'Iniciar Sesión';
    authSubtitle.textContent = 'Ingresa tus credenciales para acceder a la gestión de productos';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    authTitle.textContent = 'Crear Cuenta';
    authSubtitle.textContent = 'Regístrate para comenzar a administrar productos';
  }
}

function showAlert(message, type = 'danger') {
  const alertBox = document.getElementById('auth-alert');
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}

// Manejo del formulario de Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verificando...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data.data._id,
        name: data.data.name,
        email: data.data.email,
      }));
      showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 700);
    } else {
      showAlert(data.message || 'Error al iniciar sesión', 'danger');
    }
  } catch (error) {
    showAlert('Error de conexión con el servidor. Intente nuevamente.', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ingresar al Panel';
  }
});

// Manejo del formulario de Registro
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const submitBtn = document.getElementById('btn-register-submit');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registrando...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data.data._id,
        name: data.data.name,
        email: data.data.email,
      }));
      showAlert('¡Cuenta creada con éxito! Redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 700);
    } else {
      showAlert(data.message || 'Error al registrarse', 'danger');
    }
  } catch (error) {
    showAlert('Error de conexión con el servidor. Intente nuevamente.', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Crear Cuenta';
  }
});
