/* ==========================================================================
   ZYRA PRODUCTS CATALOG & MULTI-FACETED LIVE FILTERING JS
   ========================================================================== */

let currentFilters = {
  category: 'All',
  search: '',
  sort: 'newest',
  min_price: 0,
  max_price: 2000,
  brand: 'All',
  skin_type: 'All',
  finish: 'All',
  in_stock: false
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('category')) {
    currentFilters.category = params.get('category');
  }
  if (params.has('search')) {
    currentFilters.search = params.get('search');
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) searchInput.value = currentFilters.search;
  }
  if (params.has('sort')) {
    currentFilters.sort = params.get('sort');
    const sortSelect = document.getElementById('catalog-sort');
    if (sortSelect) sortSelect.value = currentFilters.sort;
  }

  initCatalogFilters();
  loadProducts();
});

// Fetch and render product grid
async function loadProducts() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 60px 0;"><span style="font-size: 2rem;">✨</span><p>Loading ZYRA Luxury Collection...</p></div>`;

  const queryParams = new URLSearchParams();
  if (currentFilters.category !== 'All') queryParams.append('category', currentFilters.category);
  if (currentFilters.search) queryParams.append('search', currentFilters.search);
  if (currentFilters.sort) queryParams.append('sort', currentFilters.sort);
  if (currentFilters.min_price > 0) queryParams.append('min_price', currentFilters.min_price);
  if (currentFilters.max_price < 2000) queryParams.append('max_price', currentFilters.max_price);
  if (currentFilters.brand !== 'All') queryParams.append('brand', currentFilters.brand);
  if (currentFilters.skin_type !== 'All') queryParams.append('skin_type', currentFilters.skin_type);
  if (currentFilters.finish !== 'All') queryParams.append('finish', currentFilters.finish);
  if (currentFilters.in_stock) queryParams.append('in_stock', '1');

  const res = await API.getProducts(`?${queryParams.toString()}`);

  if (!res.success || !res.products || res.products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 60px 0;">
        <span style="font-size: 3rem;">🌸</span>
        <h3 style="margin: 16px 0 8px;">No Products Matched</h3>
        <p style="color: var(--text-muted);">Try loosening your filter criteria or search terms.</p>
        <button class="btn btn-outline btn-sm" style="margin-top: 16px;" onclick="resetFilters()">Reset All Filters</button>
      </div>`;
    return;
  }

  container.innerHTML = res.products.map(product => renderProductCard(product)).join('');
}

function renderProductCard(p) {
  const isNewBadge = p.is_new ? `<span class="card-badge">NEW</span>` : (p.is_bestseller ? `<span class="card-badge" style="background:var(--champagne);">BESTSELLER</span>` : '');
  const imagePath = fixImagePath(p.image);

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="card-img-wrapper">
        ${isNewBadge}
        <button class="card-wishlist-btn" title="Add to Wishlist" onclick="handleWishlistClick(event, ${p.id})">❤️</button>
        <a href="product-details.html?id=${p.id}">
          <img src="${imagePath}" alt="${p.name}" class="card-img" onerror="this.src='${fixImagePath('assets/products/lipstick_rose.jpg')}'">
        </a>
      </div>
      <div class="card-category">${p.category}</div>
      <h3 class="card-title"><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
      <div class="card-shade">
        <span class="shade-dot" style="background:${getShadeHex(p.shade)};"></span>
        <span>${p.shade || 'Standard Shade'}</span>
      </div>
      <div style="font-size:0.8rem; color:var(--champagne); margin-bottom:10px;">
        ${'★'.repeat(Math.floor(p.rating || 5))}${'☆'.repeat(5 - Math.floor(p.rating || 5))}
        <span style="color:var(--text-muted); font-size:0.75rem;">(${p.reviews_count || 12})</span>
      </div>
      <div class="card-footer">
        <span class="card-price">₹${parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        <button class="btn btn-primary btn-sm" onclick="handleAddToCart(event, ${p.id})">🛒 Add to Cart</button>
      </div>
    </div>
  `;
}

function getShadeHex(shadeName) {
  if (!shadeName) return '#B76E79';
  const name = shadeName.toLowerCase();
  if (name.includes('rose')) return '#C87D87';
  if (name.includes('red') || name.includes('crimson')) return '#A81C28';
  if (name.includes('peach')) return '#FF9E80';
  if (name.includes('gold') || name.includes('champagne')) return '#E5C158';
  if (name.includes('pink') || name.includes('peony')) return '#F48FB1';
  if (name.includes('black') || name.includes('carbon')) return '#212121';
  if (name.includes('honey') || name.includes('beige')) return '#D7A15C';
  return '#B76E79';
}

function initCatalogFilters() {
  // Category selection
  document.querySelectorAll('.cat-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.category = btn.getAttribute('data-category');
      loadProducts();
    });
  });

  // Search input
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentFilters.search = e.target.value;
        loadProducts();
      }, 300);
    });
  }

  // Sort select
  const sortSelect = document.getElementById('catalog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      loadProducts();
    });
  }

  // Price slider
  const priceSlider = document.getElementById('price-slider');
  const priceVal = document.getElementById('price-slider-val');
  if (priceSlider && priceVal) {
    priceSlider.addEventListener('input', (e) => {
      priceVal.textContent = `₹${e.target.value}`;
      currentFilters.max_price = parseFloat(e.target.value);
      loadProducts();
    });
  }

  // Skin Type checkboxes / radio
  document.querySelectorAll('input[name="skin_type"]').forEach(input => {
    input.addEventListener('change', (e) => {
      currentFilters.skin_type = e.target.value;
      loadProducts();
    });
  });

  // In Stock checkbox
  const inStockCheck = document.getElementById('filter-instock');
  if (inStockCheck) {
    inStockCheck.addEventListener('change', (e) => {
      currentFilters.in_stock = e.target.checked;
      loadProducts();
    });
  }
}

function resetFilters() {
  currentFilters = {
    category: 'All',
    search: '',
    sort: 'newest',
    min_price: 0,
    max_price: 2000,
    brand: 'All',
    skin_type: 'All',
    finish: 'All',
    in_stock: false
  };

  const searchInput = document.getElementById('catalog-search');
  if (searchInput) searchInput.value = '';

  const priceSlider = document.getElementById('price-slider');
  const priceVal = document.getElementById('price-slider-val');
  if (priceSlider && priceVal) {
    priceSlider.value = 2000;
    priceVal.textContent = '₹2000';
  }

  document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.cat-pill-btn[data-category="All"]')?.classList.add('active');

  loadProducts();
}

async function handleAddToCart(e, productId) {
  e.preventDefault();
  const res = await API.getProducts(`?id=${productId}`);
  const productObj = res.products && res.products[0] ? res.products[0] : { id: productId, name: 'ZYRA Cosmetic', price: 1499 };
  
  await API.addToCart(productObj, 1);
  showToast('Item added to your Shopping Cart 🛒');
  updateHeaderCounts();
}

async function handleWishlistClick(e, productId) {
  e.preventDefault();
  await API.addToWishlist(productId);
  showToast('Saved to your Wishlist ❤️');
  updateHeaderCounts();
}
