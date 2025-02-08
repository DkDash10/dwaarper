import './App.css';
import Home from './screens/Home';
import{
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Login from './screens/Login';
import Signup from './screens/Signup';
import Cart from './screens/Cart'
import MyOrders from './screens/MyOrders'
import { CartProvider } from './components/ContextReducer';
import Cancel from './screens/Cancel';
import Success from './screens/Success';
import NotFound from './screens/NotFound';
import WhyChooseUs from './screens/WhyChooseUs';
import WhoAreWe from './screens/WhoAreWe';
import ConnectWithUs from './screens/ConnectWithUs';
import BackToTopButton from './components/BackToTop';

function App() {
  return (
    <CartProvider>
      <Router>
        <div>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
            <Route exact path="/login" element={<Login/>}/>
            <Route exact path="/signup" element={<Signup/>}/>
            <Route exact path="/cart" element={<Cart/>}/>
            <Route exact path="/success" element={<Success/>}/>
            <Route exact path="/cancel" element={<Cancel/>}/>
            <Route exact path="/myorders" element={<MyOrders/>}/>
            <Route exact path="/why-choose-us" element={<WhyChooseUs/>}/>
            <Route exact path="/who-are-we" element={<WhoAreWe/>}/>
            <Route exact path="/connect-with-us" element={<ConnectWithUs/>}/>
            <Route path="*" element={<NotFound />} />
          </Routes>
            <BackToTopButton />
        </div>
      </Router>
    </CartProvider>
    
  );
}

export default App;
