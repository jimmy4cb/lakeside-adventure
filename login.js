const passwordInput = document.getElementById('loginPassword');
const passwordToggle = document.getElementById('passwordToggle');
const loginForm = document.getElementById('loginForm');
const loginFeedback = document.getElementById('loginFeedback');
const emailInput = document.getElementById('loginEmail');
const passwordConfirm = document.getElementById('adminPasswordConfirm');
const passwordConfirmLabel = document.getElementById('adminPasswordConfirmLabel');
const adminAuth = window.LakeSideAdminAuth;
const requestedAdminLogin = new URLSearchParams(window.location.search).get('role') === 'admin';

function normalizedEmail(value) {
  return value.trim().toLowerCase();
}

function getAdminEmail() {
  return adminAuth.getAccount()?.email || adminAuth.bootstrapEmail;
}

function updateAdminPasswordSetup() {
  const accountExists = Boolean(adminAuth.getAccount());
  const isBootstrapAdmin = normalizedEmail(emailInput.value) === adminAuth.bootstrapEmail;
  const isAdmin = normalizedEmail(emailInput.value) === getAdminEmail();
  const needsSetup = isBootstrapAdmin && !accountExists;
  passwordConfirmLabel.hidden = !needsSetup;
  passwordConfirm.required = needsSetup;
  passwordInput.autocomplete = needsSetup ? 'new-password' : 'current-password';
  passwordConfirm.value = '';
  if (needsSetup) {
    passwordInput.minLength = 12;
    passwordInput.placeholder = 'Create at least 12 characters';
  } else {
    passwordInput.removeAttribute('minlength');
    passwordInput.placeholder = 'Enter your password';
  }
  if (requestedAdminLogin && !isAdmin) {
    loginFeedback.textContent = `Admin access is limited to ${getAdminEmail()}.`;
    loginFeedback.hidden = false;
  } else {
    loginFeedback.textContent = '';
    loginFeedback.hidden = true;
  }
}

if (requestedAdminLogin) {
  emailInput.value = getAdminEmail();
}
emailInput.addEventListener('input', updateAdminPasswordSetup);
updateAdminPasswordSetup();

passwordToggle.addEventListener('click', () => {
  const showingPassword = passwordInput.type === 'password';
  passwordInput.type = showingPassword ? 'text' : 'password';
  passwordToggle.textContent = showingPassword ? 'Hide' : 'Show';
  passwordToggle.setAttribute('aria-label', showingPassword ? 'Hide password' : 'Show password');
  passwordToggle.setAttribute('aria-pressed', String(showingPassword));
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = normalizedEmail(emailInput.value);
  const password = passwordInput.value;

  try {
    let account = adminAuth.getAccount();
    const isAdminEmail = email === (account?.email || adminAuth.bootstrapEmail);

    if (requestedAdminLogin && !isAdminEmail) {
      throw new Error(`Admin access is limited to ${getAdminEmail()}.`);
    }

    if (isAdminEmail) {
      if (!account) {
        if (email !== adminAuth.bootstrapEmail) {
          throw new Error('Admin account setup is unavailable for this email.');
        }
        if (password.length < 12 || password !== passwordConfirm.value) {
          throw new Error('Create a password of at least 12 characters and confirm it.');
        }
        account = await adminAuth.saveAccount(email, password);
      } else if (!await adminAuth.verifyPassword(account, password)) {
        throw new Error('The admin email or password is incorrect.');
      }

      sessionStorage.setItem('lakesideDemoUser', JSON.stringify({ email: account.email, role: 'admin' }));
      window.location.href = 'admin.html';
      return;
    }

    sessionStorage.setItem('lakesideDemoUser', JSON.stringify({ email, role: 'client' }));
    if (sessionStorage.getItem('lakesidePendingEvent')) {
      window.location.href = 'index.html#events';
      return;
    }
    window.location.href = 'index.html';
  } catch (error) {
    loginFeedback.textContent = error.message;
    loginFeedback.hidden = false;
  }
});
