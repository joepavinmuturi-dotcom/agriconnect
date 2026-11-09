# AgriConnect Test Plan

Prepared by: <your name>      Date: <today>      Version: 1.0

## 1. Scope
In scope: Registration/Login, Produce Catalogue (search, filter, detail), Checkout (cart and order placement, receipt).
Out of scope: Hosting, performance under heavy load, email delivery.

## 2. Objectives
- Verify each module meets the functional requirements.
- Verify input validation, authentication and SQL injection protection.
- Verify the pages are usable on phone and desktop in two browsers.
- Find, fix and re-test defects, and record the results.

## 3. Test environment
- Hardware: <PC model, RAM>
- Operating system: <Windows 10/11 or Ubuntu>
- Server: Node.js <run node -v>, Express, SQLite database file
- Browsers: Google Chrome <version>, Mozilla Firefox <version>
- Screen sizes: 375 px (phone) and 1280 px (desktop)
- URL: http://localhost:3000
- Test accounts: admin@agriconnect.local, farmer1@test.com, buyer1@test.com

## 4. Test cases to be covered
Functional: TC-R1 to TC-R4 (registration), TC-C1 to TC-C3 (catalogue), TC-O1 to TC-O4 (checkout)
Security: TC-S1 to TC-S6
Usability and compatibility: TC-U1 to TC-U4

## 5. Expected results
Each case lists its expected result in the test case table. A case passes only if the actual result matches exactly.

## 6. Schedule
| Activity | Time |
| --- | --- |
| Prepare test data and accounts | 15 min |
| Functional tests | 40 min |
| Security tests | 30 min |
| Usability and compatibility tests | 30 min |
| Defect fixing and regression | 60 min |
| Test report | 45 min |

## 7. Pass / fail criteria
Pass = actual equals expected. Any failed critical case (login, order total, stock) must be fixed and re-tested before sign-off.



## AgriConnect Test Cases

| ID | Module | Type | Steps and Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-R1 | Registration | Positive | Register Name Test Buyer, email buyer2@test.com, password Buyer1234, role Buyer. | Success message, user saved, can log in. |  |  |
| TC-R2 | Registration | Negative | Register again with the same email buyer2@test.com. | Error: email already registered. |  |  |
| TC-R3 | Registration | Boundary | Password Abc1234 (7 characters). | Rejected: password needs 8+ characters with a letter and number. |  |  |
| TC-R4 | Registration | Negative | Leave name empty and submit. | Rejected with a validation message. |  |  |
| TC-L1 | Login | Positive | Login buyer1@test.com / Buyer123. | Redirected to catalogue, name shown in menu. |  |  |
| TC-L2 | Login | Negative | Login with a wrong password. | Error: invalid email or password, no login. |  |  |
| TC-C1 | Catalogue | Positive | Search Tomatoes (produce exists and is approved). | Only matching produce shown. |  |  |
| TC-C2 | Catalogue | Negative | Search zzzzzz. | Message: no produce matches your search. |  |  |
| TC-C3 | Catalogue | Boundary | Max price filter equal to the exact price of an item (for example 80). | Item with price 80 is included. |  |  |
| TC-O1 | Checkout | Positive | Add 2 kg tomatoes, place order as buyer. | Order saved, receipt shows correct total (2 x price), stock reduced by 2. |  |  |
| TC-O2 | Checkout | Boundary | Order exactly the full remaining stock. | Order accepted, stock becomes 0. |  |  |
| TC-O3 | Checkout | Negative | Order 1 more than the available stock. | Error: only N left, no order created. |  |  |
| TC-O4 | Checkout | Negative | Place an order while logged out, or as a farmer. | Redirected to login, or message that only buyers can order. |  |  |