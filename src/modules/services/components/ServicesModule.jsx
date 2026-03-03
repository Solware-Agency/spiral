import React from 'react';
import styles from '../styles/services.module.css';
import { servicesData } from '../data/servicesData';
import ServiceItem from './ServiceItem';
import BrandShowcase from './BrandShowcase';

const ServicesModule = () => {
  return (
    <section className={styles.servicesSection}>
      <div className={styles.servicesHero} aria-hidden>
        <div className={styles.servicesHeroOverlay} />
        <h1 className={styles.servicesHeroTitle}>SERVICES</h1>
      </div>

      <div className={styles.servicesInner}>
        <div className={styles.servicesMetaRow}>
          <span className={styles.kicker}>OUR SERVICES</span>
        </div>

        <div className={styles.servicesList}>
          {servicesData.map((s) => (
            <ServiceItem
              key={s.id}
              id={s.id}
              title={s.title}
              description={s.description}
              imageUrl={s.imageUrl}
            />
          ))}
        </div>
      </div>

      <BrandShowcase />
    </section>
  );
};

export default ServicesModule;

