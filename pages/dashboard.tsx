import type { NextPage } from 'next';
import styles from '../styles/Dashboard.module.scss';

const Home: NextPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.title}>Success!</div>
      </div>
    </main>
  );
};

export default Home;
