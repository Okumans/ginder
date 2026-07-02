import React, { useEffect, useState } from 'react';
import { Award, Compass, RefreshCw, Share2, Check } from 'lucide-react';

export const WinnerView = ({
  winner,
  isHost,
  resetSession,
  leaveRoom
}) => {
  const [confetti, setConfetti] = useState([]);
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    // Generate 50 confetti particles
    const particles = [];
    const colors = ['#8c2333', '#c75860', '#ffe4e3', '#2f9e5b', '#ffd166', '#4a1620'];
    
    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
        left: `${Math.random() * 100}vw`,
        delay: `${Math.random() * 3}s`,
        duration: `${2.5 + Math.random() * 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: `${5 + Math.random() * 10}px`
      });
    }
    setConfetti(particles);
  }, [winner]);

  const handleOpenMaps = () => {
    const query = encodeURIComponent(winner.name.split(' (')[0]); // Strip Thai names for cleaner maps search
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleShare = async () => {
    const cleanName = winner.name.split(' (')[0];
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName)}`;
    const shareText = `We're eating at ${cleanName}! 🎉 The group matched on Ginder.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ginder Pick', text: shareText, url: mapsUrl });
      } catch (err) {
        // User cancelled the native share sheet — nothing to do.
      }
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${mapsUrl}`);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
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

  return (
    <div className="glass-panel" style={{ maxWidth: '560px', position: 'relative', overflow: 'visible' }}>
      {/* Confetti particles (decorative only) */}
      {confetti.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          className="confetti"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: p.color,
            width: p.size,
            height: p.size
          }}
        />
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'var(--support)',
          border: '3px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          boxShadow: 'none'
        }}>
          <Award size={36} />
        </div>
      </div>

      <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>
        We Have a Winner!
      </h1>
      <p style={{ color: 'var(--ink)', opacity: 0.65, fontSize: '1rem', marginBottom: '2rem' }}>
        The group has spoken! Enjoy your meal here:
      </p>

      {/* Featured Card */}
      <div style={{
        background: 'var(--white)',
        borderRadius: '24px',
        border: '3px solid var(--ink)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        marginBottom: '2rem',
        textAlign: 'left'
      }}>
        <img src={cleanImageUrl(winner.image)} crossOrigin="anonymous" onError={handleImageError} alt={winner.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ink)' }}>{winner.name}</h3>
            <span className="price-indicator">{winner.price_level}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink)', opacity: 0.65, marginBottom: '1rem', lineHeight: '1.4' }}>
            {winner.description}
          </p>
          <div className="swipe-tags" style={{ marginBottom: '1.25rem' }}>
            {winner.tags.map((t) => (
              <span key={t} className="tag-badge">{t}</span>
            ))}
          </div>

          {/* Featured Menu List */}
          {winner.featured_menus.length > 0 ? (
            <div style={{ borderTop: '2px dashed var(--support-dark)', paddingTop: '0.8rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-soft)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                Must-Try Dishes
              </span>
              <div className="menu-list">
                {winner.featured_menus.map((menu, idx) => (
                  <div key={idx} className="menu-item-chip" style={{ flex: 1 }}>
                    <img src={cleanImageUrl(menu.image)} crossOrigin="anonymous" onError={handleImageError} alt={menu.name} style={{ height: '45px' }} />
                    <div className="menu-item-name">{menu.name}</div>
                    <div className="menu-item-price">{menu.price}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : winner.source === 'osm' && (
            <div style={{ borderTop: '2px dashed var(--support-dark)', paddingTop: '0.8rem', fontSize: '0.8rem', color: 'var(--ink)', opacity: 0.6, fontStyle: 'italic' }}>
              Menu details aren't available from OpenStreetMap for this spot — check their Google Maps listing.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleOpenMaps} style={{ flex: 2 }}>
            <Compass size={18} />
            Open in Google Maps
          </button>
          <button className="btn btn-outline" onClick={handleShare} aria-label="Share this pick with your group" style={{ flex: 1 }}>
            {justCopied ? <Check size={18} style={{ color: 'var(--yes-color)' }} /> : <Share2 size={18} />}
          </button>
        </div>

        {isHost ? (
          <button className="btn btn-outline" onClick={resetSession}>
            <RefreshCw size={16} />
            Start New Session
          </button>
        ) : (
          <button className="btn btn-outline" onClick={leaveRoom}>
            Leave Room
          </button>
        )}
      </div>
    </div>
  );
};
export default WinnerView;
