# Service-Based MERN Stack Application

This project is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to provide a seamless service booking experience. It features real-time authentication, dynamic service browsing, cart functionality, and order management.

## Features

### 1. User Authentication
- **Signup & Login**: Users can register and log in securely.
- **Real-time Authentication**: Ensures secure access to the application using token-based authentication (e.g., JWT).

### 2. Browse Services
- **Service Categories**: Search and browse available services such as cleaning, plumbing, electrical repairs, and more.
- **Dynamic Service Cards**: Each service is displayed in an interactive card layout.
- **Database Integration**: Services are fetched dynamically from the database.

### 3. Add to Cart
- **Multiple Services per Card**: Users can select different service options from a single card.
- **Updated Pricing**: Real-time price calculation based on selected services.
- **Cart Management**: View, update, and manage services added to the cart.

### 4. Checkout
- **Real-time Checkout**: Seamlessly finalize service bookings.
- **Secure Payment Gateway (Future Integration)**: Placeholder for adding secure payment options.

### 5. My Orders Page
- **Order History**: View a list of all previous orders for each user.
- **Order Details**: Detailed view of individual past orders.

### 6. Simplified UI/UX
- **Design Framework**: Built with React-Bootstrap for responsive and accessible UI components.
- **Styling**: Custom styling using vanilla CSS for a clean and minimal design.

---

## Installation and Setup

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/mern-service-app.git
   cd mern-service-app
   ```

2. **Install Dependencies**:
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm install
     ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Run the Application**:
   - Start the backend server:
     ```bash
     cd backend
     nodemon .\index.js
     
     ```
   - Start the frontend server:
     ```bash
     cd frontend
     npm start
     ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## File Structure
```
mern-service-app/
├── backend/
│   ├── controllers/      # API logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── index.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Application pages
│   │   ├── utils/        # Helper functions
│   │   ├── App.js        # Main React app
│   │   └── index.js      # React entry point
├── README.md             # Project documentation
└── .gitignore
```

---

## Technologies Used

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Backend framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication

### Frontend
- **React.js**: Frontend library
- **React-Bootstrap**: UI framework
- **Vanilla CSS**: Custom styling
- **React-Icons**: For Icons

---

## Future Enhancements
- **Payment Gateway Integration**: Add support for secure online payments.
- **Admin Dashboard**: Manage services, users, and orders.
- **Service Reviews**: Allow users to rate and review services.
- **Push Notifications**: Notify users about their order status.

---

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.
