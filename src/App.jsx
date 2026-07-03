import React, { useState, useEffect } from 'react';
import { useRoomState } from './hooks/useRoomState';
import LobbyView from './components/LobbyView';
import SwipeCard from './components/SwipeCard';
import BracketView from './components/BracketView';
import WinnerView from './components/WinnerView';
import MatchSimulator from './components/MatchSimulator';
import { Sparkles, Users, AlertTriangle, HelpCircle } from 'lucide-react';
import logo from './assets/logo.png';
import { showToast } from './utils/toast';

function App() {
  const {
    roomCode,
    isHost,
    participants,
    status,
    settings,
    restaurants,
    swipeVotes,
    bracketMatches,
    currentMatchIndex,
    bracketVotes,
    tieBreak,
    winner,
    botsEnabled,
    publicRooms,
    joinError,
    isFetchingLive,
    liveDataError,
    userId,
    createRoom,
    joinRoom,
    updateSettings,
    toggleBots,
    startSwiping,
    submitSwipeVotes,
    submitBracketVote,
    resetSession,
    leaveRoom,
  } = useRoomState();

  // Local form inputs
  const [nicknameInput, setNicknameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Prepopulate join code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) {
      setJoinCodeInput(codeParam.toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return showToast('Please enter your nickname', 'warning');
    createRoom(nicknameInput.trim());
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return showToast('Please enter your nickname', 'warning');
    if (!joinCodeInput.trim() || joinCodeInput.trim().length !== 4) {
      return showToast('Please enter a valid 4-character Room Code', 'warning');
    }
    joinRoom(nicknameInput.trim(), joinCodeInput.trim());
  };

  // Render view dispatcher
  const renderContent = () => {
    switch (status) {
      case 'HOME':
        return (
          <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
            <div className="brand-lockup">
              <img src={logo} alt="Ginder" className="brand-mark brand-mark-img" />
              <span className="brand-word">Gin<span>der</span></span>
            </div>
            <p className="tagline">Swipe together. Match on a meal. No more "whatever, anything's fine".</p>

            <button
              type="button"
              onClick={() => setShowHowItWorks((prev) => !prev)}
              aria-expanded={showHowItWorks}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                color: 'var(--primary-soft)', fontWeight: 700, fontSize: '0.85rem',
                marginBottom: '1.5rem', fontFamily: 'inherit'
              }}
            >
              <HelpCircle size={16} />
              {showHowItWorks ? 'Hide how it works' : 'How does this work?'}
            </button>

            {showHowItWorks && (
              <div style={{
                background: 'var(--support)', border: '2px solid rgba(74,22,32,0.1)',
                borderRadius: 'var(--radius-md)', padding: '1.1rem 1.2rem',
                marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.82rem', color: 'var(--ink)'
              }}>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>1.</span>
                  <span>Everyone in the room swipes on restaurant cards — like or pass, 60 seconds.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>2.</span>
                  <span>Everyone liked exactly one place in common? That's the winner, instantly.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>3.</span>
                  <span>Multiple unanimous picks, or none at all? A bracket tournament settles it — 30 seconds a round, ties get a dramatic coin-flip animation.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>4.</span>
                  <span>Winner gets revealed with a link straight to Google Maps.</span>
                </div>
              </div>
            )}

            {joinError && (
              <div style={{
                display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                background: 'var(--no-bg)', border: '2.5px solid var(--no-color)',
                borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem',
                marginBottom: '1.5rem', textAlign: 'left'
              }}>
                <AlertTriangle size={20} style={{ color: 'var(--no-color)', flexShrink: 0, marginTop: '0.1rem' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--no-color)', fontWeight: 700 }}>{joinError}</span>
              </div>
            )}

            {/* Tab Swapping */}
            <div style={{
              display: 'flex',
              background: 'var(--support)',
              padding: '0.3rem',
              borderRadius: '14px',
              marginBottom: '2rem',
              border: '2.5px solid var(--ink)'
            }}>
              <button
                className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '9px', fontSize: '0.9rem', boxShadow: 'none' }}
                onClick={() => setActiveTab('create')}
              >
                Create Room
              </button>
              <button
                className={`btn ${activeTab === 'join' ? 'btn-secondary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '9px', fontSize: '0.9rem', boxShadow: 'none' }}
                onClick={() => setActiveTab('join')}
              >
                Join Room
              </button>
            </div>

            {activeTab === 'create' ? (
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label htmlFor="nickname-create">My Nickname</label>
                  <input
                    id="nickname-create"
                    type="text"
                    placeholder="Enter your nickname"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    required
                    maxLength={15}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={18} />
                  Create Room
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinSubmit}>
                <div className="form-group">
                  <label htmlFor="nickname-join">My Nickname</label>
                  <input
                    id="nickname-join"
                    type="text"
                    placeholder="Enter your nickname"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    required
                    maxLength={15}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="room-code">Room Code</label>
                  <input
                    id="room-code"
                    type="text"
                    placeholder="Enter 4-character Code"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    required
                    maxLength={4}
                    style={{ letterSpacing: '0.1em', textAlign: 'center', fontWeight: 800 }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  <Users size={18} />
                  Join Room
                </button>
              </form>
            )}

            {/* Public Rooms Section */}
            <div style={{ marginTop: '2.5rem', borderTop: '2px dashed var(--support-dark)', paddingTop: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <Users size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>Active Public Rooms</h3>
              </div>

              {publicRooms.length === 0 ? (
                <p style={{ color: 'var(--ink)', opacity: 0.5, fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                  No active public rooms. Create a new room to start!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {publicRooms.map((room) => (
                    <div
                      key={room.code}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--support)',
                        border: '2px solid rgba(74,22,32,0.1)',
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{room.code}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--ink)', opacity: 0.6 }}>by {room.host}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink)', opacity: 0.5, marginTop: '0.2rem' }}>
                          📍 {room.zone} • {(room.categories || []).slice(0, 3).join(', ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ink)', opacity: 0.7 }}>
                          👥 {room.participantCount}
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px', boxShadow: 'none' }}
                          onClick={() => {
                            setJoinCodeInput(room.code);
                            setActiveTab('join');
                            const input = document.getElementById('nickname-join');
                            if (input) {
                              setTimeout(() => input.focus(), 50);
                            }
                          }}
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'LOBBY':
        return (
          <LobbyView
            roomCode={roomCode}
            isHost={isHost}
            participants={participants}
            settings={settings}
            botsEnabled={botsEnabled}
            updateSettings={updateSettings}
            toggleBots={toggleBots}
            startSwiping={startSwiping}
            leaveRoom={leaveRoom}
            isFetchingLive={isFetchingLive}
            liveDataError={liveDataError}
          />
        );

      case 'SWIPING':
        return (
          <SwipeCard
            restaurants={restaurants}
            onSubmitVotes={submitSwipeVotes}
          />
        );

      case 'WAITING':
        return (
          <div className="glass-panel" style={{ padding: '3.5rem 2rem' }}>
            <div className="spinner" />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--ink)' }}>
              Waiting for friends...
            </h2>
            <p style={{ color: 'var(--ink)', opacity: 0.65, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Your swipes are submitted! Once everyone finishes swiping, we will calculate the results.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', maxWidth: '320px', margin: '0 auto' }}>
              {participants.map((p) => {
                const isFinished = swipeVotes[p.id] !== undefined;
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.8rem', background: 'var(--support)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{p.nickname}</span>
                    <span style={{ color: isFinished ? 'var(--yes-color)' : '#a56b00', fontWeight: 800, fontSize: '0.85rem' }}>
                      {isFinished ? 'Finished ✅' : 'Swiping... ✍️'}
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="sr-only" role="status" aria-live="polite">
              {participants.filter((p) => swipeVotes[p.id] !== undefined).length} of {participants.length} friends have finished swiping.
            </span>
          </div>
        );

      case 'BRACKET':
        return (
          <BracketView
            bracketMatches={bracketMatches}
            currentMatchIndex={currentMatchIndex}
            bracketVotes={bracketVotes}
            tieBreak={tieBreak}
            userId={userId}
            participants={participants}
            submitBracketVote={submitBracketVote}
          />
        );

      case 'WINNER':
        return (
          <WinnerView
            winner={winner}
            isHost={isHost}
            resetSession={resetSession}
            leaveRoom={leaveRoom}
          />
        );

      default:
        return <div>Unknown stage</div>;
    }
  };

  return (
    <>
      <div className="stage-transition" key={status}>
        {renderContent()}
      </div>

      {/* Side Docked Companion Simulator */}
      <MatchSimulator
        status={status}
        participants={participants}
        swipeVotes={swipeVotes}
        bracketMatches={bracketMatches}
        currentMatchIndex={currentMatchIndex}
        bracketVotes={bracketVotes}
        botsEnabled={botsEnabled}
        roomCode={roomCode}
      />
    </>
  );
}

export default App;
