/* ==========================================================================
   ZYRA MASTER GLOBAL APPLICATION JS (DARK MODE, BADGES, TOASTS, NAVBAR)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbarScroll();
  updateHeaderCounts();
});

/* --------------------------------------------------------------------------
   1. DARK MODE SYSTEM & PERSISTENCE
   -------------------------------------------------------------------------- */
function initTheme() {
  const savedTheme = localStorage.getItem('zyra_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Attach event listener to theme toggle buttons
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

  // Mobile menu toggle
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
      const wishlistBadges = document.querySelectorAll('.wishlist-badge');
      wishlistBadges.forEach(badge => {
        badge.textContent = wishlistRes.count || 0;
      });
    }

    const cartRes = await API.getCart();
    if (cartRes.success) {
      const cartBadges = document.querySelectorAll('.cart-badge');
      cartBadges.forEach(badge => {
        badge.textContent = cartRes.count || 0;
      });
    }

    // Check user login state
    const user = JSON.parse(localStorage.getItem('zyra_user') || 'null');
    const userBtns = document.querySelectorAll('.user-action-btn');
    userBtns.forEach(btn => {
      if (user) {
        btn.innerHTML = `👤 <span class="user-pill">${user.fullname.split(' ')[0]}</span>`;
      }
    });

  } catch (err) {
    console.error('Failed to update counts:', err);
  }
}

/* --------------------------------------------------------------------------
   4. TOAST NOTIFICATION SYSTEM
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
