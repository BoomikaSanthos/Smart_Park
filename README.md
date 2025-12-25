SmartPark Pro – Smart Parking Management System
SmartPark Pro is a MERN‑stack smart parking system that lets users register, log in, view parking slot availability on a map and grid, and book slots for a specific time range with validation. Admins can manage slots and companies via protected APIs.
​

Features
User authentication & roles

Register with personal + vehicle details (name, email, password, vehicle number, type, phone).

Login with JWT‑based authentication stored in the frontend (localStorage).

Roles: user (booking) and admin (management).
​

Parking slots

Slots stored in MongoDB with fields like slotNumber, isAvailable, state, location, and optional imageUrl.

Seed script to populate initial slots.
​

Map visualization

React page showing a Google Map with slot markers (in dev mode, can show “For development purposes only”).

Slot grid below the map with color‑coded availability (green = available, red = booked).
​

Booking flow

/slots page: select a slot and see basic details.

/book?slotId=... page: enter vehicle number, start time, and end time, then confirm booking.

Frontend checks that endTime is after startTime before sending the request.
​

Admin tools (backend APIs)

Create slots (/api/admin/create-slot).

List users, manage companies, and basic admin dashboard routes.
​

Tech Stack
Frontend

React (Create React App)

React Router DOM

Custom CSS layouts (LandingPage, Auth, SlotsPage)
​

Backend

Node.js, Express

MongoDB & Mongoose models (User, Slot, Company, Booking)

JWT authentication middleware, role‑based access (admin/user)
​

Other

Google Maps JavaScript API (development‑mode map).

dotenv, cors, bcryptjs, jsonwebtoken, nodemon.
​

Project Structure (high level)
text
smart-parking/
  Backend/
    models/
      User.js
      slotModel.js
      Company.js
      bookingModel.js
    routes/
      auth.js
      admin.js
      slotRoutes.js
      company.js
      user.js
      bookings.js
    middleware/
      authMiddleware.js
      admin.js
    seed/
      slotSeeder.js
    server.js
    .env
  frontend/
    src/
      pages/
        LandingPage.jsx
        LoginPage.jsx
        RegisterPage.jsx
        SlotList.jsx
        BookingPage.jsx
        MapPage.jsx (optional)
      components/
        ParkingMap.jsx
        StateGallery.jsx
        SlotGrid / SlotCard (older components, optional)
      styles:
        LandingPage.css
        AuthPages.css
        SlotsPage.css
      App.js
      index.js
    public/
      index.html
    .env
This structure may differ slightly if you renamed or removed some older components.
​

Backend Setup
Install dependencies

bash
cd Backend
npm install
Environment variables

Create Backend/.env:

text
MONGOURI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=secret123   # or any strong secret, must match authMiddleware
In your shared code, secret123 is hardcoded; ideally move it to JWT_SECRET.
​

Run the slot seeder (optional but recommended)

bash
cd Backend
node seed/slotSeeder.js
This inserts sample slots like A1–A4 with isAvailable and state values.
​

Start the backend server

bash
cd Backend
npm run dev
The API will listen on http://localhost:5000.
​

Frontend Setup
Install dependencies

bash
cd frontend
npm install
Environment variables

Create frontend/.env (for Google Maps dev key):

text
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key   # can show 'development only' in dev
Run the frontend

bash
cd frontend
npm start
The React app runs on http://localhost:3000.
​

Core API Endpoints (Backend)
Base URL: http://localhost:5000/api

Auth
POST /auth/register
Body: { name, email, password, vehicleNumber, vehicleType, phone, role }
Response: { message, ... }

POST /auth/login
Body: { email, password }
Response: { message, token }
The token is stored in localStorage in the frontend.
​

Slots
GET /slots/all
Returns all slots; frontend uses this for map and grid.

POST /admin/create-slot (admin only)
Body: { slotNumber, isBooked } → creates new slot with isAvailable based on isBooked.
​

Bookings (example)
POST /bookings (authenticated)
Headers: x-auth-token: <JWT>
Body: { slotId, vehicleNumber, startTime, endTime }
Validations:

All fields required.

endTime must be strictly after startTime.

No overlapping existing booking for the same slot in that time range.
Response: { message: "Booking created", booking } or error message.
​

GET /bookings/my (optional future route)
Returns bookings for the logged‑in user.

Frontend Routes & Flow
Configured in frontend/src/App.js:
​

/ – Landing page (LandingPage.jsx)

Marketing hero with “Get Started” button → /login.

/login – Login page

On success: store JWT in localStorage and redirect to /slots.

/register – Register page

On success: show message then redirect to /login.

/slots – Slot availability page (SlotList.jsx)

Protected: requires token.

Calls GET /api/slots/all.

Shows:

Google map with markers (ParkingMap.jsx).

Grid of slots with color coding.

Side panel with selected slot details and a “Go to Booking” button.

Clicking a slot selects it; clicking “Go to Booking” navigates to:
/book?slotId=<slot_id>.

/book – Booking page (BookingPage.jsx)

Query param slotId identifies the selected slot.

Fetches all slots and finds the one matching slotId to display slot info.

Booking form:

Vehicle number

Start time (datetime-local)

End time (datetime-local)

Client‑side validation:

All fields required

endTime > startTime

On submit:

Sends POST /api/bookings with JWT in x-auth-token.

On success: shows “Booking confirmed” and redirects back to /slots.
​

You may also add a /bookings page later for listing past and upcoming bookings.

How Booking Time Validation Works
Frontend (BookingPage.jsx)

Converts input strings to Date objects.

If isNaN(start) or isNaN(end), shows “Invalid time values.”

If start >= end, shows “End time must be after start time.” and does not hit the API.
​

Backend (routes/bookings.js)

Repeats the same checks for safety.

Checks for an existing Booking on the same slot where the time ranges overlap.

Only if no conflict and time is valid, creates the booking document and can update slot.isAvailable.
​

This double validation prevents any booking with invalid or conflicting times from being saved.

Development Notes & Limitations
Google Maps currently shows “For development purposes only” because the project uses a dev key without billing enabled; this is acceptable for learning but not for productionon deployment.
​

Slot state codes (TN, KA, MH, etc.) are used if you choose to filter slots by state from a “Select Place” gallery component.
​

Error handling is basic; consider adding better messages and handling for network failures and token expiry.

Possible Future Enhancements
Add /bookings page for users to manage and cancel upcoming bookings.

Add true real‑time updates (e.g., websockets or polling) to reflect when slots become free or booked.

Implement admin UI for creating/editing slots, including coordinates and images.

Replace the Google dev map with a fully configured Maps key or a free alternative like Leaflet + OpenStreetMap for deployments withoutwithout billing.
​

How to Run Everything
Start MongoDB (Atlas or local).

In Backend/:

Set .env, run seeder, then npm run dev.

In frontend/:

Set .env with Maps key, then npm start.

Visit http://localhost:3000:

Register a user, log in, view slots, select one on /slots, and complete booking on /book.
​

This README should be a good starting point; tweak wording, add screenshots (like your Parking Slots screen), and update any route names or env variables that differ in your final code.
