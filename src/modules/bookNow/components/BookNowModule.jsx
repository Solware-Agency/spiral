import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/bookNow.module.css';
import ElfsightInstagramFeed from '../../../components/ElfsightInstagramFeed';

const CASA_LOGO_WHITE =
  '/images/spiral%20logos/SPIRAL%20Logos/Casa%20Spiral/Casa.spiral-white.png';

const HERO_IMAGE = '/images/optimized/DSC01989_1280.jpg';
const BOOK_EMAIL = 'andrea@spiralmstudio.com';

const carouselSlides = [
  '/images/optimized/DSC02380_1280.jpg',
  '/images/optimized/DSC02040_1280.jpg',
  '/images/optimized/DSC01963_1280.jpg',
  '/images/optimized/DSC04163_1280.jpg',
];

const rates = [
  { hours: 2, weekday: 160, weekend: 170 },
  { hours: 3, weekday: 240, weekend: 245 },
  { hours: 4, weekday: 320, weekend: 330 },
  { hours: 5, weekday: 390, weekend: 395 },
  { hours: 6, weekday: 460, weekend: 465 },
  { hours: 7, weekday: 530, weekend: 530 },
  { hours: 8, weekday: 600, weekend: 600 },
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, delta) => new Date(d.getFullYear(), d.getMonth() + delta, 1);
const isSameDay = (a, b) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isWeekend = (d) => {
  const dow = d.getDay(); // 0=Sun..6=Sat
  return dow === 0 || dow === 6;
};

const normalizePhoneDigits = (value) => value.replace(/[^\d]/g, '');

const stripNewlines = (value) => value.replace(/[\r\n]+/g, ' ');

