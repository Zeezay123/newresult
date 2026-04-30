import React from 'react'
import { getSidebarDataByRole } from '../data/Topbar'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { BookOpen, FileCheck, HelpCircle, LayoutDashboard } from 'lucide-react'

const Topbar = () => {

    const { role } = useSelector((state) => state.user);
    const topBarData = getSidebarDataByRole(role);

    const mainItems = topBarData.mainItems;

  return (
    <div className='flex justify-between items-center m-2 bg-slate-100 border border-blue-600/40 shadow text-black p-4 rounded-lg'>
        
        <h1 className='font-bold text-lg'>Navigation</h1>
        
    <div className='flex gap-5'
    >    {mainItems.map((item, index) => (
       <NavLink key={index} to={item.url} className={({ isActive }) => `flex items-center gap-2 text-[15px] font-medium cursor-pointer ${isActive ? 'text-blue-800' : 'text-black'}`}>
        <item.icon size={16} />
         
         <span>{item.name} </span>

       </NavLink>
        ))}
        </div> 
        </div>
  )
}

export default Topbar