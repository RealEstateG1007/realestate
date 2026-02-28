# 📋 RealEstate Connect — Master TODO List

> Derived from `prd doc.txt` and `design doc.txt`

---

## Phase 1: Foundation & Setup (Months 1–2)

### Project Setup
- [ ] Initialize Node.js + Express.js project
- [ ] Configure MongoDB / PostgreSQL database
- [ ] Set up project folder structure (routes, controllers, models, middleware)
- [ ] Configure environment variables (.env)
- [ ] Set up Git repository & branching strategy

### Authentication & User Management (Module 1)
- [ ] **U1** — Role-based registration (Buyer / Seller / Agent) `P0`
- [ ] **U3** — Profile management (photo, phone, contact method, agent license) `P0`
- [ ] **U4** — JWT authentication (login, signup, token refresh) `P0`
- [ ] **U4** — OAuth 2.0 integration (Google, Facebook login) `P0`
- [ ] **A2** — Admin: user suspension & dispute resolution `P0`
- [ ] Design role-based dashboard views per user type

### Database Schema Design
- [ ] Users collection/table (roles, profile, KYC status)
- [ ] Properties collection/table (details, media, status, geo)
- [ ] Messages collection/table (threads, read receipts)
- [ ] Offers collection/table (status history, linked property)
- [ ] Admin/analytics data models

---

## Phase 2: Listings & Search — MVP Launch (Months 3–4)

### Property Listing Management (Module 2)
- [ ] **L1** — Listing creation wizard (step-by-step form) `P0`
- [ ] **L3** — Rich media upload (up to 20 images, virtual tour links) `P0`
- [ ] **L5** — Listing status management (Draft → Published → Pending → Sold/Rented) `P0`
- [ ] **L2** — AI-generated listing descriptions via LLM `P1`
- [ ] **L4** — Geo-tagging with map plotting & privacy controls `P1`

### Discovery & Search (Module 3)
- [ ] **S1** — Advanced search filters (price, BHK, location, amenities, pet policy) `P0`
- [ ] **S4** — Interactive map view with property pins `P1`
- [ ] **S5** — Saved searches & email/push alerts for new matches `P1`
- [ ] **S2** — AI natural language search (LLM parses queries to filters) `P1`
- [ ] **S3** — Personalized recommendations (ML-based) `P2`

### MVP Launch Checklist
- [ ] Deploy backend (REST APIs)
- [ ] Deploy frontend (React / Next.js)
- [ ] End-to-end testing of listing + search flow
- [ ] Performance testing (listings load < 2s, search < 1.5s)

---

## Phase 3: Communication & AI Features (Months 5–6)

### Communication (Module 4)
- [ ] **C1** — In-app real-time messaging with Socket.io + read receipts `P0`
- [/] **C2** — AI chatbot assistant (RAG: property context + LLM) `P1`
- [ ] **C3** — Smart viewing scheduler (calendar integration, AI slot suggestions) `P1`

### AI / GenAI Integration
- [x] Set up LLM API integration (OpenAI GPT or similar)
- [x] Build prompt engineering templates for listing descriptions
- [x] Implement RAG pipeline for chatbot (retrieve property data → feed to LLM)
- [x] NLP search parser (extract intent → map to DB filters)

---

## Phase 4: Transactions & Verification (Months 7–8)

### Transactions
- [ ] **C4** — Digital offer submission (accept / reject / counter) `P1`
- [ ] **C5** — AI deal summaries for agents `P2`
- [ ] **C6** — Secure document repository (sale deeds, agreements) `P2`

### Verification & Trust
- [ ] **U2** — KYC / Identity verification integration (e.g., Stripe Identity) `P1`
- [ ] Display verification badges on profiles & listings

### Admin Panel (Module 5)
- [ ] **A1** — Listing moderation (flag & review suspicious listings) `P0`
- [ ] **A3** — Analytics dashboard (metrics, AI-driven insights) `P1`

---

## Non-Functional & Cross-Cutting

### Security
- [ ] HTTPS / TLS 1.3 everywhere
- [ ] Encrypt PII at rest and in transit
- [ ] JWT token refresh rotation
- [ ] Role-based access control middleware
- [ ] GDPR: hide seller contact until chat initiated

### Performance & Scalability
- [ ] Image optimization (lazy loading, CDN, compression)
- [ ] Support 10,000 concurrent users
- [ ] Set up AWS S3 / Cloudinary for media storage
- [ ] Elasticsearch or MongoDB Atlas Search for filtering

### Responsive & PWA
- [ ] Mobile-responsive layouts
- [ ] PWA setup (service worker, manifest)

---

## Design Doc Tasks (ARKO Website)

- [ ] Complete Visual Design Analysis (Section 2) — colors, typography, imagery
- [ ] Finalize color palette & typography choices
- [ ] Create header & navigation component
- [ ] Build hero section (full-width image/video + tagline + CTA)
- [ ] Build "About" / intro section (experience, philosophy)
- [ ] Build featured projects portfolio (grid/carousel)
- [ ] Build services section with icons
- [ ] Build CTA section ("Contact Us Now")
- [ ] Build footer (links, social media, copyright)
- [ ] Mobile responsive pass (hamburger menu, stacked layout)
- [ ] Image performance optimization

---

## Document Cleanup
- [ ] Consolidate the two PRD versions into one clean document
- [ ] Align design doc with PRD (decide if same or separate projects)
- [ ] Add API endpoint specifications
- [ ] Add database schema diagrams
