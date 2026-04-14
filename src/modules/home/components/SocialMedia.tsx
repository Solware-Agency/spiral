import React from 'react';
import styles from '../styles/Home.module.css';

const SocialMedia = () => {
return (
    <section className={styles.socialMedia}>
    <div className={styles.container}>
        <h2 className={styles.sectionTitle}>SOCIAL MEDIA MANAGEMENT</h2>
        <div className={styles.socialContent}>
        <span className={styles.allAccess}>ALL ACCESS CONTENT DAYS</span>
        <div className={styles.serviceTag}>
            <span className={styles.tag}>Graphic Design</span>
        </div>
        </div>
    </div>
    </section>
);
};

export default SocialMedia;