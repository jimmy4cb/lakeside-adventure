const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const modal = document.getElementById('bookingModal');
const selectedEventInput = document.getElementById('selectedEvent');
const bookingForm = document.getElementById('bookingForm');
const membershipForm = document.getElementById('membershipForm');
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');
const bookingTotal = document.getElementById('bookingTotal');
const bookingFeedback = document.getElementById('bookingFeedback');
const participantsInput = bookingForm?.querySelector('[name="participants"]');
const payButton = bookingForm?.querySelector('[type="submit"]');

const eventPricesKes = {
  'Twende Hike Korando - Kisian': 500,
  'Twende Kajulu Hike': 500,
  'Ndere Island Hike and Picnic': 3000,
  'Mabungo Caves Adventure': 1800,
  'Kisumu Sunset Ride': 2200,
  'Lake Experience & Picnic': 1500,
  'Weekend Community Meetup': 1200
};

const eventGrid = document.querySelector('.event-grid');
const demoUser = JSON.parse(sessionStorage.getItem('lakesideDemoUser') || 'null');
let activeEvent = null;

function readLocalRecords(key) {
  try {
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(records) ? records : [];
  } catch (error) {
    console.error(`Unable to read ${key} from browser storage.`, error);
    return [];
  }
}

function addAdminEventsToList() {
  readLocalRecords('lakesideDemoEvents').forEach((event) => {
    eventPricesKes[event.title] = Number(event.price);
    if (window.React && window.ReactDOM) return;

    const card = document.createElement('article');
    card.className = 'event-card';
    const badge = document.createElement('div');
    badge.className = 'event-badge';
    badge.textContent = event.category;
    const title = document.createElement('h3');
    title.textContent = event.title;
    const details = document.createElement('ul');
    [`📅 ${event.date} · ${event.time}`, `📍 ${event.location}`, `💰 KES ${Number(event.price).toLocaleString('en-KE')}`, `👥 ${event.capacity} slots`]
      .forEach((detail) => {
        const item = document.createElement('li');
        item.textContent = detail;
        details.appendChild(item);
      });
    const actions = document.createElement('div');
    actions.className = 'event-actions';
    const button = document.createElement('button');
    button.className = 'primary-btn small';
    button.type = 'button';
    button.textContent = 'Book Now';
    button.dataset.event = event.title;
    button.dataset.price = String(event.price);
    button.dataset.date = event.date;
    button.dataset.location = event.location;
    actions.appendChild(button);
    card.append(badge, title, details, actions);
    eventGrid.appendChild(card);
  });
}

addAdminEventsToList();

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('open');
  });

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(setToast.timeoutId);
  setToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function updateBookingTotal() {
  const eventPrice = eventPricesKes[selectedEventInput.value];
  const participants = Number(participantsInput.value);

  if (!eventPrice || !Number.isInteger(participants) || participants < 1) {
    bookingTotal.textContent = 'Choose an event and participant count to see your total.';
    return;
  }

  const total = eventPrice * participants;
  bookingTotal.textContent = `Price per participant: KSh ${eventPrice.toLocaleString('en-KE')} · Total: KSh ${total.toLocaleString('en-KE')}`;
}

function openBooking(button) {
    const eventName = button.getAttribute('data-event');
    if (!eventName) return;
    const eventPrice = Number(button.dataset.price) || eventPricesKes[eventName];
    if (!eventPrice) {
      setToast('The price for this event is unavailable. Please contact our team.');
      return;
    }
    const currentUser = JSON.parse(sessionStorage.getItem('lakesideDemoUser') || 'null');
    if (!currentUser || currentUser.role !== 'client') {
      sessionStorage.setItem('lakesidePendingEvent', JSON.stringify({
        title: eventName,
        price: eventPrice,
        date: button.dataset.date || '',
        location: button.dataset.location || ''
      }));
      window.location.href = 'login.html?role=client';
      return;
    }

    activeEvent = {
      title: eventName,
      price: eventPrice,
      date: button.dataset.date || '',
      location: button.dataset.location || ''
    };
    selectedEventInput.value = eventName;
    document.getElementById('selectedEventDate').value = activeEvent.date;
    document.getElementById('selectedEventLocation').value = activeEvent.location;
    bookingForm.querySelector('[name="email"]').value = currentUser.email;
    bookingFeedback.hidden = true;
    bookingFeedback.textContent = '';
    updateBookingTotal();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-event]');
  if (button) openBooking(button);
});

const pendingEvent = sessionStorage.getItem('lakesidePendingEvent');
if (pendingEvent && demoUser?.role === 'client') {
  try {
    const eventToBook = JSON.parse(pendingEvent);
    sessionStorage.removeItem('lakesidePendingEvent');
    const matchingButton = [...document.querySelectorAll('[data-event]')]
      .find((button) => button.dataset.event === eventToBook.title);
    if (matchingButton) openBooking(matchingButton);
  } catch (error) {
    sessionStorage.removeItem('lakesidePendingEvent');
    console.error('Unable to restore the pending demo booking.', error);
  }
}

participantsInput?.addEventListener('input', updateBookingTotal);

const closeModal = () => {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
};

document.querySelector('.modal-close')?.addEventListener('click', closeModal);
document.querySelector('[data-close="true"]')?.addEventListener('click', closeModal);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const eventName = selectedEventInput.value;
  const eventPrice = eventPricesKes[eventName];
  const participants = Number(participantsInput.value);
  const emailInput = bookingForm.querySelector('[name="email"]');
  const nameInput = bookingForm.querySelector('[name="fullName"]');

  if (!eventPrice || !Number.isInteger(participants) || participants < 1 || participants > 12 || !emailInput || !nameInput) {
    setToast('Please check your event, email, and participant count.');
    return;
  }

  const reference = `DEMO-${Date.now()}`;
  const bookings = readLocalRecords('lakesideDemoBookings');
  bookings.unshift({
    reference,
    email: emailInput.value,
    name: nameInput.value.trim(),
    event: eventName,
    eventDate: activeEvent?.date || '',
    location: activeEvent?.location || '',
    participants,
    amount: eventPrice * participants,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('lakesideDemoBookings', JSON.stringify(bookings));
  bookingFeedback.textContent = `Demo booking ${reference} is saved as awaiting payment. This local prototype does not charge or verify payments.`;
  bookingFeedback.hidden = false;
  setToast('Demo booking saved. No payment was processed.');
  bookingForm.reset();
  closeModal();
});

membershipForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  setToast('Membership request received. Welcome to LakeSide!');
  membershipForm.reset();
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  setToast('Message sent. We will get back to you soon.');
  contactForm.reset();
});

document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
    document.querySelectorAll('.gallery-item').forEach((item) => {
      const matches = filter === 'all' || item.classList.contains(filter);
      item.classList.toggle('hidden', !matches);
    });
  });
});
