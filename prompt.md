Here is the detailed Minimum Viable Product (MVP) specification for Ginder (กินเด้อ). This MVP focuses strictly on the core loop: getting friends into a room, swiping, and finding a place to eat without over-engineering.

---

### **1. MVP Objectives**

* **Core Functionality:** Users can create a room, join via a short code, swipe on a fixed deck of 15 restaurants, and receive a synchronized group decision.
* **Performance:** Real-time state updates with zero noticeable lag between users (using Socket.io).
* **Visual Identity:** Implementation of the `#ffe4e3` (background), `#8c2333` (primary), and `#c75860` (secondary) color scheme, utilizing Comic Sans globally, with flashy swipe animations.

---

### **2. Screen-by-Screen Breakdown**

**1. Home Screen (The Entry Point)**

* **UI:** Minimalist. Large Ginder logo at the top. Two massive, pill-shaped buttons taking up the center of the screen.
* **Actions:**
* **"Create Room" Button:** Generates a 4-digit alphanumeric code (e.g., `A7X2`) and routes the host to the Lobby.
* **"Join Room" Input Field:** A 4-digit text input and a "Join" button. Routes the user to the Lobby.



**2. The Lobby**

* **UI:** Displays the giant Room Code at the top. Below it, a grid of "Joined Members" showing their custom usernames (e.g., "HungryBoy", "SomtumQueen").
* **Actions:**
* **Name Input:** Upon entering, users are prompted: "Who are you?" to set their display name.
* **Start Button:** Only visible to the Host. Clicking "Start Dinner Selection" pushes all connected clients in the room to the Swipe Screen.



**3. The Swipe Screen (The Core Experience)**

* **UI:** A Tinder-style stack of cards in the center of the screen. Each card displays the restaurant image, name, and category.
* **Animations:** Framer Motion handles the physics. Dragging right overlays a green "YUM" stamp; dragging left overlays a red "NOPE" stamp. Card flies off-screen upon release.
* **Actions:** Swipe Left (Reject) or Swipe Right (Accept).
* **Progress:** A simple progress bar at the bottom (e.g., "5/15").

**4. The Waiting Room**

* **UI:** A pulsing, simple loading screen that appears immediately after a user swipes their 15th card.
* **Text:** "Waiting for your slow friends to finish..." paired with a live counter (e.g., "3/5 people finished").

**5. The Verdict / Sudden Death**

* **Scenario A (Unanimous Winner):** The screen explodes with CSS confetti. The winning restaurant card is displayed dead center with a "Let's Eat!" button (which simply closes the app/returns home).
* **Scenario B (Sudden Death):** If no restaurant gets 100% right swipes, the UI flashes a red "SUDDEN DEATH" banner. The top 2 restaurants (most right-swiped by total count) are displayed side-by-side. Users tap their preferred option. The server tallies the live votes and declares the winner once everyone has tapped.

---

### **3. Technical Scope & Real-Time Events**

To keep this strictly in-memory and real-time, your custom Node.js + Socket.io server will need to handle the following exact event flow.

| Event Name | Direction | Payload Description | Purpose |
| --- | --- | --- | --- |
| `create_room` | Client -> Server | Host ID | Server creates a 4-digit code and initializes the room object. |
| `room_created` | Server -> Client | Room Code | Sends the generated code back to the Host. |
| `join_room` | Client -> Server | Code, Username | Adds a user to the room's participant array. |
| `player_joined` | Server -> Room | User List Array | Updates the Lobby screen for everyone currently in the room. |
| `start_swiping` | Host -> Server | Room Code | Host triggers the start of the game. |
| `game_started` | Server -> Room | 15 Restaurant Objects | Sends the randomized mock data to all clients so they have the exact same deck. |
| `submit_swipes` | Client -> Server | Array of Liked IDs | Fired when a user finishes their deck. |
| `match_result` | Server -> Room | Winner Object OR Null | Fired when the final user submits. Null triggers Sudden Death. |
| `sudden_death_vote` | Client -> Server | Chosen Restaurant ID | Sends the user's 1v1 battle choice to the server. |

---

### **4. Out of Scope for MVP (Do Not Build Yet)**

To ensure the MVP is built quickly and remains simple, the following features are strictly excluded:

* **Persistent Database:** No MongoDB, PostgreSQL, or Prisma. Everything dies when the server restarts.
* **Authentication:** No NextAuth, Google Sign-in, or passwords. Nicknames only.
* **Real Restaurant APIs:** No Google Places or Yelp API integration. We rely 100% on the 30 hardcoded Thai restaurants in the `restaurants.json` file.
* **Complex Brackets:** Sudden death is limited to a single 1v1 battle between the top 2 choices, rather than a full 8-team tournament bracket.
* **Location/Distance Filtering:** The app assumes everyone in the room is willing to go to any of the 15 randomly selected mock restaurants.

---

### **5. Deployment Strategy**

Because this MVP requires a custom Node.js server to run Socket.io (which keeps the WebSockets alive), standard serverless deployments (like Vercel's default tier) will drop the socket connections.

* **Hosting:** Deploy the MVP to **Render**, **Railway**, or **Heroku** using a standard Node.js environment.
* **Build Command:** `next build`
* **Start Command:** `node server.js` (Your custom server file that wraps the Next app).
