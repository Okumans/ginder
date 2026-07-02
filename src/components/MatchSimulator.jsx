import React from 'react';
import { Bot, Smartphone } from 'lucide-react';

export const MatchSimulator = ({
  status,
  participants,
  swipeVotes,
  bracketMatches,
  currentMatchIndex,
  bracketVotes,
  botsEnabled,
  roomCode
}) => {
  if (!botsEnabled) return null;

  const bots = participants.filter((p) => p.isBot);
  const activeMatch = bracketMatches[currentMatchIndex];

  // Helper to resolve swiping status
  const getBotSwipeStatus = (botId) => {
    if (status === 'LOBBY') return <span className="status-badge status-badge-done">Connected</span>;
    if (status === 'SWIPING' || status === 'WAITING') {
      const votes = swipeVotes[botId];
      if (votes) {
        const likes = Object.values(votes).filter(Boolean).length;
        return <span className="status-badge status-badge-done">Done ({likes} liked)</span>;
      }
      return <span className="status-badge status-badge-pending">Swiping...</span>;
    }
    if (status === 'BRACKET') {
      if (activeMatch) {
        const votes = bracketVotes[activeMatch.id] || {};
        if (votes[botId]) {
          return <span className="status-badge status-badge-done">Voted</span>;
        }
      }
      return <span className="status-badge status-badge-pending">Voting...</span>;
    }
    if (status === 'WINNER') return <span className="status-badge status-badge-done">Eating! 🍔</span>;
    return 'Offline';
  };

  const shareUrl = `${window.location.origin}?room=${roomCode}`;

  return (
    <div className="simulator-panel">
      <div className="simulator-header">
        <Bot size={20} style={{ color: 'var(--primary)' }} />
        <span>Multiplayer Simulator</span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--ink)', opacity: 0.6, marginBottom: '1rem', lineHeight: '1.3' }}>
        You can simulate cooperative voting here, or scan the QR/open the link in another window.
      </p>

      {/* Bot List */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary-soft)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
          Simulated Bots
        </span>
        {bots.map((bot) => (
          <div key={bot.id} className="simulator-bot-row">
            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{bot.nickname}</span>
            {getBotSwipeStatus(bot.id)}
          </div>
        ))}
      </div>

      {/* Manual Multitabbing advice */}
      <div style={{
        background: 'var(--support)',
        border: '2px solid rgba(74,22,32,0.1)',
        borderRadius: '12px',
        padding: '0.8rem',
        fontSize: '0.75rem',
        color: 'var(--ink)'
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--primary)', fontWeight: 'bold' }}>
          <Smartphone size={14} />
          <span>Real Multiplayer Sync</span>
        </div>
        <p style={{ color: 'var(--ink)', opacity: 0.6, fontSize: '0.7rem', marginBottom: '0.5rem' }}>
          Open this room link in a new private window or split-screen tab:
        </p>
        <div style={{
          background: 'var(--ink)',
          padding: '0.4rem',
          borderRadius: '6px',
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          fontSize: '0.65rem',
          color: '#ffd166',
          userSelect: 'all',
          cursor: 'pointer'
        }} onClick={() => {
          navigator.clipboard.writeText(shareUrl);
          alert('Copied URL!');
        }}>
          {shareUrl}
        </div>
        <p style={{ color: 'var(--ink)', opacity: 0.55, fontSize: '0.65rem', marginTop: '0.4rem' }}>
          *Tabs will sync swipes and tournament bracket votes in real-time!
        </p>
      </div>
    </div>
  );
};
export default MatchSimulator;
