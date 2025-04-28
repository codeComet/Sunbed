import React from "react";
import { FaFacebookSquare } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLinkedin } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-[#f5f7f7]">
  <div className="grid max-w-[1400px] mx-auto grid-cols-3 gap-1 md:gap-0 p-4 text-black">
    <div className="col-span-2"> {/* First column */}
      <h3 className="text-sm md:text-3xl font-semibold">Sun<span className="text-[#FFC300]">Bed</span></h3>
      <p className="w-[90%] py-3 text-lg">
        Book your sunbed experience with us today!
      </p>
      <div className="flex gap-2">
        <FaFacebookSquare/>
        <FaTwitter/>
        <MdEmail/>
        <FaLinkedin/>
      </div>
    </div>
    {window.innerWidth >= 400 ? ( // Check viewport width
      <div className="col-span-1"> {/* Second column */}
        <h3 className="text-md md:text-3xl font-semibold">Contact Us:</h3>
        <h6>+355683188771</h6>
      </div>
    ) : (
      <div className="col-span-2"> {/* Single column */}
        <h3 className="text-md md:text-3xl font-semibold">Contact Us:</h3>
        <h6>+355683188771</h6>
      </div>
    )}
  </div>
</footer>

  );
};

export default Footer;
