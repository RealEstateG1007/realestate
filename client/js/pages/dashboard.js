// ============================================
// Dashboard Page
// ============================================

registerPage('#/dashboard', async () => {
  if (!Auth.isLoggedIn()) {
    showToast('Please sign in to access your dashboard', 'error');
    navigate('#/login');
    return;
  }

  const user = Auth.getUser();
  const isSeller = user.role === 'seller' || user.role === 'agent' || user.role === 'admin';

  appContainer.innerHTML = `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <h2>Welcome, ${user.name} 👋</h2>
        <p class="text-secondary">Your ${user.role} dashboard</p>
      </div>

      <div class="dashboard-stats" id="dashboard-stats">
        <div class="stat-card"><div class="stat-value">—</div><div class="stat-label">Loading...</div></div>
      </div>

      ${isSeller ? `
        <div class="dashboard-tabs">
          <button class="tab-btn active" data-tab="listings">My Listings</button>
          <button class="tab-btn" data-tab="create">Create Listing</button>
        </div>

        <div class="tab-content active" id="tab-listings">
          <div id="my-listings-container"></div>
        </div>

        <div class="tab-content" id="tab-create">
          <div class="create-form">
            <h3 style="margin-bottom:1.5rem;">New Property Listing</h3>
            <form id="create-listing-form">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" id="cl-title" placeholder="Beautiful 3-Bedroom Home in Downtown" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Price ($)</label>
                  <input type="number" id="cl-price" placeholder="450000" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Type</label>
                  <select id="cl-type" required>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Property Type</label>
                  <select id="cl-property-type" required>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select id="cl-status">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Bedrooms</label>
                  <input type="number" id="cl-bedrooms" value="3" min="0">
                </div>
                <div class="form-group">
                  <label class="form-label">Bathrooms</label>
                  <input type="number" id="cl-bathrooms" value="2" min="0">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Area (sqft)</label>
                  <input type="number" id="cl-sqft" placeholder="1500">
                </div>
                <div class="form-group">
                  <label class="form-label">Furnished</label>
                  <select id="cl-furnished">
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="fully-furnished">Fully Furnished</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input type="text" id="cl-address" placeholder="123 Main St" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">City</label>
                  <input type="text" id="cl-city" placeholder="New York" required>
                </div>
                <div class="form-group">
                  <label class="form-label">State</label>
                  <input type="text" id="cl-state" placeholder="NY" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Zip Code</label>
                <input type="text" id="cl-zip" placeholder="10001">
              </div>
              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <label class="form-label" style="margin-bottom: 0;">Description</label>
                    <button type="button" id="btn-ai-desc" class="btn btn-sm" style="background: linear-gradient(45deg, var(--accent), #9b51e0); color: white; border: none; font-size: 0.8rem; padding: 0.3rem 0.8rem;">Generate with AI ✨</button>
                </div>
                <textarea id="cl-description" rows="5" placeholder="Describe the property in detail..." required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Amenities</label>
                <div class="amenities-grid" id="amenities-selector">
                  ${['Parking', 'Pool', 'Gym', 'Garden', 'Balcony', 'AC', 'Elevator', 'Security', 'Laundry', 'Storage', 'Rooftop', 'Fireplace'].map(a =>
    `<span class="amenity-tag" data-amenity="${a}">${a}</span>`
  ).join('')}
                </div>
              </div>
              <div class="form-group">
                <label class="form-label flex items-center gap-1">
                  <input type="checkbox" id="cl-pet" style="width:auto;"> Pet Friendly
                </label>
              </div>
              <div id="create-error" class="form-error" style="display:none;"></div>
              <button type="submit" class="btn btn-primary btn-lg mt-2" id="create-submit">Publish Listing</button>
            </form>
          </div>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">🏡</div>
          <h3>Your Buyer Dashboard</h3>
          <p>Browse properties and save your favorites. More features coming soon!</p>
          <a href="#/properties" class="btn btn-primary mt-3">Explore Properties</a>
        </div>
      `}
    </div>`;

  // --- Load Stats & Listings ---
  if (isSeller) {
    try {
      const data = await api('/properties/user/my-listings');
      const listings = data.properties || [];
      const published = listings.filter(l => l.status === 'published').length;
      const draft = listings.filter(l => l.status === 'draft').length;
      const pending = listings.filter(l => l.status === 'pending').length;

      document.getElementById('dashboard-stats').innerHTML = `
        <div class="stat-card"><div class="stat-value">${listings.length}</div><div class="stat-label">Total Listings</div></div>
        <div class="stat-card"><div class="stat-value">${published}</div><div class="stat-label">Published</div></div>
        <div class="stat-card"><div class="stat-value">${draft}</div><div class="stat-label">Drafts</div></div>
        <div class="stat-card"><div class="stat-value">${pending}</div><div class="stat-label">Pending</div></div>`;

      const container = document.getElementById('my-listings-container');
      if (listings.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No listings yet</h3>
            <p>Create your first property listing to get started.</p>
          </div>`;
      } else {
        container.innerHTML = `
          <div style="overflow-x:auto;">
            <table class="listings-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Price</th>
                  <th>City</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${listings.map(l => `
                  <tr>
                    <td><a href="#/property/${l._id}" style="color:var(--accent);font-weight:500;">${l.title}</a></td>
                    <td>${formatPrice(l.price)}</td>
                    <td>${l.city}</td>
                    <td style="text-transform:capitalize;">${l.type}</td>
                    <td><span class="status-badge status-${l.status}">${l.status}</span></td>
                    <td>
                      <button class="btn btn-sm btn-danger btn-delete-listing" data-id="${l._id}">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;

        // Delete handlers
        container.querySelectorAll('.btn-delete-listing').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this listing?')) return;
            try {
              await api(`/properties/${btn.dataset.id}`, { method: 'DELETE' });
              showToast('Listing deleted', 'success');
              handleRoute(); // refresh
            } catch (err) {
              showToast(err.message, 'error');
            }
          });
        });
      }
    } catch (err) {
      document.getElementById('dashboard-stats').innerHTML = `
        <div class="stat-card"><div class="stat-value">⚠️</div><div class="stat-label">${err.message}</div></div>`;
    }

    // --- Tabs ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // --- Amenity Tags ---
    const selectedAmenities = new Set();
    document.querySelectorAll('#amenities-selector .amenity-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const a = tag.dataset.amenity;
        if (selectedAmenities.has(a)) {
          selectedAmenities.delete(a);
          tag.classList.remove('selected');
        } else {
          selectedAmenities.add(a);
          tag.classList.add('selected');
        }
      });
    });

    // --- AI Description Generator ---
    document.getElementById('btn-ai-desc')?.addEventListener('click', async () => {
      const title = document.getElementById('cl-title').value.trim();
      const type = document.getElementById('cl-type').value;
      const propertyType = document.getElementById('cl-property-type').value;
      const price = document.getElementById('cl-price').value;
      const bedrooms = document.getElementById('cl-bedrooms').value;
      const bathrooms = document.getElementById('cl-bathrooms').value;
      const address = document.getElementById('cl-address').value.trim();
      const city = document.getElementById('cl-city').value.trim();
      const sqft = document.getElementById('cl-sqft').value;

      if (!title || !price || !city) {
        showToast('Please fill out Title, Price, and City first to give the AI context.', 'error');
        return;
      }

      const btn = document.getElementById('btn-ai-desc');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Generating... ⏳';
      btn.disabled = true;

      try {
        const body = { title, type, propertyType, price, bedrooms, bathrooms, address, city, sqft };
        const data = await api('/ai/generate-description', { method: 'POST', body });
        document.getElementById('cl-description').value = data.description;
        showToast('AI Description generated! ✨', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });

    // --- Create Listing Form ---
    document.getElementById('create-listing-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('create-submit');
      const errorEl = document.getElementById('create-error');
      errorEl.style.display = 'none';
      btn.textContent = 'Publishing...';
      btn.disabled = true;

      try {
        const body = {
          title: document.getElementById('cl-title').value.trim(),
          price: parseInt(document.getElementById('cl-price').value),
          type: document.getElementById('cl-type').value,
          propertyType: document.getElementById('cl-property-type').value,
          status: document.getElementById('cl-status').value,
          bedrooms: parseInt(document.getElementById('cl-bedrooms').value) || 0,
          bathrooms: parseInt(document.getElementById('cl-bathrooms').value) || 0,
          sqft: parseInt(document.getElementById('cl-sqft').value) || 0,
          furnished: document.getElementById('cl-furnished').value,
          address: document.getElementById('cl-address').value.trim(),
          city: document.getElementById('cl-city').value.trim(),
          state: document.getElementById('cl-state').value.trim(),
          zipCode: document.getElementById('cl-zip').value.trim(),
          description: document.getElementById('cl-description').value.trim(),
          amenities: Array.from(selectedAmenities),
          petFriendly: document.getElementById('cl-pet').checked
        };

        await api('/properties', { method: 'POST', body });
        showToast('Property listed successfully! 🎉', 'success');
        // Switch to listings tab and refresh
        handleRoute();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        btn.textContent = 'Publish Listing';
        btn.disabled = false;
      }
    });
  } else {
    // Buyer stats
    document.getElementById('dashboard-stats').innerHTML = `
      <div class="stat-card"><div class="stat-value">🏠</div><div class="stat-label">Explore Properties</div></div>
      <div class="stat-card"><div class="stat-value">💬</div><div class="stat-label">Messaging (Soon)</div></div>
      <div class="stat-card"><div class="stat-value">❤️</div><div class="stat-label">Saved (Soon)</div></div>`;
  }
});
