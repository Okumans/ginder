# Use Cases: Ginder (อะไรก็ได้)

This document outlines the detailed use cases for the Ginder prototype.

---

## UC-001: Create and Configure Room

**Actor(s):** Host (Primary), System (Secondary)  
**Description:** The host creates a new session, configures the settings, and generates a room code.  

### Preconditions:
- The Host is on the Ginder web application home page.

### Postconditions:
- A new room is registered, and the Host is placed in the lobby.

### Main Flow (Happy Path):
1. **Host** clicks on the "Create Room" button.
2. **System** displays the "Lobby Setup" page, requesting the Host's nickname.
3. **Host** inputs their nickname and adjusts room settings (Zone, Distance, Categories, Card Limit, Timer).
4. **Host** clicks "Start Room".
5. **System** initializes a unique 4-character room code, registers the Host as the room creator, and redirects the Host to the room lobby showing the code and settings.

### Alternative Flows:
- **UC-001-Alt-1: Keep Default Settings**
  - At step 3, if the Host does not change any settings, the default configurations (Zone: "Bangkok", Distance: 5km, Categories: All, Card Limit: 10, Timer: 60s) are used.

---

## UC-002: Join Room and Wait in Lobby

**Actor(s):** Participant (Primary), Host (Secondary), System (Secondary)  
**Description:** A participant enters a room code to join an active lobby and waits for the Host to start.  

### Preconditions:
- An active room lobby exists with a valid room code.
- The Participant is on the home page.

### Postconditions:
- The Participant is joined to the room and displayed in the lobby.

### Main Flow (Happy Path):
1. **Participant** enters the 4-character room code and their nickname, then clicks "Join Room".
2. **System** validates the room code, matches it with an active room, and adds the Participant.
3. **System** updates the lobby view for all connected members, showing the Participant's name in the active users list.
4. **Participant** waits in the lobby.
5. **Host** clicks "Start Swiping".
6. **System** transitions all room members to the Swiping Screen simultaneously.

### Exception Flows:
- **UC-002-Ex-1: Invalid Room Code**
  - At step 2, if the room code does not exist or is inactive:
    1. **System** displays an error: "Room not found. Please verify the code."
    2. **Participant** is kept on the home page.

---

## UC-003: Swiping Restaurant Cards

**Actor(s):** User (Host/Participant), System  
**Description:** Users swipe left or right on restaurant cards until the card limit is reached or time runs out.  

### Preconditions:
- The session has been started by the Host.
- Users are on the Swiping Screen.

### Postconditions:
- User votes are recorded. Users enter the "Waiting for others" screen.

### Main Flow (Happy Path):
1. **System** displays the first restaurant card containing: Name, image, featured menus with prices/images, tags, description, and countdown timer.
2. **User** swipes the card Right (like) or clicks "Like".
3. **System** records the vote as a `Yes` and slides the next card into view.
4. **User** repeats swiping until the card limit is reached.
5. **System** transitions the User to the waiting room.

### Alternative Flows:
- **UC-003-Alt-1: Dislike**
  - At step 2, if the user swipes Left or clicks "Dislike", the system records the vote as a `No` and advances to the next card.
- **UC-003-Alt-2: Timer Expires**
  - At any step, if the timer counts down to 0:
    1. **System** stops swiping, records whatever votes have been made, and transitions the user to the waiting room.

---

## UC-004: Resolve Ties & Bracket Tournament

**Actor(s):** User (Host/Participant), System  
**Description:** If there is no single unanimous winner, users participate in a knockout bracket tournament to select a restaurant.  

### Preconditions:
- All users have finished swiping.
- No single unanimous winner exists.

### Postconditions:
- A final winner restaurant is chosen and displayed.

### Main Flow (Happy Path):
1. **System** aggregates votes and finds multiple restaurants with high scores (or no unanimous votes, leading to the top 8 restaurants).
2. **System** generates a single-elimination tournament bracket and displays matchup 1 (e.g. Seed 1 vs Seed 8).
3. **Users** vote for their preferred restaurant in the matchup.
4. **System** waits for all users to vote or for the timer to expire, and then advances the winner (restaurant with most votes) to the next round.
5. **System** repeats steps 3-4 for all matchups until the championship round is completed.
6. **System** displays the final winner restaurant with a congratulatory animation and location details.

### Exception Flows:
- **UC-004-Ex-1: Bracket Vote Tie**
  - At step 4, if a matchup results in a tie:
    1. **System** resolves the tie automatically by selecting the restaurant that had the higher swiping score in the initial round. If still tied, it picks randomly.
