import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, Dispatch, RefCallback, SetStateAction } from 'react';
import LogoPicture from '../../../components/LogoPicture';
import { LOGO_SIZES, SPIRAL_LOGO_PNG, SPIRAL_LOGO_SLUG } from '../../../data/logoSources';
import styles from '../styles/bookNow.module.css';
import ElfsightInstagramFeed from '../../../components/ElfsightInstagramFeed';

type Plan = 'weekday' | 'weekend';

type BookingFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

type BookingValidationErrors = Partial<{
  selectedDate: string;
  selectedTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}>;

type BookingSlideProps = {
  plan: Plan;
  activePlan: Plan | null;
  hours: number;
  setHours: Dispatch<SetStateAction<number>>;
  money: Intl.NumberFormat;
  price: number;
  month: Date;
  setMonth: Dispatch<SetStateAction<Date>>;
  monthWeeks: (Date | null)[][];
  selectedDate: Date | null;
  setSelectedDate: Dispatch<SetStateAction<Date | null>>;
  selectedTime: string | null;
  setSelectedTime: Dispatch<SetStateAction<string | null>>;
  timeSlots: string[];
  availableTimes: string[] | null;
  isLoadingTimes: boolean;
  availableDays: Record<string, boolean> | null;
  isLoadingDays: boolean;
  showErrors: boolean;
  validation: { errors: BookingValidationErrors; isValid: boolean };
  formValues: BookingFormValues;
  setFormValues: Dispatch<SetStateAction<BookingFormValues>>;
  onContinue: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  calendarLink: string | null;
  turnstileSiteKey: string;
  turnstileContainerRef: RefCallback<HTMLDivElement>;
};

const bgSet = (id: string, w: number) =>
  `image-set(url("/images/optimized/${id}_${w}.webp") type("image/webp"), url("/images/optimized/${id}_${w}.jpg") type("image/jpeg"))`;
const bgVars = (id: string): CSSProperties =>
  ({
    '--bg-960': bgSet(id, 960),
    '--bg-1280': bgSet(id, 1280),
    '--bg-1600': bgSet(id, 1600),
    '--bg-2560': bgSet(id, 2560),
    '--bg-3200': bgSet(id, 3200),
  }) as CSSProperties;

/** Single static hero image below the booking panel (no carousel). */
const STUDIO_GALLERY_IMAGE = '/images/optimized/DSC02380_1280.jpg';

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
const BOOKING_CLOSE_HOUR = 22; // 10:00 PM
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_ACTION = 'create_checkout_session';
const BOOKING_SUCCESS_POPUP_STORAGE_KEY = 'book_now_booking_success_popup';
const BOOKING_SUMMARY_STORAGE_KEY = 'book_now_booking_summary';
const BOOKING_POPUP_INSTRUCTIONS =
  'Please arrive 10 minutes early and bring a valid ID. Lighting setup is included.';
const CHECKOUT_HEADER_SECRET_NAME = String(
  import.meta.env.VITE_CHECKOUT_HEADER_SECRET_NAME || 'x-checkout-secret'
).trim();
const CHECKOUT_HEADER_SECRET = String(import.meta.env.VITE_CHECKOUT_HEADER_SECRET || '').trim();

type BookingPopupSummary = {
  date: string;
  time: string;
  amount: string;
  payment: string;
  instructions: string;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      theme?: 'light' | 'dark' | 'auto';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove?: (widgetId?: string) => void;
};

type TurnstileWindow = Window & {
  turnstile?: TurnstileApi;
};

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

/** English ordinal suffix for booking header (e.g. 6 → 6TH). */
const ordinalSuffixEn = (n) => {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'ST';
  if (j === 2 && k !== 12) return 'ND';
  if (j === 3 && k !== 13) return 'RD';
  return 'TH';
};

