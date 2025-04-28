import React, { useState, useContext } from "react";
import Header from "../../components/Header/Header";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { Bounce, toast } from "react-toastify";
import axios from "axios";

const SearchBooking = () => {
  const { searchRandomId, deleteBooking } = useContext(SuneasyContext);
  const [code, setCode] = useState("");
  const [randomId, setRandomId] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationFieldVisible, setIsVerificationFieldVisible] =
    useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const reservation = await searchRandomId(code);
      if (reservation.randomId === code) {
        setBookingDetails(reservation);
        setRandomId(reservation?.randomId);
      } else {
      }
    } catch (error) {
      console.error("Error searching for code:", error);
    }
  };
  const bookingDetailsStyle = `
  .booking-details {
    background-color: #f8f9fa;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    padding: 20px;
    margin-top: 20px;
    text-align: center; 
  }

  .booking-details h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .booking-details p {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    margin-left: 20%;
    margin-right: 20%;
    border-bottom: 1px solid #ced4da;
  }
  

  .booking-details p span {
    font-weight: bold;
  }
  `;

  const sendVerificationCode = async () => {
    try {
      if (!email || email !== bookingDetails.email) {
        throw new Error(
          "Please enter the correct email address associated with the booking."
        );
      }

      await axios.post(
        "http://localhost:5001/bookings/send-verification-code",
        { email }
      );
      toast.success("Verification code sent to your email", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

      setIsVerificationFieldVisible(true);
    } catch (error) {
      toast.error(error.message || "Failed to send verification code", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/bookings/verify-code",
        {
          email,
          code: verificationCode,
        }
      );

      if (response.data.message === "Verification successful") {
        toast.success("Email verified successfully", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        setIsVerificationComplete(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to verify code", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const handleDelete = async (bookingId) => {
    if (!isVerificationComplete) {
      toast.error("Please verify your email before deleting the booking", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    const success = await deleteBooking(bookingId);
    if (success) {
      toast.success("Booking Deleted Successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      toast.error("Something Went Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };
  const canDeleteBooking = (details) => {
    return (
      !details.isClosed ||
      !details.isManager ||
      !details.isAdmin ||
      !details.payment === "true"
    );
  };

  return (
    <>
      <Header />
      <h2 className="text-xl font-bold mb-4 text-center mt-10">
        Booking Details
      </h2>
      <div className="container mx-auto mt-8 flex justify-center items-center">
        <input
          type="text"
          value={code}
          onChange={handleInputChange}
          placeholder="Enter code..."
          className="border border-gray-300 rounded-md p-2 mr-2"
        />
        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>
      {bookingDetails && (
        <div className="container mx-auto mt-8 booking-details">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <p>
            <span>Name:</span> {bookingDetails.name}
          </p>
          <p>
            <span>Phone:</span> {bookingDetails.phone}
          </p>
          <p>
            <span>ID:</span> {bookingDetails.randomId}
          </p>
          <p>
            <span>Date:</span> {bookingDetails.date}
          </p>
          <p>
            <span>Time:</span> {bookingDetails.time}
          </p>
          <p>
            <span>Payment:</span> {bookingDetails.payment}
          </p>
          <label className="py-2 text-red-500">
            Your email to delete your booking:{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              className="rounded-md text-sm md:text-md py-2 outline-none px-4 bg-[#ffffff] text-black flex-grow"
              placeholder="Email..."
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendVerificationCode}
              className="bg-blue-500 text-white px-2 py-2 rounded-md ml-2"
            >
              Send
            </button>
          </div>
          {isVerificationFieldVisible && (
            <>
              <label className="py-2 text-red-500">Verification Code: *</label>
              <div className="flex items-center">
                <input
                  className="rounded-md text-sm md:text-md py-2 outline-none px-4 bg-[#ffffff] text-black flex-grow"
                  placeholder="Enter verification code..."
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  onClick={verifyCode}
                  className="bg-blue-500 text-white px-2 py-2 rounded-md ml-2"
                >
                  Verify
                </button>
              </div>
            </>
          )}
          {canDeleteBooking(bookingDetails) && isVerificationComplete && (
            <button
              onClick={() => handleDelete(bookingDetails._id)}
              className="bg-red-500 text-white px-4 py-2 rounded-md mt-4"
            >
              Delete Booking
            </button>
          )}
        </div>
      )}
      <style>{bookingDetailsStyle}</style>
    </>
  );
};

export default SearchBooking;
