# Product & Engineering Notes — Hotel Guest Assistant

This document details the product design philosophy, UX decisions, AI safety guardrails, architectural boundaries, and production roadmap for **The Grand Azure Resort & Spa** guest assistant.

---

## 1. What Customer Problem Are You Solving?

Prospective and booked hotel guests frequently encounter friction when trying to answer basic questions before booking or during their stay:
- **Phone hold times**: Calling the front desk during peak check-in hours leads to long wait times for simple questions like *"What time does the pool close?"* or *"Is breakfast included in my room?"*
- **Buried information**: Traditional hotel websites bury policies, pet fees, parking rates, and room occupancy limits across multiple subpages and PDF menus.
- **Disconnected availability checks**: Standard booking engines force users through rigid multi-step date pickers without offering context on which room type fits their party (e.g. *"Which room can accommodate 3 adults?"*).
- **24/7 Concierge access**: International travelers in different time zones need immediate, reliable answers at 2:00 AM when concierge staff may be limited.

The **Hotel Guest Assistant** solves this by offering an instant, conversational 24/7 AI concierge that provides factually verified hotel information and executes real-time room availability checks within a single unified chat interface.

---

## 2. What Does the Guest Journey Look Like?

A typical guest interaction follows this step-by-step path:

1. **Discovery & Welcome**:
   - The guest lands on the hotel website. The assistant welcomes them with a friendly greeting and displays clickable **Quick Inquiries** pills (`Check-in time`, `Swimming pool`, `Rooms for 3 guests`, `Check availability`).
2. **Exploratory FAQ Questions**:
   - The guest asks about amenities (e.g., *"Does the hotel have a pool?"*). The assistant replies with verified details (heated rooftop infinity pool, ocean views, open 6 AM - 10 PM, cabanas and towels included).
3. **Conversational Follow-Up & Room Suitability**:
   - The guest asks a contextual follow-up: *"Which room is suitable for three guests?"*
   - The assistant evaluates capacity data and recommends the *Executive Harbor Suite* (King bed + pullout sofa, complimentary breakfast) or the *Deluxe Double Queen Room* (2 Queen beds).
4. **Availability Inquiry (Missing Information)**:
   - The guest types: *"Do you have rooms available next weekend?"*
   - The assistant detects the availability intent, notes that dates and guest count are required, and presents an **inline interactive Stay Details form** pre-configured for easy selection.
5. **Deterministic Availability Evaluation**:
   - The guest submits check-in (`2026-10-15`), check-out (`2026-10-18`), and `3 guests`.
   - The backend deterministic engine checks capacity, computes nights (3 nights), and returns available rooms with total price calculations ($780 for Deluxe Double Queen, $1,140 for Executive Suite). Deluxe King is cleanly marked as unavailable with a badge indicating *"Exceeds max room capacity (2 guests max)"*.
6. **Action & Confirmation**:
   - The guest clicks **"Select Room"** on their preferred room card to place a hold, completing the inquiry-to-booking path smoothly.

---

## 3. Why Did You Design the Frontend Experience the Way You Did?

### Inline Interactive Form vs. Persistent Modal/Sidebar Panel
We specifically selected an **inline interactive form embedded directly within the chat message stream** rather than a disconnected modal or sidebar panel.

**Rationale**:
1. **Conversational Continuity**: When an assistant says *"To check availability, please provide your dates and party size"*, having the form appear right below that message feels natural and intuitive. Moving the user to a modal or opening a sidebar breaks the conversational flow.
2. **Context Preservation**: The inline form maintains the chronological record of what the guest asked and what was returned.
3. **Pre-population**: When the guest has already mentioned partial information (e.g. *"Rooms for 3 guests"*), the inline form automatically pre-selects `3 Guests`, leaving only the date fields for the user to complete.
4. **Mobile Optimization**: On mobile devices, sidebars require screen toggling and modals often obscure the virtual keyboard. An inline chat widget scrolls naturally with the user's thumb.

