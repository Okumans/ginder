import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Clock } from 'lucide-react';
import { hapticSwipe } from '../utils/haptics';

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

  // Mirrors the live drag state in a ref (not just React state) so the
  // watchdog timer below can always act on fresh values instead of a
  // stale closure from whichever render scheduled it.
  const dragStateRef = useRef({ isDragging: false, offset: { x: 0, y: 0 }, pointerId: null, target: null });
  const watchdogRef = useRef(null);
  const isCommittingVoteRef = useRef(false);

  const activeRestaurant = restaurants[currentIndex];

  // Don't let a pending watchdog timer fire after the component's gone
  useEffect(() => {
    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
    };
  }, []);

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
    // Guards against double-firing with a dedicated ref (not swipeDirection
    // state) -- swipeDirection is *also* set continuously during ordinary
    // dragging as the live "YUM/PASS" preview badge, well before a vote is
    // actually committed. Checking it here used to mean a legitimate
    // release could see swipeDirection already truthy from the drag
    // preview and silently no-op, permanently freezing the card mid-swipe.
    if (!activeRestaurant || isCommittingVoteRef.current) return;
    isCommittingVoteRef.current = true;

    hapticSwipe(like);
    setSwipeDirection(like ? 'yes' : 'no');
    setSwipeOffset({ x: like ? 600 : -600, y: 0 });

    const nextVotes = { ...votes, [activeRestaurant.id]: like };
    setVotes(nextVotes);

    setTimeout(() => {
      setSwipeOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      isCommittingVoteRef.current = false;

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

  // Warm the browser cache for the next 1-2 cards so advancing never shows
  // a blank/loading flash mid-swipe.
  useEffect(() => {
    for (let offset = 1; offset <= 2; offset++) {
      const upcoming = restaurants[currentIndex + offset];
      if (!upcoming) continue;
      const img = new Image();
      img.src = upcoming.image;
    }
  }, [currentIndex, restaurants]);

  // Keyboard alternative to the drag gesture: Left = pass, Right = like
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') recordVote(false);
      else if (e.key === 'ArrowRight') recordVote(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRestaurant, swipeDirection, votes]);

  // Touch/Mouse swipe handlers
  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  // iOS Safari has known cases where pointerup/pointercancel silently fail
  // to fire after a gesture gets interrupted mid-drag (e.g. the system
  // edge-swipe gesture, the tab getting backgrounded), which would
  // otherwise leave the card permanently frozen mid-swipe with no way to
  // recover. Re-armed on every pointermove, so an actively-dragging user
  // is never interrupted -- only a truly abandoned drag gets force-resolved.
  const armWatchdog = () => {
    clearWatchdog();
    watchdogRef.current = setTimeout(() => resolveDrag(), 2000);
  };

  const resolveDrag = () => {
    clearWatchdog();
    if (!dragStateRef.current.isDragging) return;
    dragStateRef.current.isDragging = false;
    setIsDragging(false);

    const { target, pointerId, offset } = dragStateRef.current;
    if (target && pointerId != null) {
      try { target.releasePointerCapture(pointerId); } catch (err) {}
    }

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease, background-color 0.15s ease';
    }

    const threshold = 120;
    if (offset.x > threshold) {
      recordVote(true);
    } else if (offset.x < -threshold) {
      recordVote(false);
    } else {
      setSwipeOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStateRef.current = { isDragging: true, offset: { x: 0, y: 0 }, pointerId: e.pointerId, target: e.target };
    dragStart.current = { x: e.clientX, y: e.clientY };
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed:", err);
    }
    armWatchdog();
  };

  const handlePointerMove = (e) => {
    if (!dragStateRef.current.isDragging) return;
    const diffX = e.clientX - dragStart.current.x;
    const diffY = e.clientY - dragStart.current.y;
    dragStateRef.current.offset = { x: diffX, y: diffY };
    setSwipeOffset({ x: diffX, y: diffY });

    if (diffX > 100) {
      setSwipeDirection('yes');
    } else if (diffX < -100) {
      setSwipeDirection('no');
    } else {
      setSwipeDirection(null);
    }
    armWatchdog();
  };

  const handlePointerUp = () => {
    resolveDrag();
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
          onLostPointerCapture={handlePointerUp}
        >
          {overlayBadge}
          <div className="swipe-image-container">
            <img src={cleanImageUrl(activeRestaurant.image)} crossOrigin="anonymous" onError={handleImageError} alt={activeRestaurant.name} decoding="async" className="swipe-img" draggable="false" />
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
              <div className="featured-menu-teaser">
                <span className="featured-menu-teaser-label">Try:</span>
                <span className="featured-menu-teaser-text">
                  {activeRestaurant.featured_menus.map((m) => m.name).join(' · ')}
                </span>
              </div>
            ) : activeRestaurant.source === 'osm' && (
              <div className="featured-menu-teaser">
                <span className="featured-menu-teaser-text" style={{ fontStyle: 'italic' }}>
                  Menu details aren't available from OpenStreetMap for this spot.
                </span>
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
      <p className="swipe-keyboard-hint">Tip: use ← / → arrow keys to vote too</p>
    </div>
  );
};
export default SwipeCard;
