const passwordInput = document.getElementById('loginPassword');
const passwordToggle = document.getElementById('passwordToggle');
const loginForm = document.getElementById('loginForm');
const loginFeedback = document.getElementById('loginFeedback');
const emailInput = document.getElementById('loginEmail');
const passwordConfirm = document.getElementById('adminPasswordConfirm');
const passwordConfirmLabel = document.getElementById('adminPasswordConfirmLabel');
const clientName = document.getElementById('clientName');
const clientNameLabel = document.getElementById('clientNameLabel');
const clientPasswordConfirm = document.getElementById('clientPasswordConfirm');
const clientPasswordConfirmLabel = document.getElementById('clientPasswordConfirmLabel');
const clientSignupToggle = document.getElementById('clientSignupToggle');
const adminAuth = window.LakeSideAdminAuth;
const clientAuth = window.LakeSideClientAuth;
const requestedAdminLogin = new URLSearchParams(window.location.search).get('role') === 'admin';
let clientSignupMode = false;

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

function updateClientSignupMode() {
  const clientRegistration = clientSignupMode && !requestedAdminLogin;
  clientNameLabel.hidden = !clientRegistration;
  clientName.required = clientRegistration;
  clientPasswordConfirmLabel.hidden = !clientRegistration;
  clientPasswordConfirm.required = clientRegistration;
  clientSignupToggle.hidden = requestedAdminLogin;
  clientSignupToggle.textContent = clientSignupMode
    ? 'Already registered? Sign in'
    : 'New client? Create an account';
  loginForm.querySelector('.login-submit').textContent = clientRegistration ? 'Create client account' : 'Sign in';
  passwordInput.autocomplete = clientRegistration ? 'new-password' : 'current-password';
  if (clientRegistration) {
    passwordInput.minLength = 8;
    passwordInput.placeholder = 'Create at least 8 characters';
  } else if (!passwordConfirm.required) {
    passwordInput.removeAttribute('minlength');
    passwordInput.placeholder = 'Enter your password';
  }
  clientPasswordConfirm.value = '';
  updateAdminPasswordSetup();
}

if (requestedAdminLogin) {
  emailInput.value = getAdminEmail();
}
emailInput.addEventListener('input', updateAdminPasswordSetup);
clientSignupToggle.addEventListener('click', () => {
  clientSignupMode = !clientSignupMode;
  loginFeedback.hidden = true;
  loginFeedback.textContent = '';
  updateClientSignupMode();
});
updateClientSignupMode();

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
      if (clientSignupMode) {
        throw new Error('The admin email cannot be used to create a client account.');
      }
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

    let clientAccount;
    if (clientSignupMode) {
      if (password.length < 8 || password !== clientPasswordConfirm.value) {
        throw new Error('Use a password of at least 8 characters and make sure both password fields match.');
      }
      clientAccount = await clientAuth.createAccount(email, clientName.value, password);
    } else {
      clientAccount = await clientAuth.authenticate(email, password);
    }

    sessionStorage.setItem('lakesideDemoUser', JSON.stringify({
      email: clientAccount.email,
      name: clientAccount.name,
      role: 'client'
    }));
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
