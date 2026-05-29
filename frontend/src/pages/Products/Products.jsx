import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, fetchCategories, fetchProductsByCategory } from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: categorySlug } = useParams();

  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalProducts, setTotal]     = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [currentCategory, setCurrentCategory] = useState(null);

  /* ─── Filters ────────────────────────────────────────────────────────────── */
  const [filters, setFilters] = useState({
    page     : parseInt(searchParams.get('page'))  || 1,
    sort     : searchParams.get('sort')            || 'created_at',
    order    : searchParams.get('order')           || 'DESC',
    search   : searchParams.get('search')          || '',
    min_price: searchParams.get('min_price')       || '',
    max_price: searchParams.get('max_price')       || '',
    featured : searchParams.get('featured')        || '',
    category : categorySlug                        || searchParams.get('category') || '',
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  /* ─── Load Categories ────────────────────────────────────────────────────── */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await fetchCategories();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  /* ─── Load Products ─────────────────────────────────────────────────────── */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      if (categorySlug) {
        response = await fetchProductsByCategory(categorySlug, {
          page : filters.page,
          sort : filters.sort,
          order: filters.order,
        });

        if (response.data.success) {
          setProducts(response.data.products);
          setTotal(response.data.total);
          setTotalPages(response.data.pages);
          setCurrentCategory(response.data.category);
        }
      } else {
        const params = { page: filters.page, sort: filters.sort, order: filters.order };
        if (filters.search)    params.search    = filters.search;
        if (filters.min_price) params.min_price  = filters.min_price;
        if (filters.max_price) params.max_price  = filters.max_price;
        if (filters.featured)  params.featured   = filters.featured;
        if (filters.category)  params.category   = filters.category;

        response = await fetchProducts(params);

        if (response.data.success) {
          setProducts(response.data.products);
          setTotal(response.data.total);
          setTotalPages(response.data.pages);
          setCurrentCategory(null);
        }
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, categorySlug]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  /* ─── Sync URL ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (categorySlug) return;

    const params = {};
    if (filters.page > 1)    params.page      = filters.page;
    if (filters.sort !== 'created_at') params.sort = filters.sort;
    if (filters.order !== 'DESC')      params.order = filters.order;
    if (filters.search)    params.search    = filters.search;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.featured)  params.featured  = filters.featured;
    if (filters.category)  params.category  = filters.category;

    setSearchParams(params, { replace: true });
  }, [filters, categorySlug, setSearchParams]);

  /* ─── Handlers ───────────────────────────────────────────────────────────── */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      page: 1, sort: 'created_at', order: 'DESC',
      search: '', min_price: '', max_price: '',
      featured: '', category: '',
    });
  };

  const hasActiveFilters = filters.search || filters.min_price || filters.max_price
    || filters.featured || (filters.category && !categorySlug);

  const sortOptions = [
    { value: 'created_at-DESC', label: 'Newest First' },
    { value: 'created_at-ASC',  label: 'Oldest First' },
    { value: 'price-ASC',       label: 'Price: Low to High' },
    { value: 'price-DESC',      label: 'Price: High to Low' },
    { value: 'rating-DESC',     label: 'Top Rated' },
    { value: 'name-ASC',        label: 'A–Z' },
    { value: 'name-DESC',       label: 'Z–A' },
  ];

  const handleSortChange = (val) => {
    const [sort, order] = val.split('-');
    setFilters(prev => ({ ...prev, sort, order, page: 1 }));
  };

  /* ─── Pagination ─────────────────────────────────────────────────────────── */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, filters.page - Math.floor(maxVisible / 2));
    let end   = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="products-pagination">
        <button
          className="pagination-btn pagination-arrow"
          disabled={filters.page <= 1}
          onClick={() => handlePageChange(filters.page - 1)}
        >
          <span className="material-icons-round">chevron_left</span>
        </button>

        {start > 1 && (
          <>
            <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
            {start > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            className={`pagination-btn ${p === filters.page ? 'active' : ''}`}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        <button
          className="pagination-btn pagination-arrow"
          disabled={filters.page >= totalPages}
          onClick={() => handlePageChange(filters.page + 1)}
        >
          <span className="material-icons-round">chevron_right</span>
        </button>
      </div>
    );
  };

  /* ─── Container Variants ─────────────────────────────────────────────────── */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const cardVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      className="products-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <section className="products-hero">
        <div className="products-hero__bg" />
        <div className="container">
          <motion.div
            className="products-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="breadcrumb">
              <Link to="/" className="breadcrumb__link">Home</Link>
              <span className="material-icons-round breadcrumb__sep">chevron_right</span>
              {currentCategory ? (
                <>
                  <Link to="/products" className="breadcrumb__link">Shop</Link>
                  <span className="material-icons-round breadcrumb__sep">chevron_right</span>
                  <span className="breadcrumb__current">{currentCategory.name}</span>
                </>
              ) : (
                <span className="breadcrumb__current">Shop</span>
              )}
            </nav>

            <h1 className="products-hero__title">
              {currentCategory ? (
                <>{currentCategory.name}</>
              ) : filters.search ? (
                <>Results for "<span>{filters.search}</span>"</>
              ) : (
                <>All <span>Products</span></>
              )}
            </h1>

            {currentCategory && currentCategory.description && (
              <p className="products-hero__subtitle">{currentCategory.description}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <section className="products-main section-padding">
        <div className="container">
          <div className="products-layout">
            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className={`products-sidebar ${mobileFiltersOpen ? 'open' : ''}`}>
              <div className="products-sidebar__header">
                <h3>Filters</h3>
                <button
                  className="products-sidebar__close show-mobile"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              {/* Category Filter */}
              {!categorySlug && (
                <div className="filter-section">
                  <h4 className="filter-section__title">Categories</h4>
                  <div className="filter-section__options">
                    <button
                      className={`filter-option ${!filters.category ? 'active' : ''}`}
                      onClick={() => handleFilterChange('category', '')}
                    >
                      <span className="filter-option__label">All Categories</span>
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`filter-option ${filters.category === cat.slug ? 'active' : ''}`}
                        onClick={() => handleFilterChange('category', cat.slug)}
                      >
                        <span className="filter-option__label">{cat.name}</span>
                        <span className="filter-option__count">{cat.product_count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="filter-section">
                <h4 className="filter-section__title">Price Range</h4>
                <div className="filter-price-inputs">
                  <div className="filter-price-input">
                    <span>$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      min="0"
                    />
                  </div>
                  <span className="filter-price-sep">–</span>
                  <div className="filter-price-input">
                    <span>$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Featured */}
              <div className="filter-section">
                <h4 className="filter-section__title">Featured</h4>
                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={filters.featured === 'true'}
                    onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                  />
                  <span className="filter-toggle__slider" />
                  <span className="filter-toggle__label">Featured Only</span>
                </label>
              </div>

              {/* Clear */}
              {hasActiveFilters && (
                <button className="filter-clear-btn" onClick={clearFilters}>
                  <span className="material-icons-round">filter_list_off</span>
                  Clear All Filters
                </button>
              )}
            </aside>

            {/* Mobile Filter Overlay */}
            {mobileFiltersOpen && (
              <div
                className="products-sidebar-overlay"
                onClick={() => setMobileFiltersOpen(false)}
              />
            )}

            {/* ── Products Area ────────────────────────────────────────── */}
            <div className="products-area">
              {/* Toolbar */}
              <div className="products-toolbar">
                <div className="products-toolbar__left">
                  <button
                    className="products-filter-toggle show-mobile"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <span className="material-icons-round">tune</span>
                    Filters
                  </button>
                  <p className="products-toolbar__count">
                    Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
                  </p>
                </div>
                <div className="products-toolbar__right">
                  {/* View Mode */}
                  <div className="products-view-toggle hide-mobile">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <span className="material-icons-round">grid_view</span>
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <span className="material-icons-round">view_list</span>
                    </button>
                  </div>

                  {/* Sort */}
                  <div className="products-sort">
                    <span className="material-icons-round">sort</span>
                    <select
                      value={`${filters.sort}-${filters.order}`}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="products-active-filters">
                  {filters.search && (
                    <span className="active-filter-tag">
                      Search: {filters.search}
                      <button onClick={() => handleFilterChange('search', '')}>
                        <span className="material-icons-round">close</span>
                      </button>
                    </span>
                  )}
                  {filters.category && !categorySlug && (
                    <span className="active-filter-tag">
                      Category: {categories.find(c => c.slug === filters.category)?.name || filters.category}
                      <button onClick={() => handleFilterChange('category', '')}>
                        <span className="material-icons-round">close</span>
                      </button>
                    </span>
                  )}
                  {(filters.min_price || filters.max_price) && (
                    <span className="active-filter-tag">
                      Price: {filters.min_price ? `$${filters.min_price}` : '$0'}
                      {' – '}
                      {filters.max_price ? `$${filters.max_price}` : '∞'}
                      <button onClick={() => { handleFilterChange('min_price', ''); handleFilterChange('max_price', ''); }}>
                        <span className="material-icons-round">close</span>
                      </button>
                    </span>
                  )}
                  {filters.featured && (
                    <span className="active-filter-tag">
                      Featured
                      <button onClick={() => handleFilterChange('featured', '')}>
                        <span className="material-icons-round">close</span>
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* ── Product Grid ───────────────────────────────────────── */}
              {loading ? (
                <div className={`products-grid products-grid--${viewMode}`}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="product-card-skeleton">
                      <div className="skeleton" style={{ height: 200, borderRadius: '16px 16px 0 0' }} />
                      <div style={{ padding: 16 }}>
                        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 16 }} />
                        <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <motion.div
                  className={`products-grid products-grid--${viewMode}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={`${filters.page}-${filters.sort}-${filters.category}-${filters.search}`}
                >
                  {products.map(product => (
                    <motion.div key={product.id} variants={cardVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="products-empty">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <span className="material-icons-round">inventory_2</span>
                  </motion.div>
                  <h3>No Products Found</h3>
                  <p>Try adjusting your filters or search terms to find what you're looking for.</p>
                  {hasActiveFilters && (
                    <button className="btn btn-secondary" onClick={clearFilters}>
                      <span className="material-icons-round">filter_list_off</span>
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {renderPagination()}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Products;