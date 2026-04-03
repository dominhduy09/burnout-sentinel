# Build Plan

## Phase 1: Define the Prototype

Start with a lightweight version that proves the concept.

- Input weekly tasks
- Input sleep and stress estimates
- Calculate a burnout risk score
- Display schedule warnings
- Provide simple planning suggestions

## Phase 2: Choose the Data Strategy

Pick one of these approaches:

### Option A: Simulated Data

Fastest for a prototype. Create realistic weekly schedules with labels such as low, medium, or high burnout risk.

### Option B: Student Survey Data

Ask students about weekly tasks, sleep, stress, and workload. This is stronger for research, but it takes more time and may need mentor guidance.

### Option C: Hybrid Approach

Start with simulated data, then improve the model later using real survey responses.

## Phase 3: Build the ML Model

Start with simple models:

- logistic regression
- decision tree
- random forest

Inputs may include:

- number of tasks
- estimated task hours
- exam count
- clinical hours
- average sleep
- self-reported stress
- free time

Output:

- low burnout risk
- medium burnout risk
- high burnout risk

## Phase 4: Build the App

Recommended starter stack:

- Frontend: React or Next.js
- API: FastAPI or Flask
- ML: Python and scikit-learn
- Storage: SQLite or local JSON during prototyping

## Phase 5: Add Smart Suggestions

Once the risk score works, add recommendation logic.

Simple version:

- rule-based suggestions

Advanced version:

- LLM-generated personalized weekly advice

## Phase 6: Evaluate the Prototype

Questions to answer:

- Does the tool correctly flag overloaded weeks?
- Do students understand the recommendations?
- Would students actually use it every week?

## Suggested Minimum Viable Product

Your MVP only needs:

- a weekly task input screen
- a risk score output
- one dashboard or chart
- one recommendation panel

## Strong Future Features

- drag-and-drop weekly planning
- trend chart across multiple weeks
- reminder notifications
- wellness streak tracking
- integration with Canvas or calendar exports

