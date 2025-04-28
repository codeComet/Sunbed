// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { SuneasyContext } from '../../context/sunEasy/sunEasyState';
// import { IoPerson } from 'react-icons/io5';
// import { MdLogout } from 'react-icons/md';

// const Header = () => {
//   const { user, logoutUser } = useContext(SuneasyContext);

//   return (
//     <header className='sticky top-0 bg-[#f5f7f7] text-2xl px-8 z-50'>
//       <div className='h-[60px] flex items-center justify-between max-w-[1400px] mx-auto md:px-10'>
//         <Link to="/" className='text-black font-bold tracking-wider'>
//           Sun<span className='text-[#FFC300]'>Easy</span>
//         </Link>
//         <div className='flex items-center gap-5'>
//           <Link to={user ? "/admindashboard" : "/adminlogin"} className='headerIconsfont-bold cursor-pointer'  style={{ color: 'rgb(95, 40, 15)' }}><IoPerson /></Link>
//           {user && <span className='headerIcons text-black cursor-pointer font-bold' onClick={() => { logoutUser() }}><MdLogout /></span>}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SuneasyContext } from '../../context/sunEasy/sunEasyState';
import { IoPerson, IoSearch } from 'react-icons/io5';
import { MdLogout } from 'react-icons/md';
import LogoImage from '../../assets/icon.png';

const Header = () => {

  const { user, logoutUser } = useContext(SuneasyContext);
  const logoutClicked = async () => {
    try {
      await logoutUser();
      window.location.reload(); 
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <header className='sticky top-0 bg-[#66CAB8] text-2xl px-8 z-[9999]'>
      <div className='py-2 max-h-[100px] flex items-center justify-between max-w-[1400px] mx-auto md:px-10'>
        <Link to="/" className='w-20'>
          <img className='w-full h-full object-cover' src={LogoImage} alt="Logo" />
        </Link>
        <div className='flex items-center gap-5'>
          <Link to="/searchBooking" className='headerIcons text-black font-bold cursor-pointer'><IoSearch /></Link>
          {user ? (
            <>
              <Link to="/admindashboard" className='headerIcons text-black font-bold cursor-pointer'><IoPerson /></Link>
              <span className='headerIcons text-black cursor-pointer font-bold' onClick={logoutClicked}><MdLogout /></span>
            </>
          ) : (
            <Link to="/adminlogin" className='headerIcons text-black font-bold cursor-pointer'><IoPerson /></Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
