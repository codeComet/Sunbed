import React, { useState, useContext } from 'react';
import { SuneasyContext } from '../../context/sunEasy/sunEasyState';
import { Bounce, ToastContainer, toast } from 'react-toastify';

const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useContext(SuneasyContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const success = await loginUser(email, password);
      const message = success ? 'Login Successfully' : 'Login Failed\n Please Fill Correct Credentials';
      toast[success ? 'success' : 'error'](message, toastOptions);
    } catch (error) {
      toast.error('Login Failed\n Please Fill Correct Credentials', toastOptions);
    }
  };

  return (
    <>

      <div>
        <h2 className='text-[#333333] text-3xl font-semibold mb-6'>ADMIN LOGIN</h2>
        <form onSubmit={handleLogin} className='flex flex-col gap-4'>
          <label htmlFor='username' className='text-[#333333]'>Email :</label>
          <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} required className='border text-[#046E72] border-gray-300 rounded-md px-4 py-2' />
          <label htmlFor='password' className='text-[#333333]'>Password :</label>
          <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} required className='border text-[#046E72] border-gray-300 rounded-md px-4 py-2' />
          <button type='submit' className='bg-[#73D0D7] text-black rounded-md px-4 py-2 hover:bg-[#046E72] transition-colors'>Login</button>
        </form>
      </div>
    </>
  );
};

export default AdminLogin;
