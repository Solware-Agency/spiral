import React, { useMemo, useState } from 'react';
import styles from '../styles/bookNow.module.css';

const CASA_LOGO_WHITE =
  '/images/spiral%20logos/SPIRAL%20Logos/Casa%20Spiral/Casa.spiral-white.png';

const HERO_IMAGE = '/images/photos/DSC01989.jpg';
const BOOK_EMAIL = 'andrea@spiralmstudio.com';

const carouselSlides = [
  '/images/photos/DSC02380.jpg',
  '/images/photos/DSC02040.jpg',
  '/images/photos/DSC01963.jpg',
  '/images/photos/DSC04163.jpg',
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

const BookNowModule = () => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [activePlan, setActivePlan] = useState(null); // 'weekday' | 'weekend' | null
  const [hours, setHours] = useState(2);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const slideCount = carouselSlides.length;
  const activeSlide = carouselSlides[slideIdx] ?? carouselSlides[0];
  const goPrev = () => setSlideIdx((i) => (i - 1 + slideCount) % slideCount);
  const goNext = () => setSlideIdx((i) => (i + 1) % slideCount);

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
  };

  const slideTitle =
    activePlan === 'weekday'
      ? 'STUDIO RENTAL WEEKDAY'
      : activePlan === 'weekend'
        ? 'STUDIO RENTAL WEEKEND'
        : '';

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

    const body = [
      'Hi Spiral,',
      '',
      "I'd like to book the studio.",
      `Plan: ${planLabel}`,
      `Hours: ${hours}`,
      `Date: ${dateText}`,
      `Time: ${timeText}`,
      '',
      'Thanks!',
    ].join('\n');

    return `mailto:${BOOK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [activePlan, hours, selectedDate, selectedTime]);

  const monthWeeks = useMemo(() => getMonthGrid(month), [month]);

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
        </div>

        <section
          className={`${styles.bookingSlide} ${activePlan ? styles.bookingSlideOpen : ''}`}
          aria-label="Booking details"
          aria-hidden={!activePlan}
        >
          <div className={styles.bookingSlideInner}>
            <div className={styles.bookingTopTitle}>{slideTitle}</div>

            <div className={styles.bookingMeta}>
              <div className={styles.bookingMetaLeft}>
                <label className={styles.hoursRow}>
                  <select
                    className={styles.hoursSelect}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
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
                  {dayHeaders.map((d) => (
                    <div key={d} className={styles.calendarDow} aria-hidden="true">
                      {d}
                    </div>
                  ))}
                  {monthWeeks.flat().map((cell, idx) => {
                    if (!cell) {
                      return <div key={`empty-${idx}`} className={styles.calendarCellEmpty} />;
                    }
                    const selected = isSameDay(cell, selectedDate);
                    const allowed =
                      activePlan === 'weekend'
                        ? isWeekend(cell)
                        : activePlan === 'weekday'
                          ? !isWeekend(cell)
                          : true;
                    return (
                      <button
                        key={cell.toISOString()}
                        type="button"
                        className={`${styles.calendarCell} ${
                          selected ? styles.calendarCellSelected : ''
                        } ${!allowed ? styles.calendarCellDisabled : ''}`}
                        onClick={() => setSelectedDate(cell)}
                        aria-label={`Select ${cell.toDateString()}`}
                        aria-pressed={selected}
                        disabled={!allowed}
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
                </div>

                <div className={styles.timeGrid} role="list">
                  {timeSlots.map((t) => {
                    const active = t === selectedTime;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.timeSlot} ${active ? styles.timeSlotActive : ''}`}
                        onClick={() => setSelectedTime(t)}
                        disabled={!selectedDate}
                        aria-pressed={active}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.infoBlock} aria-label="Your information">
              <div className={styles.infoTitle}>YOUR INFORMATION</div>

              <div className={styles.infoForm}>
                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>FIRST NAME</span>
                  <input className={styles.fieldInput} type="text" name="firstName" />
                </label>
                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>LAST NAME</span>
                  <input className={styles.fieldInput} type="text" name="lastName" />
                </label>
                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>PHONE NUMBER</span>
                  <input className={styles.fieldInput} type="tel" name="phone" />
                </label>
                <label className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>EMAIL</span>
                  <input className={styles.fieldInput} type="email" name="email" />
                </label>
              </div>

              <button type="button" className={styles.continueButton}>
                CONTINUE TO PAYMENT
              </button>

              <a className={styles.bookingEmail} href={mailtoHref}>
                {BOOK_EMAIL.toUpperCase()}
              </a>
            </div>
          </div>
        </section>
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
            className={styles.carouselStage}
            style={{ backgroundImage: `url(${activeSlide})` }}
            aria-label="Carousel image"
          />

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

        <div className={styles.instagramGrid} aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.instagramCell} />
          ))}
        </div>
      </section>
    </section>
  );
};

export default BookNowModule;

