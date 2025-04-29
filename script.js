// Referencias DOM
const links = document.querySelectorAll('.nav-links a');
const statusDiv = document.querySelector('.status');
const html = document.documentElement;

// Estado de paginación
let pagination = {
  resource: '',
  data: [],
  page: 1,
  perPage: 10,
};

// Inicialización de tema
function applyTheme(theme) {
  html.classList.remove('light', 'dark');
  html.classList.add(theme);
  localStorage.setItem('theme', theme);
}
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
}
window.addEventListener('DOMContentLoaded', initTheme);

// Toggle manual
document.querySelector('#theme-toggle')
  .addEventListener('click', () => {
    const next = html.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
  });

// Oculta todas las secciones de datos
function hideAllSections() {
  document.querySelectorAll('.data-section')
    .forEach(sec => sec.style.display = 'none');
}

// Spinner
function showLoader() {
  statusDiv.innerHTML = '<div class="loader"></div>';
}
function hideLoader() {
  statusDiv.innerHTML = '';
}

// Renderizado Cards (Posts/Álbumes)
function renderCards(items, cardsContainerId, isPost = true) {
  const container = document.getElementById(cardsContainerId);
  container.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <h3>${it.title}</h3>
      <p>${ isPost ? it.body : 'Álbum de usuario #' + it.userId }</p>
    `;
    container.appendChild(card);
  });
}

// Renderizado de tarjetas de usuarios
function renderUsersCards(users) {
  const container = document.getElementById('users-container');
  container.innerHTML = '';
  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <h3>${user.name}</h3>
      <p><strong>📧Email:</strong> ${user.email}</p>
      <p><strong>📞Teléfono:</strong> ${user.phone}</p>
      <p><strong>👨‍💻Compañía:</strong> ${user.company.name}</p>
    `;
    container.appendChild(card);
  });
}

// Crear paginación numérica
function renderPaginationControls(containerId) {
  const container = document.getElementById(containerId);
  const totalPages = Math.ceil(pagination.data.length / pagination.perPage);

  const nav = document.createElement('div');
  nav.className = 'pagination-controls';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⬅️';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.onclick = () => {
    pagination.page--;
    updatePagination();
  };

  nav.appendChild(prevBtn);

  // Botones numéricos
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === pagination.page) {
      pageBtn.classList.add('active-page');
    }
    pageBtn.onclick = () => {
      pagination.page = i;
      updatePagination();
    };
    nav.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '➡️';
  nextBtn.disabled = pagination.page === totalPages;
  nextBtn.onclick = () => {
    pagination.page++;
    updatePagination();
  };

  nav.appendChild(nextBtn);

  container.appendChild(nav);
}

// Actualizar vista paginada
function updatePagination() {
  const start = (pagination.page - 1) * pagination.perPage;
  const end = start + pagination.perPage;
  const currentItems = pagination.data.slice(start, end);

  const containerId = pagination.resource + '-container';

  if (pagination.resource === 'posts') {
    renderCards(currentItems, containerId, true);
  } else if (pagination.resource === 'albums') {
    renderCards(currentItems, containerId, false);
  }

  renderPaginationControls(containerId);
}

// Carga genérica de recurso
async function loadResource(resource) {
  hideAllSections();
  showLoader();

  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/${resource}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (resource === 'users') {
      renderUsersCards(data);
      document.getElementById('users-container').style.display = 'grid';
    } else if (resource === 'posts' || resource === 'albums') {
      pagination = {
        resource,
        data,
        page: 1,
        perPage: 5
      };
      updatePagination();
      document.getElementById(`${resource}-container`).style.display = 'grid';
    }
  } catch (err) {
    statusDiv.textContent = `Error al cargar: ${err.message}`;
  } finally {
    hideLoader();
  }
}

// Manejo de clics en la barra lateral
links.forEach(link => {
  link.addEventListener('click', async e => {
    e.preventDefault();
    links.forEach(l => l.classList.toggle('active', l === link));
    await loadResource(link.dataset.resource);
  });
});

// Carga inicial
window.addEventListener('DOMContentLoaded', () => {
  const defaultLink = document.querySelector('a[data-resource="users"]');
  defaultLink.classList.add('active');
  loadResource('users');
});