### Rich Availability Cards vs. Raw Text Output
Instead of printing raw text lists like `"Deluxe King is $220/night, Double Queen is $260..."`, availability is presented as **clean, visual cards**:
- **Visual badges**: Green for `Available`, subtle rose/slate for `Unavailable`.
- **Transparent math**: Displays both nightly rate and computed total stay cost (`$380 / night · $1,140 total (3 nights)`).
- **Key amenities**: Highlighted as tags (e.g., `Ocean View`, `Complimentary Breakfast`, `Nespresso Machine`).
- **Clear refusal reasons**: When a room is not suitable, it states exactly why (e.g. *"Exceeds max room capacity"*).

---

## 4. Which Parts Use AI and Which Parts Remain Deterministic, and Why?

| Component | Architecture | Justification |
| :--- | :--- | :--- |
| **Natural Language Understanding (NLU)** | **AI (Groq / Llama 3.3 70B)** | Humans express queries in diverse ways (*"Can me and my two buddies crash here?"* vs *"Triple occupancy rates"*). LLMs excel at parsing nuances, slang, typos, and conversational context. |
| **Tool / Parameter Extraction** | **AI (Tool-Calling Schema)** | Extracting dates and guest counts from varied phrasing (*"from this Friday for 3 nights with my spouse"*) is best handled via structured function calling. |
| **Knowledge Base Grounding** | **AI (Strict System Prompt)** | Answering open-ended FAQ inquiries about parking, pets, and quiet hours with a warm, hospitable luxury brand tone. |
| **Room Inventory & Availability** | **Deterministic (Code Logic)** | **NEVER AI**. Large language models cannot reliably track inventory, calculate dates, or guarantee accurate pricing. Deterministic code guarantees consistency, zero hallucinations, and business rule enforcement. |
| **Capacity & Occupancy Rules** | **Deterministic (Code Logic)** | If a room has `maxOccupancy: 2` and the guest requests `adults: 3`, deterministic code immediately flags it as unavailable. |
| **Date Validation & Price Math** | **Deterministic (Code Logic)** | Arithmetic operations (`nights = checkOut - checkIn`, `total = price * nights`) must be 100% mathematically correct. |
| **Conversation Memory** | **Deterministic (Map / Sliding Window)** | Predictable, bounded in-memory sliding window preventing token bloat. |

---

## 5. What Can Go Wrong with the AI Response?

1. **Hallucination of Non-Existent Amenities**: The model might promise airport shuttles, free champagne, or late check-outs not offered by the property.
2. **Intent Misclassification**: The model could mistake an informational question (*"Do your rooms have cribs?"*) as an immediate booking request, or miss an availability intent embedded in narrative text.
3. **Date Hallucination / Misinterpretation**: Miscalculating *"next weekend"* or confusing MM-DD with DD-MM formats.
4. **Stale Data**: If prices or policies change in the hotel operations system, the model could quote obsolete rates if the knowledge base is not updated.
5. **Prompt Injection / Jailbreaking**: Malicious users asking the assistant to ignore hotel rules, discount rooms to $1, or act as an unrestricted chatbot.

---

## 6. How Do You Prevent Hallucinations and Unsupported Answers?

1. **Retrieve-Then-Generate Grounding (RAG Pipeline)**:
   - Instead of stuffing the entire raw knowledge base into the prompt, the system utilizes a semantic vector retrieval index (`knowledgeIndexService`). The model only sees top-k (k=4) relevant chunks rather than the entire knowledge base, significantly reducing attention drift over irrelevant text and keeping context focused.
   - **Similarity Threshold Gate (0.15)**: If semantic cosine similarity for all indexed chunks falls below 0.15, the system determines the query has no relevant ground truth and bypasses the LLM call entirely, returning an immediate, deterministic out-of-scope fallback response.
   - **Self-RAG Verification Pass**: For complex multi-hop or edge-case queries, the pipeline can execute a secondary entailment check that scores whether the candidate answer is strictly supported by the retrieved source chunks before emitting the final response to the user.
2. **Tool-Gated Availability**:
   - The model is explicitly forbidden from generating availability or pricing claims in raw prose. It must invoke `checkAvailability`.
3. **Structured Missing Field Detection**:
   - If required parameters are missing, the model invokes `requestMissingAvailabilityFields` rather than assuming default dates or inventing a guest count.
4. **Deterministic Fallback Engine**:
   - When running offline or if the model produces an ambiguous response, the system falls back to a deterministic semantic matcher directly bound to `hotel-data.json`.
