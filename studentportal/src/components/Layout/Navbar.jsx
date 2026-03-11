import React, { useState } from 'react'
import { PanelLeft, PanelRight, Search, Bell } from 'lucide-react'
import { useContext } from 'react'
import { ExpandContext } from '../../pages/hod/Dashboard.jsx'
import sideBarData from '../data/SidebarData'


const Navbar = () => {
const {expanded, setExpanded} = useContext(ExpandContext)
const [notify, setNotify] = useState(true)

const username = sideBarData.bottomSide
const fName = username?.username || 'lk'

const splitname =(name)=> {
    const firstS = name.charAt(0)
    const secondS = name.charAt(1)
     
    return (firstS+secondS).toUpperCase()
}


  return (
    <nav className='flex w-full p-4 mt-5 justify-between'> 
    <button onClick={() => setExpanded((prev)=>!prev)}> { expanded ? <PanelLeft /> : <PanelRight />} </button>
    
    <div className='flex gap-2'>
      <div className='flex items-center px-1 py-[2px]  border-[1px] rounded border-slate-300'>
       <Search size={16} color='grey' /> <input type="text" placeholder='Search' className='px-2 font-medium' />
      </div>

   <div className='block relative'>
       <div className='flex p-1 items-center rounded-full justify-center bg-slate-200'> 
        <Bell size={20} className='text-slate-600'/>
      </div>
      
    { notify && <div className='w-2 h-2 bg-red-700 rounded-full absolute float-right top-0 right-0'></div>}
      
      </div>

{ username.image != '' ? (<div>
 <div className='w-7 h-7 object-cover rounded-full'><img src={username.image} alt="" className='w-full h-full rounded-full ' /> </div>
</div>)
:

(<div className='flex items-center justify-center w-7 h-7 rounded-full bg-slate-200
 text-slate-500 font-[inter] font-medium text-[12px]  '> { splitname(fName) }  </div>) }

    </div>
     </nav>
  )
}

export default Navbar