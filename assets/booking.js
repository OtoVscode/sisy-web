/* ==========================================================================
   Studio Glow · Motor de citas
   Lo usan la web (calendario de reserva) y el panel (admin.html).

   storage: 'local'    → DEMO. Las citas se guardan en este navegador
                         (sirve para enseñarlo; la clienta y el panel deben
                         abrirse en el mismo navegador).
   storage: 'supabase' → PRODUCCIÓN. Las citas se guardan en Supabase (gratis)
                         y el panel las ve desde cualquier dispositivo.
                         Pasos: ver supabase-setup.sql y LEEME-CLIENTE.md.
   ========================================================================== */
(function () {
  'use strict';

  window.BOOKING_CONFIG = {
    storage: 'local',            // 'local' (demo) | 'supabase'
    supabaseUrl: '',             // p. ej. 'https://abcd1234.supabase.co'
    supabaseAnonKey: '',         // clave "anon public" del proyecto

    // Email que recibe el aviso de cada cita nueva (servicio gratuito FormSubmit).
    // La primera vez llega un correo de FormSubmit para activarlo: hay que pulsar "Activate".
    notifyEmail: '966bcd958159262dd4bcbbf47b6a0650',

    adminPin: 'glow2026',        // Solo modo demo. En Supabase se entra con email y contraseña.

    slotStep: 30,                // Cada cuántos minutos empieza un horario
    daysAhead: 21,               // Cuántos días hacia adelante se pueden agendar
    minNoticeHours: 2,           // Antelación mínima para agendar hoy

    // Horario de trabajo (0 = domingo … 6 = sábado). null = cerrado.
    hours: {
      0: null,
      1: null,
      2: ['09:00', '19:00'],
      3: ['09:00', '19:00'],
      4: ['09:00', '19:00'],
      5: ['09:00', '19:00'],
      6: ['09:00', '19:00']
    },

    // Servicios: duración en minutos y precio en dólares (precios de ejemplo).
    // "label" debe coincidir con data-service de los botones del formulario.
    services: {
      makeup:   { label: 'Maquillaje & Peinado', es: 'Maquillaje & Peinado', en: 'Makeup & Hair',      duration: 120, price: 180 },
      lashes:   { label: 'Lashes',               es: 'Lashes',               en: 'Lashes',             duration: 120, price: 150 },
      pmu:      { label: 'PMU Cejas',            es: 'PMU Cejas',            en: 'PMU Brows',          duration: 150, price: 450 },
      laminado: { label: 'Laminado & Tinte',     es: 'Laminado & Tinte',     en: 'Lamination & Tint',  duration: 60,  price: 85 }
    }
  };

  const CFG = window.BOOKING_CONFIG;
  const LS_APPTS = 'sg_appointments';
  const LS_BLOCKS = 'sg_blocks';

  /* ---------------- Utilidades de fecha y hora ---------------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function toDateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(str) { const p = str.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toMin(hhmm) { const p = hhmm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function toHHMM(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
  function overlaps(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }

  function format12(hhmm) {
    const m = toMin(hhmm);
    let h = Math.floor(m / 60);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + pad(m % 60) + ' ' + suffix;
  }

  function formatDateLong(dateStr, lang) {
    return parseDate(dateStr).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-US', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  function serviceById(id) { return CFG.services[id] || null; }
  function serviceIdByLabel(label) {
    return Object.keys(CFG.services).find(function (id) { return CFG.services[id].label === label; }) || null;
  }
  function serviceName(id, lang) {
    const s = serviceById(id);
    return s ? (lang === 'en' ? s.en : s.es) : id;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------------- Almacenamiento: demo local ---------------- */
  function lsRead(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function lsWrite(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* almacenamiento bloqueado */ }
  }

  const localDriver = {
    listAppointments: function (from, to) {
      return Promise.resolve(lsRead(LS_APPTS).filter(function (a) {
        return a.date >= from && a.date <= to;
      }));
    },
    insertAppointment: function (appt) {
      const list = lsRead(LS_APPTS);
      list.push(appt);
      lsWrite(LS_APPTS, list);
      return Promise.resolve(appt);
    },
    updateAppointment: function (id, changes) {
      const list = lsRead(LS_APPTS).map(function (a) { return a.id === id ? Object.assign({}, a, changes) : a; });
      lsWrite(LS_APPTS, list);
      return Promise.resolve();
    },
    listBlocks: function (from, to) {
      return Promise.resolve(lsRead(LS_BLOCKS).filter(function (b) { return b.date >= from && b.date <= to; }));
    },
    insertBlock: function (block) {
      const list = lsRead(LS_BLOCKS);
      list.push(block);
      lsWrite(LS_BLOCKS, list);
      return Promise.resolve(block);
    },
    deleteBlock: function (id) {
      lsWrite(LS_BLOCKS, lsRead(LS_BLOCKS).filter(function (b) { return b.id !== id; }));
      return Promise.resolve();
    },
    // Huecos ocupados (sin datos personales) para el calendario público
    listBusy: function (from, to) {
      return Promise.all([this.listAppointments(from, to), this.listBlocks(from, to)]).then(function (r) {
        const appts = r[0].filter(function (a) { return a.status !== 'cancelled'; })
          .map(function (a) { return { date: a.date, start: a.start, end: a.end }; });
        const blocks = r[1].map(function (b) { return { date: b.date, start: b.start, end: b.end }; });
        return appts.concat(blocks);
      });
    }
  };

  /* ---------------- Almacenamiento: Supabase (producción) ---------------- */
  function sbFetch(path, options) {
    const opts = options || {};
    const headers = Object.assign({
      apikey: CFG.supabaseAnonKey,
      Authorization: 'Bearer ' + (sbSession() ? sbSession().access_token : CFG.supabaseAnonKey),
      'Content-Type': 'application/json'
    }, opts.headers || {});
    return fetch(CFG.supabaseUrl + path, Object.assign({}, opts, { headers: headers })).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(t || res.statusText); });
      return res.status === 204 ? null : res.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }
  function sbSession() {
    try { return JSON.parse(localStorage.getItem('sg_sb_session') || 'null'); } catch (e) { return null; }
  }

  const supabaseDriver = {
    listAppointments: function (from, to) {
      return sbFetch('/rest/v1/appointments?select=*&date=gte.' + from + '&date=lte.' + to + '&order=date,start');
    },
    insertAppointment: function (appt) {
      return sbFetch('/rest/v1/appointments', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(appt)
      }).then(function () { return appt; });
    },
    updateAppointment: function (id, changes) {
      return sbFetch('/rest/v1/appointments?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH', body: JSON.stringify(changes)
      });
    },
    listBlocks: function (from, to) {
      return sbFetch('/rest/v1/blocks?select=*&date=gte.' + from + '&date=lte.' + to + '&order=date,start');
    },
    insertBlock: function (block) {
      return sbFetch('/rest/v1/blocks', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(block) })
        .then(function () { return block; });
    },
    deleteBlock: function (id) {
      return sbFetch('/rest/v1/blocks?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    },
    listBusy: function (from, to) {
      // Vista pública sin nombres ni teléfonos (ver supabase-setup.sql)
      return sbFetch('/rest/v1/busy_slots?select=date,start,end&date=gte.' + from + '&date=lte.' + to);
    },
    signIn: function (email, password) {
      return sbFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + CFG.supabaseAnonKey },
        body: JSON.stringify({ email: email, password: password })
      }).then(function (session) {
        localStorage.setItem('sg_sb_session', JSON.stringify(session));
        return session;
      });
    }
  };

  function driver() { return CFG.storage === 'supabase' ? supabaseDriver : localDriver; }

  /* ---------------- Disponibilidad ---------------- */
  function openingHours(dateStr) {
    return CFG.hours[parseDate(dateStr).getDay()] || null;
  }

  // Todos los horarios posibles del día para un servicio, marcando si están libres
  function computeSlots(serviceId, dateStr, busy) {
    const service = serviceById(serviceId);
    const hours = openingHours(dateStr);
    if (!service || !hours) return [];
    const open = toMin(hours[0]);
    const close = toMin(hours[1]);
    const dayBusy = busy.filter(function (b) { return b.date === dateStr; });
    const now = new Date();
    const isToday = dateStr === toDateStr(now);
    const earliest = now.getHours() * 60 + now.getMinutes() + CFG.minNoticeHours * 60;
    const slots = [];
    for (let start = open; start + service.duration <= close; start += CFG.slotStep) {
      const end = start + service.duration;
      const taken = dayBusy.some(function (b) { return overlaps(start, end, toMin(b.start), toMin(b.end)); });
      const tooSoon = isToday && start < earliest;
      slots.push({ start: toHHMM(start), end: toHHMM(end), free: !taken && !tooSoon });
    }
    return slots;
  }

  // Huecos libres del día (bloques continuos sin citas ni bloqueos), para el panel
  function freeGaps(dateStr, busy) {
    const hours = openingHours(dateStr);
    if (!hours) return [];
    const items = busy.filter(function (b) { return b.date === dateStr; })
      .map(function (b) { return [toMin(b.start), toMin(b.end)]; })
      .sort(function (a, b) { return a[0] - b[0]; });
    const gaps = [];
    let cursor = toMin(hours[0]);
    const close = toMin(hours[1]);
    items.forEach(function (it) {
      if (it[0] > cursor) gaps.push({ start: toHHMM(cursor), end: toHHMM(Math.min(it[0], close)) });
      cursor = Math.max(cursor, it[1]);
    });
    if (cursor < close) gaps.push({ start: toHHMM(cursor), end: toHHMM(close) });
    return gaps.filter(function (g) { return toMin(g.end) - toMin(g.start) >= 30; });
  }

  function bookableDays() {
    const days = [];
    const base = new Date();
    for (let i = 0; i < CFG.daysAhead; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      const ds = toDateStr(d);
      days.push({ date: ds, open: !!openingHours(ds) });
    }
    return days;
  }

  /* ---------------- Crear cita ---------------- */
  function createAppointment(data) {
    const service = serviceById(data.serviceId);
    if (!service) return Promise.reject(new Error('service'));
    const startMin = toMin(data.start);
    const appt = {
      id: uid(),
      date: data.date,
      start: data.start,
      end: toHHMM(startMin + service.duration),
      service_id: data.serviceId,
      service_name: service.es,
      duration: service.duration,
      price: service.price,
      client_name: data.name,
      client_phone: data.phone,
      note: data.note || '',
      lang: data.lang || 'es',
      status: 'confirmed',
      created_at: new Date().toISOString()
    };
    // Volver a comprobar justo antes de guardar (por si otra clienta tomó el hueco)
    return driver().listBusy(appt.date, appt.date).then(function (busy) {
      const clash = busy.some(function (b) {
        return b.date === appt.date && overlaps(startMin, toMin(appt.end), toMin(b.start), toMin(b.end));
      });
      if (clash) throw new Error('taken');
      return driver().insertAppointment(appt);
    }).then(function (saved) {
      notifyOwner(saved);
      return saved;
    });
  }

  /* ---------------- Aviso por email a la dueña (FormSubmit, gratis) ---------------- */
  function notifyOwner(appt) {
    if (!CFG.notifyEmail) return Promise.resolve(false);
    const payload = {
      _subject: 'Nueva cita: ' + appt.client_name + ' · ' + appt.service_name + ' · ' + formatDateLong(appt.date, 'es') + ' ' + format12(appt.start),
      _template: 'table',
      _captcha: 'false',
      Clienta: appt.client_name,
      'Teléfono': appt.client_phone,
      Servicio: appt.service_name,
      Fecha: formatDateLong(appt.date, 'es'),
      Hora: format12(appt.start) + ' - ' + format12(appt.end),
      Precio: '$' + appt.price,
      Nota: appt.note || '—'
    };
    return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.notifyEmail), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  window.StudioBooking = {
    config: CFG,
    driver: driver,
    toDateStr: toDateStr,
    parseDate: parseDate,
    toMin: toMin,
    toHHMM: toHHMM,
    format12: format12,
    formatDateLong: formatDateLong,
    serviceById: serviceById,
    serviceIdByLabel: serviceIdByLabel,
    serviceName: serviceName,
    openingHours: openingHours,
    computeSlots: computeSlots,
    freeGaps: freeGaps,
    bookableDays: bookableDays,
    createAppointment: createAppointment,
    notifyOwner: notifyOwner,
    uid: uid,
    listBusy: function (from, to) { return driver().listBusy(from, to); }
  };
})();
