# AgriConnect

A web application that connects smallholder farmers directly with buyers (households, hotels,
schools and exporters). Farmers list produce, buyers search and order, administrators approve
accounts and listings and move orders through Placed, Confirmed, Dispatched and Delivered.

## Framework and tools
- Node.js with Express (back end)
- SQLite database through better-sqlite3
- HTML, CSS and JavaScript (front end)
- bcrypt, express-session and Helmet for security

## Environment variables
| Name | Purpose | Example |
| --- | --- | --- |
| PORT | Port the server listens on | 3000 |
| NODE_ENV | development or production | production |
| SESSION_SECRET | Long random string that signs session cookies | (generate one) |
| ADMIN_EMAIL | Email of the first administrator | admin@example.com |
| ADMIN_PASSWORD | Password of the first administrator | (choose a strong one) |
| SEED_DEMO | Set to true to add demo produce when the database is empty | true |

Copy .env.example to .env and fill in real values. Never commit .env.

## Setup instructions
1. Install Node.js 18 or newer and Git.
2. Clone the repository: git clone https://github.com/joepavinmuturi-dotcom/agriconnect.git
3. Go into the folder: cd agriconnect
4. Install dependencies: npm install
5. Create the .env file from .env.example
6. Start in development: npm run dev (or npm start)
7. Open http://localhost:3000/index.html

## Roles
- Farmer: registers, waits for approval, creates, edits and removes produce listings
- Buyer: searches the catalogue, adds to cart, places orders, prints receipts
- Administrator: approves farmers and listings, views orders, updates order status

## Deployment
Deployed on Render from this GitHub repository.
Build command: npm install
Start command: npm start

## Author
<your name>, Software Developer