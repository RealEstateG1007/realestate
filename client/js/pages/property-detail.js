// ============================================
// Property Detail Page
// ============================================

registerPage('#/property', async (id) => {
    if (!id) { navigate('#/properties'); return; }

    appContainer.innerHTML = `<div class="detail-page"><div class="skeleton" style="height:300px;margin-bottom:2rem;"></div></div>`;

    try {
        const data = await api(`/properties/${id}`);
        const p = data.property;
        const owner = p.owner || {};
        const typeClass = p.type === 'sale' ? 'badge-sale' : 'badge-rent';
        const typeLabel = p.type === 'sale' ? 'For Sale' : 'For Rent';
        const priceLabel = p.type === 'rent' ? '/month' : '';

        appContainer.innerHTML = `
      <div class="detail-page">
        <a href="#/properties" class="btn btn-ghost btn-sm" style="margin-bottom:1rem;">← Back to Properties</a>

        <div class="detail-header">
          <div class="detail-badges">
            <span class="card-badge ${typeClass}" style="position:static;">${typeLabel}</span>
            <span class="detail-badge">${p.propertyType}</span>
            <span class="detail-badge status-${p.status}">${p.status}</span>
            ${p.petFriendly ? '<span class="detail-badge">🐾 Pet Friendly</span>' : ''}
          </div>
          <div class="detail-price mt-1">${formatPrice(p.price)} <span style="font-size:1rem;color:var(--text-muted);font-weight:400;">${priceLabel}</span></div>
          <h1 class="detail-title">${p.title}</h1>
          <div class="detail-location">📍 ${p.address}, ${p.city}, ${p.state} ${p.zipCode || ''}</div>
        </div>

        <div class="detail-grid">
          <div>
            <!-- Specs -->
            <div class="detail-section">
              <h3>Property Details</h3>
              <div class="detail-specs">
                <div class="spec-item">
                  <div class="spec-label">Bedrooms</div>
                  <div class="spec-value">🛏️ ${p.bedrooms}</div>
                </div>
                <div class="spec-item">
                  <div class="spec-label">Bathrooms</div>
                  <div class="spec-value">🛁 ${p.bathrooms}</div>
                </div>
                <div class="spec-item">
                  <div class="spec-label">Area</div>
                  <div class="spec-value">📐 ${p.sqft ? p.sqft.toLocaleString() + ' sqft' : 'N/A'}</div>
                </div>
                <div class="spec-item">
                  <div class="spec-label">Furnished</div>
                  <div class="spec-value">${p.furnished || 'N/A'}</div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="detail-section">
              <h3>Description</h3>
              <p style="color:var(--text-secondary);line-height:1.8;">${p.description}</p>
            </div>

            <!-- Amenities -->
            ${p.amenities && p.amenities.length > 0 ? `
              <div class="detail-section">
                <h3>Amenities</h3>
                <div class="amenities-grid">
                  ${p.amenities.map(a => `<span class="amenity-tag selected">${a}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Sidebar -->
          <div class="detail-sidebar">
            <div class="card">
              <h4 style="margin-bottom:1rem;">Listed By</h4>
              <div class="owner-info">
                <div class="owner-avatar">${owner.name ? owner.name.charAt(0).toUpperCase() : '?'}</div>
                <div>
                  <div class="owner-name">${owner.name || 'Unknown'}</div>
                  <div class="owner-role">${owner.role || ''} ${owner.verified ? '✅' : ''}</div>
                </div>
              </div>
              ${Auth.isLoggedIn() ? `
                <button class="btn btn-primary btn-block" onclick="showToast('Messaging coming soon!', 'info')">Send Message</button>
                <button class="btn btn-secondary btn-block mt-1" onclick="showToast('Scheduling coming soon!', 'info')">Schedule Viewing</button>
              ` : `
                <a href="#/login" class="btn btn-primary btn-block">Sign in to Contact</a>
              `}
            </div>
          </div>
        </div>
      </div>`;
    } catch (err) {
        appContainer.innerHTML = `
      <div class="detail-page">
        <div class="empty-state">
          <div class="empty-icon">😕</div>
          <h3>Property not found</h3>
          <p>${err.message}</p>
          <a href="#/properties" class="btn btn-primary mt-3">Browse Properties</a>
        </div>
      </div>`;
    }
});
