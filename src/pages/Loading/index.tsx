import React from 'react';
import styles from './loading.module.css'; // Import CSS module

const LoadingScreen = () => {
  return (
    <div className='my-[200px]'>
<div className={`${styles.container}`}>
      <div className={styles.loader}>
        <div className={styles.crystal}></div>
        <div className={styles.crystal}></div>
        <div className={styles.crystal}></div>
        <div className={styles.crystal}></div>
        <div className={styles.crystal}></div>
        <div className={styles.crystal}></div>
      </div>
    </div>
    </div>
    
  );
};

export default LoadingScreen;
