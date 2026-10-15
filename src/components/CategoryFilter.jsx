import React from 'react';
import './CategoryFilter.css';

/**
 * Reusable category filter bar.
 * 
 * Props:
 *  - categories: array of { id, slug, name, icon, color }
 *  - activeSlug: string | null (null = "All")
 *  - onChange: (slug | null) => void
 *  - counts: optional map of { [slug]: number } for badge counts
 *  - showAll: boolean, defaults true
 */
function CategoryFilter({ 
  categories = [], 
  activeSlug = null, 
  onChange, 
  counts = {},
  showAll = true 
}) {
  if (!categories.length) return null;

  const totalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="category-filter-bar">
      {showAll && (
        <button
          className={`category-pill ${activeSlug === null ? 'active' : ''}`}
          onClick={() => onChange(null)}
          style={activeSlug === null ? { 
            background: 'linear-gradient(135deg, #ff6b35, #e5532d)',
            borderColor: 'transparent'
          } : undefined}
        >
          <span className="category-pill-icon">🍽️</span>
          <span className="category-pill-name">All</span>
          {counts.all !== undefined && (
            <span className="category-pill-count">{counts.all}</span>
          )}
        </button>
      )}

      {categories.map(cat => {
        const isActive = activeSlug === cat.slug;
        return (
          <button
            key={cat.id}
            className={`category-pill ${isActive ? 'active' : ''}`}
            onClick={() => onChange(cat.slug)}
            style={isActive ? {
              background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
              borderColor: 'transparent'
            } : {
              borderColor: `${cat.color}40`
            }}
          >
            <span className="category-pill-icon">{cat.icon}</span>
            <span className="category-pill-name">{cat.name}</span>
            {counts[cat.slug] !== undefined && (
              <span className="category-pill-count">{counts[cat.slug]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;