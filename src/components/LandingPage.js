// src/components/LandingPage.js
import React, { useState, useMemo } from 'react';
import { useMenuItems, useCategories } from '../hooks/useSupabase';
import './LandingPage.css';
import logo from '../assets/logo.jpg';

// ============================================
// ICONS
// ============================================
const SignInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ============================================
// MAIN COMPONENT
// ============================================
function LandingPage({ onNavigateToAuth, onNavigateToDashboard, currentUser }) {
  const { items: menuItems, loading: menuLoading } = useMenuItems();
  const { categories, loading: categoriesLoading } = useCategories();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  // ---- Filter available items only ----
  const availableItems = useMemo(
    () => menuItems.filter((item) => item.is_available !== false),
    [menuItems]
  );

  // ---- Filter by category + search ----
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableItems.filter((item) => {
      if (activeCategory !== 'all' && item.category?.slug !== activeCategory) return false;
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !(item.description || '').toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [availableItems, activeCategory, searchQuery]);

  // ---- Group by category ----
  const groupedItems = useMemo(() => {
    const groups = [];
    categories.forEach((cat) => {
      const items = visibleItems.filter((i) => i.category_id === cat.id);
      if (items.length > 0) groups.push({ category: cat, items });
    });
    const orphans = visibleItems.filter(
      (i) => !categories.some((c) => c.id === i.category_id)
    );
    if (orphans.length > 0) {
      groups.push({
        category: {
          id: '__other__',
          slug: 'other',
          name: 'More Items',
          icon: '☕',
          color: '#64748b',
        },
        items: orphans,
      });
    }
    return groups;
  }, [visibleItems, categories]);

  // ---- Auth prompt handler ----
  const promptAuth = (action) => {
    setPromptAction(action);
    setShowAuthPrompt(true);
  };

  const handleOrderClick = (item) => {
    if (currentUser) {
      onNavigateToDashboard();
    } else {
      promptAuth(`order "${item.name}"`);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="landing-page">
      {/* ============ HEADER ============ */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <img src={logo} alt="1of1 Coffee" className="landing-logo" />
            <div className="landing-brand-text">
              <h1>1of1 Coffee</h1>
              <span>Order fresh. Anytime.</span>
            </div>
          </div>

          <nav className="landing-nav">
            <a href="#menu-section" className="landing-nav-link">Menu</a>
            <a href="#about-section" className="landing-nav-link">About</a>
            {currentUser ? (
              <button
                className="landing-btn landing-btn-primary"
                onClick={onNavigateToDashboard}
              >
                <ShoppingBagIcon /> My Dashboard
              </button>
            ) : (
              <div className="landing-auth-buttons">
                <button
                  className="landing-btn landing-btn-ghost"
                  onClick={() => onNavigateToAuth('login')}
                >
                  Sign In
                </button>
                <button
                  className="landing-btn landing-btn-primary"
                  onClick={() => onNavigateToAuth('register')}
                >
                  Register
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <span className="landing-hero-badge">☕ Now Open</span>
            <h2 className="landing-hero-title">
              Fresh Coffee,<br />
              <span className="landing-hero-accent">Delivered to You</span>
            </h2>
            <p className="landing-hero-subtitle">
              Browse our full menu of handcrafted coffee, pastries, and refreshing
              drinks. Sign in to place an order — or explore first.
            </p>
            <div className="landing-hero-actions">
              <button
                className="landing-btn landing-btn-primary landing-btn-lg"
                onClick={handleBrowseClick}
              >
                Browse Menu
              </button>
              {!currentUser && (
                <button
                  className="landing-btn landing-btn-ghost landing-btn-lg"
                  onClick={() => onNavigateToAuth('register')}
                >
                  Create Account
                </button>
              )}
            </div>
            <div className="landing-hero-stats">
              <div className="landing-hero-stat">
                <strong>{availableItems.length}+</strong>
                <span>Menu Items</span>
              </div>
              <div className="landing-hero-stat">
                <strong>{categories.length}</strong>
                <span>Categories</span>
              </div>
              <div className="landing-hero-stat">
                <strong>4.8★</strong>
                <span>Customer Rating</span>
              </div>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-hero-cup">☕</div>
          </div>
        </div>
      </section>

      {/* ============ MENU SECTION ============ */}
      <section id="menu-section" className="landing-menu-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">OUR MENU</span>
            <h2 className="landing-section-title">What would you like today?</h2>
            <p className="landing-section-subtitle">
              Every item is handcrafted with care. Sign in to add to cart.
            </p>
          </div>

          {/* Search bar */}
          <div className="landing-search-bar">
            <SearchIcon />
            <input
              type="text"
              className="landing-search-input"
              placeholder="Search coffee, pastries, drinks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="landing-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <XIcon />
              </button>
            )}
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="landing-category-bar">
              <button
                className={`landing-cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                🍽️ All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`landing-cat-pill ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}
                  style={
                    activeCategory === cat.slug
                      ? { background: cat.color, borderColor: cat.color, color: '#fff' }
                      : undefined
                  }
                >
                  {cat.icon || '☕'} {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          {menuLoading || categoriesLoading ? (
            <div className="landing-loading">
              <div className="landing-spinner"></div>
              <p>Loading menu…</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="landing-empty">
              <span className="landing-empty-icon">🔍</span>
              <h3>No items found</h3>
              <p>
                {searchQuery
                  ? `Nothing matches "${searchQuery}". Try a different search.`
                  : 'No items in this category right now.'}
              </p>
              {(searchQuery || activeCategory !== 'all') && (
                <button
                  className="landing-btn landing-btn-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="landing-category-sections">
              {groupedItems.map((group) => (
                <section key={group.category.id} className="landing-category-section">
                  <div
                    className="landing-category-heading"
                    style={{ '--cat-color': group.category.color || '#d97745' }}
                  >
                    <span className="landing-category-icon">
                      {group.category.icon || '☕'}
                    </span>
                    <h3 className="landing-category-name">{group.category.name}</h3>
                    <span className="landing-category-count">
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="landing-product-grid">
                    {group.items.map((item) => (
                      <article key={item.id} className="landing-product-card">
                        <div className="landing-product-image-wrap">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="landing-product-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="landing-product-placeholder">☕</div>
                          )}
                          {item.is_available === false && (
                            <span className="landing-product-badge sold-out">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <div className="landing-product-body">
                          <h4 className="landing-product-name">{item.name}</h4>
                          <p className="landing-product-desc">
                            {item.description || 'Handcrafted with love.'}
                          </p>
                          <div className="landing-product-footer">
                            <span className="landing-product-price">
                              ₱{Number(item.price || 0).toFixed(2)}
                            </span>
                            {Number(item.avg_rating) > 0 && (
                              <span className="landing-product-rating">
                                <StarIcon /> {Number(item.avg_rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                          <button
                            className="landing-product-btn"
                            onClick={() => handleOrderClick(item)}
                          >
                            {currentUser ? '🛒 Order Now' : '🔒 Sign in to Order'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ ABOUT / CTA SECTION ============ */}
      <section id="about-section" className="landing-about-section">
        <div className="landing-container">
          <div className="landing-about-card">
            <div className="landing-about-content">
              <span className="landing-section-eyebrow">WHY 1OF1</span>
              <h2 className="landing-section-title">More than just a cup of coffee</h2>
              <p className="landing-about-text">
                Every drink is freshly brewed to order, made with premium beans and
                quality ingredients. Whether you're grabbing a quick espresso or
                settling in for a creamy latte — we've got you.
              </p>
              {!currentUser && (
                <div className="landing-about-actions">
                  <button
                    className="landing-btn landing-btn-primary landing-btn-lg"
                    onClick={() => onNavigateToAuth('register')}
                  >
                    <UserPlusIcon /> Create Free Account
                  </button>
                  <button
                    className="landing-btn landing-btn-ghost landing-btn-lg"
                    onClick={() => onNavigateToAuth('login')}
                  >
                    <SignInIcon /> Sign In
                  </button>
                </div>
              )}
            </div>
            <div className="landing-about-features">
              <div className="landing-feature">
                <span className="landing-feature-icon">⚡</span>
                <div>
                  <strong>Fast Prep</strong>
                  <p>Most orders ready in 5–10 minutes.</p>
                </div>
              </div>
              <div className="landing-feature">
                <span className="landing-feature-icon">🌿</span>
                <div>
                  <strong>Quality Ingredients</strong>
                  <p>Premium beans, fresh milk, real flavors.</p>
                </div>
              </div>
              <div className="landing-feature">
                <span className="landing-feature-icon">💳</span>
                <div>
                  <strong>GCash & Maya</strong>
                  <p>Pay online — upload proof, get confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src={logo} alt="1of1 Coffee" className="landing-footer-logo" />
            <span>1of1 Coffee</span>
          </div>
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} 1of1 Coffee. All rights reserved.
          </p>
          {!currentUser && (
            <button
              className="landing-footer-link"
              onClick={() => onNavigateToAuth('login')}
            >
              Sign In
            </button>
          )}
        </div>
      </footer>

      {/* ============ AUTH PROMPT MODAL ============ */}
      {showAuthPrompt && (
        <div
          className="landing-modal-overlay"
          onClick={() => setShowAuthPrompt(false)}
        >
          <div className="landing-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="landing-modal-close"
              onClick={() => setShowAuthPrompt(false)}
            >
              <XIcon />
            </button>
            <div className="landing-modal-icon">🔒</div>
            <h3 className="landing-modal-title">Sign in to continue</h3>
            <p className="landing-modal-message">
              You need an account to {promptAction || 'place an order'}. It only
              takes a moment to get started.
            </p>
            <div className="landing-modal-actions">
              <button
                className="landing-btn landing-btn-ghost landing-btn-lg"
                onClick={() => {
                  setShowAuthPrompt(false);
                  onNavigateToAuth('login');
                }}
              >
                <SignInIcon /> Sign In
              </button>
              <button
                className="landing-btn landing-btn-primary landing-btn-lg"
                onClick={() => {
                  setShowAuthPrompt(false);
                  onNavigateToAuth('register');
                }}
              >
                <UserPlusIcon /> Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;