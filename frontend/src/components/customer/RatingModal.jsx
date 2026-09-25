import React, { useState } from 'react';
import { Star, X, CheckCircle, AlertCircle, MessageSquare, Car } from 'lucide-react';
import ratingService from '../../services/rating.service';

function RatingModal({ vehicle, rental, onClose, onSuccess }) {
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle && !rental) return;

    setSubmitting(true);
    setError(null);

    try {
      const vehicleId = vehicle?._id || vehicle?.id || rental?.vehicle?._id || rental?.vehicle?.id || rental?.vehicle;
      const rentalId = rental?._id || rental?.id || null;

      const payload = {
        vehicleId,
        rentalId,
        score,
        comment: comment.trim(),
      };

      await ratingService.submitRating(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const vehicleName = vehicle
    ? `${vehicle.make} ${vehicle.model}`
    : rental?.vehicle?.make
    ? `${rental.vehicle.make} ${rental.vehicle.model}`
    : 'Vehicle';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          padding: '2rem',
          background: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Star size={24} color="#fff" fill="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>Rate Your Experience</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Car size={14} color="#818cf8" /> {vehicleName}
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Thank You for Your Feedback!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Your rating has been saved and applied to the vehicle review score.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Interactive 5-Star Rating Picker */}
            <div style={{ textAlignment: 'center', margin: '1.5rem 0', textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Select Your Star Rating:
              </label>
              <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverScore || score) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setScore(star)}
                      onMouseEnter={() => setHoverScore(star)}
                      onMouseLeave={() => setHoverScore(0)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        transition: 'transform 0.15s ease',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      <Star
                        size={36}
                        color={active ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                        fill={active ? '#f59e0b' : 'none'}
                      />
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#f59e0b' }}>
                {score === 5 && '⭐⭐⭐⭐⭐ Excellent (5/5)'}
                {score === 4 && '⭐⭐⭐⭐ Very Good (4/5)'}
                {score === 3 && '⭐⭐⭐ Average (3/5)'}
                {score === 2 && '⭐⭐ Fair (2/5)'}
                {score === 1 && '⭐ Poor (1/5)'}
              </div>
            </div>

            {/* Comment Feedback Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <MessageSquare size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Written Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on vehicle performance, cleanliness, or smooth rental process..."
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {comment.length}/500
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RatingModal;
