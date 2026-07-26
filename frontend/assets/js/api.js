/* ==========================================================================
   ZYRA REST API CLIENT WRAPPER & GUEST LOCAL STORAGE STORE
   ========================================================================== */

const API_BASE_URL = window.location.origin.includes('5000') || window.location.origin.includes('http')
  ? '/api'
  : 'http://localhost:5000/api';

// Local Storage Fallback Store
const LocalStore = {
  getWishlist: () => JSON.parse(localStorage.getItem('zyra_wishlist') || '[]'),
  saveWishlist: (list) => localStorage.setItem('zyra_wishlist', JSON.stringify(list)),
  
  getCart: () => JSON.parse(localStorage.getItem('zyra_cart') || '[]'),
  saveCart: (cart) => localStorage.setItem('zyra_cart', JSON.stringify(cart)),

  getOrders: () => JSON.parse(localStorage.getItem('zyra_orders') || '[]'),
  saveOrder: (order) => {
    const orders = LocalStore.getOrders();
    orders.unshift(order);
    localStorage.setItem('zyra_orders', JSON.stringify(orders));
  }
};

function getAuthToken() {
  return localStorage.getItem('zyra_token') || sessionStorage.getItem('zyra_token');
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[API Client] Communication error on ${endpoint}. Operating in Local Mode.`);
    return { success: false, isOffline: true };
  }
}

const API = {
  // Auth
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  getProfile: () => apiRequest('/auth/me', 'GET'),

  // Products
  getProducts: async (params = '') => {
    const res = await apiRequest(`/products${params}`);
    if (res.success) return res;
    // Fallback in-memory search if backend is completely down
    return { success: true, count: 0, products: [] };
  },
  getProductById: (id) => apiRequest(`/products/${id}`),
  getCategories: () => apiRequest('/products/categories'),

  // Wishlist
  getWishlist: async () => {
    const res = await apiRequest('/wishlist');
    if (res.success && !res.isOffline) return res;

    // Fallback to Local Storage
    const items = LocalStore.getWishlist();
    return { success: true, count: items.length, items };
  },
  addToWishlist: async (productId, productObj = null) => {
    const res = await apiRequest('/wishlist', 'POST', { product_id: productId });
    if (res.success && !res.isOffline) return res;

    const list = LocalStore.getWishlist();
    if (!list.some(item => (item.product_id || item.id) === productId)) {
      list.push(productObj || { product_id: productId, id: productId });
      LocalStore.saveWishlist(list);
    }
    return { success: true, message: 'Added to Wishlist' };
  },
  removeFromWishlist: async (productId) => {
    const res = await apiRequest(`/wishlist/${productId}`, 'DELETE');
    let list = LocalStore.getWishlist();
    list = list.filter(item => (item.product_id || item.id) !== parseInt(productId));
    LocalStore.saveWishlist(list);
    return { success: true, message: 'Removed from Wishlist' };
  },

  // Cart
  getCart: async () => {
    const res = await apiRequest('/cart');
    if (res.success && !res.isOffline) return res;

    const items = LocalStore.getCart();
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { success: true, count, items };
  },
  addToCart: async (product, quantity = 1) => {
    const productId = typeof product === 'object' ? product.id : product;
    const res = await apiRequest('/cart', 'POST', { product_id: productId, quantity });
    
    // Always keep LocalStorage synced for smooth checkout
    const cart = LocalStore.getCart();
    const existing = cart.find(item => item.id === productId || item.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: productId,
        product_id: productId,
        name: product.name || 'ZYRA Beauty Product',
        price: product.price || 1499,
        image: product.image || '../assets/products/lipstick_rose.jpg',
        shade: product.shade || 'Standard',
        quantity
      });
    }
    LocalStore.saveCart(cart);

    return { success: true, message: 'Added to Cart' };
  },
  updateCartQty: async (productId, quantity) => {
    await apiRequest(`/cart/${productId}`, 'PUT', { quantity });
    const cart = LocalStore.getCart();
    const existing = cart.find(item => item.id === parseInt(productId) || item.product_id === parseInt(productId));
    if (existing) {
      if (quantity <= 0) {
        return API.removeFromCart(productId);
      }
      existing.quantity = quantity;
      LocalStore.saveCart(cart);
    }
    return { success: true };
  },
  removeFromCart: async (productId) => {
    await apiRequest(`/cart/${productId}`, 'DELETE');
    let cart = LocalStore.getCart();
    cart = cart.filter(item => item.id !== parseInt(productId) && item.product_id !== parseInt(productId));
    LocalStore.saveCart(cart);
    return { success: true };
  },
  clearCart: async () => {
    await apiRequest('/cart/clear', 'DELETE');
    LocalStore.saveCart([]);
    return { success: true };
  },

  // Contact
  submitContact: (contactData) => apiRequest('/contact', 'POST', contactData),

  // Orders
  createOrder: async (orderData) => {
    const res = await apiRequest('/orders', 'POST', orderData);
    if (res.success && res.order) {
      LocalStore.saveOrder(res.order);
      API.clearCart();
      return res;
    }
    // Offline local fallback order creation
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const order_id = `ZYRA-2026-${randomId}`;
    const localOrder = {
      order_id,
      ...orderData,
      created_at: new Date().toISOString()
    };
    LocalStore.saveOrder(localOrder);
    API.clearCart();
    return { success: true, order_id, order: localOrder };
  },
  getOrderById: async (orderId) => {
    const res = await apiRequest(`/orders/${orderId}`);
    if (res.success && res.order) return res;

    const orders = LocalStore.getOrders();
    const found = orders.find(o => o.order_id === orderId);
    if (found) return { success: true, order: found };
    return { success: false, message: 'Order not found' };
  },

  // Reviews
  getReviews: (productId) => apiRequest(`/reviews/${productId}`),
  addReview: (reviewData) => apiRequest('/reviews', 'POST', reviewData)
};
