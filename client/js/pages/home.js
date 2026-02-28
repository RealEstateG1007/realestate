// ============================================
// Home Page
// ============================================

registerPage('#/', async () => {
    // Fetch a few recent published properties for the featured section
    let featuredHTML = '';
    try {
        const data = await api('/properties?limit=3');
        if (data.properties && data.properties.length > 0) {
            featuredHTML = data.properties.map(p => propertyCard(p)).join('');
        } else {
            featuredHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">🏠</div>
          <h3>No properties yet</h3>
          <p>Be the first to list a property!</p>
        </div>`;
        }
    } catch {
        featuredHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">📡</div>
        <h3>Connect your database</h3>
        <p>Start MongoDB to see properties here.</p>
      </div>`;
    }

    appContainer.innerHTML = `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">✨ AI-Powered Real Estate Platform</div>
        <h1>Find Your <span class="gradient-text">Dream Property</span> with Ease</h1>
        <p class="hero-subtitle">
          RealEstate Connect brings buyers, sellers, and agents together on one intelligent platform.
          Discover verified listings, get AI-powered recommendations, and close deals faster.
        </p>
        <div class="hero-actions">
          <a href="#/properties" class="btn btn-primary btn-lg">Explore Properties</a>
          <a href="#/register" class="btn btn-secondary btn-lg">List Your Property</a>
        </div>
        <div class="hero-stats">
          <div>
            <span class="hero-stat-value">500+</span>
            <span class="hero-stat-label">Properties Listed</span>
          </div>
          <div>
            <span class="hero-stat-value">2K+</span>
            <span class="hero-stat-label">Happy Buyers</span>
          </div>
          <div>
            <span class="hero-stat-value">98%</span>
            <span class="hero-stat-label">Satisfaction Rate</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section" style="background: var(--bg-secondary);">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Why Choose Us</span>
          <h2>A Smarter Way to Buy & Sell</h2>
          <p>Powered by AI and built for transparency, our platform makes every step of your real estate journey effortless.</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>AI-Powered Search</h3>
            <p>Describe what you want in plain language. Our AI understands your needs and finds the perfect match.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3>Verified Listings</h3>
            <p>Every seller and agent goes through identity verification. No fakes, no spam — just real opportunities.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Instant Communication</h3>
            <p>Message sellers directly, schedule viewings, and negotiate offers — all within the platform.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>Sellers get real-time insights on listing views, clicks, and buyer interest to optimize pricing.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>AI Listing Generator</h3>
            <p>Upload photos and basic details — our LLM crafts compelling property descriptions for you.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Secure Transactions</h3>
            <p>Submit and manage offers digitally with end-to-end encryption. Your documents stay safe.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Properties -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Featured</span>
          <h2>Latest Properties</h2>
          <p>Discover our newest listings, handpicked for quality and value.</p>
        </div>
        <div class="property-grid">${featuredHTML}</div>
        <div class="text-center mt-4">
          <a href="#/properties" class="btn btn-secondary btn-lg">View All Properties →</a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-content container">
        <h2>Ready to Find Your Next Home?</h2>
        <p>Join thousands of buyers and sellers already using RealEstate Connect.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <a href="#/register" class="btn btn-primary btn-lg">Get Started Free</a>
          <a href="#/properties" class="btn btn-secondary btn-lg">Browse Properties</a>
        </div>
      </div>
    </section>
  `;
});

// --- Reusable Property Card ---
function propertyCard(p) {
    const typeClass = p.type === 'sale' ? 'badge-sale' : 'badge-rent';
    const typeLabel = p.type === 'sale' ? 'For Sale' : 'For Rent';
    const priceLabel = p.type === 'rent' ? '/mo' : '';
    const imgPlaceholder = ['🏠', '🏡', '🏢', '🏘️'][Math.floor(Math.random() * 4)];

    return `
    <a href="#/property/${p._id}" class="card" style="text-decoration:none;color:inherit;">
      <div class="card-img">
        <span class="card-badge ${typeClass}">${typeLabel}</span>
        ${p.images && p.images.length > 0
            ? `<img src="${p.images[0]}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;">`
            : imgPlaceholder}
      </div>
      <div class="card-body">
        <div class="card-price">${formatPrice(p.price)} <span>${priceLabel}</span></div>
        <div class="card-title">${p.title}</div>
        <div class="card-location">📍 ${p.city}, ${p.state}</div>
        <div class="card-meta">
          <span class="card-meta-item">🛏️ ${p.bedrooms} Beds</span>
          <span class="card-meta-item">🛁 ${p.bathrooms} Baths</span>
          <span class="card-meta-item">📐 ${p.sqft ? p.sqft.toLocaleString() + ' sqft' : 'N/A'}</span>
        </div>
      </div>
    </a>`;
}
