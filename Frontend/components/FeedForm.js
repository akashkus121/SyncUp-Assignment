import React, { useState } from 'react';
import styles from '../styles/FeedForm.module.css';

const FeedForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'motivation',
    tags: '',
    isPinned: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'motivation',
    'technique',
    'nutrition',
    'mindset',
    'performance',
    'recovery',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be under 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 2000) {
      newErrors.content = 'Content must be under 2000 characters';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
    } else if (formData.author.length > 100) {
      newErrors.author = 'Author name must be under 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 10); // Max 10 tags

      await onSubmit({
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        category: formData.category,
        tags: tagsArray,
        isPinned: formData.isPinned,
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        author: '',
        category: 'motivation',
        tags: '',
        isPinned: false,
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>✍️ Create New Feed</h2>

        {errors.submit && <div className={styles.errorAlert}>{errors.submit}</div>}
        {submitted && (
          <div className={styles.successAlert}>✅ Feed created successfully!</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="author">Author Name *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="e.g., Coach John"
            maxLength="100"
            disabled={loading}
          />
          {errors.author && <span className={styles.error}>{errors.author}</span>}
          <small>{formData.author.length}/100</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., The Power of Consistency"
            maxLength="200"
            disabled={loading}
          />
          {errors.title && <span className={styles.error}>{errors.title}</span>}
          <small>{formData.title.length}/200</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your coaching wisdom..."
            rows="6"
            maxLength="2000"
            disabled={loading}
          />
          {errors.content && <span className={styles.error}>{errors.content}</span>}
          <small>{formData.content.length}/2000</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (comma-separated, max 10)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., fitness, mindset, inspiration"
            disabled={loading}
          />
          <small>Helps users discover related content</small>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              disabled={loading}
            />
            <span>📌 Pin this feed to the top</span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? '⏳ Publishing...' : '🚀 Publish Feed'}
        </button>
      </form>
    </div>
  );
};

export default FeedForm;
