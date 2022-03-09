import type { NextPage } from 'next';
import styles from '../styles/AuthorizeStore.module.scss';
import { useEffect, useState } from 'react';

const AuthorizeStore: NextPage = () => {
  const [storeName, setStoreName] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('status') && params.get('status') == 'fail') {
      setShowError(true);
    }
    if (params.has('storeName')) {
      setStoreName(params.get('storeName'));
    }
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <img className={styles.logo} src="/logo.png" alt="ikas Logo" />
        <form method={'GET'} action={'/api/oauth/authorize'}>
          <input
            name={'storeName'}
            className={styles.input}
            placeholder={'Enter your store name...'}
            value={storeName || ''}
            onChange={(event) => setStoreName(event.target.value)}
          />
          <button type="submit" className={styles.button} disabled={!storeName}>
            Add to My Store
          </button>
          {showError && <div className={styles.error}>Unexpected error occurred</div>}
        </form>
      </div>
    </main>
  );
};

export default AuthorizeStore;