const toYmdLocal = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toYmLocal = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const normalizeName = (value, maxLen = 40) => {
  const cleaned = stripNewlines(String(value ?? ''))
    .replace(/[^A-Za-z\u00C0-\u024F\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[-']+/, '')
    .replace(/[-']+$/, '');
  return cleaned.slice(0, maxLen);
};

const normalizeEmail = (value, maxLen = 254) =>
  stripNewlines(String(value ?? '')).replace(/\s+/g, '').slice(0, maxLen);

const normalizePhone = (value, maxLenDigits = 15) =>
  normalizePhoneDigits(stripNewlines(String(value ?? ''))).slice(0, maxLenDigits);

const sanitizeEmailInput = (value, maxLen = 254) => {
  const raw = stripNewlines(String(value ?? '')).slice(0, maxLen);
  // Only keep characters that are commonly valid in email addresses.
  const allowed = raw.replace(/[^A-Za-z0-9._%+\-@]/g, '');
  const atIdx = allowed.indexOf('@');
  if (atIdx === -1) return allowed;
  const local = allowed.slice(0, atIdx).replace(/@/g, '');
  const domain = allowed
    .slice(atIdx + 1)
    .replace(/@/g, '')
    // Domain shouldn't include underscore or plus; keep it strict.
    .replace(/[^A-Za-z0-9.-]/g, '');
  return `${local}@${domain}`.slice(0, maxLen);
};

const isValidName = (value) => {
  const v = String(value ?? '').trim();
  if (v.length < 2 || v.length > 40) return false;
  // Must contain at least one letter; allow spaces, hyphens, apostrophes.
  return /[A-Za-z\u00C0-\u024F]/.test(v) && /^[A-Za-z\u00C0-\u024F\s'-]+$/.test(v);
};

const isValidEmailStrict = (value) => {
  const v = String(value ?? '').trim();
  if (!v || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  // Basic sanity: one @, sensible local+domain, and a TLD of >=2 letters.
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
};

const isValidPhoneDigits = (digits) => {
  const d = normalizePhoneDigits(String(digits ?? ''));
  return d.length >= 10 && d.length <= 15;
};

const preloadImage = async (src) => {
  if (!src) return false;
  try {
    const img = new Image();
    img.src = src;
    if (img.decode) {
      await img.decode();
      return true;
    }
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    return true;
  } catch {
    return false;
  }
};

const getMonthGrid = (monthDate) => {
  const first = startOfMonth(monthDate);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const jsDow = first.getDay(); // 0=Sun..6=Sat
  const mondayIndex = (jsDow + 6) % 7; // 0=Mon..6=Sun

  const cells = [];
  for (let i = 0; i < mondayIndex; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

const BookingSlide = React.memo(function BookingSlide({
  plan,
  activePlan,
  hours,
  setHours,
  money,
  price,
  month,
  setMonth,
  monthWeeks,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  availableTimes,
  isLoadingTimes,
  availableDays,
  isLoadingDays,
  showErrors,
  validation,
  formValues,
  setFormValues,
  onContinue,
  mailtoHref,
  gmailHref,
  isSubmitting,
  submitError,
  calendarLink,
}) {
  const isOpen = activePlan === plan;
  const planTitle = plan === 'weekday' ? 'STUDIO RENTAL WEEKDAY' : 'STUDIO RENTAL WEEKEND';

  return (
    <section
      className={`${styles.bookingSlide} ${isOpen ? styles.bookingSlideOpen : ''}`}
      aria-label="Booking details"
      aria-hidden={!isOpen}
    >
      <div className={styles.bookingSlideInner}>
        <div className={styles.bookingSlideContent}>
          <div className={styles.bookingTopTitle}>{planTitle}</div>

          <div className={styles.bookingMeta}>
            <div className={styles.bookingMetaLeft}>
              <label className={styles.hoursRow}>
                <select
                  className={styles.hoursSelect}
                  value={hours}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    const allowed = rates.some((r) => r.hours === next);
                    setHours(allowed ? next : rates[0]?.hours ?? 2);
                  }}
                  aria-label="Select hours"
                >
                  {rates.map((r) => (
                    <option key={r.hours} value={r.hours}>
                      {r.hours} HOURS
                    </option>
                  ))}
                </select>
                <span className={styles.hoursSuffix}>STUDIO RENTAL</span>
              </label>
            </div>

            <div className={styles.bookingPrice} aria-label="Price">
              {money.format(price)}
            </div>
          </div>

          <p className={styles.bookingDesc}>
            Private access to CASA STUDIO including all sets, props, and professional lighting
            equipment.
          </p>

          <div className={styles.bookingPickers}>
            <div className={styles.calendarCard} aria-label="Calendar">
              <div className={styles.calendarHeader}>
                <button
                  type="button"
                  className={styles.calendarNav}
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <div className={styles.calendarMonth}>
                  {monthNames[month.getMonth()]} {month.getFullYear()}
                </div>
                <button
                  type="button"
                  className={styles.calendarNav}
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>

              <div className={styles.calendarGrid} role="grid" aria-label="Month days">
                {dayHeaders.map((d, idx) => (
                  <div key={`${d}-${idx}`} className={styles.calendarDow} aria-hidden="true">
                    {d}
                  </div>
                ))}
                {monthWeeks.flat().map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className={styles.calendarCellEmpty} />;
                  }
                  const selected = isSameDay(cell, selectedDate);
                  const allowed = plan === 'weekend' ? isWeekend(cell) : !isWeekend(cell);
                  const ymd = toYmdLocal(cell);
                  const dayHasAvailability =
                    !availableDays || typeof availableDays[ymd] !== 'boolean'
                      ? true
                      : availableDays[ymd];
                  const enabled = allowed && dayHasAvailability && !isLoadingDays;
                  return (
                    <button
                      key={cell.toISOString()}
                      type="button"
                      className={`${styles.calendarCell} ${
                        selected ? styles.calendarCellSelected : ''
                      } ${!enabled ? styles.calendarCellDisabled : ''}`}
                      onClick={() => setSelectedDate(cell)}
                      aria-label={`Select ${cell.toDateString()}`}
                      aria-pressed={selected}
                      disabled={!enabled}
                    >
                      {cell.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.timeCard} aria-label="Time slots">
              <div className={styles.timeHeader}>
                <div className={styles.timeTitle}>
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Select a date'}
                </div>
                <div className={styles.timeZone}>TIME ZONE: EASTERN TIME (GMT-05:00)</div>
                {selectedDate && isLoadingTimes ? (
                  <div className={styles.timeZone}>CHECKING AVAILABILITY…</div>
                ) : null}
              </div>

              <div className={styles.timeGrid} role="list">
                {timeSlots.map((t) => {
                  const active = t === selectedTime;
                  const allowed = !selectedDate
                    ? false
                    : !availableTimes
                      ? true
                      : availableTimes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.timeSlot} ${active ? styles.timeSlotActive : ''}`}
                      onClick={() => setSelectedTime(t)}
                      disabled={!selectedDate || isLoadingTimes || !allowed}
                      aria-pressed={active}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.infoBlock} aria-label="Your information">
          <div className={styles.infoTitle}>YOUR INFORMATION</div>

          <div className={styles.infoForm}>
            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>FIRST NAME</span>
              <div className={styles.fieldControl}>
                <input
                  className={`${styles.fieldInput} ${
                    showErrors && validation.errors.firstName ? styles.fieldInputError : ''
                  }`}
                  type="text"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      firstName: stripNewlines(e.target.value).slice(0, 40),
                    }))
                  }
                  aria-invalid={showErrors && !!validation.errors.firstName}
                  aria-describedby={validation.errors.firstName ? 'booknow-firstname-error' : undefined}
                  autoComplete="given-name"
                  maxLength={40}
                />
                {showErrors && validation.errors.firstName ? (
                  <div id="booknow-firstname-error" className={styles.fieldError} role="alert">
                    {validation.errors.firstName}
                  </div>
                ) : null}
              </div>
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>LAST NAME</span>
              <div className={styles.fieldControl}>
                <input
                  className={`${styles.fieldInput} ${
                    showErrors && validation.errors.lastName ? styles.fieldInputError : ''
                  }`}
                  type="text"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      lastName: stripNewlines(e.target.value).slice(0, 40),
                    }))
                  }
                  aria-invalid={showErrors && !!validation.errors.lastName}
                  aria-describedby={validation.errors.lastName ? 'booknow-lastname-error' : undefined}
                  autoComplete="family-name"
                  maxLength={40}
                />
                {showErrors && validation.errors.lastName ? (
                  <div id="booknow-lastname-error" className={styles.fieldError} role="alert">
                    {validation.errors.lastName}
                  </div>
                ) : null}
              </div>
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>PHONE NUMBER</span>
              <div className={styles.fieldControl}>
                <input
                  className={`${styles.fieldInput} ${
                    showErrors && validation.errors.phone ? styles.fieldInputError : ''
                  }`}
                  type="tel"
                  name="phone"
                  value={formValues.phone}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onBeforeInput={(e) => {
                    // Block any non-digit character input (keeps caret stable).
                    if (typeof e.data === 'string' && e.data && /\D/.test(e.data)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData?.getData('text') ?? '';
                    const digits = normalizePhoneDigits(pasted).slice(0, 15);
                    if (!digits) {
                      e.preventDefault();
                      return;
                    }
                    e.preventDefault();
                    setFormValues((v) => ({ ...v, phone: digits }));
                  }}
                  onChange={(e) => {
                    const digitsOnly = normalizePhoneDigits(stripNewlines(e.target.value)).slice(0, 15);
                    setFormValues((v) => ({ ...v, phone: digitsOnly }));
                  }}
                  aria-invalid={showErrors && !!validation.errors.phone}
                  aria-describedby={validation.errors.phone ? 'booknow-phone-error' : undefined}
                  autoComplete="tel"
                  maxLength={15}
                />
                <div className={styles.fieldHint}>SOLO NÚMEROS (10–15 DÍGITOS)</div>
                {showErrors && validation.errors.phone ? (
                  <div id="booknow-phone-error" className={styles.fieldError} role="alert">
                    {validation.errors.phone}
                  </div>
                ) : null}
              </div>
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>EMAIL</span>
              <div className={styles.fieldControl}>
                <input
                  className={`${styles.fieldInput} ${
                    showErrors && validation.errors.email ? styles.fieldInputError : ''
                  }`}
                  type="email"
                  name="email"
                  value={formValues.email}
                  inputMode="email"
                  onBeforeInput={(e) => {
                    if (typeof e.data !== 'string' || !e.data) return;
                    if (/[^A-Za-z0-9._%+\-@]/.test(e.data)) {
                      e.preventDefault();
                      return;
                    }
                    if (e.data.includes('@') && formValues.email.includes('@')) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData?.getData('text') ?? '';
                    const cleaned = sanitizeEmailInput(pasted, 254);
                    e.preventDefault();
                    setFormValues((v) => ({ ...v, email: cleaned }));
                  }}
                  onChange={(e) => {
                    const cleaned = sanitizeEmailInput(e.target.value, 254);
                    setFormValues((v) => ({ ...v, email: cleaned }));
                  }}
                  aria-invalid={showErrors && !!validation.errors.email}
                  aria-describedby={[
                    'booknow-email-hint',
                    validation.errors.email ? 'booknow-email-error' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  autoComplete="email"
                  maxLength={254}
                  spellCheck={false}
                  autoCapitalize="none"
                />
                <div id="booknow-email-hint" className={styles.fieldHint}>
                  EMAIL VÁLIDO (EJ: NOMBRE@DOMINIO.COM)
                </div>
                {showErrors && validation.errors.email ? (
                  <div id="booknow-email-error" className={styles.fieldError} role="alert">
                    {validation.errors.email}
                  </div>
                ) : null}
              </div>
            </label>
          </div>

          {showErrors &&
          (validation.errors.activePlan || validation.errors.selectedDate || validation.errors.selectedTime) ? (
            <div className={styles.formSummaryError} role="alert">
              {validation.errors.activePlan ??
                validation.errors.selectedDate ??
                validation.errors.selectedTime}
            </div>
          ) : null}

          <button
            type="button"
            className={styles.continueButton}
            onClick={onContinue}
            disabled={!validation.isValid || isSubmitting}
          >
            {isSubmitting ? 'SAVING…' : 'CONTINUE TO PAYMENT'}
          </button>

          {submitError ? (
            <div className={styles.formSummaryError} role="alert">
              {submitError}
            </div>
          ) : null}

          {calendarLink ? (
            <a className={styles.bookingEmail} href={calendarLink} target="_blank" rel="noreferrer">
              VER EN GOOGLE CALENDAR
            </a>
          ) : null}

          <a
            className={styles.bookingEmail}
            href={gmailHref || mailtoHref}
            target="_blank"
            rel="noreferrer"
          >
            {BOOK_EMAIL.toUpperCase()}
          </a>
        </div>
      </div>
    </section>
  );
});

const BookNowModule = () => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [activePlan, setActivePlan] = useState(null); // 'weekday' | 'weekend' | null
  const [hours, setHours] = useState(2);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarLink, setCalendarLink] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [availableTimes, setAvailableTimes] = useState(null);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [availableDays, setAvailableDays] = useState(null);
  const [isLoadingDays, setIsLoadingDays] = useState(false);

  const slideCount = carouselSlides.length;
  const activeSlide = carouselSlides[slideIdx] ?? carouselSlides[0];
  const loadedSlidesRef = useRef(new Set());
  const [renderedSlide, setRenderedSlide] = useState(activeSlide);
  const [incomingSlide, setIncomingSlide] = useState(null);
  const [isCarouselLoading, setIsCarouselLoading] = useState(false);
  const goPrev = () => setSlideIdx((i) => (i - 1 + slideCount) % slideCount);
  const goNext = () => setSlideIdx((i) => (i + 1) % slideCount);

  useEffect(() => {
    // Preload above-the-fold imagery as early as possible.
    preloadImage(HERO_IMAGE);
    preloadImage(carouselSlides[0]);

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(
          () => {
            carouselSlides.forEach((src) => {
              if (!loadedSlidesRef.current.has(src)) {
                preloadImage(src).then((ok) => {
                  if (ok) loadedSlidesRef.current.add(src);
                });
              }
            });
          },
          { timeout: 1800 }
        )
      : window.setTimeout(() => {
          carouselSlides.forEach((src) => {
            if (!loadedSlidesRef.current.has(src)) {
              preloadImage(src).then((ok) => {
                if (ok) loadedSlidesRef.current.add(src);
              });
            }
          });
        }, 900);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let fadeTimer = null;

    const current = activeSlide;
    const next = carouselSlides[(slideIdx + 1) % slideCount];
    const prev = carouselSlides[(slideIdx - 1 + slideCount) % slideCount];

    [current, next, prev].forEach((src) => {
      if (!src || loadedSlidesRef.current.has(src)) return;
      preloadImage(src).then((ok) => {
        if (ok) loadedSlidesRef.current.add(src);
      });
    });

    if (!current || renderedSlide === current) return () => {};
    setIsCarouselLoading(true);

    preloadImage(current).then((ok) => {
      if (cancelled) return;
      if (ok) loadedSlidesRef.current.add(current);
      setIncomingSlide(current);
      // Let the browser paint the new layer before transitioning opacity.
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        setRenderedSlide(current);
        setIsCarouselLoading(false);
      });

      fadeTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIncomingSlide(null);
      }, 320);
    });

    return () => {
      cancelled = true;
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [activeSlide, renderedSlide, slideIdx, slideCount]);

  const money = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  const togglePlan = (plan) => {
    setActivePlan((p) => (p === plan ? null : plan));
    setSelectedTime(null);
    setSelectedDate(null);
    setSubmitAttempted(false);
  };

  const price = useMemo(() => {
    const entry = rates.find((r) => r.hours === hours) ?? rates[0];
    if (!entry) return 0;
    if (activePlan === 'weekend') return entry.weekend;
    return entry.weekday;
  }, [activePlan, hours]);

  const mailtoHref = useMemo(() => {
    const planLabel = activePlan === 'weekend' ? 'Weekend' : 'Weekday';
    const subject = `Studio Rental - ${planLabel}`;
    const dateText = selectedDate ? selectedDate.toDateString() : '(not selected)';
    const timeText = selectedTime ?? '(not selected)';
    const firstName = normalizeName(formValues.firstName);
    const lastName = normalizeName(formValues.lastName);
    const phone = normalizePhone(formValues.phone);
    const email = normalizeEmail(formValues.email);

    const body = [
      'Hi Spiral,',
      '',
      "I'd like to book the studio.",
      `Plan: ${planLabel}`,
      `Hours: ${hours}`,
      `Date: ${dateText}`,
      `Time: ${timeText}`,
      '',
      'My information:',
      `First name: ${firstName || '(not provided)'}`,
      `Last name: ${lastName || '(not provided)'}`,
      `Phone number: ${phone || '(not provided)'}`,
      `Email: ${email || '(not provided)'}`,
      '',
      'Thanks!',
    ].join('\n');

    return `mailto:${BOOK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [activePlan, formValues, hours, selectedDate, selectedTime]);

  const gmailHref = useMemo(() => {
    const planLabel = activePlan === 'weekend' ? 'Weekend' : 'Weekday';
    const subject = `Studio Rental - ${planLabel}`;
    const dateText = selectedDate ? selectedDate.toDateString() : '(not selected)';
    const timeText = selectedTime ?? '(not selected)';
    const firstName = normalizeName(formValues.firstName);
    const lastName = normalizeName(formValues.lastName);
    const phone = normalizePhone(formValues.phone);
    const email = normalizeEmail(formValues.email);

    const body = [
      'Hi Spiral,',
      '',
      "I'd like to book the studio.",
      `Plan: ${planLabel}`,
      `Hours: ${hours}`,
      `Date: ${dateText}`,
      `Time: ${timeText}`,
      '',
      'My information:',
      `First name: ${firstName || '(not provided)'}`,
      `Last name: ${lastName || '(not provided)'}`,
      `Phone number: ${phone || '(not provided)'}`,
      `Email: ${email || '(not provided)'}`,
      '',
      'Thanks!',
    ].join('\n');

    const to = encodeURIComponent(BOOK_EMAIL);
    const su = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${b}`;
  }, [activePlan, formValues, hours, selectedDate, selectedTime]);

  const monthWeeks = useMemo(() => getMonthGrid(month), [month]);

  useEffect(() => {
    if (!activePlan) {
      setAvailableDays(null);
      setIsLoadingDays(false);
      return;
    }
    const controller = new AbortController();
    setIsLoadingDays(true);
    fetch('/api/month-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: toYmLocal(month), hours, plan: activePlan }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok) throw new Error(data?.error || 'No se pudo leer disponibilidad.');
        setAvailableDays(data.availability && typeof data.availability === 'object' ? data.availability : null);
      })
      .catch(() => {
        // Don't block UX if the check fails.
        setAvailableDays(null);
      })
      .finally(() => setIsLoadingDays(false));

    return () => controller.abort();
  }, [activePlan, month, hours]);

  useEffect(() => {
    if (!activePlan || !selectedDate) {
      setAvailableTimes(null);
      setIsLoadingTimes(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingTimes(true);
    fetch('/api/available-time-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: toYmdLocal(selectedDate), hours }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok) throw new Error(data?.error || 'No se pudo leer disponibilidad.');
        const list = Array.isArray(data.available) ? data.available : [];
        setAvailableTimes(list);
      })
      .catch(() => {
        // If availability check fails, do not block booking UI.
        setAvailableTimes(null);
      })
      .finally(() => setIsLoadingTimes(false));

    return () => controller.abort();
  }, [activePlan, selectedDate, hours]);

  useEffect(() => {
    if (!selectedTime || !availableTimes) return;
    if (!availableTimes.includes(selectedTime)) setSelectedTime(null);
  }, [availableTimes, selectedTime]);

  const validation = useMemo(() => {
    const errors = {};

    if (!activePlan) errors.activePlan = 'Selecciona un plan (Weekday o Weekend).';
    if (!selectedDate) errors.selectedDate = 'Selecciona una fecha.';
    if (!selectedTime) errors.selectedTime = 'Selecciona una hora.';

    const firstName = stripNewlines(formValues.firstName).trim();
    const lastName = stripNewlines(formValues.lastName).trim();
    const email = stripNewlines(formValues.email).trim();
    const phoneDigits = normalizePhoneDigits(stripNewlines(formValues.phone));

    if (!firstName) errors.firstName = 'Ingresa tu nombre.';
    else if (!isValidName(firstName))
      errors.firstName = "Solo letras, espacios, '-' y '’' (2–40 caracteres).";

    if (!lastName) errors.lastName = 'Ingresa tu apellido.';
    else if (!isValidName(lastName))
      errors.lastName = "Solo letras, espacios, '-' y '’' (2–40 caracteres).";

    if (!email) errors.email = 'Ingresa tu email.';
    else if (!isValidEmailStrict(email)) errors.email = 'Ingresa un email válido.';

    if (!phoneDigits) errors.phone = 'Ingresa tu teléfono.';
    else if (!isValidPhoneDigits(phoneDigits))
      errors.phone = 'Ingresa un teléfono válido (10–15 dígitos).';

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [activePlan, formValues, selectedDate, selectedTime]);

  const showErrors = submitAttempted;

  const onContinue = () => {
    setSubmitAttempted(true);
    if (!validation.isValid) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setCalendarLink(null);

    const payload = {
      plan: activePlan,
      hours,
      date: toYmdLocal(selectedDate),
      time: selectedTime,
      firstName: normalizeName(formValues.firstName),
      lastName: normalizeName(formValues.lastName),
      phone: normalizePhone(formValues.phone),
      email: normalizeEmail(formValues.email),
    };

    fetch('/api/create-booking-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok) {
          throw new Error(data?.error || 'No se pudo crear el evento en el calendario.');
        }
        if (data?.htmlLink) setCalendarLink(data.htmlLink);
      })
      .catch((e) => {
        setSubmitError(e?.message || 'No se pudo crear el evento en el calendario.');
        // Fallback: keep existing mailto flow so the booking isn't lost.
        window.location.href = mailtoHref;
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const timeSlots = useMemo(
    () => [
      '7:00 AM',
      '8:00 AM',
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM',
      '7:00 PM',
      '8:00 PM',
      '9:00 PM',
      '10:00 PM',
    ],
    []
  );

  return (
    <section className={styles.page} aria-label="Book now page">
      <section
        className={styles.hero}
        aria-label="Book Now hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className={styles.heroOverlay} aria-hidden />
        <img
          className={styles.heroLogo}
          src={CASA_LOGO_WHITE}
          alt="CASA SPIRAL"
          loading="eager"
          decoding="async"
        />
      </section>

      <section className={styles.bookNow} aria-label="Book the studio">
        <div className={styles.titleBar}>
          <h1 className={styles.title}>BOOK THE STUDIO</h1>
        </div>

        <div className={styles.panel}>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.label} ${styles.labelButton}`}
              onClick={() => togglePlan('weekday')}
              aria-expanded={activePlan === 'weekday'}
            >
              STUDIO RENTAL&nbsp;&nbsp;WEEKDAY
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => togglePlan('weekday')}
              aria-expanded={activePlan === 'weekday'}
            >
              BOOK NOW!
            </button>
          </div>

          <BookingSlide
            plan="weekday"
            activePlan={activePlan}
            hours={hours}
            setHours={setHours}
            money={money}
            price={price}
            month={month}
            setMonth={setMonth}
            monthWeeks={monthWeeks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            timeSlots={timeSlots}
            availableTimes={availableTimes}
            isLoadingTimes={isLoadingTimes}
            availableDays={availableDays}
            isLoadingDays={isLoadingDays}
            showErrors={showErrors}
            validation={validation}
            formValues={formValues}
            setFormValues={setFormValues}
            onContinue={onContinue}
            mailtoHref={mailtoHref}
            gmailHref={gmailHref}
            isSubmitting={isSubmitting}
            submitError={submitError}
            calendarLink={calendarLink}
          />

          <div className={styles.divider} aria-hidden />

          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.label} ${styles.labelButton}`}
              onClick={() => togglePlan('weekend')}
              aria-expanded={activePlan === 'weekend'}
            >
              STUDIO RENTAL&nbsp;&nbsp;WEEKEND
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => togglePlan('weekend')}
              aria-expanded={activePlan === 'weekend'}
            >
              BOOK NOW!
            </button>
          </div>

          <BookingSlide
            plan="weekend"
            activePlan={activePlan}
            hours={hours}
            setHours={setHours}
            money={money}
            price={price}
            month={month}
            setMonth={setMonth}
            monthWeeks={monthWeeks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            timeSlots={timeSlots}
            availableTimes={availableTimes}
            isLoadingTimes={isLoadingTimes}
            availableDays={availableDays}
            isLoadingDays={isLoadingDays}
            showErrors={showErrors}
            validation={validation}
            formValues={formValues}
            setFormValues={setFormValues}
            onContinue={onContinue}
            mailtoHref={mailtoHref}
            gmailHref={gmailHref}
            isSubmitting={isSubmitting}
            submitError={submitError}
            calendarLink={calendarLink}
          />
        </div>
      </section>

      <section className={styles.carouselWrap} aria-label="Studio carousel">
        <div className={styles.carousel}>
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
            onClick={goPrev}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <div
            className={`${styles.carouselStage} ${
              isCarouselLoading ? styles.carouselStageLoading : ''
            }`}
            aria-label="Carousel image"
            aria-busy={isCarouselLoading}
          >
            <div
              className={styles.carouselLayer}
              style={{ backgroundImage: `url(${renderedSlide})` }}
              aria-hidden="true"
            />
            {incomingSlide ? (
              <div
                className={`${styles.carouselLayer} ${styles.carouselLayerIncoming}`}
                style={{ backgroundImage: `url(${incomingSlide})` }}
                aria-hidden="true"
              />
            ) : null}
          </div>

          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
            onClick={goNext}
            aria-label="Next photo"
          >
            ›
          </button>

          <div className={styles.carouselDots} role="tablist" aria-label="Carousel dots">
            {carouselSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.carouselDot} ${
                  idx === slideIdx ? styles.carouselDotActive : ''
                }`}
                onClick={() => setSlideIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-selected={idx === slideIdx}
                role="tab"
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.instagram} aria-label="Instagram">
        <div className={styles.instagramTop}>
          <a
            className={styles.instagramHandle}
            href="https://www.instagram.com/spiral.mstudio/"
            target="_blank"
            rel="noreferrer"
          >
            @SPIRAL.MSTUDIO
          </a>
        </div>

        <div className={styles.instagramGrid}>
          <ElfsightInstagramFeed />
        </div>
      </section>
    </section>
  );
};

export default BookNowModule;

