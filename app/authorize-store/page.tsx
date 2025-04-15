'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.scss';
import Image from 'next/image';

export default function AuthorizeStore() {
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
        <Image className={styles.logo} src="/logo.png" alt="ikas Logo" width={200} height={50} loading="eager" />
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
}
