import React, { useState, useRef, useEffect } from 'react';
import { Copy, Users, Play, Bot, AlertCircle, MapPin, Eye, EyeOff, Timer, Globe, Sparkles, Loader2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { restaurants } from '../data/restaurants';

export const LobbyView = ({
  roomCode,
  isHost,
  participants,
  settings,
  botsEnabled,
  updateSettings,
  toggleBots,
  startSwiping,
  leaveRoom,
  isFetchingLive,
  liveDataError
}) => {
  const categoriesList = ['Thai', 'Japanese', 'Italian', 'Spicy', 'Dessert', 'Buffet', 'Shabu', 'Burgers', 'BBQ', 'Noodles', 'Korean', 'Indian', 'Vietnamese', 'Seafood', 'Cafe', 'Street Food'];
  
  // Helper: Haversine distance formula in kilometers
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate matching restaurants based on current settings
  const getAvailableCount = () => {
    const lat = settings.latitude || 13.7444;
    const lng = settings.longitude || 100.5348;
    const distLimit = settings.distance || 5;
    const selectedCats = settings.categories || [];

    const matches = restaurants.filter(r => {
      // Must match at least one selected category
      const matchCat = r.tags.some(t => selectedCats.includes(t));
      // Must be within selected distance
      const dist = getDistanceKm(lat, lng, r.latitude, r.longitude);
      const matchDist = dist <= distLimit;
      return matchCat && matchDist;
    });
    return matches.length;
  };

  const availableCount = getAvailableCount();

  // Room invite QR code — lets friends in the same room scan to join
  // instead of typing the 4-character code.
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    if (!showQr || !roomCode) return;
    const shareUrl = `${window.location.origin}?room=${roomCode}`;
    QRCode.toDataURL(shareUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#4a1620', light: '#fffdfb' }
    })
      .then(setQrDataUrl)
      .catch((err) => console.error('QR code generation failed:', err));
  }, [showQr, roomCode]);

  // Gleo Map States
  const [gleoLoaded, setGleoLoaded] = useState(!!window.Gleo);
  const mapRef = useRef(null);
  const pinRef = useRef(null);
  const radiusRef = useRef(null);
  
  // Keep settings ref fresh to avoid stale closures in the map listeners
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Track last map center to prevent map pan vibration when adjusting slider
  const lastCenter = useRef({ lat: null, lng: null });

  // Sync with gleo-loaded event
  useEffect(() => {
    if (window.Gleo) {
      setGleoLoaded(true);
      return;
    }
    const handleGleoLoaded = () => setGleoLoaded(true);
    window.addEventListener('gleo-loaded', handleGleoLoaded);
    return () => window.removeEventListener('gleo-loaded', handleGleoLoaded);
  }, []);

  // Initialize Gleo Map
  useEffect(() => {
    if (!gleoLoaded) return;
    
    let mapInstance = null;
    let timer = setTimeout(checkContainerAndInit, 50);

    function checkContainerAndInit() {
      const container = document.getElementById("gleomap");
      if (!container) return;

      // Ensure the container is fully mounted and has a non-zero client layout size
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        timer = setTimeout(checkContainerAndInit, 100);
        return;
      }

      initMap(container);
    }

    function initMap(container) {
      const { MercatorMap, MercatorTiles, CircleFill } = window.Gleo;

      // Monkeypatch buggy remove method on MercatorMap prototype
      if (window.Gleo && window.Gleo.MercatorMap && !window.Gleo.MercatorMap.prototype._monkeypatched) {
        window.Gleo.MercatorMap.prototype.remove = function(symbol) {
          if (symbol && typeof symbol.remove === 'function') {
            try { symbol.remove(); } catch (e) {}
          }
          return this;
        };
        window.Gleo.MercatorMap.prototype._monkeypatched = true;
      }

      const initialLat = settingsRef.current.latitude || 13.7444;
      const initialLng = settingsRef.current.longitude || 100.5348;
      
      // Create map centered on coordinate
      const map = new MercatorMap(container, {
        center: [initialLat, initialLng],
        span: 80000 // around 80km span
      });
      mapRef.current = map;
      mapInstance = map;
      lastCenter.current = { lat: initialLat, lng: initialLng };

      // Load OpenStreetMap tiles
      new MercatorTiles("https://tile.osm.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        minZoom: 0
      }).addTo(map);

      // Initial pin dot
      const pinSymbol = new CircleFill([initialLat, initialLng], {
        radius: 10,
        colour: "#8c2333"
      }).addTo(map);
      pinRef.current = pinSymbol;

      // Initial distance radius circle
      const radiusInMeters = (settingsRef.current.distance || 5) * 1000;
      const radiusInPixels = Math.min(radiusInMeters / map.scale, 800);
      const radiusSymbol = new CircleFill([initialLat, initialLng], {
        radius: radiusInPixels,
        colour: "#c7586075"
      }).addTo(map);
      radiusRef.current = radiusSymbol;

      // Map click event listener (Host only)
      if (isHost) {
        map.on("click", (ev) => {
          // Convert geometry back to EPSG:4326 LatLng
          const [clickedLng, clickedLat] = ev.geometry.toCRS("EPSG:4326").coords;

          // Determine zone name dynamically based on coordinates
          let zone = 'Bangkok';
          if (clickedLat > 13.85 && clickedLng < 100.54) zone = 'Nonthaburi';
          else if (clickedLat > 13.88 && clickedLng >= 100.54) zone = 'Don Mueang';
          else if (clickedLng > 100.70) zone = 'Lat Krabang';
          else if (clickedLng > 100.60 && clickedLat < 13.70) zone = 'Bang Na / Sukhumvit East';
          else if (clickedLat < 13.71) zone = 'Samut Prakan / South';
          else if (clickedLat > 13.76 && clickedLng < 100.54) zone = 'Victory Monument';
          else if (clickedLat > 13.76 && clickedLng >= 100.54) zone = 'Ari';
          else if (clickedLat < 13.73 && clickedLng > 100.52) zone = 'Silom / Sathorn';
          else if (clickedLng < 100.51) zone = 'Chinatown / Old Town';
          else if (clickedLng < 100.50) zone = 'Thonburi / West Side';
          else zone = 'Siam Square';

          updateSettings({
            ...settingsRef.current,
            latitude: parseFloat(clickedLat.toFixed(5)),
            longitude: parseFloat(clickedLng.toFixed(5)),
            zone
          });
        });
      }

      // Keep radius circle aligned with zoom/scale updates
      map.on("viewchanged", () => {
        const activeMap = mapRef.current;
        if (!activeMap) return;

        const currentSettings = settingsRef.current;
        const currentLat = currentSettings.latitude || 13.7444;
        const currentLng = currentSettings.longitude || 100.5348;
        const currentDistance = currentSettings.distance || 5;

        if (radiusRef.current) {
          try { radiusRef.current.remove(); } catch(e) {}
        }

        const freshRadiusInMeters = currentDistance * 1000;
        const freshRadiusInPixels = Math.min(freshRadiusInMeters / activeMap.scale, 800);

        const freshRadiusSymbol = new CircleFill([currentLat, currentLng], {
          radius: freshRadiusInPixels,
          colour: "#c7586075"
        }).addTo(activeMap);
        radiusRef.current = freshRadiusSymbol;
      });
    }

    return () => {
      clearTimeout(timer);
      try {
        if (mapInstance) {
          if (typeof mapInstance.destroy === 'function') {
            mapInstance.destroy();
          } else if (typeof mapInstance.remove === 'function') {
            mapInstance.remove();
          } else {
            const container = document.getElementById("gleomap");
            if (container) container.innerHTML = "";
          }
        }
      } catch (e) {
        console.error("Error destroying map:", e);
      }
    };
  }, [gleoLoaded]);

  // Sync pins when settings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !gleoLoaded) return;

    const { CircleFill } = window.Gleo;

    const lat = settings.latitude || 13.7444;
    const lng = settings.longitude || 100.5348;
    const distance = settings.distance || 5;

    // Pan map to new center ONLY if actual lat/lng coordinates changed
    if (lastCenter.current.lat !== lat || lastCenter.current.lng !== lng) {
      map.setView({ center: [lat, lng], duration: 400 });
      lastCenter.current = { lat, lng };
    }

    // Redraw pin
    if (pinRef.current) {
      try { pinRef.current.remove(); } catch (e) {}
    }
    const newPin = new CircleFill([lat, lng], {
      radius: 10,
      colour: "#8c2333"
    }).addTo(map);
    pinRef.current = newPin;

    // Redraw radius circle
    if (radiusRef.current) {
      try { radiusRef.current.remove(); } catch (e) {}
    }
    const radiusInMeters = distance * 1000;
    const radiusInPixels = Math.min(radiusInMeters / map.scale, 800);
    const newRadius = new CircleFill([lat, lng], {
      radius: radiusInPixels,
      colour: "#c7586075"
    }).addTo(map);
    radiusRef.current = newRadius;

  }, [settings.latitude, settings.longitude, settings.distance, gleoLoaded]);

  const handleCategoryToggle = (category) => {
    if (!isHost) return;
    const current = settings.categories;
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    
    updateSettings({ ...settings, categories: next });
  };

  const handleSliderChange = (e) => {
    if (!isHost) return;
    updateSettings({ ...settings, distance: parseInt(e.target.value) });
  };

  const handleCardLimitChange = (e) => {
    if (!isHost) return;
    updateSettings({ ...settings, cardLimit: parseInt(e.target.value) });
  };

  const handlePublicityChange = (e) => {
    if (!isHost) return;
    updateSettings({ ...settings, isPublic: e.target.checked });
  };

  const handleDataSourceChange = (source) => {
    if (!isHost) return;
    updateSettings({ ...settings, dataSource: source });
  };

  const isLiveMode = settings.dataSource === 'live';

  // Fixed Clipboard Copy Fallback
  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Room link copied to clipboard!');
      } else {
        alert('Failed to copy. Please copy manually: ' + text);
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
      alert('Failed to copy. Please copy manually: ' + text);
    }
    document.body.removeChild(textArea);
  };

  const copyRoomLink = () => {
    const shareUrl = `${window.location.origin}?room=${roomCode}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Room link copied to clipboard!'))
        .catch(() => fallbackCopy(shareUrl));
    } else {
      fallbackCopy(shareUrl);
    }
  };

  return (
    <div className="lobby-layout glass-panel" style={{ maxWidth: '860px' }}>
      {/* Left Column: Room Info & Settings */}
      <div>
        <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {isHost ? 'Room Management' : 'Room Lobby'}
        </h2>
        <p style={{ color: 'var(--ink)', opacity: 0.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {isHost ? 'Customize the search map, distance radius, and categories.' : 'Wait for the host to adjust settings and start.'}
        </p>

        <div className="room-code-publicity-row" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Room Code
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="room-code-badge" style={{ marginBottom: 0 }}>{roomCode}</div>
              <button className="btn btn-outline" onClick={copyRoomLink} aria-label="Copy room invite link" style={{ width: 'auto', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <Copy size={18} />
              </button>
              <button
                className={`btn ${showQr ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setShowQr((prev) => !prev)}
                aria-label={showQr ? 'Hide QR code' : 'Show QR code to scan and join'}
                aria-pressed={showQr}
                style={{ width: 'auto', padding: '0.75rem 1rem', borderRadius: '12px' }}
              >
                <QrCode size={18} />
              </button>
            </div>
            {showQr && (
              <div style={{ marginTop: '0.75rem' }}>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code to join room ${roomCode}`}
                    width={140}
                    height={140}
                    style={{ borderRadius: '12px', border: '3px solid var(--ink)' }}
                  />
                ) : (
                  <div className="spinner" style={{ margin: '0.5rem 0' }} />
                )}
                <p style={{ fontSize: '0.72rem', color: 'var(--ink)', opacity: 0.55, marginTop: '0.4rem', maxWidth: '160px' }}>
                  Scan to jump straight into this room
                </p>
              </div>
            )}
          </div>

          {/* Room Publicity Toggle (Host only) */}
          {isHost ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lobby Publicity
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0, textTransform: 'none', letterSpacing: 'normal' }}>
                <input
                  type="checkbox"
                  checked={settings.isPublic !== false}
                  onChange={handlePublicityChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  {settings.isPublic !== false ? (
                    <><Eye size={16} style={{ color: 'var(--primary-soft)' }} /> Public</>
                  ) : (
                    <><EyeOff size={16} style={{ color: 'var(--no-color)' }} /> Private</>
                  )}
                </span>
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lobby Publicity
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--ink)', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {settings.isPublic !== false ? (
                  <><Eye size={16} /> Public Room</>
                ) : (
                  <><EyeOff size={16} /> Private Room</>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div style={{ background: 'var(--support)', borderRadius: '18px', padding: '1.5rem', border: '2px solid rgba(74,22,32,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} className="text-gradient" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--ink)' }}>Pin Your Spot</h3>
            </div>
            {isLiveMode ? (
              <div style={{
                background: 'var(--support-dark)', border: '2px solid var(--primary-soft)', color: 'var(--primary)',
                padding: '0.35rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}>
                <Globe size={13} />
                Live from OpenStreetMap
              </div>
            ) : (
              <div style={{
                background: availableCount > 0 ? 'var(--yes-bg)' : 'var(--no-bg)',
                border: availableCount > 0 ? '2px solid var(--yes-color)' : '2px solid var(--no-color)',
                color: availableCount > 0 ? 'var(--yes-color)' : 'var(--no-color)',
                padding: '0.35rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: availableCount > 0 ? 'var(--yes-color)' : 'var(--no-color)' }} />
                {availableCount} Restaurants Match
              </div>
            )}
          </div>

          {/* Data Source Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleDataSourceChange('curated')}
              disabled={!isHost}
              className={`btn ${!isLiveMode ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem', borderRadius: '12px', boxShadow: 'none' }}
            >
              <Sparkles size={15} />
              Curated Picks
            </button>
            <button
              type="button"
              onClick={() => handleDataSourceChange('live')}
              disabled={!isHost}
              className={`btn ${isLiveMode ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem', borderRadius: '12px', boxShadow: 'none' }}
            >
              <Globe size={15} />
              Live (OpenStreetMap)
            </button>
          </div>

          {isLiveMode && (
            <div style={{
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: 'var(--white)',
              border: '2px solid rgba(74,22,32,0.1)', borderRadius: '12px', padding: '0.7rem 0.9rem',
              marginBottom: '1.25rem', fontSize: '0.78rem', color: 'var(--ink)', opacity: 0.75
            }}>
              <Globe size={14} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--primary-soft)' }} />
              <span>We'll fetch real nearby places from OpenStreetMap when you start swiping. Coverage varies by area, and menu/price details usually aren't available — photos shown are illustrative.</span>
            </div>
          )}

          {liveDataError && (
            <div style={{
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#fff2c4',
              border: '2px solid #d69e00', borderRadius: '12px', padding: '0.7rem 0.9rem',
              marginBottom: '1.25rem', fontSize: '0.78rem', color: '#a56b00', fontWeight: 600
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <span>{liveDataError}</span>
            </div>
          )}

          {/* Interactive WebGL Map */}
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {isHost ? '🖱️ Drag to pan • Scroll to zoom • Click anywhere to Pin Location' : 'Pinned Location Map'}
            </span>

            {/* Gleo Map Div Container */}
            {!gleoLoaded ? (
              <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--support)', borderRadius: '14px', border: '2px solid var(--ink)' }}>
                <div className="spinner" />
                <span style={{ marginTop: '0.75rem', color: 'var(--ink)', opacity: 0.6, fontSize: '0.85rem' }}>Loading WebGL Map...</span>
              </div>
            ) : (
              <div id="gleomap" style={{ width: '100%', height: '260px', borderRadius: '14px', border: '2px solid var(--ink)', overflow: 'hidden', background: 'var(--support)' }} />
            )}
          </div>

          <div className="pinned-area-gps-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--primary)', display: 'block', fontWeight: 'bold' }}>Pinned Area:</span>
              <span style={{ color: 'var(--primary-soft)', fontWeight: 'bold', fontSize: '0.95rem' }}>📍 {settings.zone}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--primary)', display: 'block' }}>GPS Coordinates:</span>
              <span style={{ color: 'var(--ink)', opacity: 0.6, fontFamily: 'monospace' }}>{settings.latitude}, {settings.longitude}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Max Distance Radius</label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="15"
                value={settings.distance}
                onChange={handleSliderChange}
                disabled={!isHost}
              />
              <span className="slider-val">{settings.distance} km</span>
            </div>
          </div>

          <div className="cards-timer-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Cards to Swipe</label>
              <select value={settings.cardLimit} onChange={handleCardLimitChange} disabled={!isHost}>
                <option value={5}>5 Cards</option>
                <option value={10}>10 Cards</option>
                <option value={15}>15 Cards</option>
                <option value={20}>20 Cards</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--support)', border: '2.5px solid var(--ink)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
              <Timer size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>60s swipe · 30s per bracket round</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ marginBottom: '0.75rem' }}>Food Categories</label>
            <div className="category-grid">
              {categoriesList.map((category) => {
                const isActive = settings.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isActive}
                    disabled={!isHost}
                    className={`category-chip ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryToggle(category)}
                    style={{ opacity: !isHost && !isActive ? 0.4 : 1, cursor: isHost ? 'pointer' : 'default' }}
                  >
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Participants List & Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '2px dashed var(--support-dark)', paddingLeft: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users size={20} className="text-gradient" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)' }}>
              Friends connected ({participants.length})
            </h3>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {participants.map((p) => (
              <div key={p.id} className={`user-card ${p.isHost ? 'host' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', color: 'var(--ink)', fontWeight: 700 }}>{p.nickname}</span>
                  {p.isHost && <span className="user-tag-host">Host</span>}
                  {p.isBot && <span className="user-tag-host" style={{ background: 'rgba(199,88,96,0.2)', color: '#c75860' }}>Bot</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink)', opacity: 0.6 }}>Ready</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bots Simulation Toggle (Host only) */}
          {isHost && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'var(--support)',
                border: '2px solid rgba(199,88,96,0.3)',
                borderRadius: '16px',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Bot size={18} style={{ color: '#c75860' }} />
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--ink)', display: 'block' }}>Simulate Companions</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink)', opacity: 0.6 }}>Add 3 bots to demo consensus</span>
                </div>
              </div>
              <button
                className={`btn ${botsEnabled ? 'btn-danger' : 'btn-secondary'}`}
                style={{ width: 'auto', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem' }}
                onClick={() => toggleBots(!botsEnabled)}
              >
                {botsEnabled ? 'Remove' : 'Enable'}
              </button>
            </div>
          )}
        </div>

        {/* Start Action */}
        <div>
          {isHost && !isLiveMode && availableCount === 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--no-bg)', border: '2px solid var(--no-color)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <AlertCircle size={16} style={{ color: 'var(--no-color)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--no-color)', fontWeight: 700 }}>
                No matching restaurants! Adjust your map location, expand distance, or select more categories.
              </span>
            </div>
          )}

          {isHost ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-outline"
                onClick={leaveRoom}
                style={{ flex: 1, padding: '1.1rem', borderRadius: '12px' }}
              >
                Close Room
              </button>
              <button
                className="btn btn-primary"
                onClick={startSwiping}
                disabled={(participants.length < 2 && !botsEnabled) || (!isLiveMode && availableCount === 0) || isFetchingLive}
                style={{ flex: 2, padding: '1.1rem' }}
              >
                {isFetchingLive ? (
                  <>
                    <Loader2 size={20} className="spin-icon" />
                    Fetching real places...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Start Swiping
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff2c4', border: '2px solid #d69e00', padding: '1rem', borderRadius: '14px' }}>
                <AlertCircle size={18} style={{ color: '#a56b00', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#a56b00', fontWeight: 700 }}>
                  Wait for Host to launch swiping. Ensure you don't close this tab!
                </span>
              </div>
              <button
                className="btn btn-outline"
                onClick={leaveRoom}
                style={{ padding: '1.1rem', borderRadius: '12px' }}
              >
                Leave Room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LobbyView;
