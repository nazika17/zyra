/* ==========================================================================
   ZYRA WISHLIST PAGE JS (IMAGE, NAME, PRICE, RATING, REMOVE, MOVE TO CART)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadWishlistPage();
});

async function loadWishlistPage() {
  const container = document.getElementById('wishlist-grid-container');
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 60px 0;"><p>Loading your Wishlist ❤️...</p></div>`;

  const res = await API.getWishlist();
  const wishlistItems = res.items || res.wishlist || [];

  if (!res.success || wishlistItems.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 60px 0;">
        <span style="font-size: 3rem;">❤️</span>
        <h3 style="margin: 16px 0 8px;">Your Wishlist is Empty</h3>
        <p style="color: var(--text-muted);">Save your favorite luxury cosmetics items to view them here anytime.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top: 18px;">Explore Products</a>
      </div>
    `;
    return;
  }

  // Fetch product detail for items if only IDs stored
  const detailedProducts = await Promise.all(wishlistItems.map(async item => {
    const id = item.product_id || item.id;
    if (item.name && item.price && item.image) return item;

    const prodRes = await API.getProductById(id);
    return prodRes.success && prodRes.product ? prodRes.product : { id, name: 'ZYRA Luxury Product', price: 1499, image: '../assets/products/lipstick_rose.jpg', rating: 4.9 };
  }));

  container.innerHTML = detailedProducts.map(item => {
    const productId = item.product_id || item.id;
    const imgPath = fixImagePath(item.image);

    return `
      <div class="product-card" data-id="${productId}">
        <div class="card-img-wrapper">
          <button class="card-wishlist-btn active" title="Remove from Wishlist" onclick="removeWishlistItem(${productId})">✖</button>
          <a href="product-details.html?id=${productId}">
            <img src="${imgPath}" class="card-img" alt="${item.name}" onerror="this.src='${fixImagePath('assets/products/lipstick_rose.jpg')}'">
          </a>
        </div>
        <div class="card-category">${item.category || 'ZYRA Cosmetics'}</div>
        <h3 class="card-title"><a href="product-details.html?id=${productId}">${item.name}</a></h3>
        <div class="card-shade">
          <span>${item.shade || 'Standard Shade'}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--champagne); margin-bottom:10px;">
          ${'★'.repeat(Math.floor(item.rating || 5))}${'☆'.repeat(5 - Math.floor(item.rating || 5))}
          <span style="color:var(--text-muted); font-size:0.75rem;">(${item.reviews_count || 32})</span>
        </div>
        <div class="card-footer">
          <span class="card-price">₹${parseFloat(item.price || 1499).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="removeWishlistItem(${productId})" title="Remove">Remove</button>
            <button class="btn btn-primary btn-sm" onclick="moveWishlistToCart(${productId})">🛒 Move to Cart</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateHeaderCounts();
}

async function removeWishlistItem(productId) {
  await API.removeFromWishlist(productId);
  showToast('Item removed from wishlist.');
  loadWishlistPage();
}

async function moveWishlistToCart(productId) {
  const prodRes = await API.getProductById(productId);
  const p = prodRes.success && prodRes.product ? prodRes.product : { id: productId, name: 'ZYRA Cosmetic', price: 1499 };

  await API.addToCart(p, 1);
  await API.removeFromWishlist(productId);
  showToast('Moved item to Shopping Cart 🛒');
  loadWishlistPage();
}
