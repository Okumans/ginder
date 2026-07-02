# Project Specification Description: AraiKeeDai (อะไรก็ได้)

**Tagline:** No more "Whatever" when choosing where to eat!

---

## 1. Project Overview

### Project Name and Tagline
- **Name:** AraiKeeDai (อะไรก็ได้)
- **Tagline:** No more "Whatever" when choosing where to eat!

### Problem Statement
When groups of friends decide to go out for a meal or hang out, they often run into a common roadblock: the indecisiveness of the participants. When asked what they want to eat, many friends respond with "Arai Kee Dai" (Thai for "Anything" or "Whatever"). This leads to wasted time, frustration, and social friction.

### Solution Summary
AraiKeeDai is a web-based prototype designed to make group restaurant selection fun, interactive, and quick. By utilizing a Tinder-like swiping mechanic for restaurant cards and a bracket-style tournament system for ties or top choices, AraiKeeDai helps groups reach a consensus in minutes.

---

## 2. Goals and Objectives

### Primary Goals
- Provide a responsive, high-performance web prototype that allows a group of friends to quickly decide on a restaurant.
- Solve indecisiveness by combining swiping mechanics and interactive voting tournaments.

### Secondary Goals
- Provide a highly engaging user experience with vibrant typography, fluid animations, and visual food cards.
- Support simulation of multiple users so a single tester can experience the group dynamic.

### Success Metrics (KPIs)
- **Time to decision:** Reducing decision time for a group of 4 from 15+ minutes to under 3 minutes.
- **User Engagement:** 100% completion of room voting rounds.
- **UX Satisfaction:** High visual appeal and smooth swiping experience (measured by prototype feedback).

---

## 3. Target Audience

### Primary Users
- **Group of friends (18-35 years old):** Tech-savvy individuals, university students, and young working professionals who frequently dine out together and struggle with group decisions.

### Secondary Users
- **Families or Couples:** Looking to decide on a quick meal without endless discussions.

---

## 4. Scope Summary

### Core Features (In-Scope)
- **Room Creation:** Host can create a room and configure settings:
  - Location/Zone
  - Distance limit (slider/input)
  - Categories (Buffet, A La Carte, Single Dish, Dessert, etc.)
  - Round duration (swiping time limit)
  - Number of cards to swipe
- **Room Code Sharing:** Sharing a room join code/link for friends to join.
- **Multi-user Simulation / Real-time Lobby:** A lobby where participants join, showing real-time list of members.
- **Tinder-like Swiping Interface:**
  - Swipe card Left (Reject) / Right (Like)
  - Cards show: Restaurant name, image, featured menus with prices/images, tags, description.
- **Consensus & Match Calculation:**
  - Case 1: Single unanimous match → instant winner screen.
  - Case 2: Multiple unanimous matches → Bracket-style voting tournament among matches.
  - Case 3: No unanimous match → Bracket-style voting tournament among top 8 overall liked restaurants (sorted by highest vote count).
- **Bracket Tournament Mode:** Fast-paced pairwise voting round (single elimination) where users vote on matches (e.g. 1st vs 8th, 2nd vs 7th, etc.) until one restaurant wins.

### Nice-to-Have Features (Out-of-Scope for Initial Prototype)
- Integration with live Google Maps API (mock data will be used instead for reliability).
- User registration and persistent profiles (users join with just a nickname).
- Production deployment on custom domain.

---

## 5. Constraints and Assumptions

### Technical Constraints
- The client app must run as a single-page web app built using HTML, CSS, JavaScript (React with Vite).
- Styling must use Vanilla CSS (no Tailwind CSS unless requested) with a dark-mode theme, premium glassmorphism gradients, and smooth animations.
- The state should be managed locally or using a simple client-side mock backend to facilitate easy multi-user simulation in a single browser window (e.g. multi-tab sync via `BroadcastChannel` or a clean multi-perspective simulator panel).

### Assumptions
- Users have internet access and standard modern mobile/desktop web browsers.
- A simulated backend or `BroadcastChannel` synchronization is sufficient to show the multi-user cooperative swiping flow.

---

## 6. High-Level Requirements

### Functional Requirements
- **FR-01:** Host must be able to customize session parameters.
- **FR-02:** Users must be able to join via a room code.
- **FR-03:** Users must see real-time status of other members in the lobby.
- **FR-04:** Users must swipe on cards independently.
- **FR-05:** System must aggregate swipe votes and transition everyone to the result phase simultaneously.
- **FR-06:** System must automatically resolve ties and organize brackets.

### Non-Functional Requirements
- **Performance:** App transition and swiping animations must run at 60fps.
- **Usability:** Touch-friendly swipe gestures for mobile browsers.
- **Aesthetics:** Sleek dark UI with vibrant neon colors, modern typography (Google Fonts - Outfit/Inter), and smooth transition effects.
