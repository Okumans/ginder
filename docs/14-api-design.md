# API Design (BroadcastChannel Events): AraiKeeDai (อะไรก็ได้)

Since the AraiKeeDai prototype utilizes the browser's `BroadcastChannel` API to sync rooms locally in real-time, this document defines the event schema.

---

## 1. Channel Name Convention

Each session uses a unique BroadcastChannel based on the 4-letter room code:
```javascript
const channel = new BroadcastChannel(`araikeedai-room-${roomCode}`);
```

---

## 2. Event Payload Schema

### 2.1. Member Joined (`MEMBER_JOINED`)
Broadcasted by a participant when they enter the lobby.
```json
{
  "type": "MEMBER_JOINED",
  "payload": {
    "id": "uuid-v4-string",
    "nickname": "JohnDoe",
    "isHost": false
  }
}
```

### 2.2. Settings Updated (`SETTINGS_UPDATED`)
Broadcasted by the host when updating room configurations.
```json
{
  "type": "SETTINGS_UPDATED",
  "payload": {
    "zone": "Siam Square",
    "distance": 8,
    "categories": ["Thai", "Japanese", "Buffet"],
    "cardLimit": 10,
    "timerLimit": 60
  }
}
```

### 2.3. Start Swiping (`START_SWIPING`)
Broadcasted by the host to move everyone to the swiping view.
```json
{
  "type": "START_SWIPING",
  "payload": {
    "restaurants": [
      {
        "id": "r1",
        "name": "Siam Buffet",
        "image_url": "...",
        "description": "Premium sushi and beef",
        "price_level": "฿฿฿",
        "tags": ["Japanese", "Buffet"],
        "featured_menus": [...]
      }
    ]
  }
}
```

### 2.4. Swipe Submitted (`SWIPE_SUBMITTED`)
Broadcasted by a participant when they finish swiping or the timer expires.
```json
{
  "type": "SWIPE_SUBMITTED",
  "payload": {
    "participantId": "uuid-v4-string",
    "votes": {
      "r1": true,
      "r2": false,
      "r3": true
    }
  }
}
```

### 2.5. Bracket Vote Cast (`BRACKET_VOTE_CAST`)
Broadcasted by a participant during the tournament round.
```json
{
  "type": "BRACKET_VOTE_CAST",
  "payload": {
    "participantId": "uuid-v4-string",
    "matchId": "R1-M1",
    "restaurantId": "r1"
  }
}
```
