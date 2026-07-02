import React, { useState, useEffect } from 'react';
import { Award, Check, Users, Clock, Shuffle } from 'lucide-react';
import { TIE_BREAK_DURATION_MS } from '../hooks/useRoomState';

const ROUND_DURATION_SECS = 30;

// Build a schedule of flash-flip timestamps (ms since tie-break start) that
// starts fast and gradually slows down, landing exactly on the final winner
// at the end of the animation. Deterministic given a duration, so every
// connected client renders an identical sequence off the shared startedAt.
const buildFlashSchedule = (durationMs) => {
  const deltas = [];
  let d = 110;
  let total = 0;
  while (total + d < durationMs) {
    deltas.push(d);
    total += d;
    d *= 1.22;
  }
  deltas.push(durationMs - total); // final segment lands exactly on duration
  const cumulative = [];
  let running = 0;
  deltas.forEach((delta) => {
    running += delta;
    cumulative.push(running);
  });
  return cumulative;
};

const FLASH_SCHEDULE = buildFlashSchedule(TIE_BREAK_DURATION_MS);

export const BracketView = ({
  bracketMatches,
  currentMatchIndex,
  bracketVotes,
  tieBreak,
  userId,
  participants,
  submitBracketVote
}) => {
  const activeMatch = bracketMatches[currentMatchIndex];
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECS);
  const [flashSide, setFlashSide] = useState(null); // 1 or 2

  const matchId = activeMatch?.id;
  const currentMatchVotes = bracketVotes[matchId] || {};
  const userVote = currentMatchVotes[userId];
  const isTieBreakActiveForThisMatch = tieBreak && tieBreak.matchId === matchId;

  // 30-second countdown per bracket round. If the timer hits zero and the
  // user hasn't voted yet, cast a random vote on their behalf so the group
  // isn't stuck waiting on someone who wandered off.
  useEffect(() => {
    setTimeLeft(ROUND_DURATION_SECS);
    if (!activeMatch) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    if (timeLeft !== 0 || userVote || !activeMatch || isTieBreakActiveForThisMatch) return;
    const options = [activeMatch.restaurant1?.id, activeMatch.restaurant2?.id].filter(Boolean);
    if (options.length > 0) {
      submitBracketVote(options[Math.floor(Math.random() * options.length)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, userVote, activeMatch, isTieBreakActiveForThisMatch]);

  // Drive the flashing decider animation off the synced startedAt timestamp
  // so every participant sees the same flicker land on the same restaurant.
  useEffect(() => {
    if (!isTieBreakActiveForThisMatch) {
      setFlashSide(null);
      return;
    }

    const winnerSide = tieBreak.finalWinnerId === activeMatch.restaurant1?.id ? 1 : 2;
    const otherSide = winnerSide === 1 ? 2 : 1;
    const lastIsEven = (FLASH_SCHEDULE.length - 1) % 2 === 0;
    const sideForEven = lastIsEven ? winnerSide : otherSide;
    const sideForOdd = lastIsEven ? otherSide : winnerSide;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - tieBreak.startedAt;
      let segmentIdx = FLASH_SCHEDULE.findIndex((t) => elapsed < t);
      if (segmentIdx === -1) segmentIdx = FLASH_SCHEDULE.length - 1;
      setFlashSide(segmentIdx % 2 === 0 ? sideForEven : sideForOdd);

      if (elapsed < TIE_BREAK_DURATION_MS) {
        requestAnimationFrame(tick);
      } else {
        setFlashSide(winnerSide);
      }
    };
    tick();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTieBreakActiveForThisMatch, tieBreak?.matchId]);

  if (!activeMatch) {
    return (
      <div className="glass-panel">
        <div className="spinner" />
        <p>Loading bracket stage...</p>
      </div>
    );
  }

  const { restaurant1, restaurant2 } = activeMatch;

  const totalVotesCount = Object.keys(currentMatchVotes).length;
  const totalParticipants = participants.length;

  const handleVote = (restaurantId) => {
    if (userVote || isTieBreakActiveForThisMatch) return;
    submitBracketVote(restaurantId);
  };

  const getStageTitle = (mid) => {
    if (mid.startsWith('Q')) return `Quarterfinals (Match ${mid.slice(1)})`;
    if (mid.startsWith('S')) return `Semifinals (Match ${mid.slice(1)})`;
    if (mid.startsWith('F')) return `Championship Final 🏆`;
    return 'Tournament Round';
  };

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ffe4e3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='30'>🍽️</text></svg>";
  };

  const urgent = timeLeft <= 8;

  const renderOption = (restaurant, side) => {
    if (!restaurant) {
      return (
        <div className="bracket-option-card" style={{ background: 'var(--support)', padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>
          <Award size={32} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 800 }}>BYE ROUND</div>
        </div>
      );
    }

    const isFlashHighlighted = isTieBreakActiveForThisMatch && flashSide === side;
    const isSelected = !isTieBreakActiveForThisMatch && userVote === restaurant.id;
    const isDimmed = !isTieBreakActiveForThisMatch && userVote && userVote !== restaurant.id;

    const canVote = !userVote && !isTieBreakActiveForThisMatch;

    return (
      <div
        className={`bracket-option-card ${isSelected ? 'selected' : ''} ${isFlashHighlighted ? 'selected flash-active' : ''}`}
        onClick={() => handleVote(restaurant.id)}
        role="button"
        tabIndex={canVote ? 0 : -1}
        aria-pressed={isSelected}
        aria-label={`Vote for ${restaurant.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleVote(restaurant.id);
          }
        }}
        style={{ opacity: isDimmed ? 0.55 : 1, cursor: isTieBreakActiveForThisMatch ? 'default' : 'pointer' }}
      >
        <img src={restaurant.image} onError={handleImageError} alt={restaurant.name} className="bracket-option-img" />
        <div className="bracket-option-info">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 800, marginBottom: '0.4rem' }}>
            {restaurant.name}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
            {restaurant.tags.slice(0, 2).map((t) => (
              <span key={t} className="tag-badge" style={{ fontSize: '0.65rem' }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink)', opacity: 0.65, height: '40px', overflow: 'hidden' }}>
            {restaurant.description}
          </p>
          {isSelected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--yes-color)', fontWeight: 800, fontSize: '0.85rem', marginTop: '0.75rem' }}>
              <Check size={16} /> My Vote
            </div>
          )}
          {isFlashHighlighted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', marginTop: '0.75rem' }}>
              <Shuffle size={16} /> Deciding...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bracket-container glass-panel" style={{ maxWidth: '680px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.9rem', fontWeight: 800 }}>
          {getStageTitle(activeMatch.id)}
        </h2>
        <div className={`round-timer ${urgent ? 'urgent' : ''}`}>
          <Clock size={16} />
          <span>{timeLeft}s</span>
        </div>
      </div>
      <p style={{ color: 'var(--ink)', opacity: 0.65, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {isTieBreakActiveForThisMatch
          ? "It's a tie! Flashing between both dishes to pick a winner..."
          : 'Select your favorite. The majority vote wins!'}
      </p>

      {/* Matchup Comparison Grid */}
      <div className="bracket-matchup-box">
        {renderOption(restaurant1, 1)}
        <div className="bracket-vs-circle">VS</div>
        {renderOption(restaurant2, 2)}
      </div>

      {/* Vote Progress Panel */}
      <div style={{ background: 'var(--support)', borderRadius: '14px', padding: '1rem', width: '100%', marginBottom: '1.5rem', border: '2px solid rgba(74,22,32,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} />
            <span>Voting Progress</span>
          </div>
          <span style={{ fontWeight: 800 }}>{totalVotesCount} / {totalParticipants} Friends Voted</span>
        </div>
        <div className="vote-bar-wrapper">
          <div
            className="vote-bar-fill"
            style={{ width: `${(totalVotesCount / totalParticipants) * 100}%` }}
          />
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {totalVotesCount} of {totalParticipants} friends have voted on this matchup.
        </span>
      </div>

      {/* Live Bracket Diagram Visual (Quarter -> Semi -> Final) */}
      <div style={{ width: '100%', textAlign: 'left' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-soft)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
          Bracket Tree
        </span>
        <div className="bracket-tree-diagram">
          <div className="bracket-tier">
            {bracketMatches.map((m) => {
              const isActive = m.id === activeMatch.id;
              const hasWinner = m.winner !== null;
              return (
                <div
                  key={m.id}
                  className={`bracket-node ${isActive ? 'active' : ''} ${hasWinner ? 'winner' : ''}`}
                >
                  {hasWinner ? m.winner.name.split(' ')[0] : m.restaurant1 ? `${m.restaurant1.name.split(' ')[0]} vs ${m.restaurant2?.name.split(' ')[0] || 'BYE'}` : 'Match'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BracketView;
