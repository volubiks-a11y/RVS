import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Helmet } from 'react-helmet-async';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('rv_cart') || '[]');
  } catch {
    return [];
  }
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch latest products from Excel
    const fetchProducts = async () => {
      try {
        const response = await fetch('/data/products.xlsx?t=' + Date.now());
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        const normalized = rawData.map((r, i) => {
          const id = String(r.id || (i + 1));
          const product = {
            id: id,
            name: (r.name || '').trim(),
            slug: (r.slug || '').trim() || (r.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            price: Number(r.price || 0),
            currency: (r.currency || 'NGN').toUpperCase(),
            image: '', // primary image
            images: [], // ordered list of images
            description: (r.description || '').trim(),
            category: (r.category || '').trim(),
            featured: String(r.featured || '').toLowerCase() === 'true',
            inventory: Number(r.inventory || 0),
            tags: (typeof r.tags === 'string' && r.tags.length) ? r.tags.split(/[,;]+/).map(s => s.trim()) : []
          };

          // Set images based on available images
          let baseImages = [];
          if (id === '1') {
            baseImages = ['/images/4.jpg', '/images/4-1.jpg', '/images/4-2.jpg', '/images/4-3.jpg'];
          } else if (id === '2') {
            baseImages = ['/images/IMG-1.jpg', '/images/IMG-2.jpg', '/images/IMG-3.jpg'];
          } else if (id === '3') {
            baseImages = ['/images/golden_green_chain_1.jpg', '/images/golden_green_chain_2.jpg', '/images/golden_green_chain_3.jpg', '/images/golden_green_chain_4.jpg'];
          } else if (id === '4') {
            baseImages = ['/images/Screenshot_20251225-175416.jpg'];
          }
          product.images = baseImages;
          product.image = product.images[0] || (r.image || '').trim();

          return product;
        });
        
        setProducts(normalized);
      } catch (error) {
        console.error('Failed to fetch products from Excel:', error);
      }
    };
    fetchProducts();
    const interval = setInterval(fetchProducts, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function refresh() {
      const c = loadCart();
      // aggregate by id to compute quantities
      const map = {};
      for (const p of c) {
        if (!map[p.id]) map[p.id] = { product: p, qty: 0 };
        map[p.id].qty++;
      }
      let aggregated = Object.values(map);
      // Update prices with latest data if available
      if (products.length > 0) {
        aggregated = aggregated.map(item => {
          const latest = products.find(prod => prod.id === item.product.id);
          if (latest) {
            return { ...item, product: { ...item.product, price: latest.price } };
          }
          return item;
        });
      }
      setItems(aggregated);
    }
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [products]);

  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const VAT_RATE = 0.10; // 10%
  const vat = +(subtotal * VAT_RATE).toFixed(2);
  const total = +(subtotal + vat).toFixed(2);

  // update cart helper: change is +1 or -1
  const changeQty = (productId, change) => {
    const cart = loadCart();
    if (change > 0) {
      // add one instance of the product; try to reuse product data found in cart or items
      let prod = cart.find(p => p.id === productId);
      if (!prod) {
        const found = items.find(it => it.product.id === productId);
        if (found) prod = found.product;
      }
      if (prod) cart.push(prod);
    } else if (change < 0) {
      // remove one instance of the product
      const idx = cart.findIndex(p => p.id === productId);
      if (idx !== -1) cart.splice(idx, 1);
    }
    localStorage.setItem('rv_cart', JSON.stringify(cart));
    // trigger storage listeners (header) and refresh UI
    window.dispatchEvent(new Event('storage'));

    // recompute aggregated items
    const map = {};
    for (const p of cart) {
      if (!map[p.id]) map[p.id] = { product: p, qty: 0 };
      map[p.id].qty++;
    }
    setItems(Object.values(map));
  };

  return (
    <>
      <Helmet>
        <title>Checkout - Volubiks Jewelry</title>
        <meta name="description" content="Complete your purchase securely at Volubiks Jewelry. Review your cart and proceed to payment." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{ padding: 20 }} className="checkout">
        <h2>Checkout</h2>
        {items.length === 0 ? (
          <div>
            <p>Your cart is empty.</p>
            <Link to="/shop" className="button primary">Go to shop</Link>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="cart-list">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="cart-item">
                  <div className="cart-image"><img src={product.image} alt={product.name} /></div>
                  <div className="cart-body">
                  <div className="cart-name">{product.name}</div>
                  <div className="cart-meta">
                    <div className="qty-controls">
                      <button className="qty-btn" aria-label={`Decrease ${product.name}`} onClick={() => changeQty(product.id, -1)}>-</button>
                      <span className="qty">{qty}</span>
                      <button className="qty-btn" aria-label={`Increase ${product.name}`} onClick={() => changeQty(product.id, 1)}>+</button>
                    </div>
                      <div className="cart-price">₦{product.price.toFixed(2)} each</div>
                  </div>
                </div>
                <div className="cart-line">₦{(product.price * qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <aside className="checkout-summary">
            <h3>Summary</h3>
            <div className="summary-row"><span>Subtotal</span><strong>₦{subtotal.toFixed(2)}</strong></div>
            <div className="summary-row"><span>VAT (10%)</span><strong>₦{vat.toFixed(2)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>₦{total.toFixed(2)}</strong></div> 

            <Link to="/payment" state={{ subtotal, vat, total }} className="button primary" style={{ display: 'block', marginTop: 12 }}>Proceed to Payment</Link>
            <Link to="/shop" className="button ghost" style={{ display: 'block', marginTop: 8 }}>Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
    </>
  );
}
