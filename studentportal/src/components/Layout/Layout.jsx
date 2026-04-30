import React from 'react'
import Sidebar from './Sidebar.jsx'
import Mainbody from './hod/Mainbody.jsx'
import { Outlet,  } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Topbar from './Topbar.jsx'

const Layout = () => {
const { role } = useSelector((state) => state.user);

  return (
    <div className={`flex ${role === 'Student' ? 'flex-col' : 'flex-row'} h-screen w-full overflow-hidden`}>
   
     {role === 'Student' ? <Topbar /> : <Sidebar />}
        
          <div className='flex-1 overflow-y-auto border border-slate-200/20 rounded-lg   bg-slate-100 backdrop-blur-lg shadow-lg m-2'><Outlet/> </div>  
        
    </div>
  )
}

export default Layout