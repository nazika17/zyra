/* ==========================================================================
   ZYRA AUTHENTICATION JS (LOGIN, REGISTER, USER PROFILE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});

// Toggle password visibility (eye icon)
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      if (input && (input.type === 'password' || input.type === 'text')) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? '🙈' : '👁️';
      }
    });
  });
}

// Handle Login Form
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    const res = await API.login({ email, password });
    if (res.success) {
      localStorage.setItem('zyra_token', res.token);
      localStorage.setItem('zyra_user', JSON.stringify(res.user));
      showToast('Welcome back to ZYRA! Logged in successfully.');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1200);
    } else {
      showToast(res.message || 'Login failed.', 'error');
    }
  });
}

// Handle Register Form
function initRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullname = document.getElementById('reg-fullname').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;

    if (!fullname || !email || !password) {
      showToast('Full name, email, and password are required.', 'error');
      return;
    }

    const res = await API.register({ fullname, email, phone, password });
    if (res.success) {
      localStorage.setItem('zyra_token', res.token);
      localStorage.setItem('zyra_user', JSON.stringify(res.user));
      showToast('Account created! Welcome to ZYRA.');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1200);
    } else {
      showToast(res.message || 'Registration failed.', 'error');
    }
  });
}
