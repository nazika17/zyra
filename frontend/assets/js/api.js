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

const FALLBACK_PRODUCTS = [
  { id: 1, category: 'Lipstick', name: 'Velvet Rose Matte Lipstick', description: 'Weightless velvet-matte lipstick infused with hyaluronic acid and organic rosehip oil for 12-hour comfortable hydration.', price: 499.00, shade: 'Velvet Rose', stock: 45, image: 'assets/products/lipstick_rose.jpg', images: ["assets/products/lipstick_rose.jpg", "assets/products/lipstick_crimson.jpg", "assets/products/lipliner_mauve.jpg"], brand: 'ZYRA', color: 'Rose Pink', finish: 'Matte', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 128, ingredients: 'Dimethicone, Rosa Canina Fruit Oil, Hyaluronic Acid.', benefits: '12-Hour Hydrating Hold.', how_to_use: 'Apply directly from bullet.', is_featured: 1, is_bestseller: 1, is_new: 0 },
  { id: 2, category: 'Lipstick', name: 'Satin Crimson Nude Lipstick', description: 'Luminous satin finish lipstick that wraps lips in ultra-rich pigmentation, silky feel, and understated luxury sheen.', price: 449.00, shade: 'Crimson Nude', stock: 30, image: 'assets/products/lipstick_crimson.jpg', images: ["assets/products/lipstick_crimson.jpg", "assets/products/lipstick_rose.jpg", "assets/products/lipgloss_crystal.jpg"], brand: 'ZYRA', color: 'Crimson Red', finish: 'Satin', skin_type: 'All Skin Types', rating: 4.8, reviews_count: 86, ingredients: 'Ricinus Communis Seed Oil, Jojoba Oil.', benefits: 'Luminous Satin Sheen.', how_to_use: 'Glide across clean lips.', is_featured: 0, is_bestseller: 1, is_new: 1 },
  { id: 3, category: 'Foundation', name: 'Luminous Silk Hydrating Foundation', description: 'Ultra-fluid liquid foundation providing buildable medium-to-full coverage with a natural radiant glow.', price: 899.00, shade: 'Warm Honey', stock: 60, image: 'assets/products/foundation_silk.jpg', images: ["assets/products/foundation_silk.jpg", "assets/products/foundation_matte.jpg", "assets/products/concealer_peach.jpg"], brand: 'ZYRA', color: 'Warm Beige', finish: 'Dewy', skin_type: 'Dry & Normal', rating: 4.9, reviews_count: 210, ingredients: 'Aqua, Cyclopentasiloxane, Niacinamide, Squalane.', benefits: '24-Hour Hydration Veil.', how_to_use: 'Blend outward with sponge.', is_featured: 1, is_bestseller: 1, is_new: 0 },
  { id: 4, category: 'Foundation', name: 'Soft Matte Perfecting Foundation', description: 'Oil-free velvet matte foundation formulated with micronized silica and salicylic acid for poreless coverage.', price: 799.00, shade: 'Porcelain Ivory', stock: 40, image: 'assets/products/foundation_matte.jpg', images: ["assets/products/foundation_matte.jpg", "assets/products/foundation_silk.jpg"], brand: 'ZYRA', color: 'Ivory Nude', finish: 'Matte', skin_type: 'Oily & Combination', rating: 4.7, reviews_count: 142, ingredients: 'Aqua, Silica, Zinc Oxide, Salicylic Acid.', benefits: 'Sebum Absorbing, 16H Hold.', how_to_use: 'Apply onto prepped skin.', is_featured: 0, is_bestseller: 0, is_new: 1 },
  { id: 5, category: 'Concealer', name: 'Radiant Skin Full Coverage Concealer', description: 'Creamy crease-proof concealer that instantly blurs dark circles, redness, and blemishes with a botanical finish.', price: 399.00, shade: 'Light Peach', stock: 50, image: 'assets/products/concealer_peach.jpg', images: ["assets/products/concealer_peach.jpg", "assets/products/foundation_silk.jpg"], brand: 'ZYRA', color: 'Peach Warm', finish: 'Satin', skin_type: 'All Skin Types', rating: 4.8, reviews_count: 94, ingredients: 'Aqua, Glycerin, Coffee Seed Extract.', benefits: 'De-Puffing Coffee Complex.', how_to_use: 'Dot under eyes or over spots.', is_featured: 1, is_bestseller: 0, is_new: 0 },
  { id: 6, category: 'Compact Powder', name: 'Aura Micro-Fine Pressed Powder', description: 'Weightless translucent setting compact powder that diffuses light, sets makeup, and absorbs shine.', price: 499.00, shade: 'Translucent Gold', stock: 35, image: 'assets/products/compact_gold.jpg', images: ["assets/products/compact_gold.jpg", "assets/products/foundation_matte.jpg"], brand: 'ZYRA', color: 'Champagne Gold', finish: 'Matte', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 78, ingredients: 'Talc Free Mica, Silica, Argan Oil.', benefits: 'Zero Flashback, Ultra-Fine.', how_to_use: 'Press gently with puff.', is_featured: 0, is_bestseller: 1, is_new: 0 },
  { id: 7, category: 'Blush', name: 'Soft Petal Liquid Blush', description: 'Liquid cream blush that melts effortlessly into skin, delivering a fresh flush of youth-building radiance.', price: 399.00, shade: 'Soft Peony', stock: 55, image: 'assets/products/blush_peony.jpg', images: ["assets/products/blush_peony.jpg", "assets/products/highlighter_champagne.jpg"], brand: 'ZYRA', color: 'Peony Pink', finish: 'Dewy', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 165, ingredients: 'Isododecane, Squalane, Rose Water.', benefits: 'Weightless Liquid Flush.', how_to_use: 'Dab 1-2 dots onto cheek apples.', is_featured: 1, is_bestseller: 1, is_new: 1 },
  { id: 8, category: 'Primer', name: 'Silk Veil Poreless Radiant Primer', description: 'Smoothing hydrating primer infused with pearl essence and hyaluronic acid to create a silky canvas.', price: 599.00, shade: 'Clear Glow', stock: 40, image: 'assets/products/primer_glow.jpg', images: ["assets/products/primer_glow.jpg", "assets/products/foundation_silk.jpg"], brand: 'ZYRA', color: 'Clear Pearl', finish: 'Dewy', skin_type: 'All Skin Types', rating: 4.8, reviews_count: 112, ingredients: 'Dimethicone Crosspolymer, Pearl Essence.', benefits: 'Pore-Filling Velvet Texture.', how_to_use: 'Smooth over clean skin.', is_featured: 0, is_bestseller: 0, is_new: 1 },
  { id: 9, category: 'Highlighter', name: 'Celestial Glow Liquid Highlighter', description: 'Concentrated liquid illuminator packed with pearl pigments for buildable glass-skin luminosity.', price: 499.00, shade: 'Champagne Shimmer', stock: 45, image: 'assets/products/highlighter_champagne.jpg', images: ["assets/products/highlighter_champagne.jpg", "assets/products/blush_peony.jpg"], brand: 'ZYRA', color: 'Champagne Gold', finish: 'Shimmer', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 184, ingredients: 'Mica, Titanium Dioxide, Squalane.', benefits: 'Glass-Skin Shimmer.', how_to_use: 'Apply to cheekbones.', is_featured: 1, is_bestseller: 1, is_new: 0 },
  { id: 10, category: 'Mascara', name: 'Lash Sculpt Volume & Curl Mascara', description: 'Smudge-proof 24-hour lengthening mascara with an hourglass wand that lifts and fans every lash.', price: 349.00, shade: 'Midnight Black', stock: 70, image: 'assets/products/mascara_black.jpg', images: ["assets/products/mascara_black.jpg", "assets/products/eyeliner_black.jpg"], brand: 'ZYRA', color: 'Deep Black', finish: 'Glossy', skin_type: 'Sensitive Eyes', rating: 4.8, reviews_count: 195, ingredients: 'Carnauba Wax, Acacia Gum, Panthenol.', benefits: '300% Volume Boost.', how_to_use: 'Wiggle wand from root to tip.', is_featured: 1, is_bestseller: 1, is_new: 0 },
  { id: 11, category: 'Eyeliner', name: 'Precision Waterproof Liquid Eyeliner', description: 'Ultra-fine 0.1mm felt-tip pen for razor-sharp winged liner with waterproof carbon black intensity.', price: 299.00, shade: 'Jet Black', stock: 80, image: 'assets/products/eyeliner_black.jpg', images: ["assets/products/eyeliner_black.jpg", "assets/products/mascara_black.jpg"], brand: 'ZYRA', color: 'Jet Black', finish: 'Matte', skin_type: 'All Skin Types', rating: 4.7, reviews_count: 130, ingredients: 'Water, Acrylates Copolymer, Carbon Black.', benefits: '24-Hour Waterproof.', how_to_use: 'Draw along upper lash line.', is_featured: 0, is_bestseller: 0, is_new: 1 },
  { id: 12, category: 'Kajal', name: 'Intense Kohl Gel Kajal', description: 'Creamy botanical kajal pencil enriched with Sweet Almond Oil and Vitamin E for smudgeless 16-hour wear.', price: 249.00, shade: 'Deep Carbon', stock: 65, image: 'assets/products/kajal_carbon.jpg', images: ["assets/products/kajal_carbon.jpg", "assets/products/eyeliner_black.jpg"], brand: 'ZYRA', color: 'Carbon Black', finish: 'Matte', skin_type: 'Sensitive Eyes', rating: 4.8, reviews_count: 150, ingredients: 'Prunus Amygdalus Dulcis Oil, Vitamin E.', benefits: 'Ophthalmologist Tested.', how_to_use: 'Glide along waterline.', is_featured: 0, is_bestseller: 1, is_new: 0 },
  { id: 13, category: 'Eyeshadow', name: 'Rose Gold Luxury Eyeshadow Palette', description: '12 high-pigment shades featuring buttery mattes, sparkling foils, and silky shimmers.', price: 899.00, shade: '12-Shade Palette', stock: 30, image: 'assets/products/eyeshadow_palette.jpg', images: ["assets/products/eyeshadow_palette.jpg", "assets/products/highlighter_champagne.jpg"], brand: 'ZYRA', color: 'Rose Gold Metallic', finish: 'Shimmer & Matte', skin_type: 'All Skin Types', rating: 5.0, reviews_count: 310, ingredients: 'Mica, Talc Free Silicates, Magnesium Stearate.', benefits: 'Zero Fallout, High Payoff.', how_to_use: 'Sweep neutral mattes across lid.', is_featured: 1, is_bestseller: 1, is_new: 1 },
  { id: 14, category: 'Lip Gloss', name: 'Glass Shine Plumping Lip Gloss', description: 'Non-sticky high-shine gloss infused with natural peptide complexes and coconut nectar for fuller-looking lips.', price: 349.00, shade: 'Crystal Rose', stock: 50, image: 'assets/products/lipgloss_crystal.jpg', images: ["assets/products/lipgloss_crystal.jpg", "assets/products/lipstick_rose.jpg", "assets/products/lipliner_mauve.jpg"], brand: 'ZYRA', color: 'Crystal Pink', finish: 'Glossy', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 140, ingredients: 'Polybutene, Coconut Oil, Peptide Complex.', benefits: '3D Glass Mirror Shine.', how_to_use: 'Apply directly onto bare lips.', is_featured: 1, is_bestseller: 0, is_new: 1 },
  { id: 15, category: 'Lip Liner', name: 'Sculpt & Define Precision Lip Pencil', description: 'Creamy waterproof lip liner pencil that prevents feathering and creates defined contours.', price: 299.00, shade: 'Mauve Nude', stock: 40, image: 'assets/products/lipliner_mauve.jpg', images: ["assets/products/lipliner_mauve.jpg", "assets/products/lipstick_rose.jpg", "assets/products/lipgloss_crystal.jpg"], brand: 'ZYRA', color: 'Nude Mauve', finish: 'Matte', skin_type: 'All Skin Types', rating: 4.7, reviews_count: 75, ingredients: 'Jojoba Seed Oil, Carnauba Wax.', benefits: 'Waterproof 12H Contour.', how_to_use: 'Outline outer lip border.', is_featured: 0, is_bestseller: 0, is_new: 0 },
  { id: 16, category: 'Setting Spray', name: 'Everlasting Dewy Setting Mist', description: 'Micro-fine setting spray that seals makeup for up to 18 hours while locking in skin hydration.', price: 499.00, shade: 'Dewy Clear', stock: 45, image: 'assets/products/settingspray_dewy.jpg', images: ["assets/products/settingspray_dewy.jpg", "assets/products/primer_glow.jpg", "assets/products/cream_rose.jpg"], brand: 'ZYRA', color: 'Clear Mist', finish: 'Dewy', skin_type: 'All Skin Types', rating: 4.8, reviews_count: 98, ingredients: 'Aqua, Aloe Vera, Niacinamide, Rose Hydrosol.', benefits: '18-Hour Makeup Lock.', how_to_use: 'Mist evenly across face.', is_featured: 0, is_bestseller: 1, is_new: 0 },
  { id: 17, category: 'Makeup Brushes', name: 'Velvet Touch 8-Piece Luxury Brush Set', description: 'Ultra-soft cruelty-free synthetic fiber brushes with ergonomic Rose Gold metallic handles.', price: 999.00, shade: 'Rose Gold Edition', stock: 25, image: 'assets/products/brushes_set.jpg', images: ["assets/products/brushes_set.jpg", "assets/products/sponge_pink.jpg"], brand: 'ZYRA', color: 'Rose Gold', finish: 'Luxury Taklon', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 120, ingredients: 'Taklon Synthetic Bristles, Aluminum Ferrule.', benefits: 'Zero Shedding Guarantee.', how_to_use: 'Use for liquids and powders.', is_featured: 1, is_bestseller: 1, is_new: 0 },
  { id: 18, category: 'Beauty Blender', name: 'Seamless Blend Miracle Sponge Duo', description: 'Precision teardrop beauty sponges for streak-free liquid foundation and concealer application.', price: 299.00, shade: 'Blush Pink', stock: 90, image: 'assets/products/sponge_pink.jpg', images: ["assets/products/sponge_pink.jpg", "assets/products/brushes_set.jpg"], brand: 'ZYRA', color: 'Blush Pink', finish: 'Airbrush', skin_type: 'All Skin Types', rating: 4.8, reviews_count: 205, ingredients: 'Hydrophilic Polyurethane Foam.', benefits: 'Zero Absorbed Product Waste.', how_to_use: 'Wet thoroughly and bounce gently.', is_featured: 0, is_bestseller: 1, is_new: 1 },
  { id: 19, category: 'Skincare', name: 'Botanical Youth Elixir Facial Serum', description: 'Restorative facial oil serum formulated with Bakuchiol, Rosehip Oil, and Squalane for ageless glow.', price: 799.00, shade: 'Golden Elixir', stock: 35, image: 'assets/products/serum_elixir.jpg', images: ["assets/products/serum_elixir.jpg", "assets/products/cream_rose.jpg"], brand: 'ZYRA', color: 'Golden Glow', finish: 'Dewy', skin_type: 'All Skin Types', rating: 4.9, reviews_count: 175, ingredients: 'Squalane, Bakuchiol, Rosehip Oil.', benefits: 'Smooths Fine Lines.', how_to_use: 'Warm 3-4 drops and press into skin.', is_featured: 1, is_bestseller: 1, is_new: 1 },
  { id: 20, category: 'Skincare', name: 'Hydra-Rose Moisture Surge Cream', description: 'Rich velvety moisturizer packed with Damask Rose water, Ceramide NP, and Hyaluronic Acid.', price: 699.00, shade: 'Soft Ivory Cream', stock: 40, image: 'assets/products/cream_rose.jpg', images: ["assets/products/cream_rose.jpg", "assets/products/serum_elixir.jpg"], brand: 'ZYRA', color: 'Soft Pink Cream', finish: 'Dewy', skin_type: 'Dry & Normal', rating: 4.9, reviews_count: 134, ingredients: 'Damask Rose Water, Sodium Hyaluronate.', benefits: '72-Hour Plumping Hydration.', how_to_use: 'Massage onto face after serum.', is_featured: 0, is_bestseller: 1, is_new: 0 }
];