const formatPickerDateHeading = (d) => {
  if (!d) return 'Select a date';
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const month = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const dayNum = d.getDate();
  return `${weekday} ${month} ${dayNum}${ordinalSuffixEn(dayNum)}`;
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

const startOfDayLocal = (d) => {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
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

const getSupabaseAccessTokenFromStorage = () => {
  if (typeof window === 'undefined') return '';
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = String(window.localStorage.key(i) || '');
      if (!/^sb-.*-auth-token$/.test(key)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const token = String(parsed?.access_token || parsed?.currentSession?.access_token || '').trim();
      if (token) return token;
    }
  } catch {
    // Ignore localStorage parse errors; request can still proceed with other controls.
  }
  return '';
};

const parseTime12hTo24h = (timeStr) => {
  const s = String(timeStr ?? '').trim().toUpperCase();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3];
  if (h < 1 || h > 12 || min < 0 || min > 59) return null;
  if (ap === 'AM') {
    if (h === 12) h = 0;
  } else if (ap === 'PM') {
    if (h !== 12) h += 12;
  }
  return { hour: h, minute: min };
};

const slotEndsBeforeClose = (timeStr, durationHours) => {
  const t = parseTime12hTo24h(timeStr);
  if (!t || !Number.isFinite(durationHours) || durationHours <= 0) return false;
  const endMinutes = (t.hour + durationHours) * 60 + t.minute;
  return endMinutes <= BOOKING_CLOSE_HOUR * 60;
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
  isSubmitting,
  submitError,
  calendarLink,
  turnstileSiteKey,
  turnstileContainerRef,
}: BookingSlideProps) {
  const isOpen = activePlan === plan;
  const todayStart = startOfDayLocal(new Date());
  const currentMonthStart = startOfMonth(todayStart);
  const canGoToPreviousMonth = startOfMonth(month).getTime() > currentMonthStart.getTime();

  return (
    <section
      className={`${styles.bookingSlide} ${isOpen ? styles.bookingSlideOpen : ''}`}
      aria-label={
        plan === 'weekday' ? 'Studio rental weekday booking details' : 'Studio rental weekend booking details'
      }
      aria-hidden={!isOpen}
    >
      <div className={styles.bookingSlideInner}>
        <div className={styles.bookingSlideContent}>
          <div className={styles.bookingLead}>
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
                </label>
                <span className={styles.bookingMetaTitle}>STUDIO RENTAL</span>
              </div>
              <div className={styles.bookingPrice} aria-label="Price">
                {money.format(price)}
              </div>
            </div>

            <p className={styles.bookingDesc}>
              Private access to CASA STUDIO including all sets, props, and professional lighting
              equipment.
            </p>
          </div>

          <div className={styles.bookingPickers}>
            <div className={styles.calendarCard} aria-label="Calendar">
              <div className={styles.calendarHeader}>
                <button
                  type="button"
                  className={styles.calendarNav}
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  aria-label="Previous month"
                  disabled={!canGoToPreviousMonth}
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
                  const ymd = toYmdLocal(cell);
                  const isPastDate = startOfDayLocal(cell).getTime() < todayStart.getTime();
                  const dayHasAvailability =
                    !availableDays || typeof availableDays[ymd] !== 'boolean'
                      ? true
                      : availableDays[ymd];
                  const enabled = !isPastDate && dayHasAvailability && !isLoadingDays;
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
                <div className={styles.timeTitle}>{formatPickerDateHeading(selectedDate)}</div>
                <div className={styles.timeZone}>TIME ZONE: EASTERN TIME (GMT-05:00)</div>
                {selectedDate && isLoadingTimes ? (
                  <div className={styles.timeZone}>CHECKING AVAILABILITY…</div>
                ) : null}
              </div>

              <div className={styles.timeGrid} role="list">
                {timeSlots.map((t) => {
                  const active = t === selectedTime;
                  const withinClosingHour = slotEndsBeforeClose(t, hours);
                  const allowed = !selectedDate
                    ? false
                    : !availableTimes
                      ? true
                      : availableTimes.includes(t);
                  const enabled = !!selectedDate && !isLoadingTimes && allowed && withinClosingHour;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.timeSlot} ${active ? styles.timeSlotActive : ''}`}
                      onClick={() => setSelectedTime(t)}
                      disabled={!enabled}
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

        <div className={styles.bookingInfoDivider} aria-hidden />

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
                  aria-describedby={
                    showErrors && validation.errors.email ? 'booknow-email-error' : undefined
                  }
                  autoComplete="email"
                  maxLength={254}
                  spellCheck={false}
                  autoCapitalize="none"
                />
                {showErrors && validation.errors.email ? (
                  <div id="booknow-email-error" className={styles.fieldError} role="alert">
                    {validation.errors.email}
                  </div>
                ) : null}
              </div>
            </label>
          </div>

          {showErrors && (validation.errors.selectedDate || validation.errors.selectedTime) ? (
            <div className={styles.formSummaryError} role="alert">
              {validation.errors.selectedDate ?? validation.errors.selectedTime}
            </div>
          ) : null}

          {isOpen && turnstileSiteKey ? (
            <div className={styles.securityBlock}>
              <p className={styles.securityHint}>Security check required before payment</p>
              <div className={styles.securityWidget} ref={turnstileContainerRef} />
            </div>
          ) : null}

          <button
            type="button"
            className={styles.continueButton}
            onClick={onContinue}
            disabled={!validation.isValid || isSubmitting}
          >
            {isSubmitting ? 'PROCESSING…' : 'CONTINUE TO PAYMENT'}
          </button>

          {submitError ? (
            <div className={styles.formSummaryError} role="alert">
              {submitError}
            </div>
          ) : null}

          {calendarLink ? (
            <a className={styles.bookingEmail} href={calendarLink} target="_blank" rel="noreferrer">
              ADD TO MY GOOGLE CALENDAR
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
});

const BookNowModule = () => {
  const turnstileSiteKey = String(import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
  const [activePlan, setActivePlan] = useState<Plan | null>('weekday');
  const [hours, setHours] = useState(2);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<BookingFormValues>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showBookingSuccessPopup, setShowBookingSuccessPopup] = useState(false);
  const [bookingPopupSummary, setBookingPopupSummary] = useState<BookingPopupSummary | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[] | null>(null);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [availableDays, setAvailableDays] = useState<Record<string, boolean> | null>(null);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const todayStartTs = useMemo(() => startOfDayLocal(new Date()).getTime(), []);
  const paymentQueryHandledRef = useRef(false);
  const [turnstileContainerEl, setTurnstileContainerEl] = useState<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const handleTurnstileContainerRef = useCallback((node: HTMLDivElement | null) => {
    setTurnstileContainerEl(node);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shouldShow = window.sessionStorage.getItem(BOOKING_SUCCESS_POPUP_STORAGE_KEY) === '1';
    if (shouldShow) {
      setShowBookingSuccessPopup(true);
    }
    const rawSummary = window.sessionStorage.getItem(BOOKING_SUMMARY_STORAGE_KEY);
    if (!rawSummary) return;
    try {
      const parsed = JSON.parse(rawSummary);
      const date = String(parsed?.date || '').trim();
      const time = String(parsed?.time || '').trim();
      const amount = String(parsed?.amount || '').trim();
      const payment = String(parsed?.payment || '').trim();
      const instructions = String(parsed?.instructions || '').trim();
      if (!date || !time || !amount || !payment || !instructions) return;
      setBookingPopupSummary({ date, time, amount, payment, instructions });
    } catch {
      // Ignore invalid summary payload.
    }
  }, []);

  useEffect(() => {
    preloadImage('/images/optimized/DSC01989_1600.jpg');
    preloadImage(STUDIO_GALLERY_IMAGE);
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (typeof window === 'undefined') return;
    if (document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (typeof window === 'undefined') return;
    if (!turnstileContainerEl) return;

    let cancelled = false;
    let pollTimer = 0;

    const tryRender = () => {
      const container = turnstileContainerEl;
      const turnstile = (window as TurnstileWindow).turnstile;
      if (!container || !turnstile) return false;
      if (cancelled) return false;

      if (turnstileWidgetIdRef.current) {
        try {
          turnstile.remove?.(turnstileWidgetIdRef.current);
        } catch {
          // Ignore cleanup errors and re-render widget in current container.
        }
        turnstileWidgetIdRef.current = null;
      }

      turnstileWidgetIdRef.current = turnstile.render(container, {
        sitekey: turnstileSiteKey,
        action: TURNSTILE_ACTION,
        theme: 'light',
        callback: (token) => {
          setTurnstileToken(String(token || '').trim());
          setSubmitError((prev) =>
            prev === 'Completa la verificación de seguridad para continuar.' ? null : prev
          );
        },
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
      return true;
    };

    if (!tryRender()) {
      pollTimer = window.setInterval(() => {
        if (tryRender() && pollTimer) {
          window.clearInterval(pollTimer);
          pollTimer = 0;
        }
      }, 250);
    }

    return () => {
      cancelled = true;
      if (pollTimer) window.clearInterval(pollTimer);
      const turnstile = (window as TurnstileWindow).turnstile;
      if (turnstile && turnstileWidgetIdRef.current) {
        try {
          turnstile.remove?.(turnstileWidgetIdRef.current);
        } catch {
          // Ignore widget cleanup failures to avoid blocking unmount.
        }
      }
      turnstileWidgetIdRef.current = null;
      setTurnstileToken('');
    };
  }, [turnstileContainerEl, turnstileSiteKey]);

  useEffect(() => {
    if (paymentQueryHandledRef.current) return;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatusRaw =
      params.get('payment') || params.get('redirect_status') || params.get('status') || '';
    const paymentStatus = String(paymentStatusRaw).trim().toLowerCase();
    const sessionId = String(params.get('session_id') || params.get('sessionId') || '').trim();
    const isCancelledReturn = paymentStatus === 'cancelled' || paymentStatus === 'canceled';
    const isSuccessReturn =
      paymentStatus === 'success' || paymentStatus === 'succeeded' || (!paymentStatus && !!sessionId);
    if (!isCancelledReturn && !isSuccessReturn) return;
    paymentQueryHandledRef.current = true;

    const clearPaymentParams = () => {
      const next = `${window.location.pathname}${window.location.hash || ''}`;
      window.history.replaceState({}, '', next);
    };

    if (isCancelledReturn) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(BOOKING_SUCCESS_POPUP_STORAGE_KEY);
        window.sessionStorage.removeItem(BOOKING_SUMMARY_STORAGE_KEY);
      }
      setShowBookingSuccessPopup(false);
      setBookingPopupSummary(null);
      setSubmitError('Pago cancelado. Puedes intentar nuevamente cuando quieras.');
      setIsSubmitting(false);
      clearPaymentParams();
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(BOOKING_SUCCESS_POPUP_STORAGE_KEY, '1');
    }
    setShowBookingSuccessPopup(true);
    setSubmitError(null);

    if (!sessionId) {
      setIsSubmitting(false);
      clearPaymentParams();
      return;
    }
    setIsSubmitting(true);

    fetch('/api/confirm-booking-after-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok) {
          const msg = [
            data?.error || 'No se pudo confirmar la reserva después del pago.',
            data?.details ? `Details: ${data.details}` : null,
            Array.isArray(data?.missing) && data.missing.length > 0
              ? `Faltan variables: ${data.missing.join(', ')}`
              : null,
          ]
            .filter(Boolean)
            .join(' | ');
          throw new Error(msg);
        }
        const link =
          typeof data?.calendarTemplateLink === 'string' && data.calendarTemplateLink
            ? data.calendarTemplateLink
            : typeof data?.htmlLink === 'string' && data.htmlLink
              ? data.htmlLink
              : null;
        if (link) setCalendarLink(link);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(BOOKING_SUCCESS_POPUP_STORAGE_KEY, '1');
        }
        setShowBookingSuccessPopup(true);
      })
      .catch((e) => {
        // Keep popup visible because Stripe already returned as paid.
        setSubmitError(e?.message || 'No se pudo confirmar la reserva después del pago.');
      })
      .finally(() => {
        setIsSubmitting(false);
        clearPaymentParams();
      });
  }, []);

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

  const togglePlan = (plan: Plan) => {
    setActivePlan((p) => (p === plan ? null : plan));
    setSelectedTime(null);
    setSelectedDate(null);
    setSubmitAttempted(false);
  };

  const price = useMemo(() => {
    const entry = rates.find((r) => r.hours === hours) ?? rates[0];
    if (!entry) return 0;
    const detectedPlan = selectedDate ? (isWeekend(selectedDate) ? 'weekend' : 'weekday') : activePlan;
    if (detectedPlan === 'weekend') return entry.weekend;
    return entry.weekday;
  }, [activePlan, hours, selectedDate]);

  const monthWeeks = useMemo(() => getMonthGrid(month), [month]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingDays(true);
    fetch('/api/month-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: toYmLocal(month), hours }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok) {
          const msg = [
            data?.error || 'No se pudo leer disponibilidad.',
            data?.details ? `Details: ${data.details}` : null,
            Array.isArray(data?.missing) && data.missing.length > 0
              ? `Faltan variables: ${data.missing.join(', ')}`
              : null,
          ]
            .filter(Boolean)
            .join(' | ');
          console.error('month-availability failed', { status: r.status, data });
          throw new Error(msg);
        }
        setAvailableDays(data.availability && typeof data.availability === 'object' ? data.availability : null);
      })
      .catch((e) => {
        // Don't block UX if the check fails.
        console.error(e);
        setAvailableDays(null);
      })
      .finally(() => setIsLoadingDays(false));

    return () => controller.abort();
  }, [month, hours]);

  useEffect(() => {
    if (!selectedDate) {
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
        if (!r.ok || !data?.ok) {
          const msg = [
            data?.error || 'No se pudo leer disponibilidad.',
            data?.details ? `Details: ${data.details}` : null,
            Array.isArray(data?.missing) && data.missing.length > 0
              ? `Faltan variables: ${data.missing.join(', ')}`
              : null,
          ]
            .filter(Boolean)
            .join(' | ');
          console.error('available-time-slots failed', { status: r.status, data });
          throw new Error(msg);
        }
        const list = Array.isArray(data.available) ? data.available : [];
        setAvailableTimes(list);
      })
      .catch((e) => {
        // If availability check fails, do not block booking UI.
        console.error(e);
        setAvailableTimes(null);
      })
      .finally(() => setIsLoadingTimes(false));

    return () => controller.abort();
  }, [selectedDate, hours]);

  useEffect(() => {
    if (!selectedDate) return;
    const detectedPlan: Plan = isWeekend(selectedDate) ? 'weekend' : 'weekday';
    if (activePlan !== detectedPlan) setActivePlan(detectedPlan);
  }, [activePlan, selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    if (startOfDayLocal(selectedDate).getTime() < todayStartTs) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedDate, todayStartTs]);

  useEffect(() => {
    if (!selectedTime || !availableTimes) return;
    if (!availableTimes.includes(selectedTime)) setSelectedTime(null);
  }, [availableTimes, selectedTime]);

  useEffect(() => {
    if (!selectedTime) return;
    if (!slotEndsBeforeClose(selectedTime, hours)) setSelectedTime(null);
  }, [hours, selectedTime]);

  const validation = useMemo(() => {
    const errors: BookingValidationErrors = {};

    if (!selectedDate) errors.selectedDate = 'Selecciona una fecha.';
    if (!selectedTime) errors.selectedTime = 'Selecciona una hora.';
    else if (!slotEndsBeforeClose(selectedTime, hours))
      errors.selectedTime = 'La reserva debe finalizar a las 10:00 PM o antes.';

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
  }, [formValues, selectedDate, selectedTime, hours]);

  const showErrors = submitAttempted;

  const onContinue = () => {
    setSubmitAttempted(true);
    if (!validation.isValid) return;
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitError('Completa la verificación de seguridad para continuar.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setCalendarLink(null);
    setShowBookingSuccessPopup(false);
    setBookingPopupSummary(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(BOOKING_SUCCESS_POPUP_STORAGE_KEY);
      window.sessionStorage.removeItem(BOOKING_SUMMARY_STORAGE_KEY);
    }

    const payload = {
      hours,
      date: toYmdLocal(selectedDate),
      time: selectedTime,
      firstName: normalizeName(formValues.firstName),
      lastName: normalizeName(formValues.lastName),
      phone: normalizePhone(formValues.phone),
      email: normalizeEmail(formValues.email),
      turnstileToken: turnstileSiteKey ? turnstileToken : undefined,
    };

    const checkoutAuthToken = getSupabaseAccessTokenFromStorage();
    const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (checkoutAuthToken) {
      requestHeaders.Authorization = `Bearer ${checkoutAuthToken}`;
    }
    if (CHECKOUT_HEADER_SECRET) {
      requestHeaders[CHECKOUT_HEADER_SECRET_NAME] = CHECKOUT_HEADER_SECRET;
    }

    const popupSummary: BookingPopupSummary = {
      date: toYmdLocal(selectedDate),
      time: selectedTime || '',
      amount: money.format(price),
      payment: 'Paid via Stripe',
      instructions: BOOKING_POPUP_INSTRUCTIONS,
    };
    setBookingPopupSummary(popupSummary);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(BOOKING_SUMMARY_STORAGE_KEY, JSON.stringify(popupSummary));
    }

    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok) {
          const msg = [
            data?.error || 'No se pudo iniciar el pago con Stripe.',
            data?.details ? `Details: ${data.details}` : null,
            Array.isArray(data?.missing) && data.missing.length > 0
              ? `Faltan variables: ${data.missing.join(', ')}`
              : null,
          ]
            .filter(Boolean)
            .join(' | ');
          console.error('create-checkout-session failed', { status: r.status, data });
          throw new Error(msg);
        }

        if (typeof window !== 'undefined' && typeof data?.url === 'string' && data.url) {
          window.location.assign(data.url);
          return;
        }
        throw new Error('Stripe no devolvió una URL de checkout válida.');
      })
      .catch((e) => {
        const turnstile = (window as TurnstileWindow).turnstile;
        if (turnstile && turnstileWidgetIdRef.current) {
          try {
            turnstile.reset(turnstileWidgetIdRef.current);
          } catch {
            // Ignore reset issues; user can retry.
          }
        }
        setTurnstileToken('');
        setSubmitError(e?.message || 'No se pudo iniciar el pago con Stripe.');
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
        style={bgVars('DSC01989')}
      >
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroLogoWrap}>
          <LogoPicture
            slug={SPIRAL_LOGO_SLUG.casaWhite}
            pngSrc={SPIRAL_LOGO_PNG.casaWhite}
            className={styles.heroLogo}
            alt="CASA SPIRAL"
            sizes={LOGO_SIZES.casaStudio}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
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
            isSubmitting={isSubmitting}
            submitError={submitError}
            calendarLink={calendarLink}
            turnstileSiteKey={turnstileSiteKey}
            turnstileContainerRef={handleTurnstileContainerRef}
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
            isSubmitting={isSubmitting}
            submitError={submitError}
            calendarLink={calendarLink}
            turnstileSiteKey={turnstileSiteKey}
            turnstileContainerRef={handleTurnstileContainerRef}
          />
        </div>
      </section>

      <section className={styles.carouselWrap} aria-label="Studio photo">
        <div className={styles.carousel}>
          <div
            className={styles.carouselStage}
            style={{ backgroundImage: `url(${STUDIO_GALLERY_IMAGE})` }}
            role="img"
            aria-label="Studio interior"
          />
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
      {showBookingSuccessPopup ? (
        <div className={styles.popupOverlay} role="dialog" aria-modal="true" aria-label="Booking success">
          <div className={styles.popupCard}>
            <p className={styles.popupMessage}>
              Booking confirmed! Your payment was successfully processed.
            </p>
            {bookingPopupSummary ? (
              <div className={styles.popupSummary} aria-label="Booking summary">
                <div className={styles.popupSummaryRow}>
                  <span>Time</span>
                  <span>
                    {bookingPopupSummary.date} at {bookingPopupSummary.time}
                  </span>
                </div>
                <div className={styles.popupSummaryRow}>
                  <span>Payment</span>
                  <span>
                    {bookingPopupSummary.amount} - {bookingPopupSummary.payment}
                  </span>
                </div>
                <div className={styles.popupSummaryInstructions}>
                  <span>Instructions</span>
                  <p>{bookingPopupSummary.instructions}</p>
                </div>
              </div>
            ) : null}
            {calendarLink ? (
              <a
                className={styles.popupCalendarButton}
                href={calendarLink}
                target="_blank"
                rel="noreferrer"
              >
                ADD TO MY CALENDAR
              </a>
            ) : null}
            <button
              type="button"
              className={styles.popupOkButton}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.sessionStorage.removeItem(BOOKING_SUCCESS_POPUP_STORAGE_KEY);
                  window.sessionStorage.removeItem(BOOKING_SUMMARY_STORAGE_KEY);
                }
                setShowBookingSuccessPopup(false);
              }}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default BookNowModule;

