import "./App.css";
import Home from "./screens/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import CompleteProfile from "./screens/CompleteProfile";
import GoogleSuccess from "./screens/GoogleSuccess";
import Cart from "./screens/Cart";
import MyOrders from "./screens/MyOrders";
import { CartProvider } from "./components/ContextReducer";
import Cancel from "./screens/Cancel";
import Success from "./screens/Success";
import NotFound from "./screens/NotFound";
import WhyChooseUs from "./screens/WhyChooseUs";
import WhoAreWe from "./screens/WhoAreWe";
import ConnectWithUs from "./screens/ConnectWithUs";
import BackToTopButton from "./components/BackToTop";
import Profile from "./screens/Profile/Profile";
import Services from "./screens/Services/Services"

function App() {
  return (
    <CartProvider>
      <Router>
        <div>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/google-success" element={<GoogleSuccess />} />
            <Route path="/services" element={<Services />}/>

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/myorders" element={<MyOrders />} />
            </Route>

            {/* Other public pages */}
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/why-choose-us" element={<WhyChooseUs />} />
            <Route path="/who-are-we" element={<WhoAreWe />} />
            <Route path="/connect-with-us" element={<ConnectWithUs />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <BackToTopButton />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