5. **Low Temperature Setting**:
   - Set to `temperature: 0.1` on Groq to maximize factual determinism and eliminate creative liberties.

---

## 7. What Happens When the Model, Frontend API Call, or Dependencies Fail?

### 1. Upstream AI / Groq API Outage
- **Catch & Protect**: The backend `aiService` wraps all LLM calls in `try...catch` blocks.
- **Graceful Degradation**: Instead of crashing or returning a 500 error, it returns:
  ```json
  {
    "reply": "I am having a brief connection issue with our service. Please feel free to ask your question again, or contact our front desk at +1 (831) 555-0199 for immediate help.",
    "intent": "fallback",
    "conversationId": "..."
  }
  ```
- **Tested in Jest**: Scenario 9 explicitly simulates client failure and verifies zero server crashes.

### 2. Frontend-to-Backend Network Failure / Timeout
- **Timeout Protection**: The frontend uses `AbortController` with a 15-second timeout.
- **Visual Alert Banner**: If the backend is unreachable or the network drops, a clear rose-colored banner appears at the top of the chat: *"Message delivery failed — Unable to connect to the hotel concierge backend."*
- **One-Click Retry**: The failed user message renders with an inline **"Retry"** button that re-dispatches the exact message once connectivity resumes.

---

## 8. How Would You Measure if This Feature Is Actually Useful?

To evaluate real-world product and business impact, we would track these key metrics:

| Metric | Target | Description |
| :--- | :--- | :--- |
| **Inquiry Resolution Rate** | `> 82%` | Percentage of guest sessions that end without escalating to front desk phone/email. |
| **Availability-to-Booking Conversion** | `> 18%` | Percentage of guests who run an availability check and click "Select Room" to begin reservation. |
| **Tool Invocation Accuracy** | `> 96%` | Precision of the LLM invoking `checkAvailability` when availability intent is present. |
| **Fallback Rate** | `< 7%` | Percentage of queries triggering the fallback response (identifies gaps in hotel knowledge). |
| **P95 Latency** | `< 1,200ms` | End-to-end response time (Groq Llama 3.3 70B typically achieves ~300-600ms). |
| **Guest Satisfaction (CSAT)** | `> 4.6 / 5.0` | In-chat thumbs up / thumbs down prompt after conversation completion. |
| **Front Desk Call Deflection** | `-35%` | Reduction in repetitive front desk phone inquiries during peak hours. |

---

## 9. Known Limitations & Production Readiness Roadmap

While this implementation fulfills all requirements for the take-home assignment, the following enhancements are planned before deploying to a multi-property enterprise production environment:

### Immediate Enhancements
1. **Streaming Responses (SSE)**:
   - Stream tokens via Server-Sent Events for instant typing perception on longer policy answers.
2. **Persistent Storage (PostgreSQL + Redis)**:
   - Replace in-memory conversation storage with Redis session caching (TTL: 24h) and PostgreSQL for audit logs and analytics.
3. **State Graph Orchestration (LangGraph)**:
   - For production, we would model this multi-step pipeline (classify intent → retrieve chunks → ground check → generate or fallback) as a LangGraph state graph to make each transition explicit, observable, and retryable with checkpointed state.
4. **RAG Vector Search for Large Resort Portfolios**:
   - For resorts with hundreds of pages of menus, spa treatments, conference room floorplans, and golf course guides, replace in-memory vector index with a distributed vector database (e.g. pgvector or Pinecone) performing hybrid semantic retrieval with BM25 reranking.

### Enterprise & Security Guardrails
4. **Rate Limiting & Abuse Prevention**:
   - Implement `express-rate-limit` (e.g., 30 requests/minute per IP) to prevent DDoS or API quota depletion.
5. **Real PMS / CRS Integration**:
   - Connect `availabilityService` to the hotel's real Property Management System (e.g., Opera PMS, Amadeus, or Mews) via secure webhooks.
6. **Multi-Language Localization**:
   - Add automated language detection and translation support for international travelers (Spanish, French, Mandarin, Japanese, German).
7. **Direct Booking Checkout Flow**:
   - Integrate Stripe / hotel payment gateway to finalize room reservations directly within the concierge flow.
