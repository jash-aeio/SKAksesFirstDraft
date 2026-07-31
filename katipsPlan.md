# Software Development Plan: Katips (Katipunan Central Hub) - Local Prototype Version

## 1. Project Overview
**Katips** is a hybrid portal (Web and Mobile Application) proposed for the Sangguniang Kabataan (SK). It serves as a centralized hub for the youth, featuring community engagement, transparency, digital services, and a gamified rewards system (SKill Up). 

*Note: This phase focuses on a local-first prototype to validate the concept and architecture before investing in cloud infrastructure.*

---

## 2. Improved System Architecture (Prototype Focus)
Based on the drafted architecture in **IMG_5755.jpg**, here is how the local prototype will function:

### 2.1 User Interface Enhancements
*   **Onboarding & KYC (Know Your Customer):** Mock ID verification process. Uploaded dummy IDs will be saved locally.
*   **Transparency Board:** A UI section to view locally hosted PDFs representing financial reports, resolutions, and SK meeting minutes.
*   **Notification Center:** Local state/polling-based notifications to simulate real-time alerts for forum replies, service request approvals, and SKill Up events.
*   **Gamification Dashboard:** Within "SKill Up", a distinct "My Rewards/Wallet" section to track accumulated points based on local database records.

### 2.2 Admin Interface Enhancements
*   **Role-Based Access Control (RBAC):** Implementation of "Super Admin" and "Moderators" using local JWT authentication.
*   **Dynamic Maintenance Handling:**
    *   *SKill Up Engine:* Prototyped using a dynamic schema (JSONB in local PostgreSQL) so admins can add or edit events on-the-fly.

---

## 3. Technology Stack Selection (Local Environment)
To achieve a single database and synchronized web/app experience locally:
*   **Database:** Local PostgreSQL (via pgAdmin or Docker) or SQLite for rapid prototyping.
*   **Backend (API):** Node.js with Express.js running on `localhost`.
*   **Frontend (Web):** React.js or Next.js running on a local dev server.
*   **Frontend (Mobile):** React Native (using Expo Go) or Flutter. Connecting to the backend via local network IP (e.g., `192.168.x.x`) or a local tunnel like Ngrok.
*   **Storage:** Local file system (e.g., an `/uploads` directory in the backend repository) instead of cloud storage.

---

## 4. Phased Prototype Development Process

### Phase 1: UI/UX Design and Local Setup 
*   **Wireframing:** Create high-fidelity Figma designs for Web and Mobile based on the IMG_5755.jpg draft.
*   **Database Schema:** Design the unified database mapping out Users, Forum Threads, Events, Services, and Points Ledgers.
*   **Environment Setup:** Initialize local Node.js servers, set up local PostgreSQL/SQLite.

### Phase 2: Core Backend & API Prototyping 
*   **Authentication:** Implement JWT (JSON Web Tokens) for local login.
*   **Admin RBAC:** Develop the roles for the SK Council.
*   **Dynamic SKill Up API:** Build the engine for adding events and calculating points.

### Phase 3: Frontend Web & Mobile Prototyping
*   **Web Portal:** Develop the Next.js/React website targeting `localhost` APIs. Implement the Main Page, Community Forum, and Services UI.
*   **Mobile App:** Build the React Native/Flutter app. Ensure it connects to the local backend using the machine's local IP address.
*   **Service Modules:** Build the Printing Services Log and SK Gym Log interfaces.

### Phase 4: Integration & Local Testing
*   **SKill Up Integration:** Tie the frontend to the backend point-allocation system.
*   **Cross-Device Testing:** Test the web version on desktop and the mobile app on a physical device connected to the same local network.
*   **Stakeholder Demo:** Present the fully functional local prototype to the SK Council for feedback and approval before planning the production cloud deployment.