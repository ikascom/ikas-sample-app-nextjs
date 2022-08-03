import type { NextPage } from 'next';
import styles from '../styles/Home.module.scss';
import { useEffect } from 'react';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { useRouter } from 'next/router';
import { TokenHelpers } from '../lib/token-helpers';
import { ApiRequests } from '../lib/api-requests';
import { CheckForReauthorizeApiResponse } from './api/oauth/check-for-reauthorize';

const Home: NextPage = () => {
  const router = useRouter();

  const load = async () => {
    AppBridgeHelper.closeLoader();

    const params = new URLSearchParams(window.location.search);
    // Retrieve token from session storage or from ikas via AppBridge
    let token = await TokenHelpers.getTokenForIframeApp(router);
    let isInternallyLoaded = false;
    if (token) {
      // If we received token this means app is loaded within ikas Dashboard
      isInternallyLoaded = true;
    } else {
      // App is not loaded in within ikas Dashboard try to load token via query params
      token = await TokenHelpers.getTokenForExternalApp(router, params);
    }

    if (token) {
      // If you successfully received token it is suggested checking if your app requires re-authorization
      const res = await ApiRequests.oauth.checkForReauthorize(token);
      const data = res.data as CheckForReauthorizeApiResponse | undefined;
      if (data?.required) {
        if (isInternallyLoaded) {
          // Call app bridge reaAuthorizeApp function so ikas dashboard will navigate to app grant access page
          AppBridgeHelper.reAuthorizeApp(data.authorizeData!);
        } else {
          // Redirect to authorize api
          window.location.replace(`/api/oauth/authorize?storeName=${params.get('storeName')}`);
        }
      } else {
        await router.push('/dashboard');
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className={styles.main}>
      <div>Please wait...</div>
    </main>
  );
};

export default Home;
