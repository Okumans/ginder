# User Stories: AraiKeeDai (อะไรก็ได้)

This document contains user stories detailing user actions, benefits, and acceptance criteria.

---

## Epic 1: Room Creation & Setup (Host)

### Story ID: US-001 - Host Room Creation
**As a** Group Host  
**I want** to create a new session room  
**So that** I can invite my friends to decide where to eat.  

**Acceptance Criteria:**
- **Given** I am on the home page, **when** I click "Create Room", **then** the system generates a unique 4-character room code (e.g. `X8Y2`) and prompts me to enter my nickname.
- **Given** I have entered my nickname, **when** I proceed, **then** I am taken to the Room Lobby as the Host.

### Story ID: US-002 - Host Room Configuration
**As a** Group Host  
**I want** to customize room parameters (zone, distance, categories, card limit, timer)  
**So that** the recommendations match our preferences.  

**Acceptance Criteria:**
- **Given** I am in the lobby, **when** I view the settings panel, **then** I can set:
  - Location/Zone (text input)
  - Distance limit (slider from 1km to 15km)
  - Food Categories (checkboxes: Thai, Japanese, Italian, Buffet, Dessert, Fast Food)
  - Swipe Timer limit (30s, 60s, 90s, or unlimited)
  - Card Limit (5, 10, 15, or 20 cards)
- **Given** I modify these settings, **when** I click "Update Settings", **then** all other participants in the lobby see the updated settings in real-time.

---

## Epic 2: Room Joining & Lobby (Participants)

### Story ID: US-003 - Join Room
**As a** Group Friend (Participant)  
**I want** to join a room using a code shared by the host  
**So that** I can participate in the restaurant selection.  

**Acceptance Criteria:**
- **Given** I am on the home page, **when** I input a valid 4-character code and my nickname, **then** I am successfully added to the room lobby.
- **Given** I input an invalid room code, **when** I submit, **then** the system displays an error message.

### Story ID: US-004 - Room Lobby Sync
**As a** Room Member  
**I want** to see who else is in the room  
**So that** I know when everyone is ready.  

**Acceptance Criteria:**
- **Given** I am in the room lobby, **when** other friends join, **then** their nicknames appear in the lobby user list dynamically.
- **Given** I am a Participant, **then** I cannot start the voting round; only the Host sees the "Start Swiping" button.

---

## Epic 3: Swiping Experience

### Story ID: US-005 - Tinder Swiping Interface
**As a** Room Member  
**I want** to swipe restaurant cards left (no) or right (yes)  
**So that** I can express my individual restaurant preferences.  

**Acceptance Criteria:**
- **Given** the swiping round starts, **when** a restaurant card is displayed, **then** I can drag it left or click the "No" button, or drag it right or click the "Yes" button.
- **Given** a card is shown, **when** I look at it, **then** it displays the name, image, description, average price range, tags, and 3 featured menu items.
- **Given** I swipe a card, **then** the next card transitions smoothly into view.

### Story ID: US-006 - Swiping Timer
**As a** Room Member  
**I want** to see a countdown timer during the swiping round  
**So that** I know how much time is left to make my choices.  

**Acceptance Criteria:**
- **Given** the host set a timer, **when** the swiping round starts, **then** a visual timer counts down.
- **Given** the timer reaches 0, **when** I have not finished swiping, **then** my current swipes are submitted, and I am taken to the waiting screen.

---

## Epic 4: Consensus & Tournament Resolver

### Story ID: US-007 - Match Resolution
**As a** Room Member  
**I want** the system to check if there is an immediate unanimous winner  
**So that** we can proceed to dine.  

**Acceptance Criteria:**
- **Given** all members have finished swiping, **when** exactly one restaurant gets a "Yes" from everyone, **then** that restaurant is shown as the Winner.
- **Given** no restaurants get unanimous votes or multiple do, **then** the system triggers the tournament bracket.

### Story ID: US-008 - Bracket Voting Tournament
**As a** Room Member  
**I want** to vote in a single-elimination tournament between competing restaurants  
**So that** we can narrow down our final choice.  

**Acceptance Criteria:**
- **Given** a tournament is triggered, **when** a matchup is presented (e.g. Restaurant A vs Restaurant B), **then** I can vote for one of them.
- **Given** all members vote on the current matchup, **then** the restaurant with the most votes advances to the next round, and a live bracket diagram is updated.
- **Given** there is a tie in bracket votes, **then** the system breaks the tie (either randomly or by host preference) to select a winner.
- **Given** the final round completes, **then** the winner is displayed with options to view maps/directions.

---

## Epic 5: Resiliency & Public Room Exploration

### Story ID: US-009 - Session Reload Resilience
**As a** Room Member  
**I want** the system to remember my session details if I accidentally refresh the page  
**So that** I don't lose my progress or get kicked out of the active room.  

**Acceptance Criteria:**
- **Given** I am in an active room lobby, swiping round, or tournament round, **when** I refresh the browser, **then** the app automatically restores my nickname, room code, role, and current state.
- **Given** I have refreshed, **when** I connect back to the BroadcastChannel, **then** my state syncs with other users dynamically.

### Story ID: US-010 - Active Public Rooms Listing
**As a** Dining Group Friend  
**I want** to see a list of currently active public rooms on the Home screen  
**So that** I can join my friends' rooms easily without manually typing the code.  

**Acceptance Criteria:**
- **Given** I am on the home page, **when** active host sessions exist in the system, **then** they are displayed in a real-time "Active Public Rooms" list with Host name, active zone, and player count.
- **Given** I click "Join" on a public room, **then** the room code is automatically populated, and I am focused on the nickname input field.
