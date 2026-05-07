import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/home.module.css';

const services = [
  { id: '01', lines: ['SOCIAL MEDIA', 'MANAGEMENT'], seoLabel: 'Social Media Management' },
  { id: '02', lines: ['ALL ACCESS', 'CONTENT DAYS'], seoLabel: 'All Access Content Days' },
  { id: '03', title: 'Graphic Design', seoLabel: 'Graphic Design' },
];

const OurServices = () => {
  return (
    <section className={styles.ourServices}>
      <div className={styles.ourServicesInner}>
        <div className={styles.servicesHeader} aria-hidden>
          <span className={`${styles.sectionLabel} ${styles.ourServicesLabel}`}>OUR SERVICES</span>
        </div>

        <div className={styles.servicesList}>
          {services.map((s) => (
            <div key={s.id} className={styles.serviceRow}>
              <span className={styles.serviceNumber}>{s.id}</span>
              <span
                className={`${styles.serviceTitle} ${s.lines ? styles.serviceTitleStack : ''}`}
                data-service-id={s.id}
              >
                {s.lines
                  ? s.lines.map((line) => (
                      <span key={line} className={styles.serviceTitleLine}>
                        {line}
                      </span>
                    ))
                  : s.title}
              </span>

              <Link
                to="/services"
                className={styles.learnMoreBtn}
                aria-label={`Learn more about ${s.seoLabel} services`}
              >
                LEARN MORE
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;
