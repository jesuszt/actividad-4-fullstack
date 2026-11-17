// Proteger acceso: si no hay token, enviar a login
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
}

let productsCache = [];

// Elementos de la interfaz
const userDisplayName = document.getElementById('user-display-name');
const productsTableBody = document.getElementById('products-table-body');
const emptyState = document.getElementById('empty-state');
const globalAlert = document.getElementById('global-alert');
const productModal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const btnSaveProduct = document.getElementById('btn-save-product');

// Inicializar datos al cargar
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  fetchProducts();
});

function showAlert(message, type = 'success') {
  globalAlert.className = `alert alert-${type}`;
  globalAlert.textContent = message;
  globalAlert.style.display = 'block';
  setTimeout(() => {
    globalAlert.style.display = 'none';
  }, 4000);
}

// Cargar perfil del usuario
async function loadUserProfile() {
  try {
    const res = await fetch('/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      logout();
      return;
    }

    const data = await res.json();
    if (data.success && data.data) {
      userDisplayName.textContent = `👤 ${data.data.name} (${data.data.email})`;
    }
  } catch (error) {
    const cached = localStorage.getItem('user');
    if (cached) {
      const user = JSON.parse(cached);
      userDisplayName.textContent = `👤 ${user.name}`;
    }
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Obtener productos
async function fetchProducts() {
  try {
    const res = await fetch('/api/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      logout();
      return;
    }

    const result = await res.json();
    if (result.success) {
      productsCache = result.data;
      renderProducts(productsCache);
      updateStats(productsCache);
    }
  } catch (error) {
    showAlert('Error al cargar la lista de productos', 'danger');
  }
}

// Renderizar tabla
function renderProducts(products) {
  productsTableBody.innerHTML = '';

  if (!products || products.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  products.forEach((prod) => {
    const tr = document.createElement('tr');

    let stockBadgeClass = 'badge-stock-ok';
    if (prod.stock === 0) stockBadgeClass = 'badge-stock-empty';
    else if (prod.stock < 5) stockBadgeClass = 'badge-stock-low';

    const creatorName = prod.user?.name || 'Usuario';

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(prod.name)}</strong>
        ${prod.description ? `<br><small style="color:#64748b;">${escapeHtml(prod.description)}</small>` : ''}
      </td>
      <td><span class="badge badge-category">${escapeHtml(prod.category)}</span></td>
      <td><strong>$${Number(prod.price).toFixed(2)}</strong></td>
      <td><span class="badge ${stockBadgeClass}">${prod.stock} uds</span></td>
      <td><small>${escapeHtml(creatorName)}</small></td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm" onclick="editProduct('${prod._id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${prod._id}')">Eliminar</button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
}

// Actualizar estadísticas del dashboard
function updateStats(products) {
  const total = products.length;
  const units = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-units').textContent = units;
  document.getElementById('stat-value').textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Filtrar productos
function filterProducts() {
  const query = document.getElementById('filter-input').value.toLowerCase().trim();
  const filtered = productsCache.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
  );
  renderProducts(filtered);
}

// Modal Abrir/Cerrar
function openProductModal(mode = 'create', product = null) {
  productForm.reset();
  if (mode === 'create') {
    modalTitle.textContent = 'Nuevo Producto';
    document.getElementById('product-id').value = '';
    btnSaveProduct.textContent = 'Guardar Producto';
  } else if (mode === 'edit' && product) {
    modalTitle.textContent = 'Editar Producto';
    document.getElementById('product-id').value = product._id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-category').value = product.category;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-stock').value = product.stock;
    document.getElementById('prod-description').value = product.description || '';
    btnSaveProduct.textContent = 'Actualizar Cambios';
  }
  productModal.classList.add('active');
}

function closeProductModal() {
  productModal.classList.remove('active');
}

// Guardar (Crear / Actualizar)
async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const isEditing = Boolean(id);

  const payload = {
    name: document.getElementById('prod-name').value.trim(),
    category: document.getElementById('prod-category').value.trim(),
    price: parseFloat(document.getElementById('prod-price').value),
    stock: parseInt(document.getElementById('prod-stock').value, 10),
    description: document.getElementById('prod-description').value.trim(),
  };

  btnSaveProduct.disabled = true;
  btnSaveProduct.textContent = 'Guardando...';

  try {
    const url = isEditing ? `/api/products/${id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showAlert(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
      closeProductModal();
      fetchProducts();
    } else {
      alert(data.message || 'Error al guardar el producto');
    }
  } catch (error) {
    alert('Error al comunicar con el servidor');
  } finally {
    btnSaveProduct.disabled = false;
    btnSaveProduct.textContent = isEditing ? 'Actualizar Cambios' : 'Guardar Producto';
  }
}

// Editar
function editProduct(id) {
  const product = productsCache.find((p) => p._id === id);
  if (product) {
    openProductModal('edit', product);
  }
}

// Eliminar
async function deleteProduct(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showAlert('Producto eliminado correctamente');
      fetchProducts();
    } else {
      showAlert(data.message || 'Error al eliminar el producto', 'danger');
    }
  } catch (error) {
    showAlert('Error de conexión al eliminar', 'danger');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
