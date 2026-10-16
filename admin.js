const eventStorageKey = 'lakesideDemoEvents';
const bookingStorageKey = 'lakesideDemoBookings';
let demoUser;
try {
  demoUser = JSON.parse(sessionStorage.getItem('lakesideDemoUser') || 'null');
} catch (error) {
  console.error('Unable to read the current browser session.', error);
  demoUser = null;
}
const eventForm = document.getElementById('eventForm');
const eventRows = document.getElementById('adminEvents');
const transactionRows = document.getElementById('adminTransactions');
const adminAccountForm = document.getElementById('adminAccountForm');
const adminAccountFeedback = document.getElementById('adminAccountFeedback');
const adminAuth = window.LakeSideAdminAuth;

function hasAdminAccess() {
  try {
    const account = adminAuth.getAccount();
    return Boolean(account && demoUser?.role === 'admin' && demoUser.email === account.email);
  } catch (error) {
    console.error('Unable to verify the admin account in browser storage.', error);
    return false;
  }
}

if (!hasAdminAccess()) {
  window.location.replace('login.html?role=admin');
} else {

adminAccountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(adminAccountForm);
  const currentAccount = adminAuth.getAccount();
  const currentPassword = String(formData.get('currentPassword'));
  const email = String(formData.get('email')).trim().toLowerCase();
  const password = String(formData.get('password'));
  const passwordConfirm = String(formData.get('passwordConfirm'));

  try {
    if (!currentAccount || !await adminAuth.verifyPassword(currentAccount, currentPassword)) {
      throw new Error('Your current password is incorrect.');
    }
    if (password.length < 12 || password !== passwordConfirm) {
      throw new Error('The new password must be at least 12 characters and both password fields must match.');
    }

    const updatedAccount = await adminAuth.saveAccount(email, password);
    sessionStorage.setItem('lakesideDemoUser', JSON.stringify({ email: updatedAccount.email, role: 'admin' }));
    adminAccountFeedback.textContent = 'Admin email and password updated in this browser.';
    adminAccountFeedback.hidden = false;
    adminAccountForm.reset();
  } catch (error) {
    adminAccountFeedback.textContent = error.message;
    adminAccountFeedback.hidden = false;
  }
});

function getRecords(key) {
  try {
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(records) ? records : [];
  } catch (error) {
    console.error(`Unable to read ${key} from browser storage.`, error);
    return [];
  }
}

function saveRecords(key, records) {
  localStorage.setItem(key, JSON.stringify(records));
}

function appendCell(row, text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  row.appendChild(cell);
  return cell;
}

function renderDashboard() {
  const events = getRecords(eventStorageKey);
  const bookings = getRecords(bookingStorageKey);
  eventRows.replaceChildren();
  transactionRows.replaceChildren();

  document.getElementById('eventCount').textContent = String(events.length);
  document.getElementById('bookingCount').textContent = String(bookings.length);
  document.getElementById('pendingCount').textContent = String(bookings.filter((booking) => booking.status !== 'confirmed').length);
  const confirmedTotal = bookings
    .filter((booking) => booking.status === 'confirmed')
    .reduce((total, booking) => total + Number(booking.amount || 0), 0);
  document.getElementById('revenueTotal').textContent = `KES ${confirmedTotal.toLocaleString('en-KE')}`;
  document.getElementById('emptyEvents').hidden = events.length > 0;
  document.getElementById('emptyTransactions').hidden = bookings.length > 0;

  events.forEach((event) => {
    const row = document.createElement('tr');
    appendCell(row, `${event.title} (${event.category})`);
    appendCell(row, `${event.date} ${event.time}`);
    appendCell(row, event.location);
    appendCell(row, `KES ${Number(event.price).toLocaleString('en-KE')}`);
    appendCell(row, String(event.capacity));
    const actionCell = appendCell(row, '');
    const removeButton = document.createElement('button');
    removeButton.className = 'table-action remove-action';
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.dataset.removeEvent = event.id;
    actionCell.appendChild(removeButton);
    eventRows.appendChild(row);
  });

  bookings.forEach((booking) => {
    const row = document.createElement('tr');
    appendCell(row, booking.reference);
    appendCell(row, booking.name || booking.email);
    appendCell(row, booking.event);
    appendCell(row, String(booking.participants));
    appendCell(row, `KES ${Number(booking.amount).toLocaleString('en-KE')}`);
    appendCell(row, booking.status === 'confirmed' ? 'Confirmed (demo)' : 'Awaiting verification');
    const actionCell = appendCell(row, '');
    if (booking.status !== 'confirmed') {
      const confirmButton = document.createElement('button');
      confirmButton.className = 'table-action confirm-action';
      confirmButton.type = 'button';
      confirmButton.textContent = 'Confirm payment';
      confirmButton.dataset.confirmBooking = booking.reference;
      actionCell.appendChild(confirmButton);
    }
    transactionRows.appendChild(row);
  });
}

eventForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(eventForm);
  const records = getRecords(eventStorageKey);
  records.unshift({
    id: crypto.randomUUID(),
    title: String(formData.get('title')).trim(),
    category: String(formData.get('category')),
    date: String(formData.get('date')),
    time: String(formData.get('time')),
    location: String(formData.get('location')).trim(),
    price: Number(formData.get('price')),
    capacity: Number(formData.get('capacity'))
  });
  saveRecords(eventStorageKey, records);
  eventForm.reset();
  renderDashboard();
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  if (target.dataset.removeEvent) {
    const remaining = getRecords(eventStorageKey).filter((item) => item.id !== target.dataset.removeEvent);
    saveRecords(eventStorageKey, remaining);
    renderDashboard();
    }
  }

  if (target.dataset.confirmBooking) {
    const bookings = getRecords(bookingStorageKey).map((booking) => (
      booking.reference === target.dataset.confirmBooking
        ? { ...booking, status: 'confirmed', confirmedAt: new Date().toISOString() }
        : booking
    ));
    saveRecords(bookingStorageKey, bookings);
    renderDashboard();
  }
});

document.getElementById('adminSignOut').addEventListener('click', () => {
  sessionStorage.removeItem('lakesideDemoUser');
  window.location.href = 'login.html';
});

renderDashboard();
