// Referencias DOM
const links = document.querySelectorAll('.nav-links a');
const statusDiv = document.querySelector('.status');
const html = document.documentElement;

// Tema
function applyTheme(theme) {
  html.classList.remove('light', 'dark');
  html.classList.add(theme);
  localStorage.setItem('theme', theme);
}
function initTheme() {
  const saved = localStorage.getItem('theme');
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
}
window.addEventListener('DOMContentLoaded', initTheme);
document.querySelector('#theme-toggle').addEventListener('click', () =>
  applyTheme(html.classList.contains('dark') ? 'light' : 'dark')
);

// Utilidades
function hideAllSections() {
  document.querySelectorAll('.data-section').forEach(sec => sec.style.display = 'none');
}
function toggleLoader(show = true) {
  statusDiv.innerHTML = show ? '<div class="loader"></div>' : '';
}
function renderCardsGeneric(items, containerId, contentFn) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = contentFn(item);
    container.appendChild(card);
  });
}

// Carga y renderizado
async function loadResource(resource) {
  hideAllSections();
  toggleLoader(true);

  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/${resource}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const containerId = `${resource}-container`;
    const contentFn = resource === 'users'
      ? user => `
          <h3>${user.name}</h3>
          <p><strong>📧Email:</strong> ${user.email}</p>
          <p><strong>📞Teléfono:</strong> ${user.phone}</p>
          <p><strong>👨‍💻Compañía:</strong> ${user.company.name}</p>
        `
      : item => `
          <h3>${item.title}</h3>
          <p>${resource === 'posts' ? item.body : 'Álbum de usuario #' + item.userId}</p>
        `;

    renderCardsGeneric(data, containerId, contentFn);
    document.getElementById(containerId).style.display = 'grid';

  } catch (err) {
    statusDiv.textContent = `Error al cargar: ${err.message}`;
  } finally {
    toggleLoader(false);
  }
}

// Navegación
function handleNavClick(e) {
  e.preventDefault();
  links.forEach(l => l.classList.toggle('active', l === e.currentTarget));
  loadResource(e.currentTarget.dataset.resource);
}
links.forEach(link => link.addEventListener('click', handleNavClick));

// Carga inicial
window.addEventListener('DOMContentLoaded', () => {
  const defaultLink = document.querySelector('a[data-resource="users"]');
  defaultLink.classList.add('active');
  loadResource('users');
});
