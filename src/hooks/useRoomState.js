import { useState, useEffect, useRef } from 'react';
import { restaurants as masterRestaurants } from '../data/restaurants';
import { fetchNearbyRestaurants } from '../services/overpassApi';

// Helper to generate UUID
const generateUUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Helper to generate Room Code
// How long the tie-break "flashing decider" animation runs before settling
// on the winner, in milliseconds. Shared by host logic and BracketView UI.
export const TIE_BREAK_DURATION_MS = 3200;

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, I, 1, 0
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useRoomState = () => {
  const [userId, setUserId] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ginder_session_state');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.userId) return state.userId;
      }
    } catch (e) {}
    let id = sessionStorage.getItem('ginder_user_id');
    if (!id) {
      id = generateUUID();
      sessionStorage.setItem('ginder_user_id', id);
    }
    return id;
  });

  // Restore session state on reload
  const loadSavedState = () => {
    try {
      const saved = sessionStorage.getItem('ginder_session_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading session state:', e);
    }
    return null;
  };

  const savedState = loadSavedState() || {};

  const [nickname, setNicknameState] = useState(() => savedState.nickname || '');
  const [roomCode, setRoomCode] = useState(() => savedState.roomCode || null);
  const [isHost, setIsHost] = useState(() => savedState.isHost || false);
  const [participants, setParticipants] = useState(() => savedState.participants || []);
  const [status, setStatus] = useState(() => savedState.status || 'HOME'); // HOME, LOBBY, SWIPING, WAITING, BRACKET, WINNER
  
  const [settings, setSettings] = useState(() => savedState.settings || {
    zone: 'Siam Square',
    latitude: 13.7444,
    longitude: 100.5348,
    isPublic: true,
    distance: 5,
    categories: ['Thai', 'Japanese', 'Buffet'],
    cardLimit: 10,
    timerLimit: 60,
    dataSource: 'curated', // 'curated' (mock dataset) or 'live' (OpenStreetMap via Overpass)
  });

  const [restaurants, setRestaurants] = useState(() => savedState.restaurants || []);
  const [swipeVotes, setSwipeVotes] = useState(() => savedState.swipeVotes || {}); // { [userId]: { [restaurantId]: boolean } }
  const [bracketMatches, setBracketMatches] = useState(() => savedState.bracketMatches || []); // Array of matches
  const [currentMatchIndex, setCurrentMatchIndex] = useState(() => savedState.currentMatchIndex || 0);
  const [bracketVotes, setBracketVotes] = useState(() => savedState.bracketVotes || {}); // { [matchId]: { [userId]: restaurantId } }
  const [winner, setWinner] = useState(() => savedState.winner || null);
  const [botsEnabled, setBotsEnabled] = useState(() => savedState.botsEnabled || false);
  // Transient "flashing decider" state for tied bracket votes: { matchId, finalWinnerId, startedAt }
  const [tieBreak, setTieBreak] = useState(null);

  const [publicRooms, setPublicRooms] = useState([]);
  // Set when a guest's join attempt times out with no response from a host
  // (e.g. the host is on a different browser/device — this app has no
  // server, so joining only works within the same browser profile).
  const [joinError, setJoinError] = useState(null);
  // Live-data fetch status when settings.dataSource === 'live' (Host only)
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveDataError, setLiveDataError] = useState(null);

  const channelRef = useRef(null);
  const stateRef = useRef();

  // Sync state helper to broadcast to other tabs
  const broadcast = (type, payload) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, payload, senderId: userId });
    }
  };

  // Keep stateRef fresh on every render to avoid stale closure in BroadcastChannel callback
  stateRef.current = {
    userId,
    nickname,
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
    winner,
    botsEnabled,
    tieBreak
  };

  // Warn before an accidental tab close/refresh strands the rest of the
  // group mid-game. Not shown on HOME (nothing to lose) or WINNER (session
  // already concluded).
  useEffect(() => {
    const activeStatuses = ['LOBBY', 'SWIPING', 'WAITING', 'BRACKET'];
    if (!roomCode || !activeStatuses.includes(status)) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomCode, status]);

  // Persist state to sessionStorage on every change
  useEffect(() => {
    if (status !== 'HOME' && roomCode) {
      const stateToSave = {
        userId,
        nickname,
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
        winner,
        botsEnabled
      };
      sessionStorage.setItem('ginder_session_state', JSON.stringify(stateToSave));
    } else {
      sessionStorage.removeItem('ginder_session_state');
    }
  }, [userId, nickname, roomCode, isHost, participants, status, settings, restaurants, swipeVotes, bracketMatches, currentMatchIndex, bracketVotes, winner, botsEnabled]);

  // Host: Periodically publish this room as an active public room in localStorage
  useEffect(() => {
    if (!isHost || !roomCode || status === 'HOME' || !settings.isPublic) {
      // If private, ensure we remove it from localStorage list!
      try {
        const rawRooms = localStorage.getItem('ginder_public_rooms');
        if (rawRooms) {
          let rooms = JSON.parse(rawRooms);
          rooms = rooms.filter(r => r.code !== roomCode);
          localStorage.setItem('ginder_public_rooms', JSON.stringify(rooms));
        }
      } catch (e) {}
      return;
    }

    const publishRoom = () => {
      try {
        const rawRooms = localStorage.getItem('ginder_public_rooms');
        let rooms = rawRooms ? JSON.parse(rawRooms) : [];
        
        // Filter out expired entries (>10 seconds since last heartbeat) and this room's old entry
        rooms = rooms.filter(r => r.code !== roomCode && (Date.now() - r.updatedAt) < 10000);

        // Add updated room description
        rooms.push({
          code: roomCode,
          host: nickname,
          status,
          zone: settings.zone,
          latitude: settings.latitude,
          longitude: settings.longitude,
          isPublic: settings.isPublic,
          categories: settings.categories,
          participantCount: participants.length,
          updatedAt: Date.now()
        });

        localStorage.setItem('ginder_public_rooms', JSON.stringify(rooms));
      } catch (e) {
        console.error('Error publishing public room:', e);
      }
    };

    publishRoom();
    const interval = setInterval(publishRoom, 2000);

    return () => {
      clearInterval(interval);
      try {
        const rawRooms = localStorage.getItem('ginder_public_rooms');
        if (rawRooms) {
          let rooms = JSON.parse(rawRooms);
          rooms = rooms.filter(r => r.code !== roomCode);
          localStorage.setItem('ginder_public_rooms', JSON.stringify(rooms));
        }
      } catch (e) {
        console.error(e);
      }
    };
  }, [isHost, roomCode, status, nickname, settings.zone, settings.latitude, settings.longitude, settings.isPublic, participants.length]);

  // All users: Periodically scan localStorage for active public rooms
  useEffect(() => {
    const scanPublicRooms = () => {
      try {
        const rawRooms = localStorage.getItem('ginder_public_rooms');
        if (rawRooms) {
          const rooms = JSON.parse(rawRooms);
          // Only show active public rooms (updated in the last 6 seconds) and exclude current room
          const active = rooms.filter(r => (Date.now() - r.updatedAt) < 6000 && r.code !== roomCode);
          setPublicRooms(active);
        } else {
          setPublicRooms([]);
        }
      } catch (e) {
        console.error('Error scanning public rooms:', e);
      }
    };

    scanPublicRooms();
    const interval = setInterval(scanPublicRooms, 2000);
    return () => clearInterval(interval);
  }, [roomCode]);

  // Setup BroadcastChannel when roomCode changes
  useEffect(() => {
    if (!roomCode) {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      return;
    }

    const channel = new BroadcastChannel(`ginder_room_${roomCode}`);
    channelRef.current = channel;
    let syncReceived = false;

    // Build a full state snapshot for syncing other tabs/devices in this room
    const buildSyncPayload = (s) => ({
      participants: s.participants,
      settings: s.settings,
      status: s.status,
      restaurants: s.restaurants,
      swipeVotes: s.swipeVotes,
      bracketMatches: s.bracketMatches,
      currentMatchIndex: s.currentMatchIndex,
      bracketVotes: s.bracketVotes,
      winner: s.winner,
      botsEnabled: s.botsEnabled,
      tieBreak: s.tieBreak
    });

    // Listen for messages
    channel.onmessage = (event) => {
      const { type, payload, senderId } = event.data;
      if (senderId === userId) return; // Ignore own messages

      const currentState = stateRef.current;

      switch (type) {
        case 'REQUEST_STATE':
          if (currentState.isHost) {
            // Host sends the full state
            broadcast('SYNC_STATE', buildSyncPayload(currentState));
          }
          break;

        case 'SYNC_STATE':
          syncReceived = true;
          setJoinError(null);
          setParticipants(payload.participants);
          setSettings(payload.settings);
          setRestaurants(payload.restaurants);
          setSwipeVotes(payload.swipeVotes);
          setBracketMatches(payload.bracketMatches);
          setCurrentMatchIndex(payload.currentMatchIndex);
          setBracketVotes(payload.bracketVotes);
          setWinner(payload.winner);
          setBotsEnabled(payload.botsEnabled);
          setTieBreak(payload.tieBreak || null);

          // Guard status transition:
          // A guest who is swiping should NOT be forced to WAITING.
          if (!(currentState.status === 'SWIPING' && payload.status === 'WAITING')) {
            setStatus(payload.status);
          }
          break;

        case 'PARTICIPANT_JOINED':
          setParticipants((prev) => {
            if (prev.find((p) => p.id === payload.id)) return prev;
            return [...prev, payload];
          });
          // Host should re-broadcast current state to keep everyone aligned
          if (currentState.isHost) {
            broadcast('SYNC_STATE', buildSyncPayload({
              ...currentState,
              participants: [...currentState.participants.filter(p => p.id !== payload.id), payload]
            }));
          }
          break;

        case 'SETTINGS_UPDATED':
          setSettings(payload);
          break;

        case 'STATUS_CHANGED':
          setStatus(payload.status);
          if (payload.restaurants) setRestaurants(payload.restaurants);
          if (payload.status === 'SWIPING') {
            setSwipeVotes({});
            setWinner(null);
            setBracketMatches([]);
            setBracketVotes({});
            setCurrentMatchIndex(0);
            setTieBreak(null);
          }
          break;

        case 'SWIPES_SUBMITTED':
          setSwipeVotes((prev) => ({
            ...prev,
            [payload.userId]: payload.votes
          }));
          break;

        case 'BRACKET_VOTE_SUBMITTED':
          setBracketVotes((prev) => ({
            ...prev,
            [payload.matchId]: {
              ...(prev[payload.matchId] || {}),
              [payload.userId]: payload.restaurantId
            }
          }));
          break;

        case 'TIE_BREAK_START':
          setTieBreak(payload);
          break;

        case 'MATCH_RESOLVED':
          setBracketMatches(payload.matches);
          setCurrentMatchIndex(payload.currentIndex);
          setBracketVotes(payload.bracketVotes);
          setTieBreak(null);
          if (payload.winner) setWinner(payload.winner);
          if (payload.status) setStatus(payload.status);
          break;

        default:
          break;
      }
    };

    // If guest, request full state from Host AND broadcast join event slightly deferred
    // to allow tabs to align their BroadcastChannel listener event loops.
    if (!stateRef.current.isHost) {
      setTimeout(() => {
        if (!channelRef.current) return;
        const freshState = stateRef.current;
        channelRef.current.postMessage({
          type: 'REQUEST_STATE',
          senderId: userId
        });

        const guestUser = { id: userId, nickname: freshState.nickname, isHost: false, status: 'CONNECTED' };
        channelRef.current.postMessage({
          type: 'PARTICIPANT_JOINED',
          payload: guestUser,
          senderId: userId
        });
      }, 100);

      // If no host ever responds, the room doesn't exist in this browser
      // (wrong code, or the host is on a different browser/device — this
      // app has no server, so BroadcastChannel only reaches the same
      // browser profile). Bail out with a clear error instead of leaving
      // the guest stuck in a lobby of one forever.
      const joinTimeout = setTimeout(() => {
        if (!syncReceived) {
          setJoinError("Couldn't reach that room. Make sure you're joining from the same browser as the host (BroadcastChannel doesn't cross devices or browser profiles), then double-check the room code.");
          setRoomCode(null);
          setIsHost(false);
          setParticipants([]);
          setStatus('HOME');
        }
      }, 5000);

      return () => {
        clearTimeout(joinTimeout);
        channel.close();
        channelRef.current = null;
      };
    }

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [roomCode]); // Only rebuild BroadcastChannel when room code changes!

  // Host creates room
  const createRoom = (hostNickname) => {
    const code = generateRoomCode();
    const newUserId = generateUUID();
    setJoinError(null);
    setUserId(newUserId);
    setNicknameState(hostNickname);
    sessionStorage.setItem('ginder_nickname', hostNickname);
    setIsHost(true);
    setRoomCode(code);
    setStatus('LOBBY');
    
    const hostUser = { id: newUserId, nickname: hostNickname, isHost: true, status: 'CONNECTED' };
    setParticipants([hostUser]);
  };

  // Participant joins room
  const joinRoom = (guestNickname, code) => {
    const cleanCode = code.toUpperCase().trim();
    const newUserId = generateUUID();
    setJoinError(null);
    setUserId(newUserId);
    setNicknameState(guestNickname);
    sessionStorage.setItem('ginder_nickname', guestNickname);
    setIsHost(false);
    setRoomCode(cleanCode);
    setStatus('LOBBY');

    const guestUser = { id: newUserId, nickname: guestNickname, isHost: false, status: 'CONNECTED' };
    setParticipants([guestUser]);
  };

  // Leave room or close session
  const leaveRoom = () => {
    // If Host, delete from active public list
    if (isHost && roomCode) {
      try {
        const rawRooms = localStorage.getItem('ginder_public_rooms');
        if (rawRooms) {
          let rooms = JSON.parse(rawRooms);
          rooms = rooms.filter(r => r.code !== roomCode);
          localStorage.setItem('ginder_public_rooms', JSON.stringify(rooms));
        }
      } catch (e) {}
    }

    // Reset hook states
    setRoomCode(null);
    setIsHost(false);
    setParticipants([]);
    setStatus('HOME');
    setWinner(null);
    setRestaurants([]);
    setSwipeVotes({});
    setBracketMatches([]);
    setBracketVotes({});
    setCurrentMatchIndex(0);
    setBotsEnabled(false);
    setTieBreak(null);

    // Clear session storage
    sessionStorage.removeItem('ginder_session_state');
  };

  // Update Settings (Host only)
  const updateSettings = (newSettings) => {
    if (!isHost) return;
    setSettings(newSettings);
    broadcast('SETTINGS_UPDATED', newSettings);
  };

  // Toggle Simulator Bots (Host only)
  const toggleBots = (enable) => {
    if (!isHost) return;
    setBotsEnabled(enable);
    
    if (enable) {
      const mockBots = [
        { id: 'bot1', nickname: 'Alice 👩‍🦰', isHost: false, status: 'CONNECTED', isBot: true },
        { id: 'bot2', nickname: 'Bob 👨‍💻', isHost: false, status: 'CONNECTED', isBot: true },
        { id: 'bot3', nickname: 'Charlie 👱‍♂️', isHost: false, status: 'CONNECTED', isBot: true }
      ];
      setParticipants((prev) => {
        const withoutBots = prev.filter(p => !p.id.startsWith('bot'));
        return [...withoutBots, ...mockBots];
      });
    } else {
      setParticipants((prev) => prev.filter(p => !p.id.startsWith('bot')));
    }
  };

  // Start Swiping Round (Host only)
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

  const getCuratedMatches = () => masterRestaurants.filter(r => {
    const matchCategory = r.tags.some(t => settings.categories.includes(t));
    const dist = getDistanceKm(settings.latitude, settings.longitude, r.latitude, r.longitude);
    return matchCategory && dist <= settings.distance;
  });

  const beginSwipingWith = (selected) => {
    setStatus('SWIPING');
    setRestaurants(selected);
    setSwipeVotes({});
    setWinner(null);
    setBracketMatches([]);
    setBracketVotes({});
    setCurrentMatchIndex(0);
    setTieBreak(null);

    broadcast('STATUS_CHANGED', { status: 'SWIPING', restaurants: selected });
  };

  const startSwipingWithCuratedData = () => {
    const filtered = getCuratedMatches();

    if (filtered.length === 0) {
      alert("No restaurants match your selected categories and distance range! Please adjust your settings before starting.");
      return;
    }

    if (filtered.length < settings.cardLimit) {
      alert(`Only ${filtered.length} matching restaurants found for your current criteria. Swiping will proceed with ${filtered.length} cards.`);
    }

    beginSwipingWith(filtered.slice(0, settings.cardLimit));
  };

  // Start Swiping Round (Host only). Fetches live nearby places from
  // OpenStreetMap when settings.dataSource is 'live', falling back to the
  // curated dataset if the live lookup fails or comes back empty.
  const startSwiping = async () => {
    if (!isHost) return;

    if (settings.dataSource !== 'live') {
      startSwipingWithCuratedData();
      return;
    }

    setIsFetchingLive(true);
    setLiveDataError(null);
    try {
      const liveResults = await fetchNearbyRestaurants({
        latitude: settings.latitude,
        longitude: settings.longitude,
        distanceKm: settings.distance,
        limit: settings.cardLimit,
      });
      beginSwipingWith(liveResults.slice(0, settings.cardLimit));
    } catch (err) {
      setLiveDataError(`${err.message} Falling back to curated picks.`);
      startSwipingWithCuratedData();
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Submit Swipe Votes
  const submitSwipeVotes = (votes) => {
    setSwipeVotes((prev) => {
      const next = { ...prev, [userId]: votes };
      broadcast('SWIPES_SUBMITTED', { userId, votes });
      return next;
    });

    setStatus('WAITING');
  };

  // Auto-simulate bot swipes when host finishes or waits
  useEffect(() => {
    if (status === 'WAITING' && isHost && botsEnabled) {
      const botIds = ['bot1', 'bot2', 'bot3'];
      const nextSwipeVotes = { ...swipeVotes };
      let changed = false;

      botIds.forEach(botId => {
        if (!nextSwipeVotes[botId] && participants.find(p => p.id === botId)) {
          const botVotes = {};
          restaurants.forEach(r => {
            botVotes[r.id] = Math.random() > 0.4;
          });
          nextSwipeVotes[botId] = botVotes;
          changed = true;
          broadcast('SWIPES_SUBMITTED', { userId: botId, votes: botVotes });
        }
      });

      if (changed) {
        setSwipeVotes(nextSwipeVotes);
      }
    }
  }, [status, isHost, botsEnabled, swipeVotes, participants, restaurants]);

  // Aggregate results (Host only, once everyone is done)
  useEffect(() => {
    if (!isHost || status !== 'WAITING') return;

    const activeParticipants = participants;
    const allDone = activeParticipants.every(p => swipeVotes[p.id]);

    if (allDone && activeParticipants.length > 0) {
      const likeCounts = {};
      restaurants.forEach(r => {
        likeCounts[r.id] = 0;
        activeParticipants.forEach(p => {
          if (swipeVotes[p.id]?.[r.id]) {
            likeCounts[r.id]++;
          }
        });
      });

      const totalMembers = activeParticipants.length;
      const unanimousRestaurants = restaurants.filter(r => likeCounts[r.id] === totalMembers);

      if (unanimousRestaurants.length === 1) {
        setWinner(unanimousRestaurants[0]);
        setStatus('WINNER');
        broadcast('MATCH_RESOLVED', {
          matches: [],
          currentIndex: 0,
          bracketVotes: {},
          winner: unanimousRestaurants[0],
          status: 'WINNER'
        });
      } else if (unanimousRestaurants.length > 1) {
        // Bracket sizes only go up to 8 seeds — if more dishes were unanimous
        // than that (everyone has identical scores), randomly cap to 8.
        const bracketCandidates = pickTopSeeds(unanimousRestaurants, likeCounts, 8);
        generateBracketTournament(bracketCandidates, likeCounts);
      } else {
        const sortedByVotes = [...restaurants]
          .filter(r => likeCounts[r.id] > 0)
          .sort((a, b) => likeCounts[b.id] - likeCounts[a.id]);

        const topCandidates = pickTopSeeds(sortedByVotes, likeCounts, 8);

        if (topCandidates.length === 0) {
          const fallback = restaurants.slice(0, 4);
          generateBracketTournament(fallback, likeCounts);
        } else if (topCandidates.length === 1) {
          setWinner(topCandidates[0]);
          setStatus('WINNER');
          broadcast('MATCH_RESOLVED', {
            matches: [],
            currentIndex: 0,
            bracketVotes: {},
            winner: topCandidates[0],
            status: 'WINNER'
          });
        } else {
          generateBracketTournament(topCandidates, likeCounts);
        }
      }
    }
  }, [isHost, status, swipeVotes, participants, restaurants]);

  // Pick the top N seeds from a vote-sorted list. If there's a tie for the
  // last qualifying spot(s), randomly choose among the tied candidates so
  // ties at the cutoff boundary don't unfairly favor array order.
  const pickTopSeeds = (sortedByVotes, likeCounts, n) => {
    if (sortedByVotes.length <= n) return sortedByVotes;

    const cutoffScore = likeCounts[sortedByVotes[n - 1].id];
    const clearlyIn = sortedByVotes.filter(r => likeCounts[r.id] > cutoffScore);
    const tiedAtCutoff = sortedByVotes.filter(r => likeCounts[r.id] === cutoffScore);

    const slotsLeft = n - clearlyIn.length;
    const shuffledTied = [...tiedAtCutoff].sort(() => Math.random() - 0.5);
    const chosenFromTie = shuffledTied.slice(0, slotsLeft);

    return [...clearlyIn, ...chosenFromTie].sort((a, b) => likeCounts[b.id] - likeCounts[a.id]);
  };

  // Generate Single Elimination Bracket
  const generateBracketTournament = (candidates, originalLikes) => {
    let size = 2;
    if (candidates.length > 4) size = 8;
    else if (candidates.length > 2) size = 4;

    const paddedCandidates = [...candidates];
    while (paddedCandidates.length < size) {
      paddedCandidates.push(null);
    }

    const matches = [];
    if (size === 8) {
      matches.push(createMatch('Q1', paddedCandidates[0], paddedCandidates[7], originalLikes));
      matches.push(createMatch('Q2', paddedCandidates[1], paddedCandidates[6], originalLikes));
      matches.push(createMatch('Q3', paddedCandidates[2], paddedCandidates[5], originalLikes));
      matches.push(createMatch('Q4', paddedCandidates[3], paddedCandidates[4], originalLikes));
    } else if (size === 4) {
      matches.push(createMatch('S1', paddedCandidates[0], paddedCandidates[3], originalLikes));
      matches.push(createMatch('S2', paddedCandidates[1], paddedCandidates[2], originalLikes));
    } else {
      matches.push(createMatch('F1', paddedCandidates[0], paddedCandidates[1], originalLikes));
    }

    let resolvedMatches = [...matches];
    resolvedMatches = autoResolveByes(resolvedMatches);

    // Find the first unresolved match (skip byes)
    const firstUnresolvedIdx = resolvedMatches.findIndex(m => m.winner === null);
    const startIdx = firstUnresolvedIdx !== -1 ? firstUnresolvedIdx : 0;

    setBracketMatches(resolvedMatches);
    setCurrentMatchIndex(startIdx);
    setBracketVotes({});
    setStatus('BRACKET');

    broadcast('MATCH_RESOLVED', {
      matches: resolvedMatches,
      currentIndex: startIdx,
      bracketVotes: {},
      status: 'BRACKET',
      winner: null
    });
  };

  const createMatch = (matchId, r1, r2, originalLikes) => {
    return {
      id: matchId,
      restaurant1: r1,
      restaurant2: r2,
      votes1: 0,
      votes2: 0,
      winner: null,
      originalScore1: r1 ? (originalLikes[r1.id] || 0) : -1,
      originalScore2: r2 ? (originalLikes[r2.id] || 0) : -1,
    };
  };

  const autoResolveByes = (matches) => {
    return matches.map(m => {
      if (!m.restaurant1) {
        return { ...m, winner: m.restaurant2, votes2: 1 };
      }
      if (!m.restaurant2) {
        return { ...m, winner: m.restaurant1, votes1: 1 };
      }
      return m;
    });
  };

  // Submit Bracket Vote (Single match)
  const submitBracketVote = (restaurantId) => {
    const activeMatch = bracketMatches[currentMatchIndex];
    if (!activeMatch) return;

    setBracketVotes((prev) => {
      const nextMatchVotes = {
        ...(prev[activeMatch.id] || {}),
        [userId]: restaurantId
      };
      const next = { ...prev, [activeMatch.id]: nextMatchVotes };
      broadcast('BRACKET_VOTE_SUBMITTED', { userId, matchId: activeMatch.id, restaurantId });
      return next;
    });
  };

  // Simulate bot bracket voting
  useEffect(() => {
    const activeMatch = bracketMatches[currentMatchIndex];
    if (!activeMatch || status !== 'BRACKET') return;

    if (isHost && botsEnabled) {
      const botIds = ['bot1', 'bot2', 'bot3'];
      const nextBracketVotes = { ...bracketVotes };
      const currentMatchVotes = nextBracketVotes[activeMatch.id] || {};
      let changed = false;

      botIds.forEach(botId => {
        if (!currentMatchVotes[botId] && participants.find(p => p.id === botId)) {
          const options = [activeMatch.restaurant1?.id, activeMatch.restaurant2?.id].filter(Boolean);
          if (options.length > 0) {
            const voteOption = options[Math.floor(Math.random() * options.length)];
            currentMatchVotes[botId] = voteOption;
            changed = true;
            broadcast('BRACKET_VOTE_SUBMITTED', { userId: botId, matchId: activeMatch.id, restaurantId: voteOption });
          }
        }
      });

      if (changed) {
        setBracketVotes({
          ...bracketVotes,
          [activeMatch.id]: currentMatchVotes
        });
      }
    }
  }, [bracketMatches, currentMatchIndex, status, isHost, botsEnabled, bracketVotes, participants]);

  // Finalize a resolved match: advance to next tier or crown the champion.
  // Runs on the Host, either immediately (clear vote) or after the
  // tie-break flash animation completes (tied vote).
  const finalizeMatchResolution = (matchId, v1, v2, matchWinner) => {
    const freshState = stateRef.current;
    const idx = freshState.bracketMatches.findIndex(m => m.id === matchId);
    if (idx === -1) return;

    const updatedMatches = freshState.bracketMatches.map((m, i) => {
      if (i === idx) {
        return { ...m, votes1: v1, votes2: v2, winner: matchWinner };
      }
      return m;
    });

    setTieBreak(null);
    const finishedTier = updatedMatches.every(m => m.winner !== null);

    if (finishedTier) {
      if (updatedMatches.length > 1) {
        // Generate next tier matches
        const nextCandidates = updatedMatches.map(m => m.winner);
        const nextMatches = [];
        const nextTierLength = updatedMatches.length / 2;

        let nextTierId = 'F';
        if (nextTierLength === 4) nextTierId = 'Q';
        else if (nextTierLength === 2) nextTierId = 'S';

        for (let i = 0; i < nextCandidates.length; i += 2) {
          nextMatches.push({
            id: `${nextTierId}${Math.floor(i / 2) + 1}`,
            restaurant1: nextCandidates[i],
            restaurant2: nextCandidates[i + 1],
            votes1: 0,
            votes2: 0,
            winner: null,
            originalScore1: nextCandidates[i] ? (nextCandidates[i].originalScore1 || 0) : 0,
            originalScore2: nextCandidates[i + 1] ? (nextCandidates[i + 1].originalScore2 || 0) : 0,
          });
        }

        let resolvedNextMatches = autoResolveByes(nextMatches);
        const firstUnresolvedIdx = resolvedNextMatches.findIndex(m => m.winner === null);
        const nextStartIdx = firstUnresolvedIdx !== -1 ? firstUnresolvedIdx : 0;

        setBracketMatches(resolvedNextMatches);
        setCurrentMatchIndex(nextStartIdx);
        setBracketVotes({});

        broadcast('MATCH_RESOLVED', {
          matches: resolvedNextMatches,
          currentIndex: nextStartIdx,
          bracketVotes: {},
          status: 'BRACKET',
          winner: null,
          tieBreak: null
        });
      } else {
        // Finals complete!
        setWinner(matchWinner);
        setStatus('WINNER');
        broadcast('MATCH_RESOLVED', {
          matches: updatedMatches,
          currentIndex: idx,
          bracketVotes: freshState.bracketVotes,
          winner: matchWinner,
          status: 'WINNER',
          tieBreak: null
        });
      }
    } else {
      // Find next unresolved match (skips byes in current tier)
      const firstUnresolvedIdx = updatedMatches.findIndex(m => m.winner === null);
      if (firstUnresolvedIdx !== -1) {
        setBracketMatches(updatedMatches); // Update matches list with the winner of this match!
        setCurrentMatchIndex(firstUnresolvedIdx);
        broadcast('MATCH_RESOLVED', {
          matches: updatedMatches,
          currentIndex: firstUnresolvedIdx,
          bracketVotes: freshState.bracketVotes,
          winner: null,
          status: 'BRACKET',
          tieBreak: null
        });
      }
    }
  };

  // Host checks if all votes are in for the active matchup
  useEffect(() => {
    if (!isHost || status !== 'BRACKET') return;

    const activeMatch = bracketMatches[currentMatchIndex];
    if (!activeMatch) return;

    // A tie-break flash animation is already running for this match — let
    // its timeout call finalizeMatchResolution when the animation ends.
    if (tieBreak && tieBreak.matchId === activeMatch.id) return;

    const activeParticipants = participants;
    const currentMatchVotes = bracketVotes[activeMatch.id] || {};
    const allVoted = activeParticipants.every(p => currentMatchVotes[p.id]);

    if (allVoted && activeParticipants.length > 0) {
      let v1 = 0;
      let v2 = 0;
      activeParticipants.forEach(p => {
        if (currentMatchVotes[p.id] === activeMatch.restaurant1.id) v1++;
        else if (currentMatchVotes[p.id] === activeMatch.restaurant2.id) v2++;
      });

      if (v1 === v2) {
        // Tied! Run the flashing decider animation on every client, then
        // settle on the host-chosen random winner once it finishes.
        const matchWinner = Math.random() > 0.5 ? activeMatch.restaurant1 : activeMatch.restaurant2;
        const tieBreakPayload = { matchId: activeMatch.id, finalWinnerId: matchWinner.id, startedAt: Date.now() };
        setTieBreak(tieBreakPayload);
        broadcast('TIE_BREAK_START', tieBreakPayload);

        setTimeout(() => {
          finalizeMatchResolution(activeMatch.id, v1, v2, matchWinner);
        }, TIE_BREAK_DURATION_MS);
        return;
      }

      const matchWinner = v1 > v2 ? activeMatch.restaurant1 : activeMatch.restaurant2;
      finalizeMatchResolution(activeMatch.id, v1, v2, matchWinner);
    }
  }, [isHost, status, bracketMatches, currentMatchIndex, bracketVotes, participants, tieBreak]);

  // Restart Session (Host only)
  const resetSession = () => {
    if (!isHost) return;
    setStatus('LOBBY');
    setWinner(null);
    setRestaurants([]);
    setSwipeVotes({});
    setBracketMatches([]);
    setBracketVotes({});
    setCurrentMatchIndex(0);
    setTieBreak(null);

    broadcast('STATUS_CHANGED', { status: 'LOBBY' });
  };

  return {
    userId,
    nickname,
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
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    toggleBots,
    startSwiping,
    submitSwipeVotes,
    submitBracketVote,
    resetSession,
  };
};
