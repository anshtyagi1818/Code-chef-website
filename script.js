(() => {
  'use strict';

  const EVENTS_KEY = 'codechef-abesec-events-v1';
  const REGISTRATIONS_KEY = 'codechef-abesec-registrations-v1';
  const ADMIN_SESSION_KEY = 'codechef-abesec-admin';
  const ADMIN_EMAIL = 'admin@codechefabsec.in';
  const ADMIN_PASSWORD = 'chef@2026';
  const page = document.body.dataset.page;

  const seedEvents = [
    { id: 'algo-rush-2026', name: 'AlgoRush: The Campus Challenge', category: 'Competition', date: '2026-10-15', time: '10:00', venue: 'Innovation Lab, Block C', description: 'A fast-paced algorithm contest built for sharp thinking, clever trade-offs, and a little friendly rivalry.', featured: true },
    { id: 'build-night-2026', name: 'Build Night: Ship Your First App', category: 'Workshop', date: '2026-10-08', time: '14:30', venue: 'Computer Lab 4, Block B', description: 'Go from blank folder to a working web app with mentors on hand and plenty of time to experiment.', featured: false },
    { id: 'abesec-webathon-2026', name: 'ABESEC Webathon', category: 'Hackathon', date: '2026-10-24', time: '09:00', venue: 'Main Auditorium', description: 'Form a team, pick a real campus problem, and build a thoughtful web solution in one focused day.', featured: false },
    { id: 'git-together-2026', name: 'Git Together: Open Source 101', category: 'Community', date: '2026-10-12', time: '16:00', venue: 'Seminar Hall 2', description: 'Make your first pull request, explore beginner-friendly projects, and meet the people behind them.', featured: false },
    { id: 'beyond-big-o-2026', name: 'Beyond Big O: Systems That Scale', category: 'Talk', date: '2026-11-06', time: '12:00', venue: 'ABES Main Auditorium', description: 'An engineer’s perspective on the choices that keep real-world systems fast, resilient, and useful.', featured: false }
  ];

  function readStore(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getEvents() {
    return readStore(EVENTS_KEY, seedEvents);
  }

  function getRegistrations() {
    return readStore(REGISTRATIONS_KEY, []);
  }

  function saveEvents(events) {
    writeStore(EVENTS_KEY, events);
  }

  function saveRegistrations(registrations) {
    writeStore(REGISTRATIONS_KEY, registrations);
  }

  function initializeData() {
    try {
      if (localStorage.getItem(EVENTS_KEY) === null) saveEvents(seedEvents);
      if (localStorage.getItem(REGISTRATIONS_KEY) === null) saveRegistrations([]);
    } catch (error) {
      console.error('Could not initialize local event data.', error);
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function eventDate(date) {
    if (!date) return 'Date to be announced';
    const parsed = new Date(`${date}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return 'Date to be announced';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
  }

  function eventTime(time) {
    if (!time) return 'Time to be announced';
    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
    return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(2000, 0, 1, hours, minutes));
  }

  function isUpcoming(event) {
    return Boolean(event.date) && new Date(`${event.date}T23:59:59`).getTime() >= Date.now();
  }

  function iconFor(category) {
    const paths = {
      Competition: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/>',
      Workshop: '<path d="m14 6 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/><path d="m13 7 4 4"/>',
      Hackathon: '<path d="m8 3-5 9h7l-1 9 8-12h-7l2-6Z"/>',
      Talk: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8m-8 3h5"/>',
      Community: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1H3Zm13-9a3 3 0 1 0-1-5.8m2 8.1a5 5 0 0 1 4 4.9v.8h-4"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[category] || paths.Community}</svg>`;
  }

  function eventCard(event) {
    const url = `register.html?event=${encodeURIComponent(event.id)}`;
    return `<article class="event-card">
      <div class="event-card-top"><span class="event-icon">${iconFor(event.category)}</span><span class="category-tag">${escapeHtml(event.category)}</span></div>
      <h3>${escapeHtml(event.name)}</h3><p class="event-description">${escapeHtml(event.description)}</p>
      <div class="event-meta-list"><span><b class="meta-symbol" aria-hidden="true">◷</b>${escapeHtml(eventDate(event.date))} · ${escapeHtml(eventTime(event.time))}</span><span><b class="meta-symbol" aria-hidden="true">⌖</b>${escapeHtml(event.venue)}</span></div>
      <a class="button button-primary" href="${url}">Register <span aria-hidden="true">→</span></a>
    </article>`;
  }

  function renderHome() {
    const events = getEvents().filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));
    const featured = events.find(event => event.featured);
    const featuredSlot = document.getElementById('homeFeatured');
    const upcomingSlot = document.getElementById('homeUpcoming');
    const empty = document.getElementById('homeEmpty');
    if (!events.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    if (featured) {
      featuredSlot.innerHTML = `<article class="featured-card"><div><p class="eyebrow">✳ &nbsp; FEATURED EVENT</p><h3>${escapeHtml(featured.name)}</h3><p>${escapeHtml(featured.description)}</p><div class="featured-meta"><span>${escapeHtml(eventDate(featured.date))}</span><span>${escapeHtml(eventTime(featured.time))}</span><span>${escapeHtml(featured.venue)}</span></div></div><div class="featured-action"><span class="featured-label">${escapeHtml(featured.category)}</span><a class="button button-primary" href="register.html?event=${encodeURIComponent(featured.id)}">Save your seat <span aria-hidden="true">→</span></a></div></article>`;
    }
    upcomingSlot.innerHTML = events.filter(event => event.id !== featured?.id).slice(0, 2).map(eventCard).join('');
  }

  function renderEvents() {
    const search = document.getElementById('eventSearch');
    const category = document.getElementById('categoryFilter');
    const sort = document.getElementById('eventSort');
    const grid = document.getElementById('eventGrid');
    const count = document.getElementById('eventCount');
    const empty = document.getElementById('eventsEmpty');

    function update() {
      const needle = search.value.trim().toLowerCase();
      const selectedCategory = category.value;
      const filtered = getEvents().filter(event => {
        return event.name.toLowerCase().includes(needle) && (!selectedCategory || event.category === selectedCategory);
      });
      if (sort.value === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
      else filtered.sort((a, b) => sort.value === 'date-desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
      grid.innerHTML = filtered.map(eventCard).join('');
      count.textContent = `${filtered.length} ${filtered.length === 1 ? 'event' : 'events'}`;
      empty.hidden = filtered.length > 0;
      grid.hidden = filtered.length === 0;
    }

    const categories = [...new Set(getEvents().map(event => event.category).filter(Boolean))].sort();
    category.insertAdjacentHTML('beforeend', categories.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join(''));
    search.addEventListener('input', update);
    category.addEventListener('change', update);
    sort.addEventListener('change', update);
    document.getElementById('clearEventFilters').addEventListener('click', () => {
      search.value = '';
      category.value = '';
      sort.value = 'date-asc';
      update();
    });
    update();
  }

  function renderRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const select = document.getElementById('registrationEvent');
    const success = document.getElementById('registrationSuccess');
    const formError = document.getElementById('registrationFormError');
    const noEvents = document.getElementById('noRegistrationEvents');
    const events = getEvents().filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));

    select.insertAdjacentHTML('beforeend', events.map(event => `<option value="${escapeHtml(event.id)}">${escapeHtml(event.name)} · ${escapeHtml(eventDate(event.date))}</option>`).join(''));
    const queryEvent = new URLSearchParams(window.location.search).get('event');
    if (queryEvent && events.some(event => event.id === queryEvent)) select.value = queryEvent;
    if (!events.length) {
      form.hidden = true;
      noEvents.hidden = false;
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      formError.hidden = true;
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const currentEvents = getEvents();
      const selectedEvent = currentEvents.find(item => item.id === values.get('eventId') && isUpcoming(item));
      if (!selectedEvent) {
        formError.textContent = 'That event is no longer available. Please choose another event.';
        formError.hidden = false;
        return;
      }
      const phone = String(values.get('phone')).trim();
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        formError.textContent = 'Enter a phone number with 7 to 15 digits.';
        formError.hidden = false;
        return;
      }
      const registrations = getRegistrations();
      registrations.push({
        id: makeId('registration'),
        name: String(values.get('name')).trim(),
        email: String(values.get('email')).trim(),
        college: String(values.get('college')).trim(),
        year: String(values.get('year')),
        phone,
        eventId: selectedEvent.id,
        registeredAt: new Date().toISOString()
      });
      try {
        saveRegistrations(registrations);
        form.reset();
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        formError.textContent = 'We could not save your registration in this browser. Please check local storage settings and try again.';
        formError.hidden = false;
        console.error('Could not save registration.', error);
      }
    });
  }

  function makeId(prefix) {
    return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  }

  function renderAdmin() {
    const login = document.getElementById('adminLogin');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');
    const eventForm = document.getElementById('adminEventForm');
    const eventList = document.getElementById('adminEventList');
    const eventFormError = document.getElementById('eventFormError');
    const registrationSearch = document.getElementById('registrationSearch');
    const registrationEventFilter = document.getElementById('registrationEventFilter');

    function setAdminView(isAdmin) {
      login.hidden = isAdmin;
      dashboard.hidden = !isAdmin;
      if (isAdmin) refreshDashboard();
    }

    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const values = new FormData(loginForm);
      const matches = values.get('email') === ADMIN_EMAIL && values.get('password') === ADMIN_PASSWORD;
      loginError.hidden = matches;
      if (matches) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setAdminView(true);
      }
    });

    document.getElementById('adminLogout').addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setAdminView(false);
    });

    function resetEventForm() {
      eventForm.reset();
      eventForm.elements.eventId.value = '';
      document.getElementById('eventFormTitle').textContent = 'Add an event';
      document.getElementById('saveEventButton').innerHTML = 'Add event <span aria-hidden="true">+</span>';
      document.getElementById('cancelEdit').hidden = true;
      eventFormError.hidden = true;
    }

    document.getElementById('cancelEdit').addEventListener('click', resetEventForm);

    eventForm.addEventListener('submit', event => {
      event.preventDefault();
      eventFormError.hidden = true;
      if (!eventForm.reportValidity()) return;
      const values = new FormData(eventForm);
      const currentEvents = getEvents();
      const eventId = String(values.get('eventId'));
      const eventRecord = {
        id: eventId || makeId('event'),
        name: String(values.get('name')).trim(),
        category: String(values.get('category')),
        date: String(values.get('date')),
        time: String(values.get('time')),
        venue: String(values.get('venue')).trim(),
        description: String(values.get('description')).trim(),
        featured: values.get('featured') === 'on'
      };
      const updatedEvents = eventId ? currentEvents.map(item => item.id === eventId ? eventRecord : item) : [...currentEvents, eventRecord];
      if (eventRecord.featured) updatedEvents.forEach(item => { if (item.id !== eventRecord.id) item.featured = false; });
      try {
        saveEvents(updatedEvents);
        resetEventForm();
        refreshDashboard();
      } catch (error) {
        eventFormError.textContent = 'The event could not be saved. Check this browser’s local storage settings.';
        eventFormError.hidden = false;
        console.error('Could not save event.', error);
      }
    });

    function renderEventList(events) {
      if (!events.length) {
        eventList.innerHTML = '<p class="admin-list-empty">No events yet. Add one to get started.</p>';
        return;
      }
      eventList.innerHTML = events.slice().sort((a, b) => a.date.localeCompare(b.date)).map(item => `<article class="admin-event-row"><div><h3>${escapeHtml(item.name)}${item.featured ? ' <span aria-label="Featured">✳</span>' : ''}</h3><p>${escapeHtml(item.category)} · ${escapeHtml(eventDate(item.date))} · ${escapeHtml(item.venue)}</p></div><div class="admin-event-actions"><button class="icon-button" type="button" data-edit-event="${escapeHtml(item.id)}">Edit</button><button class="icon-button" type="button" data-delete-event="${escapeHtml(item.id)}" aria-label="Delete ${escapeHtml(item.name)}">Delete</button></div></article>`).join('');
      eventList.querySelectorAll('[data-edit-event]').forEach(button => button.addEventListener('click', () => {
        const item = getEvents().find(event => event.id === button.dataset.editEvent);
        if (!item) return;
        eventForm.elements.eventId.value = item.id;
        eventForm.elements.name.value = item.name;
        eventForm.elements.category.value = item.category;
        eventForm.elements.date.value = item.date;
        eventForm.elements.time.value = item.time;
        eventForm.elements.venue.value = item.venue;
        eventForm.elements.description.value = item.description;
        eventForm.elements.featured.checked = Boolean(item.featured);
        document.getElementById('eventFormTitle').textContent = 'Edit event';
        document.getElementById('saveEventButton').innerHTML = 'Save changes <span aria-hidden="true">→</span>';
        document.getElementById('cancelEdit').hidden = false;
        eventForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }));
      eventList.querySelectorAll('[data-delete-event]').forEach(button => button.addEventListener('click', () => {
        const item = getEvents().find(event => event.id === button.dataset.deleteEvent);
        if (!item) return;
        const registrations = getRegistrations();
        const relatedCount = registrations.filter(record => record.eventId === item.id).length;
        const detail = relatedCount ? ` This will also remove ${relatedCount} related registration${relatedCount === 1 ? '' : 's'}.` : '';
        if (!window.confirm(`Delete “${item.name}”?${detail}`)) return;
        saveEvents(getEvents().filter(event => event.id !== item.id));
        saveRegistrations(registrations.filter(record => record.eventId !== item.id));
        if (eventForm.elements.eventId.value === item.id) resetEventForm();
        refreshDashboard();
      }));
    }

    function renderRegistrations(events, registrations) {
      const eventMap = new Map(events.map(event => [event.id, event.name]));
      const needle = registrationSearch.value.trim().toLowerCase();
      const eventId = registrationEventFilter.value;
      const filtered = registrations.filter(record => {
        const matchesText = [record.name, record.email, record.college].some(value => String(value || '').toLowerCase().includes(needle));
        return matchesText && (!eventId || record.eventId === eventId);
      }).sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)));
      document.getElementById('registrationTableCount').textContent = String(filtered.length);
      const body = document.getElementById('registrationTableBody');
      const empty = document.getElementById('registrationEmpty');
      body.innerHTML = filtered.map(record => {
        const registeredDate = record.registeredAt ? new Date(record.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return `<tr><td data-label="STUDENT"><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.email)}</small></td><td data-label="COLLEGE / YEAR">${escapeHtml(record.college)}<br><small>${escapeHtml(record.year)}</small></td><td data-label="EVENT">${escapeHtml(eventMap.get(record.eventId) || 'Event removed')}</td><td data-label="PHONE">${escapeHtml(record.phone)}</td><td data-label="REGISTERED">${escapeHtml(registeredDate)}</td></tr>`;
      }).join('');
      empty.hidden = filtered.length > 0;
    }

    function refreshDashboard() {
      const events = getEvents();
      const registrations = getRegistrations();
      document.getElementById('statEvents').textContent = String(events.length);
      document.getElementById('statRegistrations').textContent = String(registrations.length);
      document.getElementById('statUpcoming').textContent = String(events.filter(isUpcoming).length);
      renderEventList(events);
      const previousFilter = registrationEventFilter.value;
      registrationEventFilter.innerHTML = '<option value="">All events</option>' + events.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
      registrationEventFilter.value = events.some(item => item.id === previousFilter) ? previousFilter : '';
      renderRegistrations(events, registrations);
    }

    registrationSearch.addEventListener('input', refreshDashboard);
    registrationEventFilter.addEventListener('change', refreshDashboard);
    setAdminView(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  }

  initializeData();
  if (page === 'home') renderHome();
  if (page === 'events') renderEvents();
  if (page === 'register') renderRegistrationForm();
  if (page === 'admin') renderAdmin();
})();
