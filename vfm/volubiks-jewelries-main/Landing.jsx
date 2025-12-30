import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import Carousel from './components/Carousel';
import ProductModal from './components/ProductModal';
import { Helmet } from 'react-helmet-async';

export default function Landing() {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('popular');
  const [modalProduct, setModalProduct] = useState(null);
  const [productsData, setProductsData] = useState([]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await response.json();
        setProductsData(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const products = useMemo(() => {
    let list = productsData.slice();
    if (filter) {
      const q = filter.toLowerCase().replace(/[<>\"'&]/g, ''); // Sanitize input
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [filter, sort, productsData]);

  const featuredProducts = useMemo(() => {
    const categories = ['jewelries', 'clothings', 'drinks'];
    const featured = {};
    categories.forEach(cat => {
      const catProducts = productsData.filter(p => p.category === cat && p.featured);
      // Shuffle
      for (let i = catProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [catProducts[i], catProducts[j]] = [catProducts[j], catProducts[i]];
      }
      featured[cat] = catProducts.slice(0, 4); // Up to 4 per category
    });
    return featured;
  }, [productsData]);

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
      cart.push({ id: product.id, name: product.name, price: product.price });
      localStorage.setItem('rv_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      alert(`${product.name} added to cart`);
    } catch (err) {
      console.error(err);
    }
  };

  const onPreview = (product) => {
    setModalProduct(product);
  };

  const closeModal = () => {
    setModalProduct(null);
  };

  return (
    <>
      <Helmet>
        <title>Ojaja Royal Volubiks Stores - Exquisite Jewelry, Clothings & Drinks</title>
        <meta name="description" content="Discover beautiful jewelry, stylish clothings, and refreshing drinks at Ojaja Royal Volubiks Stores. Shop rings, necklaces, apparel, and beverages with secure payments and fast shipping." />
        <meta name="keywords" content="jewelry, clothings, drinks, rings, necklaces, earrings, apparel, beverages, Volubiks, buy online" />
        <meta property="og:title" content="Ojaja Royal Volubiks Stores - Exquisite Jewelry, Clothings & Drinks" />
        <meta property="og:description" content="Discover beautiful jewelry, stylish clothings, and refreshing drinks at Ojaja Royal Volubiks Stores." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1400&q=80" />
        <meta property="og:url" content={`${window.location.origin}/`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="landing">
        <section className="hero hero-compact">
          <div className="sparkle s1" />
          <div className="sparkle s2" />
          <div className="sparkle s3" />
          <div className="hero-inner">
            <div className="hero-content">
            <h1 className="logo-heading" aria-label="Ojaja Royal Volubiks Stores">
              <span className="crown" aria-hidden="true"><svg width="28" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M2 8l3 8 4-6 4 6 4-8 3 8H2z" fill="#b8860b"/></svg></span>
            <svg className="title-svg" viewBox="0 0 1200 260" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <text x="0" y="180" className="svg-title" fill="#b8860b" fontSize="220" textLength="1040" lengthAdjust="spacingAndGlyphs">Ojaja Royal Volubiks Stores</text>
            </svg> 
              <span className="sr-only">Ojaja Royal Volubiks Stores</span>
              </h1>
              <p className="lead">Explore thousands of pieces — jewelry, clothings, drinks. Everyday low prices, premium quality.</p>
              <div className="hero-ctas">
              <Link to="/shop?category=jewelries"><button className="button primary">Jewelries</button></Link>
              <Link to="/shop?category=clothings"><button className="button primary">Clothings</button></Link>
              <Link to="/shop?category=drinks"><button className="button primary">Drinks</button></Link>
              </div>
            </div>
            <div className="hero-image" aria-hidden="true">
              <img src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1400&q=80" alt="Jewelry" />
            </div>
          </div>
        </section>

{featuredProducts.jewelries && featuredProducts.jewelries.length > 0 && (
        <section id="featured-jewelries" className="product-section">
          <h2>Featured Jewelries</h2>
          <Carousel products={featuredProducts.jewelries} perPage={6} autoPlay={true} interval={3000} onAdd={addToCart} />
        </section>
      )}

      {featuredProducts.clothings && featuredProducts.clothings.length > 0 && (
        <section id="featured-clothings" className="product-section">
          <h2>Featured Clothings</h2>
          <Carousel products={featuredProducts.clothings} perPage={6} autoPlay={true} interval={3000} onAdd={addToCart} />
        </section>
      )}

      {featuredProducts.drinks && featuredProducts.drinks.length > 0 && (
        <section id="featured-drinks" className="product-section">
          <h2>Featured Drinks</h2>
          <Carousel products={featuredProducts.drinks} perPage={6} autoPlay={true} interval={3000} onAdd={addToCart} />
        </section>
      )}

        <section id="products" className="product-section">
          <div className="product-tools">
            <div>
              <input className="input" placeholder="Filter products..." value={filter} onChange={e => setFilter(e.target.value)} />
            </div>
            <div>
              <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="popular">Sort: Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="product-grid dense">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} onPreview={onPreview} />
            ))}
          </div>
        </section>

        <section id="about" className="features">
        <h2>Why Ojaja Royal Volubiks?</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>Exquisite Jewelry</h3>
            <p>Timeless designs, handcrafted with premium materials.</p>
          </div>
          <div className="feature">
            <h3>Stylish Clothings</h3>
            <p>Fashionable apparel for every occasion.</p>
          </div>
          <div className="feature">
            <h3>Refreshing Drinks</h3>
            <p>Quality beverages to complement your lifestyle.</p>
            <div className="feature">
              <h3>Secure Payments</h3>
              <p>Pay using Paystack or Moniepoint integrations (test mode available).</p>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <h2>Visit & Contact</h2>
          <p>Open to collaborations and custom orders. Email: <a href="mailto:hello@volubiks.example">hello@volubiks.example</a></p>
        </section>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Ojaja Royal Volubiks Stores</p>

          <ProductModal product={modalProduct} open={!!modalProduct} onClose={closeModal} onAdd={addToCart} />
        </footer>
      </div>
    </>
  );
}
