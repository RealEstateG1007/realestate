// ============================================
// Properties Listing Page
// ============================================

registerPage('#/properties', async () => {
  appContainer.innerHTML = `
    <div class="section" style="padding-top:100px;min-height:100vh;">
      <div class="container">
        <div class="section-header" style="text-align:left;">
          <span class="section-label">Browse</span>
          <h2>Explore Properties</h2>
        </div>

        <!-- AI Search -->
        <div class="ai-search-container" style="margin-bottom: 1.5rem; background: rgba(155, 81, 224, 0.1); padding: 1.5rem; border-radius: var(--radius); border: 1px solid rgba(155, 81, 224, 0.3);">
            <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                ✨ AI Property Search
            </h3>
            <p class="text-secondary" style="margin-bottom: 1rem; font-size: 0.9rem;">Just describe what you're looking for! (e.g., "cheap 2 bed apartments in New York")</p>
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="ai-search-input" placeholder="What kind of property do you want?" style="flex: 1; padding: 0.8rem; border-radius: var(--radius); border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white;">
                <button id="btn-ai-search" class="btn" style="background: linear-gradient(45deg, var(--accent), #9b51e0); color: white; border: none;">Ask AI ✨</button>
            </div>
            <div id="ai-search-status" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--accent); display: none;"></div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <div class="filters-grid">
            <div class="filter-group">
              <label>Keyword</label>
              <input type="text" id="filter-keyword" placeholder="Search...">
            </div>
            <div class="filter-group">
              <label>City</label>
              <input type="text" id="filter-city" placeholder="e.g. New York">
            </div>
            <div class="filter-group">
              <label>Type</label>
              <select id="filter-type">
                <option value="">All</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Property</label>
              <select id="filter-property-type">
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Min Price</label>
              <input type="number" id="filter-min-price" placeholder="$0">
            </div>
            <div class="filter-group">
              <label>Max Price</label>
              <input type="number" id="filter-max-price" placeholder="Any">
            </div>
            <div class="filter-group">
              <label>Bedrooms</label>
              <select id="filter-bedrooms">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div class="filter-group" style="display:flex;align-items:flex-end;">
              <button class="btn btn-primary btn-block" id="btn-search">Search</button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div id="properties-count" class="text-secondary mb-2" style="font-size:0.9rem;"></div>
        <div id="properties-grid" class="property-grid"></div>
        <div id="properties-pagination" class="flex justify-center gap-1 mt-4"></div>
      </div>
    </div>`;

  let currentPage = 1;

  async function fetchProperties(page = 1) {
    const grid = document.getElementById('properties-grid');
    const countEl = document.getElementById('properties-count');
    const pagEl = document.getElementById('properties-pagination');

    grid.innerHTML = Array(6).fill('<div class="card"><div class="skeleton" style="height:220px;"></div><div style="padding:1.2rem;"><div class="skeleton" style="height:20px;width:40%;margin-bottom:8px;"></div><div class="skeleton" style="height:16px;width:80%;margin-bottom:8px;"></div><div class="skeleton" style="height:14px;width:60%;"></div></div></div>').join('');

    // Build query
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', '12');

    const keyword = document.getElementById('filter-keyword').value.trim();
    const city = document.getElementById('filter-city').value.trim();
    const type = document.getElementById('filter-type').value;
    const propertyType = document.getElementById('filter-property-type').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;
    const bedrooms = document.getElementById('filter-bedrooms').value;

    if (keyword) params.set('keyword', keyword);
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (propertyType) params.set('propertyType', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);

    try {
      const data = await api(`/properties?${params.toString()}`);
      countEl.textContent = `Showing ${data.count} of ${data.total} properties`;

      if (data.properties.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;">
            <div class="empty-icon">🏜️</div>
            <h3>No properties found</h3>
            <p>Try adjusting your search filters.</p>
          </div>`;
        pagEl.innerHTML = '';
        return;
      }

      grid.innerHTML = data.properties.map(p => propertyCard(p)).join('');

      // Pagination
      if (data.pages > 1) {
        let pagHTML = '';
        for (let i = 1; i <= data.pages; i++) {
          pagHTML += `<button class="btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}" data-page="${i}">${i}</button>`;
        }
        pagEl.innerHTML = pagHTML;
        pagEl.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => fetchProperties(parseInt(btn.dataset.page)));
        });
      } else {
        pagEl.innerHTML = '';
      }
    } catch (err) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">⚠️</div>
          <h3>Could not load properties</h3>
          <p>${err.message}</p>
        </div>`;
      countEl.textContent = '';
      pagEl.innerHTML = '';
    }
  }

  // --- AI Natural Language Search ---
  document.getElementById('btn-ai-search')?.addEventListener('click', async () => {
    const query = document.getElementById('ai-search-input').value.trim();
    if (!query) return;

    const btn = document.getElementById('btn-ai-search');
    const statusEl = document.getElementById('ai-search-status');
    const originalText = btn.innerHTML;

    btn.innerHTML = 'Thinking... ⏳';
    btn.disabled = true;
    statusEl.style.display = 'block';
    statusEl.textContent = 'AI is analyzing your request...';

    try {
      const data = await api('/ai/nl-search', { method: 'POST', body: { query } });
      const filters = data.filters || {};

      statusEl.textContent = 'Filters applied! Searching properties...';

      // Reset all filters first
      document.querySelectorAll('.filters-bar input, .filters-bar select').forEach(el => el.value = '');

      // Apply AI extracted filters
      if (filters.type) document.getElementById('filter-type').value = filters.type;
      if (filters.propertyType) document.getElementById('filter-property-type').value = filters.propertyType;
      if (filters.city) document.getElementById('filter-city').value = filters.city;
      if (filters.minPrice) document.getElementById('filter-min-price').value = filters.minPrice;
      if (filters.maxPrice) document.getElementById('filter-max-price').value = filters.maxPrice;
      if (filters.bedrooms) document.getElementById('filter-bedrooms').value = filters.bedrooms;

      // Trigger search
      fetchProperties(1);

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);

    } catch (err) {
      statusEl.textContent = 'AI Search failed: ' + err.message;
      statusEl.style.color = '#ff6b6b';
      setTimeout(() => statusEl.style.display = 'none', 4000);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  // Enter key for AI search
  document.getElementById('ai-search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-ai-search').click();
  });

  // Search button
  document.getElementById('btn-search').addEventListener('click', () => fetchProperties(1));

  // Enter key in inputs
  document.querySelectorAll('.filters-bar input').forEach(input => {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') fetchProperties(1); });
  });

  // Initial load
  fetchProperties(1);
});
