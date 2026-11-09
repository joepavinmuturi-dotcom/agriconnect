## AgriConnect Security Testing

| ID | Test | How to Run It | Expected Result |
|---|---|---|---|
| TC-S1 | Input Validation | Register with email `abc` and with a 61-character name. | Both rejected with a clear message (client and server). |
| TC-S2 | SQL Injection on Login | Run the SQL injection test snippet. | Error: invalid email or password. No login and no database error shown. |
| TC-S3 | Weak Password Handling | Register with password `12345678`, then password. | Both rejected (need a letter and number, 8+ characters). |
| TC-S4 | Password Storage | Open the SQLite file or run the password verification query. | Passwords are bcrypt hashes starting with `$2`, never plain text. |
| TC-S5 | Authentication and Access Control | Without logging in, open `http://localhost:3000/api/admin/stats`. Then log in as a buyer and open it again. | First: `401 Please log in`. Second: `403 Access denied`. |
| TC-S6 | Session and XSS | Register with name `<script>alert(1)</script>`, then log in. | No popup. The name shows as plain text. Logout destroys the session. |

## AgriConnect Compatibility and Usability Testing

| ID | Check | Chrome 375 px | Chrome 1280 px | Firefox 375 px | Firefox 1280 px |
|---|---|---|---|---|---|
| TC-U1 | Layout: cards reflow, nothing overlaps. |  |  |  |  |
| TC-U2 | Navigation: menu button works on phone, all links reachable. |  |  |  |  |
| TC-U3 | Interaction: search, filter and View Details buttons work. |  |  |  |  |
| TC-U4 | Readability: text size and button size easy to read and tap. |  |  |  |  |