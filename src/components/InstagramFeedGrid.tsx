import React from 'react';
import ElfsightInstagramFeed from './ElfsightInstagramFeed';
import styles from './instagramFeedGrid.module.css';

const InstagramFeedGrid = () => {
  return (
    <div className={styles.wrap}>
      <ElfsightInstagramFeed />
    </div>
  );
};

export default InstagramFeedGrid;

