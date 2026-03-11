import React, { createContext, useEffect, useState } from 'react'

import Mainbody from '../../components/Layout/hod/Mainbody.jsx'
import Sidebar from '../../components/Layout/Sidebar.jsx'
import Submissions from '../../components/Layout/hod/Submissions.jsx'
import DashOverview from '../../components/Layout/hod/DashOverview.jsx'


export const  ExpandContext = createContext()
const Dashboard = () => {





  return (
    <main className='flex flex-col w-full p-4'>
 <div> 
  <h1 className='text-black font-bold text-xl md:text-3xl'>Dashboard</h1>
      <h5 className='text-sm text-slate-600 '> An Overview of the complete Result Portal </h5>
      
  </div> 
  
   <DashOverview/>
    
    
    </main>
  )
}

export default Dashboard