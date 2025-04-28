import React from 'react';

const EditUmbrella = React.memo(({ index, handleSubmit, editprice, seteditprice, edittype, setedittype, editnrbed, seteditnrbed, editdisabled, seteditdisabled, editdisappear, seteditdisappear }) => {
  return (
    <section className='my-10 mx-auto'>
      <div className='bg-[#73D0D7] p-4 rounded-3xl shadow-2xl flex flex-col-reverse md:flex-row'>
        <div className='grow py-10 md:py-5 px-6'>
          <form onSubmit={handleSubmit} className='grid grid-cols-3 gap-3 py-4 text-xl md:text-2xl text-white'>
            <label className='col-span-1 py-2'>Price: </label>
            <input className='rounded-md col-span-2 py-2 outline-none px-4 bg-[#046E72] text-white' value={editprice} onChange={(e) => seteditprice(e.target.value)} placeholder='Price...' type='number' required />
            <label className='col-span-1 py-2'>Type: </label>
            <select
              className='rounded-md col-span-2 py-2 outline-none px-4 bg-[#046E72] text-white'
              value={edittype}
              placeholder="SELECT TYPE"
              onChange={(e) => setedittype(e.target.value)}
              required
            >
              <option value="circle">Circle umbrella</option>
              <option value="square">Square umbrella</option>
              <option value="squarev">VIP umbrella</option>
            </select>
            <label className='col-span-1 py-2'>Nr: </label>
            <input className='rounded-md col-span-2 py-2 outline-none px-4 bg-[#046E72] text-white' value={editnrbed} onChange={(e) => seteditnrbed(e.target.value)} placeholder='Nr...' type='number' required />
            <label className='col-span-1 py-2'>Disable: </label>
            <select
              className='rounded-md col-span-2 py-2 outline-none px-4 bg-[#046E72] text-white'
              value={editdisabled}
              onChange={(e) => seteditdisabled(e.target.value)}
              required >
              <option value="jo">False</option>
              <option value="po">True</option>
            </select>
            <label className='col-span-1 py-2'>Disappear: </label>
            <select
              className='rounded-md col-span-2 py-2 outline-none px-4 bg-[#046E72] text-white'
              value={editdisappear}
              onChange={(e) => seteditdisappear(e.target.value)}
              required >
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
            <button type='submit' className='md:py-2 md:px-4 p-2 font-medium rounded-3xl bg-white text-[#73D0D7] col-span-3 sm:text-lg my-2'>Update</button>
          </form>
        </div>
      </div>
    </section>
  )
});

export default EditUmbrella;
