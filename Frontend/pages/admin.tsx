import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import FeedForm from '../components/FeedForm';
import styles from '../styles/Admin.module.css';

export default function AdminPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to home page after publishing post
    setTimeout(() => {
      router.push('/');
    }, 1200);
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Publish Insight | SyncUp Admin</title>
        <meta name="description" content="Publish real-time coaching posts" />
      </Head>

      <div className={styles.container}>
        <div className={styles.backNav}>
          <Link href="/" className={styles.backLink}>
            ← Back to Coaching Feed
          </Link>
        </div>

        <div className={styles.formCard}>
          <FeedForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