const API = {
  // Auth
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  getProfile: () => apiRequest('/auth/me', 'GET'),

  // Products
  getProducts: async (paramsStr = '') => {
    const res = await apiRequest(`/products${paramsStr}`);
    if (res.success && res.products && res.products.length > 0) return res;

    // Local filter fallback if backend database is offline
    const params = new URLSearchParams(paramsStr.replace(/^\?/, ''));
    let filtered = [...FALLBACK_PRODUCTS];

    if (params.get('category') && params.get('category') !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === params.get('category').toLowerCase());
    }
    if (params.get('search')) {
      const q = params.get('search').toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (params.get('bestseller') === '1') {
      filtered = filtered.filter(p => p.is_bestseller);
    }
    if (params.get('featured') === '1') {
      filtered = filtered.filter(p => p.is_featured);
    }
    if (params.get('id')) {
      const targetId = parseInt(params.get('id'));
      filtered = filtered.filter(p => p.id === targetId);
    }

    return { success: true, count: filtered.length, products: filtered, isOffline: true };
  },

  getProductById: async (id) => {
    const res = await apiRequest(`/products/${id}`);
    if (res.success && res.product) return res;

    const targetId = parseInt(id);
    const prod = FALLBACK_PRODUCTS.find(p => p.id === targetId) || FALLBACK_PRODUCTS[0];
    return { success: true, product: prod, isOffline: true };
  },

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
