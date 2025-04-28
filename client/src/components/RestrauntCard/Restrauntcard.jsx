import React from 'react'
import { Link } from 'react-router-dom'
import Umbrella from './../../../src/assets/umbrella.png'
const Restrauntcard = ({sunbed}) => {
  return (
      <Link to={`/restaurants/${sunbed?._id}`} key={sunbed?._id}>
      <div className=' bg-white sunbedcard m-2 border rounded-xl overflow-hidden shadow-lg '>
      <div className='h-[250px] md:h-[300px]'><img src={sunbed?.img? sunbed.img :"./assets/12.jpg"} alt="" className='object-cover w-full h-full '/></div>
      <div className={`flex justify-between p-4 text-left text-[#000000] md:text-xl`}>
  <div>
    <h3 className='text-[#FFC300] font-semibold'>{sunbed?.city}</h3>
    <h2 className='text-md font-medium'>{sunbed?.name}</h2>
    <p className='text-md'>{sunbed?.desc}</p>
  </div>
  <div className="flex flex-col justify-between">
    <div className="flex items-center mb-2">
      <p className="text-sm mr-2" style={{ backgroundColor: '#f0f0f0', boxShadow: '0 5px 4px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '5px' }}>
        <img src={Umbrella} alt="Umbrella" className="inline-block h-5 w-5" /> 
        {sunbed?.floorplans?.length>0 &&  sunbed?.floorplans?.map(floorplan =>
    floorplan?.sunbeds?.filter(sunbed => sunbed.disappear !== "true").length
  ).reduce((acc, curr) => acc + curr, 0)}      </p>
      <p className="text-sm" style={{ backgroundColor: '#f0f0f0', boxShadow: '0 5px 4px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '5px' }}>
        {sunbed?.floorplans?.length>0 && Math.min(...sunbed?.floorplans[0]?.sunbeds?.map(umbrella => umbrella.price))} ALL
      </p>
    </div>
    <button className="bg-[#73D0D7] text-black px-2 py-2 rounded-md text-xs">Book +</button>
  </div>
</div>

    </div>
      </Link>
  )
}

export default Restrauntcard
