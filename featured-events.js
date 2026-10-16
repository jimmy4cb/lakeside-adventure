const featuredEventElement = document.getElementById('upcoming');

if (featuredEventElement && window.React && window.ReactDOM) {
  const h = window.React.createElement;
  const publishedEvents = [
    {
      title: 'Twende Hike Korando - Kisian',
      category: 'Hiking',
      date: '14 Mar 2026',
      location: 'Korando - Kisian',
      price: 500
    },
    {
      title: 'Twende Kajulu Hike',
      category: 'Hiking',
      date: '21 Mar 2026',
      location: 'Kajulu Hills',
      price: 500
    },
    {
      title: 'Ndere Island Hike and Picnic',
      category: 'Hiking',
      date: '28 Mar 2026',
      location: 'Ndere Island',
      price: 3000
    }
  ];

  function readAdminEvents() {
    try {
      const events = JSON.parse(localStorage.getItem('lakesideDemoEvents') || '[]');
      return Array.isArray(events) ? events : [];
    } catch (error) {
      console.error('Unable to read featured events from browser storage.', error);
      return [];
    }
  }

  function EventCard({ event, isAdminEvent = false }) {
    const details = [
      `📅 ${isAdminEvent ? `${event.date} · ${event.time}` : event.date}`,
      `📍 ${event.location}`,
      `💰 KES ${Number(event.price).toLocaleString('en-KE')}`,
      ...(isAdminEvent ? [`👥 ${event.capacity} slots`] : [])
    ];

    const bookingButtonAttributes = {
      'data-event': event.title,
      'data-price': String(event.price),
      'data-date': event.date || '',
      'data-location': event.location || ''
    };

    return h('article', { className: 'event-card' },
      h('div', { className: 'event-badge' }, event.category),
      h('h3', null, event.title),
      h('ul', null, details.map((detail) => h('li', { key: detail }, detail))),
      h('div', { className: 'event-actions' },
        !isAdminEvent && h('button', {
          ...bookingButtonAttributes,
          className: 'secondary-btn small',
          type: 'button'
        }, 'Details'),
        h('button', {
          ...bookingButtonAttributes,
          className: 'primary-btn small',
          type: 'button'
        }, 'Book Now')
      )
    );
  }

  const adminEvents = readAdminEvents();
  const events = [...publishedEvents, ...adminEvents];

  function FeaturedEvents() {
    return events.map((event, index) => h(EventCard, {
      key: `${event.title}-${index}`,
      event,
      isAdminEvent: index >= publishedEvents.length
    }));
  }

  window.ReactDOM.createRoot(featuredEventElement).render(h(FeaturedEvents));
}
