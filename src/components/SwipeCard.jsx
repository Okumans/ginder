import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Clock } from 'lucide-react';

const SWIPE_DURATION_SECS = 60;
const SWIPE_TINT_MAX_OPACITY = 0.5;
const SWIPE_TINT_RANGE_PX = 220;

export const SwipeCard = ({
  restaurants,
  onSubmitVotes
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [timeLeft, setTimeLeft] = useState(SWIPE_DURATION_SECS);

  // Swipe animation states
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'yes', 'no', or null

  const dragStart = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const activeRestaurant = restaurants[currentIndex];

  // Fixed 60-second countdown for the whole swipe round
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(votes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes]);

  const recordVote = (like) => {
    if (!activeRestaurant) return;

    setSwipeDirection(like ? 'yes' : 'no');
    setSwipeOffset({ x: like ? 600 : -600, y: 0 });

    const nextVotes = { ...votes, [activeRestaurant.id]: like };
    setVotes(nextVotes);

    setTimeout(() => {
      setSwipeOffset({ x: 0, y: 0 });
      setSwipeDirection(null);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= restaurants.length) {
        handleSubmit(nextVotes);
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 300);
  };

  const handleSubmit = (finalVotes) => {
    const completeVotes = { ...finalVotes };
    restaurants.forEach((r) => {
      if (completeVotes[r.id] === undefined) {
        completeVotes[r.id] = false;
      }
    });
    onSubmitVotes(completeVotes);
  };

  // Touch/Mouse swipe handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed:", err);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const diffX = e.clientX - dragStart.current.x;
    const diffY = e.clientY - dragStart.current.y;
    setSwipeOffset({ x: diffX, y: diffY });

    if (diffX > 100) {
      setSwipeDirection('yes');
    } else if (diffX < -100) {
      setSwipeDirection('no');
    } else {
      setSwipeDirection(null);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease, background-color 0.15s ease';
    }

    const threshold = 120;
    if (swipeOffset.x > threshold) {
      recordVote(true);
    } else if (swipeOffset.x < -threshold) {
      recordVote(false);
    } else {
      setSwipeOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ffe4e3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='30'>🍽️</text></svg>";
  };

  const cleanImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cors=1`;
  };

  if (!activeRestaurant) {
    return (
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--ink)', fontWeight: 700 }}>Tallying swipes...</p>
      </div>
    );
  }

  // Calculate card rotation, transform, and green/red tint intensity based on drag distance
  const rotation = swipeOffset.x * 0.05;
  const tintStrength = Math.min(Math.abs(swipeOffset.x) / SWIPE_TINT_RANGE_PX, 1) * SWIPE_TINT_MAX_OPACITY;
  const tintColor = swipeOffset.x > 0
    ? `rgba(47, 158, 91, ${tintStrength})`
    : swipeOffset.x < 0
      ? `rgba(209, 59, 74, ${tintStrength})`
      : 'transparent';

  const cardStyle = {
    transform: `translate3d(${swipeOffset.x}px, ${swipeOffset.y}px, 0) rotate(${rotation}deg)`,
    opacity: isDragging ? 0.97 : 1,
    backgroundColor: tintStrength > 0 ? tintColor : 'var(--white)',
    backgroundBlendMode: 'normal'
  };

  let overlayBadge = null;
  if (swipeDirection === 'yes') {
    overlayBadge = (
      <div className="swipe-badge swipe-badge-yes">YUM!</div>
    );
  } else if (swipeDirection === 'no') {
    overlayBadge = (
      <div className="swipe-badge swipe-badge-no">PASS</div>
    );
  }

  const urgent = timeLeft <= 10;

  return (
    <div className="swipe-container">
      {/* Top Header info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 800 }}>
          Card {currentIndex + 1} of {restaurants.length}
        </span>
        <div className={`timer-indicator ${urgent ? 'urgent' : ''}`}>
          <Clock size={16} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Stack wrapper */}
      <div className="swipe-card-wrapper">
        <div
          ref={cardRef}
          className="swipe-card"
          style={cardStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {overlayBadge}
          <div className="swipe-image-container">
            <img src={cleanImageUrl(activeRestaurant.image)} crossOrigin="anonymous" onError={handleImageError} alt={activeRestaurant.name} className="swipe-img" draggable="false" />
            <div className="swipe-overlay-gradient" />
          </div>

          <div className="swipe-info">
            <div>
              <div className="swipe-header">
                <h3 className="swipe-title">{activeRestaurant.name}</h3>
                <span className="price-indicator">{activeRestaurant.price_level}</span>
              </div>
              <p className="swipe-desc">{activeRestaurant.description}</p>
              <div className="swipe-tags">
                {activeRestaurant.tags.map((tag) => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>

            {activeRestaurant.featured_menus.length > 0 ? (
              <div className="featured-menu-section" style={{ width: '100%' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-soft)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Featured Menu
                </span>
                <div className="menu-list">
                  {activeRestaurant.featured_menus.map((menu, idx) => (
                    <div key={idx} className="menu-item-chip">
                      <img src={cleanImageUrl(menu.image)} crossOrigin="anonymous" onError={handleImageError} alt={menu.name} draggable="false" />
                      <div className="menu-item-name">{menu.name}</div>
                      <div className="menu-item-price">{menu.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeRestaurant.source === 'osm' && (
              <div className="featured-menu-section" style={{ width: '100%', fontSize: '0.75rem', color: 'var(--ink)', opacity: 0.55, fontStyle: 'italic' }}>
                Menu details aren't available from OpenStreetMap for this spot.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="swipe-controls">
        <button className="swipe-btn swipe-btn-no" onClick={() => recordVote(false)} aria-label="Pass">
          <X size={28} />
        </button>
        <button className="swipe-btn swipe-btn-yes" onClick={() => recordVote(true)} aria-label="Like">
          <Heart size={28} />
        </button>
      </div>
    </div>
  );
};
export default SwipeCard;
