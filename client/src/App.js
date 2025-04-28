import React, { useContext, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import SingleDetails from "./pages/Singledetails/SingleDetails";
import Searchbooking from "./pages/searchBooking/SearchBooking";
import Adminlogin from "./pages/AdminLogin/Adminlogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import QRCode from "./pages/QrCode";
import { SuneasyContext } from "./context/sunEasy/sunEasyState";
import { ToastContainer } from "react-toastify";
import WorkerLogin from "./pages/WorkerLogin/WorkerLogin";
import WorkerDashboard from "./pages/WorkerDashboard/WorkerDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { user, worker } = useContext(SuneasyContext);
  return (
    <BrowserRouter>
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants/:id" element={<SingleDetails />} />
        <Route path="/searchBooking" element={<Searchbooking />} />
        <Route
          path="/adminlogin"
          element={!user ? <Adminlogin /> : <Navigate to="/admindashboard" />}
        />
        <Route
          path="/admindashboard"
          element={user ? <AdminDashboard /> : <Navigate to="/adminlogin" />}
        />
        <Route
          path="/qrCode/:code"
          element={user ? <QRCode /> : <Navigate to="/adminlogin" />}
        />
        <Route
          path="/workerlogin" element={<WorkerLogin />}
        />
        <Route
          path="/workerdashboard"
          element={<WorkerDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
