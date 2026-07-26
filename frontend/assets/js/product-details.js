/* ==========================================================================
   ZYRA PRODUCT DETAILS PAGE JS (GALLERY, HOVER ZOOM, REVIEWS, BUY NOW)
   ========================================================================== */

let selectedQuantity = 1;
let currentProductId = null;
let currentProductData = null;
let selectedStarRating = 5;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 1;
  currentProductId = parseInt(id);
  loadProductDetails(currentProductId);
  initStarRating();
  initReviewForm();
});

async function loadProductDetails(id) {
  const res = await API.getProductById(id);
  if (!res.success || !res.product) {
    showToast('Product details not available.', 'error');
    return;
  }

  const p = res.product;
  currentProductData = p;
  document.title = `${p.name} — ZYRA Luxury Cosmetics`;

  // Gallery Setup
  const mainImg = document.getElementById('details-main-img');

  function getCategoryGalleryFallback(prod) {
    const primary = prod.image || 'assets/products/lipstick_rose.jpg';
    const cat = (prod.category || '').toLowerCase();

    if (cat.includes('lipgloss') || cat.includes('gloss')) {
      return [primary, 'assets/products/lipgloss_crystal.jpg', 'assets/products/lipstick_rose.jpg', 'assets/products/lipliner_mauve.jpg'];
    }
    if (cat.includes('liner') || cat.includes('lipliner')) {
      return [primary, 'assets/products/lipliner_mauve.jpg', 'assets/products/lipstick_rose.jpg', 'assets/products/lipgloss_crystal.jpg'];
    }
    if (cat.includes('spray') || cat.includes('setting')) {
      return [primary, 'assets/products/settingspray_dewy.jpg', 'assets/products/primer_glow.jpg', 'assets/products/cream_rose.jpg'];
    }
    if (cat.includes('foundation')) {
      return [primary, 'assets/products/foundation_silk.jpg', 'assets/products/foundation_matte.jpg', 'assets/products/concealer_peach.jpg'];
    }
    if (cat.includes('blush')) {
      return [primary, 'assets/products/blush_peony.jpg', 'assets/products/highlighter_champagne.jpg', 'assets/products/compact_gold.jpg'];
    }
    if (cat.includes('eyeshadow')) {
      return [primary, 'assets/products/eyeshadow_palette.jpg', 'assets/products/highlighter_champagne.jpg', 'assets/products/eyeliner_black.jpg'];
    }
    if (cat.includes('mascara') || cat.includes('eyeliner') || cat.includes('kajal')) {
      return [primary, 'assets/products/mascara_black.jpg', 'assets/products/eyeliner_black.jpg', 'assets/products/kajal_carbon.jpg'];
    }
    if (cat.includes('skincare') || cat.includes('serum') || cat.includes('cream')) {
      return [primary, 'assets/products/serum_elixir.jpg', 'assets/products/cream_rose.jpg', 'assets/products/settingspray_dewy.jpg'];
    }
    if (cat.includes('brush') || cat.includes('blender') || cat.includes('sponge')) {
      return [primary, 'assets/products/brushes_set.jpg', 'assets/products/sponge_pink.jpg', 'assets/products/compact_gold.jpg'];
    }
    return [primary, 'assets/products/lipstick_rose.jpg', 'assets/products/lipstick_crimson.jpg'];
  }

  const imageList = (p.images && p.images.length > 1) ? p.images : getCategoryGalleryFallback(p);
  const resolvedImages = imageList.map(img => fixImagePath(img));

  if (mainImg) {
    mainImg.src = resolvedImages[0];
    mainImg.onerror = () => { mainImg.src = fixImagePath(resolvedImages[0]); };
    initImageZoom(mainImg);
  }

  // Thumbnails Grid
  const thumbGrid = document.getElementById('thumbnail-grid');
  if (thumbGrid) {
    thumbGrid.innerHTML = resolvedImages.map((imgUrl, index) => `
      <img src="${imgUrl}" class="thumb-img ${index === 0 ? 'active' : ''}" alt="Product View ${index + 1}" onclick="switchMainImage('${imgUrl}', this)" onerror="this.src='${fixImagePath('assets/products/lipstick_rose.jpg')}'">
    `).join('');
  }

  // Info details
  const categoryElem = document.getElementById('details-category');
  if (categoryElem) categoryElem.textContent = p.category;

  const titleElem = document.getElementById('details-title');
  if (titleElem) titleElem.textContent = p.name;

  const priceElem = document.getElementById('details-price');
  if (priceElem) priceElem.textContent = `₹${parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const descElem = document.getElementById('details-desc');
  if (descElem) descElem.textContent = p.description;

  const shadeElem = document.getElementById('details-shade-name');
  if (shadeElem) shadeElem.textContent = p.shade || 'Standard Shade';

  const ingredientsElem = document.getElementById('details-ingredients');
  if (ingredientsElem) ingredientsElem.textContent = p.ingredients || 'Natural botanical oils, mineral pigments, hyaluronic acid.';

  const benefitsElem = document.getElementById('details-benefits');
  if (benefitsElem) benefitsElem.textContent = p.benefits || '12-Hour Moisture Hold, 100% Cruelty-Free, Dermatologist Approved.';

  const howToUseElem = document.getElementById('details-howtouse');
  if (howToUseElem) howToUseElem.textContent = p.how_to_use || 'Apply evenly across prepped skin. Layer for buildable intensity.';

  const ratingElem = document.getElementById('details-rating');
  if (ratingElem) ratingElem.textContent = `★ ${p.rating || '4.9'} (${p.reviews_count || 32} Customer Reviews)`;

  const stockElem = document.getElementById('details-stock');
  if (stockElem) {
    stockElem.textContent = p.stock > 0 ? `In Stock (${p.stock} units available)` : 'Out of Stock';
    stockElem.style.color = p.stock > 0 ? '#4CAF50' : '#E53935';
  }

  // Action Buttons
  const addCartBtn = document.getElementById('details-add-cart-btn');
  if (addCartBtn) {
    addCartBtn.onclick = async () => {
      await API.addToCart(p, selectedQuantity);
      showToast(`Added ${selectedQuantity}x ${p.name} to Shopping Cart 🛒`);
      updateHeaderCounts();
    };
  }

  const wishlistBtn = document.getElementById('details-wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.onclick = async () => {
      await API.addToWishlist(p.id, p);
      showToast('Saved to Wishlist ❤️');
      updateHeaderCounts();
    };
  }

  const buyNowBtn = document.getElementById('details-buy-now-btn');
  if (buyNowBtn) {
    buyNowBtn.onclick = async () => {
      await API.addToCart(p, selectedQuantity);
      updateHeaderCounts();
      window.location.href = 'checkout.html';
    };
  }

  // Related products
  if (res.related && res.related.length > 0) {
    const relatedContainer = document.getElementById('related-products-grid');
    if (relatedContainer) {
      relatedContainer.innerHTML = res.related.map(item => `
        <div class="product-card">
          <div class="card-img-wrapper">
            <a href="product-details.html?id=${item.id}">
              <img src="${fixImagePath(item.image)}" class="card-img" alt="${item.name}" onerror="this.src='${fixImagePath('assets/products/lipstick_rose.jpg')}'">
            </a>
          </div>
          <div class="card-category">${item.category}</div>
          <h4 class="card-title"><a href="product-details.html?id=${item.id}">${item.name}</a></h4>
          <div class="card-footer">
            <span class="card-price">₹${parseFloat(item.price).toFixed(2)}</span>
            <a href="product-details.html?id=${item.id}" class="btn btn-outline btn-sm">View Details</a>
          </div>
        </div>
      `).join('');
    }
  }

  loadReviews(id);
}

function switchMainImage(url, thumbElem) {
  const mainImg = document.getElementById('details-main-img');
  if (mainImg) {
    mainImg.src = url;
  }
  document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
  if (thumbElem) thumbElem.classList.add('active');
}

function initImageZoom(imgElement) {
  const container = imgElement.parentElement;
  if (!container || !container.classList.contains('zoom-container')) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imgElement.style.transformOrigin = `${x}% ${y}%`;
  });
}

function updateQty(delta) {
  selectedQuantity = Math.max(1, selectedQuantity + delta);
  const qtyElem = document.getElementById('details-qty-val');
  if (qtyElem) qtyElem.textContent = selectedQuantity;
}

/* --------------------------------------------------------------------------
   REVIEWS & RATING SYSTEM
   -------------------------------------------------------------------------- */
async function loadReviews(productId) {
  const container = document.getElementById('reviews-list-container');
  if (!container) return;

  const res = await API.getReviews(productId);
  if (res.success && res.reviews && res.reviews.length > 0) {
    container.innerHTML = res.reviews.map(r => `
      <div class="product-card" style="padding:20px; margin-bottom:14px; background:var(--card-bg);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:0.95rem;">${r.user_name}</strong>
          <span style="color:var(--champagne); font-size:1.1rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
        <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.5;">${r.comment}</p>
        <span style="font-size:0.75rem; color:var(--rose-gold); margin-top:8px; display:block;">Verified Buyer • ${new Date(r.created_at).toLocaleDateString()}</span>
      </div>
    `).join('');
  } else {
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px;">No reviews yet. Be the first to leave feedback for this luxury product!</p>`;
  }
}

function initStarRating() {
  const starsContainer = document.getElementById('star-rating-picker');
  if (!starsContainer) return;

  const stars = starsContainer.querySelectorAll('span');
  stars.forEach((star, idx) => {
    star.addEventListener('click', () => {
      selectedStarRating = idx + 1;
      stars.forEach((s, i) => {
        if (i <= idx) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });
}

function initReviewForm() {
  const form = document.getElementById('submit-review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('review-name')?.value.trim();
    const email = document.getElementById('review-email')?.value.trim();
    const comment = document.getElementById('review-comment')?.value.trim();

    if (!name || !comment) {
      showToast('Please fill in your name and review comment.', 'error');
      return;
    }

    const res = await API.addReview({
      product_id: currentProductId,
      user_name: name,
      user_email: email,
      rating: selectedStarRating,
      comment
    });

    if (res.success) {
      showToast('Thank you! Your review has been submitted ✨');
      form.reset();
      loadReviews(currentProductId);
    } else {
      showToast(res.message || 'Could not submit review.', 'error');
    }
  });
}
