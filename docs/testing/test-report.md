# AgriConnect Test Report

Tester: <name>   Date: <date>   Build: git commit <run: git rev-parse --short HEAD>

## 1. Summary
| Module | Cases run | Passed | Failed |
| --- | --- | --- | --- |
| Registration/Login | | | |
| Produce Catalogue | | | |
| Checkout | | | |
| Security | | | |
| Usability/Compatibility | | | |

## 2. Defects found
| Defect ID | Module | Expected result | Actual result | Steps to reproduce | Severity | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| D-01 | Registration/Login | Server starts and login works | Server crashes on start with SyntaxError in routes/auth.js | 1. Run npm run dev | Critical | screenshots/d01-error.png |
| D-02 | Checkout | Order is placed and receipt shown | Error: no such table: products | 1. Login as buyer 2. Add item to cart 3. Press Place order | High | screenshots/d02-error.png |
| D-03 | Checkout | 3 x KES 80 = KES 240 | Total shows KES 80 | 1. Add 3 kg tomatoes 2. Place order 3. Check receipt | High | screenshots/d03-receipt.png |

D-01 to D-03 are the deliberately introduced faults. Replace or add rows for any real defects.

## 3. Sign-off
All defects fixed and re-tested: Yes / No. Remaining risks: <write here>




## AgriConnect Debugging Techniques

| ID | Type | Edit to Introduce It | What You See | How to Trace It | Correction |
|---|---|---|---|---|---|
| D-01 | **Syntax Error** (code breaks language rules) | In `routes/auth.js`, in the login route, delete the closing bracket so the line becomes `return res.status(401).json({ error: 'Invalid email or password' };` | `npm run dev` stops with a SyntaxError and prints the file name and line number. | Read the first lines of the terminal error, open that file and line, and look for the missing bracket. | Put the `)` back: `...password' });` |
| D-02 | **Runtime Error** (valid code that fails while running) | In `routes/orders.js`, inside the `place` transaction, change `FROM produce WHERE id = ? AND approved = 1` to `FROM products WHERE id = ? AND approved = 1`. | Server starts, but placing an order shows `no such table: products`. | Open DevTools, Network tab, click the failed POST `/api/orders` request, read the response. Then search the code for `products` and compare with `schema.sql`. | Restore the real table name `produce`. |
| D-03 | **Logical Error** (runs without error but gives the wrong result) | In `routes/orders.js`, change `total += p.price * qty;` to `total += p.price;`. | No error anywhere, but an order of 3 items is charged for 1. | Add `console.log('qty', qty, 'price', p.price, 'total', total);` inside the loop, place an order and read the terminal. The total does not grow with quantity. | Restore `total += p.price * qty;` and remove the `console.log`. |