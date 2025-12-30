---
trigger: always_on
---

### [PROJECT RULESET: WEB3 SUPPLY CHAIN STABILIZATION]

**Objective:** Complete the Demo Task (Option A) to stabilize the repository and transform it from a "Web2-simulated" demo into a Production-Ready DApp.

**1. ARCHITECTURE RULES**
* **Fix Split-Brain:** Every state update must be initiated on the Blockchain (On-chain). Once confirmed, the MongoDB database (Off-chain) must be synced.
* **Direct Web3 Interaction:** The Frontend must NOT rely solely on the Backend API for blockchain actions. It must use Web3.js to interact directly with the Smart Contract.
* **Data Integrity:** Ensure that the `note` field is stored both in the Smart Contract (for immutability) and MongoDB (for fast querying/indexing).

**2. CODING STANDARDS**
* **Solidity:** * Use Natspec comments for all new functions.
    * Emit clear `Events` for every status update.
    * Ensure security checks (e.g., only authorized roles can update status).
* **Backend (Node.js/Express):** * Implement centralized error handling using try/catch.
    * Match Mongoose schemas with the new Smart Contract data structures.
* **Frontend (React):** * Implement a 3-stage Transaction Feedback: "Sending", "Processing/Pending", and "Confirmed/Failed".
    * Use loading spinners for buttons to prevent multiple clicks during transactions.

**3. STEP-BY-STEP COMMIT STRATEGY**
Provide changes incrementally. For each step, provide the full file code and a **Commit Message** following Conventional Commits standards:
* `feat(contract): update Shipment struct and add updateShipmentStatusWithNote function`
* `feat(backend): update shipment model and sync controller with note field`
* `feat(frontend): implement direct web3 call and add transaction status UI`

**4. INITIAL TASK**
Analyze the current `Supplychain.sol` and apply the necessary changes to implement `updateShipmentStatusWithNote`. 
**Output Required:**
1. Optimized Solidity Code.
2. Technical Summary of changes (why this approach was taken).
3. The specific Commit Message.