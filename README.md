# Dwaarper

Dwaarper is a full-stack MERN service-booking application. Customers can discover services, choose a date and time, select an available professional, pay through Stripe, and track each booking through its lifecycle.

## Implemented Features

### Authentication and profiles

- Email/password signup and login with bcrypt-hashed passwords and JWT authentication.
- Optional Google OAuth login through Passport.js.
- Profile completion with location, phone number, and address.
- Profile editing, authenticated account lookup, and explicit account deletion.
- Protected routes for profile, cart, bookings, and booking details.

### Service discovery and booking

- Service data loaded from MongoDB and displayed through searchable, filterable service screens.
- Multi-step booking journey for service selection, date/time selection, professional selection, and confirmation.
- Professional availability checks based on service capability, working hours, booking duration, and existing booking conflicts.
- Paid bookings waiting for assignment reserve capacity, so the cart prevents multiple customers from taking the same final professional slot.
- Cancelled services release their professional slot immediately, even when other services remain in the same order.
- Responsive landing page sections for the booking journey, service benefits, and navigation.

### Cart and payments

- Authenticated cart retrieval, add, update, remove, and clear operations.
- Booking-specific date, time, duration, and professional details stored with cart items.
- Stripe Checkout session creation, payment verification, and cancelled-payment handling.

### Booking management

- Booking history with upcoming, completed, and cancelled filters plus pagination.
- Booking detail view with service, professional, schedule, payment, and status information.
- Individual service cancellation while the booking is in a cancellable status.
- Lifecycle service that assigns available professionals immediately after payment and retries every five seconds for existing paid bookings.
- Multi-service bookings assign different professionals when simultaneous capacity is available.
- Payment verification updates only booking header fields, preventing duplicate verification requests from overwriting lifecycle assignments.
- Statuses include `confirmed`, `assigning`, `assigned`, `on_the_way`, `arrived`, `in_progress`, `completed`, and `cancelled`.

### Supporting pages and UX

- Contact form with server-side validation and MongoDB persistence.
- About, privacy policy, and terms and conditions pages.
- Success, cancelled-payment, not-found, back-to-top, toast, and responsive states.
- Favicon assets and custom CSS/Tailwind configuration.

## Requirements

- [Node.js](https://nodejs.org/) 14 or newer
- A MongoDB database
- Stripe account and secret key for checkout
- Google Cloud OAuth credentials if Google login is enabled

## Installation and Setup

Clone the repository and install dependencies for both applications:

```bash
git clone https://github.com/DkDash10/dwaarper.git
cd dwaarper

cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`. The MongoDB connection currently uses the configured database user and `MONGO_PASSWORD`:

```env
PORT=5000
MONGO_PASSWORD=your_mongodb_password
JWT_SECRET=replace_with_a_long_random_secret
SESSION_SECRET=replace_with_a_long_random_session_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
FRONTEND_URL=http://localhost:3000

# Optional Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Never commit `.env` files or real credentials. `GOOGLE_CALLBACK_URL` is optional when the backend can derive its callback URL from the request host.

## Running Locally

Start the backend in one terminal:

```bash
cd backend
node index.js
```

For backend development with automatic restarts:

```bash
cd backend
npx nodemon index.js
```

Start the React frontend in a second terminal:

```bash
cd frontend
npm start
```

The frontend runs at [http://localhost:3000](http://localhost:3000) and proxies API requests to [http://localhost:5000](http://localhost:5000).

### Seed professionals

The seed utility creates six active professionals and assigns every existing service to each professional. Run it after service data exists in MongoDB:

```bash
cd backend
node seedProfessionals.js
```

The backend lifecycle worker starts with the server, retries assignment every five seconds, and also runs immediately after successful payment verification. Existing paid bookings still marked `assigning` are retried after the backend restarts.

## API Overview

The Express server is mounted at `/api` unless noted otherwise:

| Area           | Routes                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Authentication | `/auth/signup`, `/auth/login`, `/auth/google`, `/auth/me`, `/auth/profile`, `/auth/complete-profile`, `/auth/delete-account` |
| Services       | `/service_data`                                                                                                              |
| Professionals  | `/professionals/available`                                                                                                   |
| Cart           | `/cart`, `/cart/add`, `/cart/item/:itemId`, `/cart/clear`                                                                    |
| Checkout       | `/create-checkout-session`, `/verify-payment`, `/cancel-payment`                                                             |
| Bookings       | `/order-data`, `/cancel-booking`                                                                                             |
| Contact        | `/contact`                                                                                                                   |

JWT-protected requests use the `auth-token` header. Stripe checkout also requires the frontend to complete payment verification after returning from Stripe.

## Project Structure

```text
backend/
├── config/              # Passport and Google OAuth setup
├── middleware/          # JWT authentication middleware
├── models/              # Mongoose schemas
├── Routes/              # Authentication, service, cart, checkout, order, contact, and professional APIs
├── services/            # Booking assignment and lifecycle processing
├── db.js                # MongoDB connection and service data access
├── index.js             # Express server entry point
└── seedProfessionals.js # Professional seed utility

frontend/
├── public/              # HTML shell and favicon assets
├── src/components/      # Navigation, cart context, booking journey, hero, and feature sections
├── src/screens/         # Home, auth, services, profile, cart, booking, legal, and contact pages
├── serviceCategory.json  # Local service category data
├── serviceData.json      # Local service data
└── package.json          # React scripts and dependencies
```

## Technology Stack

- **Frontend:** React 19, React Router, Tailwind CSS, custom CSS, React Icons, GSAP, Formik, Yup, and React Toastify
- **Backend:** Node.js, Express, Mongoose, MongoDB, Passport Google OAuth, JWT, bcryptjs, express-validator, and CORS
- **Payments:** Stripe Checkout and Stripe.js

## Available Scripts

From `frontend/`:

```bash
npm start   # Start the development server
npm test    # Run the Create React App test runner
npm run build # Create a production build
```

The backend currently has no automated test script. Run it with `node index.js` or `npx nodemon index.js`.

## Future Enhancements

- Admin dashboard for managing users, professionals, services, and bookings
- Customer reviews and ratings
- Push notifications and transactional booking updates

## Contributing

Contributions are welcome. Open an issue or submit a pull request with a focused change and relevant validation.

## License

No `LICENSE` file is currently included in the repository.
