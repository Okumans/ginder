# Function List: Ginder (อะไรก็ได้)

This document contains a structured inventory of the application functions.

---

## 1. Room & Membership Management

### FN-1.1: CreateRoom
- **Actor:** Group Host
- **Input:** Host Nickname
- **Output:** Room Code, Host Participant ID
- **Description:** Generates a new unique room session and assigns the host.

### FN-1.2: ConfigureRoom
- **Actor:** Group Host
- **Input:** Zone, Distance, Categories, Card Limit, Timer
- **Output:** Updated Room Settings
- **Description:** Host can modify settings which instantly sync to the lobby.

### FN-1.3: JoinRoom
- **Actor:** Participant
- **Input:** Room Code, Participant Nickname
- **Output:** Participant ID, Room State
- **Description:** Validates code, registers nickname, and redirects user to lobby.

### FN-1.4: BroadcastLobbyState
- **Actor:** System
- **Input:** Room ID
- **Output:** Lobby updates (list of members, active settings)
- **Description:** Sends state updates to all joined users in real-time.

---

## 2. Card Swiping Flow

### FN-2.1: StartSwipingSession
- **Actor:** Group Host
- **Input:** Room ID
- **Output:** Status change → `SWIPING`
- **Description:** Transitions all users in the room to the swiping screen.

### FN-2.2: GetRestaurantCards
- **Actor:** System
- **Input:** Room Settings (Zone, Categories, Card Limit)
- **Output:** Array of Restaurant Card Objects
- **Description:** Filters the master restaurant database using host parameters and returns the configured number of cards.

### FN-2.3: RecordSwipeVote
- **Actor:** User (Host/Participant)
- **Input:** Room ID, Participant ID, Restaurant ID, Vote (Like/Dislike)
- **Output:** Success status
- **Description:** Stores individual swipes.

### FN-2.4: CompleteSwiping
- **Actor:** User / System (Timer)
- **Input:** Participant ID
- **Output:** Status change → `SWIPING_DONE`
- **Description:** Marks the user as done and redirects them to a waiting screen.

---

## 3. Consensus Resolution & Tournaments

### FN-3.1: CalculateSwipeConsensus
- **Actor:** System
- **Input:** Room ID
- **Output:** Result Action (Direct Winner OR Tournament Bracket)
- **Description:** Tally all user swipes.
  - If exactly 1 restaurant receives unanimous "Yes" votes → Direct Winner.
  - If multiple restaurants are unanimous, or if none are → generates a bracket.

### FN-3.2: GenerateBracket
- **Actor:** System
- **Input:** Room ID, Match Data (Swipe tallies)
- **Output:** Matches Array with Seedings
- **Description:**
  - Case A (multiple unanimous): Generates bracket for all unanimous restaurants.
  - Case B (no unanimous): Takes top 8 restaurants (by total "Yes" counts) and seeds them: 1st vs 8th, 2nd vs 7th, 3rd vs 6th, 4th vs 5th.

### FN-3.3: SubmitBracketVote
- **Actor:** User (Host/Participant)
- **Input:** Room ID, Participant ID, Match ID, Restaurant ID (Voted choice)
- **Output:** Success status
- **Description:** Registers bracket matchup votes in real-time.

### FN-3.4: ResolveBracketMatch
- **Actor:** System
- **Input:** Match ID
- **Output:** Winning restaurant of the matchup
- **Description:** Sums votes for the match. If there is a tie, breaks it using the original swiping score (or a coin toss if still tied).

### FN-3.5: DisplayFinalWinner
- **Actor:** System
- **Input:** Winner Restaurant ID
- **Output:** UI Celebration Screen
- **Description:** Renders the final winning restaurant card with menu highlights and map links.
