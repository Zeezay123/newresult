import React from 'react'
import Sidebar from './Sidebar.jsx'
import Mainbody from './hod/Mainbody.jsx'
import { Outlet,  } from 'react-router-dom'

const Layout = () => {
  return (
    <div className='flex h-screen w-full overflow-hidden'>
        <Sidebar/>
        
          <div className='flex-1 overflow-y-auto border border-slate-200/20 rounded-lg   bg-slate-100 backdrop-blur-lg shadow-lg m-2'><Outlet/> </div>  
        
    </div>
  )
}

export default Layout