import React, { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    console.log('🚀 SyncUp Frontend loaded');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
