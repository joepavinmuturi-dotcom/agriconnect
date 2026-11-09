## AgriConnect Software Testing

| No. | Testing Type | Purpose for AgriConnect | Registration | Catalogue | Checkout |
|---|---|---|---|---|---|
| 1 | Unit Testing | Check one small piece of code on its own, such as the password rule or the order total calculation. | Yes | No | Yes |
| 2 | Functional Testing | Confirm each feature does what the requirement says: register, search produce, place an order. | Yes | Yes | Yes |
| 3 | Integration Testing | Confirm the front end, the API and the database work together, for example a form saving a row in the database. | Yes | Yes | Yes |
| 4 | Input Validation Testing | Confirm empty, wrong or oversized data is rejected on both the client and the server. | Yes | Yes | Yes |
| 5 | Security Testing | Confirm SQL injection, weak passwords and unauthorised access are blocked. | Yes | No | Yes |
| 6 | Usability Testing | Confirm farmers and buyers can finish their tasks easily, including on a phone. | Yes | Yes | Yes |
| 7 | Compatibility Testing | Confirm pages display and work correctly on different browsers and screen sizes. | Yes | Yes | Yes |
| 8 | Regression Testing | After a fix, re-run earlier tests to confirm nothing else broke. | Yes | Yes | Yes |
| 9 | User Acceptance Testing | Confirm the finished system meets the client's stated requirements. | Yes | Yes | Yes |



## AgriConnect Software Testing

| Testing Type               | Purpose for AgriConnect | Applies To |
|----------------------------|---|---|
| Unit Testing               | Check one small piece independently, for example the password rule or price total calculation. | Registration, Checkout |
| Functional Testing         | Confirm each feature does what the requirement says (register, search, order). | Registration, Catalogue, Checkout |
| Integration Testing        | Confirm the frontend, API and database work together (form to API to database row). | All Three |
| Security Testing           | Confirm SQL injection, weak passwords and unauthorised access are blocked. | Registration/Login |
| Usability Testing          | Confirm farmers and buyers can complete tasks easily on a phone. | Catalogue, Checkout |
| Compatibility Testing      | Confirm pages work on different browsers and screen sizes. | Catalogue |
| Validation (Input) Testing | Confirm bad or empty data is rejected on both client and server sides. | Registration, Produce Listing, Checkout |
| Regression Testing         | After a fix, re-run earlier tests to confirm nothing else broke. | All Three |
| User Acceptance Testing    | Confirm the finished system meets the client's stated requirements. | All Three |