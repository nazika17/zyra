/* --------------------------------------------------------------------------
   0. UNIVERSAL RELATIVE IMAGE PATH RESOLVER
   -------------------------------------------------------------------------- */
function fixImagePath(imgPath) {
  const isSubfolder = window.location.pathname.includes('/pages/');
  const defaultImg = isSubfolder ? '../assets/products/lipstick_rose.jpg' : 'assets/products/lipstick_rose.jpg';

  if (!imgPath) return defaultImg;

  let clean = imgPath.replace(/^(\.\.\/|\/)+/, '');
  if (!clean.startsWith('assets/')) {
    clean = `assets/${clean}`;
  }

  return isSubfolder ? `../${clean}` : clean;
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbarScroll();
  updateHeaderCounts();
  initLiveSearchSuggestions();
});

/* --------------------------------------------------------------------------
   1. DARK MODE SYSTEM & PERSISTENCE
   -------------------------------------------------------------------------- */
function initTheme() {
  const savedTheme = localStorage.getItem('zyra_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('zyra_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(newTheme === 'dark' ? 'Switched to Dark Luxury Mode 🌙' : 'Switched to Light Luxury Mode ☀️');
    });
  });
}

function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

/* --------------------------------------------------------------------------
   2. STICKY GLASSMORPHISM NAVBAR & MOBILE MENU
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }
}

/* --------------------------------------------------------------------------
   3. HEADER BADGE COUNTERS (WISHLIST & CART)
   -------------------------------------------------------------------------- */
async function updateHeaderCounts() {
  try {
    const wishlistRes = await API.getWishlist();
    if (wishlistRes.success) {
      document.querySelectorAll('.wishlist-badge').forEach(badge => {
        badge.textContent = wishlistRes.count || 0;
      });
    }

    const cartRes = await API.getCart();
    if (cartRes.success) {
      document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = cartRes.count || 0;
      });
    }

    const user = JSON.parse(localStorage.getItem('zyra_user') || 'null');
    document.querySelectorAll('.user-action-btn').forEach(btn => {
      if (user) {
        btn.innerHTML = `👤 <span class="user-pill">${user.fullname.split(' ')[0]}</span>`;
      }
    });

  } catch (err) {
    console.error('Failed to update header counts:', err);
  }
}

/* --------------------------------------------------------------------------
   4. LIVE SEARCH AUTCOMPLETE SUGGESTIONS
   -------------------------------------------------------------------------- */
function initLiveSearchSuggestions() {
  const searchInputs = document.querySelectorAll('.search-input');
  
  searchInputs.forEach(input => {
    const parent = input.parentElement;
    if (!parent) return;

    let dropdown = parent.querySelector('.search-suggestions-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-suggestions-dropdown';
      parent.appendChild(dropdown);
    }

    input.addEventListener('input', async (e) => {
      const term = e.target.value.trim();
      if (term.length < 2) {
        dropdown.style.display = 'none';
        return;
      }

      const res = await API.getProducts(`?search=${encodeURIComponent(term)}`);
      if (res.success && res.products && res.products.length > 0) {
        const pathPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
        dropdown.innerHTML = res.products.slice(0, 5).map(p => `
          <div class="search-suggestion-item" onclick="window.location.href='${pathPrefix}product-details.html?id=${p.id}'">
            <img src="${fixImagePath(p.image)}" class="suggestion-thumb" alt="${p.name}" onerror="this.src='${fixImagePath('assets/products/lipstick_rose.jpg')}'">
            <div>
              <div style="font-weight:600; font-size:0.88rem;">${p.name}</div>
              <div style="font-size:0.75rem; color:var(--rose-gold);">₹${parseFloat(p.price).toFixed(2)} • ${p.category}</div>
            </div>
          </div>
        `).join('');
        dropdown.style.display = 'block';
      } else {
        dropdown.innerHTML = `<div style="padding: 14px; font-size:0.85rem; color:var(--text-muted); text-align:center;">No matching products found.</div>`;
        dropdown.style.display = 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!parent.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. TOAST NOTIFICATION SYSTEM
   -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${type === 'error' ? '⚠️' : '✨'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}
