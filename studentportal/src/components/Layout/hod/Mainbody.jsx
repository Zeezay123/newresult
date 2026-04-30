import React from 'react'
import Navbar from '../Navbar'
import DashOverview from './DashOverview'
import { NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Submissions from './Submissions.jsx'


const Mainbody = () => {



  return (
    <main className='flex flex-col  mx-auto  rounded-lg border '>
  
    <div className='grid grid-rows-1 place-content-start p-4'>
      
       <h1 className='font-[inter] font-bold text-xl md:text-3xl'>Dashboard</h1>
      <h5 className='font-[inter] text-sm text-slate-600'> An Overview of Result Portal </h5>
     </div>
 <DashOverview/> 
  

    </main>
  )
}

export default Mainbody