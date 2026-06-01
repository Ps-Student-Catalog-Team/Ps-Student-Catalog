import styles from './PageLoader.module.css';

export function PageLoader() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>
      <span className={styles.text}>加载中...</span>
    </div>
  );
}