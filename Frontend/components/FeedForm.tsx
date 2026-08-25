import React, { useState } from 'react';
import { createFeed } from '../utils/api';
import { useFeedStore } from '../store/useFeedStore';
import { Category } from '../types/feed';
import styles from '../styles/FeedForm.module.css';

interface FeedFormProps {
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS: { value: Category; label: string; icon: string }[] = [
  { value: 'motivation', label: 'Motivation', icon: '🔥' },
  { value: 'technique', label: 'Technique', icon: '🏋️' },
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'mindset', label: 'Mindset', icon: '🧠' },
  { value: 'performance', label: 'Performance', icon: '⚡' },
  { value: 'recovery', label: 'Recovery', icon: '🧊' },
];

export const FeedForm: React.FC<FeedFormProps> = ({ onSuccess }) => {
  const { addNotification } = useFeedStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'motivation' as Category,
    tagsInput: '',
    isPinned: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      setError('Title, Content, and Author name are required');
      return;
    }

    // Process tags comma-separated
    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    setSubmitting(true);

    try {
      await createFeed({
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        category: formData.category,
        tags,
        isPinned: formData.isPinned,
      });

      addNotification('✨ Post published successfully! Live updates active.', 'success');

      // Reset form
      setFormData({
        title: '',
        content: '',
        author: '',
        category: 'motivation',
        tagsInput: '',
        isPinned: false,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Submit post error:', err);
      setError(err.message || 'Failed to publish coaching post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>✨ Create Coaching Insight</h2>
      <p className={styles.formSubtitle}>
        Share training tips, motivation, or tactical breakdowns with athletes in real-time.
      </p>

      {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Post Title <span className={styles.required}>*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Mastering Mindset Under Pressure"
          value={formData.title}
          onChange={handleChange}
          maxLength={200}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="author" className={styles.label}>
            Author Name <span className={styles.required}>*</span>
          </label>
          <input
            id="author"
            name="author"
            type="text"
            placeholder="e.g. Coach Alex"
            value={formData.author}
            onChange={handleChange}
            maxLength={100}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content" className={styles.label}>
          Coaching Content <span className={styles.required}>*</span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          placeholder="Write your detailed coaching advice, action steps, or motivation here..."
          value={formData.content}
          onChange={handleChange}
          maxLength={2000}
          required
          className={styles.textarea}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tagsInput" className={styles.label}>
          Tags (comma-separated)
        </label>
        <input
          id="tagsInput"
          name="tagsInput"
          type="text"
          placeholder="e.g. mindset, recovery, endurance"
          value={formData.tagsInput}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.checkboxGroup}>
        <input
          id="isPinned"
          name="isPinned"
          type="checkbox"
          checked={formData.isPinned}
          onChange={handleChange}
          className={styles.checkbox}
        />
        <label htmlFor="isPinned" className={styles.checkboxLabel}>
          📌 Pin this post to the top of the feed
        </label>
      </div>

      <button type="submit" disabled={submitting} className={styles.submitBtn}>
        {submitting ? 'Publishing Post...' : '🚀 Publish Coaching Post'}
      </button>
    </form>
  );
};

export default FeedForm;
