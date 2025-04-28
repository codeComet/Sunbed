import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { useParams } from "react-router-dom";

const AdminDashboard = () => {
  const params = useParams();
  const { getRestaurantDetails, getSunbedById } = useContext(SuneasyContext); // Changed to getSunbedById
  const [restaurantId, setRestaurantId] = useState();
  const [sunbedId, setSunbedId] = useState();
  const [bookingDate, setBookingDate] = useState();
  const [name, setName] = useState();
  const [randomId, setRandomId] = useState()
  const [phone, setPhone] = useState();
  const [price, setPrice] = useState();
  const [restaurantName, setRestaurantName] = useState();
  const [sunbedNumber, setSunbedNumber] = useState();
  const [payment, setPayment] = useState()
  const [email, setEmail] = useState()
  useEffect(() => {
    const { code } = params;

    try {
      const data = JSON.parse(atob(code));
      setRestaurantId(data.r);
      setSunbedId(data.s);
      setBookingDate(data.d);
      setName(data.n);
      setPhone(data.p)
      setRandomId(data.rr)
      setPayment(data.payment)
      setEmail(data.email)
      const fetchDetails = async () => {
        const restaurantData = await getRestaurantDetails(data.r);
        if (restaurantData) {
          setRestaurantName(restaurantData.name);
        }

        const sunbedData = await getSunbedById(data.r, data.s);
        console.log(sunbedData);
        if (sunbedData) {
          setSunbedNumber(sunbedData.number);
          setPrice(sunbedData.price)
        }


      };

      fetchDetails();
    } catch (e) {
      console.error("Error fetching details:", e);
    }
  }, [params, getRestaurantDetails, getSunbedById]);

  return (
    <>
      <Header />
      <div style={{ fontSize: "1.5em", margin: "2.5em" }}>
        <h1>Restaurant Name: {restaurantName}</h1>
        <h1> Name: {name}</h1>
        <h1> Email: {email}</h1>
        <h1> Phone: {phone}</h1>
        <h1>Sunbed Nr: {sunbedNumber}</h1>
        <h1> Price: {price}</h1>
        <h1>Date: {bookingDate}</h1>
        <h1>ID: {randomId}</h1>
        <h1>Payment: {payment}</h1>

      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
