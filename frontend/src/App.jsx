// frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CowDetail from "./pages/CowDetail";
import EditCow from "./pages/EditCow";
import Profile from "./pages/Profile";
import CowsPage from "./pages/CowsPage";
import AddListing from "./pages/AddListing";
import EditProfile from "./pages/EditProfile";
import MarketPage from './pages/MarketPage';
import MarketDetail from './pages/MarketDetail';
import SoldPage from "./pages/SoldPage";


export default function App() {
  return (
    <Router>
      
      {/* Nav แสดงทุกหน้า */}
      <Nav />

      {/* เนื้อหาของแต่ละหน้า */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cows/:id" element={<CowDetail />} />
        <Route path="/cows/:id/edit" element={<EditCow />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cows" element={<CowsPage />} />
        <Route path="/add-listing" element={<AddListing />} />  
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/markets" element={<MarketPage />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/sold-out" element={<SoldPage />} />
      </Routes>
    </Router>
  );
}
