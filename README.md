# DwaarPer - Service-Based MERN Stack Application

DwaarPer is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to provide a seamless service booking experience. It includes real-time authentication, dynamic service browsing, cart functionality, and order management with Stripe Payment Gateway integration.

---

## Features

### 1. User Authentication
- **Secure Signup & Login**: Users can register and log in securely.
- **Token-Based Authentication**: Utilizes JWT for secure access and session management.

### 2. Browse Services
- **Service Categories**: Users can explore various service categories, including cleaning, plumbing, electrical repairs, and more.
- **Dynamic Service Cards**: Interactive and visually appealing service cards for a better browsing experience.
- **Database Integration**: Services are dynamically fetched from MongoDB.

### 3. Add to Cart
- **Multiple Service Selection**: Users can add multiple services from a single card.
- **Real-Time Pricing Updates**: Prices are dynamically updated based on user selections.
- **Cart Management**: Users can view, update, and manage their selected services before checkout.

### 4. Checkout
- **Seamless Booking Process**: Users can finalize their service bookings effortlessly.
- **Secure Payment Integration**: Placeholder for Stripe and other secure payment options.

### 5. Order Management
- **Order History**: Users can view all their past bookings.
- **Detailed Order View**: Each order contains comprehensive details for reference.

### 6. Enhanced UI/UX
- **Responsive Design**: Built with React-Bootstrap for an adaptive and user-friendly experience.
- **Custom Styling**: Uses vanilla CSS for a clean and minimalistic look.

---

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community)

### Steps to Run the Project

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/DkDash10/dwaarper.git
   cd dwaarper
   ```

2. **Install Dependencies**:
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd frontend
     npm install
     ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory with the following details:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Run the Application**:
   - Start the backend server:
     ```bash
     cd backend
     nodemon index.js
     ```
   - Start the frontend server:
     ```bash
     cd frontend
     npm start
     ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure
```
dwaarper/
├── backend/
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── db.js                 # Database connection
│   └── index.js              # Backend entry point
├── frontend/
│   ├── src/
│   │   ├── assets/           # Images and icons
│   │   ├── components/       # Reusable React components
│   │   ├── screens/          # Application pages
│   │   ├── App.js            # Main application file
│   │   ├── App.css           # Global styling
│   │   └── index.js          # React entry point
│   ├── serviceCategory.json  # Sample service categories
│   ├── serviceData.json      # Sample service data
├── README.md                 # Documentation
└── .gitignore
```

---

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for building APIs
- **MongoDB**: NoSQL database for storing service and user data
- **Mongoose**: MongoDB object modeling tool
- **JWT (JSON Web Token)**: Secure authentication
- **Bcrypt**: Password hashing for security

### Frontend
- **React.js**: Frontend library for building UI
- **React-Bootstrap**: Framework for responsive UI components
- **Vanilla CSS**: Custom styling for a unique look
- **React Icons**: Rich set of icons for UI enhancement
- **React Router**: Navigation without page reloads

### Payment Gateway
- **Stripe**: Secure and seamless payment gateway (Future Integration)

---

## Future Enhancements
- **Admin Dashboard**: Manage users, orders, and services
- **User Reviews & Ratings**: Allow customers to rate services
- **Push Notifications**: Real-time updates on order status

---

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to improve DwaarPer.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

