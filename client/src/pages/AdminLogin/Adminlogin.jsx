import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminLogin from '../../components/AdminLogin/AdminLogin';

const Adminlogin = () => {
  return (
    <>
      <Header />
    <div className={`hero-container transition-height-opacity `}>
      <section className='hero max-h-[700px] relative flex-col justify-center items-center  flex max-w-[1400px] mx-auto text-white text-center'>
          <div className='bg-black bg-opacity-50 absolute inset-0 flex justify-center items-center'>
            <div className='flex bg-white p-10 rounded-3xl shadow-md'>
              <div className='w-[400px] rounded-3xl overflow-hidden hidden md:block'>
                <img src='./assets/12.jpg' className='w-full h-full object-cover' alt='image' />
              </div>
              <div className='md:p-10'>
                <AdminLogin />
              </div>
            </div>
          </div>
          </section>
          </div>
      <Footer />
    </>
  );
};

export default Adminlogin;
