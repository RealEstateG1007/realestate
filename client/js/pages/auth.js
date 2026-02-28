// ============================================
// Auth Pages — Login & Register
// ============================================

// --- Login ---
registerPage('#/login', async () => {
    appContainer.innerHTML = `
    <div class="form-page">
      <div class="form-card">
        <h2>Welcome Back</h2>
        <p class="form-subtitle">Sign in to your account</p>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="login-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" placeholder="••••••••" required>
          </div>
          <div id="login-error" class="form-error" style="display:none;"></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg mt-2" id="login-submit">Sign In</button>
        </form>
        <div class="form-footer">
          Don't have an account? <a href="#/register">Sign Up</a>
        </div>
      </div>
    </div>`;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-submit');
        const errorEl = document.getElementById('login-error');
        errorEl.style.display = 'none';
        btn.textContent = 'Signing in...';
        btn.disabled = true;

        try {
            const data = await api('/auth/login', {
                method: 'POST',
                body: {
                    email: document.getElementById('login-email').value.trim(),
                    password: document.getElementById('login-password').value
                }
            });
            Auth.setAuth(data.token, data.user);
            updateNavUI();
            showToast(`Welcome back, ${data.user.name}!`, 'success');
            navigate('#/dashboard');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
            btn.textContent = 'Sign In';
            btn.disabled = false;
        }
    });
});

// --- Register ---
registerPage('#/register', async () => {
    let selectedRole = 'buyer';

    appContainer.innerHTML = `
    <div class="form-page">
      <div class="form-card">
        <h2>Create Account</h2>
        <p class="form-subtitle">Join RealEstate Connect today</p>
        <form id="register-form">
          <div class="form-group">
            <label class="form-label">I am a...</label>
            <div class="role-selector" id="role-selector">
              <div class="role-option selected" data-role="buyer">
                <span class="role-icon">🏠</span>
                Buyer
              </div>
              <div class="role-option" data-role="seller">
                <span class="role-icon">🔑</span>
                Seller
              </div>
              <div class="role-option" data-role="agent">
                <span class="role-icon">🤝</span>
                Agent
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="reg-name" placeholder="John Doe" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="reg-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="reg-password" placeholder="min 6 characters" required minlength="6">
          </div>
          <div class="form-group">
            <label class="form-label">Phone (optional)</label>
            <input type="tel" id="reg-phone" placeholder="+1 (555) 000-0000">
          </div>
          <div class="form-group agent-field" id="agent-field" style="display:none;">
            <label class="form-label">Agent License #</label>
            <input type="text" id="reg-license" placeholder="License number">
          </div>
          <div id="register-error" class="form-error" style="display:none;"></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg mt-2" id="register-submit">Create Account</button>
        </form>
        <div class="form-footer">
          Already have an account? <a href="#/login">Sign In</a>
        </div>
      </div>
    </div>`;

    // Role selector
    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedRole = option.dataset.role;
            document.getElementById('agent-field').style.display = selectedRole === 'agent' ? 'block' : 'none';
        });
    });

    // Submit
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('register-submit');
        const errorEl = document.getElementById('register-error');
        errorEl.style.display = 'none';
        btn.textContent = 'Creating account...';
        btn.disabled = true;

        try {
            const body = {
                name: document.getElementById('reg-name').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                password: document.getElementById('reg-password').value,
                role: selectedRole,
                phone: document.getElementById('reg-phone').value.trim()
            };
            if (selectedRole === 'agent') {
                body.agentLicense = document.getElementById('reg-license').value.trim();
            }

            const data = await api('/auth/register', { method: 'POST', body });
            Auth.setAuth(data.token, data.user);
            updateNavUI();
            showToast(`Welcome, ${data.user.name}! Account created.`, 'success');
            navigate('#/dashboard');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }
    });
});
