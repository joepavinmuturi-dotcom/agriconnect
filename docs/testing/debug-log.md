# Debugging Log

## D-03 Order total wrong
- Type: Logical error
- Module: Checkout (routes/orders.js)
- Symptom: Order of 3 x KES 80 shows KES 80 on the receipt
- Debugging action: Added console.log of qty, price and total in the order loop; placed a test order
- Evidence: screenshots/d03-terminal.png (qty 3, total stays 80)
- Cause: line `total += p.price;` ignored the quantity
- Source change: `total += p.price;` changed to `total += p.price * qty;` (commit <hash>)
- Final verification: TC-O1 passed, receipt shows KES 240; regression on TC-O1 to TC-O4 all pass, no new defects