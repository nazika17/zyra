const { pool } = require('../config/database');
const mockProducts = require('../config/mockProducts');

// Get all products with dynamic multi-faceted filtering, live search & sorting
async function getAllProducts(req, res) {
  const {
    category,
    min_price,
    max_price,
    brand,
    finish,
    skin_type,
    shade,
    in_stock,
    search,
    sort,
    featured,
    bestseller,
    is_new
  } = req.query;

  try {
    let query = 'SELECT * FROM products WHERE 1=1';
    const queryParams = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      queryParams.push(category);
    }

    if (min_price) {
      query += ' AND price >= ?';
      queryParams.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ' AND price <= ?';
      queryParams.push(parseFloat(max_price));
    }

    if (brand && brand !== 'All') {
      query += ' AND brand = ?';
      queryParams.push(brand);
    }

    if (finish && finish !== 'All') {
      query += ' AND finish = ?';
      queryParams.push(finish);
    }

    if (skin_type && skin_type !== 'All') {
      query += ' AND (skin_type = ? OR skin_type = "All Skin Types")';
      queryParams.push(skin_type);
    }

    if (shade && shade !== 'All') {
      query += ' AND shade LIKE ?';
      queryParams.push(`%${shade}%`);
    }

    if (in_stock === 'true' || in_stock === '1') {
      query += ' AND stock > 0';
    }

    if (search && search.trim() !== '') {
      query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ? OR shade LIKE ?)';
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term, term);
    }

    if (featured === '1' || featured === 'true') {
      query += ' AND is_featured = 1';
    }

    if (bestseller === '1' || bestseller === 'true') {
      query += ' AND is_bestseller = 1';
    }

    if (is_new === '1' || is_new === 'true') {
      query += ' AND is_new = 1';
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC, reviews_count DESC';
        break;
      case 'popularity':
        query += ' ORDER BY reviews_count DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY is_new DESC, id DESC';
        break;
    }

    const [products] = await pool.execute(query, queryParams);
    const cleanedProducts = products.map(p => ({
      ...p,
      image: p.image ? p.image.replace(/^(\.\.\/|\/)+/, '') : 'assets/products/lipstick_rose.jpg',
      images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images).map(img => img.replace(/^(\.\.\/|\/)+/, '')) : ['assets/products/lipstick_rose.jpg']
    }));
    return res.json({ success: true, count: cleanedProducts.length, products: cleanedProducts });
  } catch (error) {
    console.log('[Product API] Database query failed or offline. Serving mock catalog dataset.');
    
    // Filter mock products in memory as fallback
    let filtered = [...mockProducts];

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (min_price) {
      filtered = filtered.filter(p => p.price >= parseFloat(min_price));
    }
    if (max_price) {
      filtered = filtered.filter(p => p.price <= parseFloat(max_price));
    }
    if (brand && brand !== 'All') {
      filtered = filtered.filter(p => p.brand === brand);
    }
    if (finish && finish !== 'All') {
      filtered = filtered.filter(p => p.finish === finish);
    }
    if (skin_type && skin_type !== 'All') {
      filtered = filtered.filter(p => p.skin_type === skin_type || p.skin_type === 'All Skin Types');
    }
    if (shade && shade !== 'All') {
      filtered = filtered.filter(p => p.shade && p.shade.toLowerCase().includes(shade.toLowerCase()));
    }
    if (in_stock === 'true' || in_stock === '1') {
      filtered = filtered.filter(p => p.stock > 0);
    }
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term) ||
        (p.shade && p.shade.toLowerCase().includes(term))
      );
    }
    if (featured === '1' || featured === 'true') {
      filtered = filtered.filter(p => p.is_featured === 1);
    }
    if (bestseller === '1' || bestseller === 'true') {
      filtered = filtered.filter(p => p.is_bestseller === 1);
    }
    if (is_new === '1' || is_new === 'true') {
      filtered = filtered.filter(p => p.is_new === 1);
    }

    // Sort mock products
    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.reviews_count - a.reviews_count);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => (b.is_new - a.is_new) || (b.id - a.id));
        break;
    }

    return res.json({ success: true, count: filtered.length, products: filtered });
  }
}

// Get single product details
async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = rows[0];
    product.image = product.image ? product.image.replace(/^(\.\.\/|\/)+/, '') : 'assets/products/lipstick_rose.jpg';
    product.images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images).map(img => img.replace(/^(\.\.\/|\/)+/, '')) : ['assets/products/lipstick_rose.jpg'];

    const [relatedRows] = await pool.execute(
      'SELECT id, name, category, price, image, shade, rating FROM products WHERE category = ? AND id != ? LIMIT 4',
      [product.category, product.id]
    );

    const related = relatedRows.map(r => ({
      ...r,
      image: r.image ? r.image.replace(/^(\.\.\/|\/)+/, '') : 'assets/products/lipstick_rose.jpg'
    }));

    return res.json({ success: true, product, related });
  } catch (error) {
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const related = mockProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    return res.json({ success: true, product, related });
  }
}

// Get all categories list with count
async function getCategories(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category ASC'
    );
    return res.json({ success: true, categories: rows });
  } catch (error) {
    const catMap = {};
    mockProducts.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });

    const categories = Object.keys(catMap).map(category => ({
      category,
      count: catMap[category]
    })).sort((a, b) => a.category.localeCompare(b.category));

    return res.json({ success: true, categories });
  }
}

module.exports = { getAllProducts, getProductById, getCategories };

