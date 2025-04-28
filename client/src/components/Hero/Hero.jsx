// import React, { useState } from 'react';

// const Hero = ({ isHeroVisible}) => {
//   const [isVisible, setIsVisible] = useState(true);
//   const handleButtonClick = (e) => {
//     e.preventDefault();
//     setIsVisible(false);
//   };

//   return (
//     <div className={`hero-container transition-height-opacity ${(!isVisible || !isHeroVisible) && 'h-0 opacity-0'}`} style={(!isVisible || !isHeroVisible) ? { transform: 'translateY(-200%)',transition:"1s all ease" } : {}}>
//       <section className='hero max-h-[700px] relative flex-col justify-center items-center  flex max-w-[1400px] mx-auto text-white text-center'>
//           <div className='bg-black bg-opacity-50 absolute inset-0 flex justify-center items-center flex-col'>
//             <p className='text-xl'>WELCOME TO</p>
//             <h1 className='text-6xl'>
//               SUN<span className='text-[#FFC300]'>EASY</span>
//             </h1>
//             <p className='text-sm md:text-3xl w-full md:w-1/2 py-4'>
//               Secure Your Spot Under the Sun in Albania's Premier Beach Destinations
//             </p>
//             <button onClick={handleButtonClick} className='border-[#FFC300] border px-4 py-2 md:px-6 md:py-4 text-sm md:text-lg'>
//               BOOK NOW
//             </button>
//           </div>
//       </section>
//     </div>
//   );
// };

// export default Hero;
import React, { useState } from 'react';

const Hero = ({ isHeroVisible}) => {
  const [isVisible, setIsVisible] = useState(true);
  const handleButtonClick = (e) => {
    e.preventDefault();
    setIsVisible(false);
  };

  return (
    <div className={`transition-height-opacity ${(!isVisible || !isHeroVisible) && 'h-0 opacity-0'}`} style={(!isVisible || !isHeroVisible) ? { transform: 'translateY(-200%)',transition:"1s all ease" } : {}}>
      <section className='hero max-h-[700px] relative flex-col justify-center items-center  flex max-w-[1400px] mx-auto text-white text-center'>
      {/* <video autoPlay muted loop className="absolute inset-0 object-cover w-full h-full">
          <source src="./assets/hero.mp4" type="video/mp4" />
        </video> */}
          <div className='bg-black bg-opacity-10 absolute inset-0 flex justify-end items-center flex-col' style={{ padding: '10%' }}>
            <p className='text-xl text-black'>WELCOME TO</p>
            <h1 className='text-6xl text-black'>
              SUN<span className='text-[#FFC300]'>BED</span>
            </h1>
            <p className='text-sm md:text-3xl w-full md:w-1/2 py-4 text-black'>
              Secure Your Spot Under the Sun in Albania's Premier Beach Destinations
            </p>
            <button onClick={handleButtonClick} className='border-[#FFC300] bg-[#FFC300]  text-black border px-4 py-2 md:px-6 md:py-4 text-sm md:text-lg'>
              BOOK NOW
            </button>
          </div>
      </section>
    </div>
  );
};

export default Hero;
