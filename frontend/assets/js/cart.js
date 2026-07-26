/* ==========================================================================
   ZYRA SHOPPING CART UI JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadCartPage();
});

async function loadCartPage() {
  const container = document.getElementById('cart-table-body');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTax = document.getElementById('summary-tax');
  const summaryShipping = document.getElementById('summary-shipping');
  const summaryTotal = document.getElementById('summary-total');

  if (!container) return;

  container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 40px;">Loading your cart...</td></tr>`;

  const res = await API.getCart();
  const cartItems = res.items || [];

  if (!res.success || cartItems.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 60px 0;">
          <span style="font-size: 3rem;">🛒</span>
          <h3 style="margin: 16px 0 8px;">Your Shopping Cart is Empty</h3>
          <p style="color: var(--text-muted);">Explore our luxury cosmetics collection to add items.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top: 18px;">Shop Now</a>
        </td>
      </tr>
    `;
    if (summarySubtotal) summarySubtotal.textContent = '₹0.00';
    if (summaryTax) summaryTax.textContent = '₹0.00';
    if (summaryShipping) summaryShipping.textContent = '₹0.00';
    if (summaryTotal) summaryTotal.textContent = '₹0.00';
    return;
  }

  let subtotal = 0;

  container.innerHTML = cartItems.map(item => {
    const itemPrice = parseFloat(item.price || 1499);
    const itemTotal = itemPrice * item.quantity;
    subtotal += itemTotal;
    const itemId = item.id || item.product_id;
    const imgPath = fixImagePath(item.image);

    return `
      <tr>
        <td>
          <div class="table-product-item">
            <img src="${imgPath}" class="table-product-img" alt="${item.name}" onerror="this.src='${fixImagePath('assets/products/lipstick_rose.jpg')}'">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--rose-gold);">${item.category || 'ZYRA Cosmetics'}</div>
              <strong style="font-size: 1rem;">${item.name}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${item.shade || 'Standard'}</div>
            </div>
          </div>
        </td>
        <td style="font-weight: 600;">₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeCartQty(${itemId}, ${item.quantity - 1})">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="changeCartQty(${itemId}, ${item.quantity + 1})">+</button>
          </div>
        </td>
        <td style="font-weight: 700; color: var(--rose-gold);">₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td>
          <button style="background:none; border:none; color: #E53935; cursor:pointer; font-size: 1.2rem;" title="Remove Item" onclick="removeCartItem(${itemId})">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');

  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 999 ? 0 : 99.00; // Free shipping above ₹999
  const grandTotal = subtotal + tax + shipping;

  if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (summaryTax) summaryTax.textContent = `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (summaryShipping) summaryShipping.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
  if (summaryTotal) summaryTotal.textContent = `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  updateHeaderCounts();
}

async function changeCartQty(productId, newQty) {
  await API.updateCartQty(productId, newQty);
  loadCartPage();
}

async function removeCartItem(productId) {
  await API.removeFromCart(productId);
  showToast('Item removed from cart.');
  loadCartPage();
}

function proceedCheckout() {
  window.location.href = 'checkout.html';
}
