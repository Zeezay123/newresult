import { FileCheck, FileSearch, FolderKanban, GraduationCap } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const ManagementConsole = () => {
  return (
    <div className='flex flex-col w-full my-5  rounded-xl gap-4 bg-white p-6 '>
      <div className='flex gap-2 items-center mb-5'> 
        <span  className=' p-2 rounded-full text-blue-900' > <FolderKanban size={24}/> </span>  
        <h1 className='text-xl font-semibold text-black'>Management Console</h1> </div>  
    
    {/* cards */}
    <div className='flex gap-4 items-center'>
  
  {/*Course Assignment Card  */}

   <Link to="/hod/assign-course" className='flex flex-col  bg-blue-700 rounded-lg shadow-sm border border-blue-950 p-3 gap-7 w-1/4 hover:bg-blue-950 transition cursor-pointer'>  
     
        <span className='w-12 h-12 p-2 flex items-center rounded-full text-blue-800  bg-slate-100 '><FileCheck size={30}/> </span>
       
       {/* card text */}
        <div>
        <h1 className='text-white font-bold mb-2'> Course Assignment</h1>
        <p className='text-slate-100 text-sm'>Assign courses to lecturers for the upcoming semester</p>
   


     </div>
 
</Link>


    {/*Course Assignment Card  */}

   <Link to="/hod/results"  className='flex flex-col  bg-amber-600 rounded-lg shadow-sm border border-amber-700 p-3 gap-7 w-1/4 hover:bg-amber-950 transition cursor-pointer'> 
     
        <span className='w-12 h-12 p-2 flex items-center rounded-full text-amber-700  bg-amber-100 '><FileSearch size={30}/> </span>
       
       {/* card text */}
        <div>
        <h1 className='text-white font-bold mb-2'> Review Results </h1>
        <p className='text-slate-100 text-sm'>Approve or reject student results for the semester</p>
   


     </div>
  
</Link> 

    {/*Course Assignment Card  */}

    <div className='flex flex-col  bg-purple-800 rounded-lg shadow-sm border border-purple-900 p-3 gap-7 w-1/4 hover:bg-purple-950 transition cursor-pointer'>
     
        <span className='w-12 h-12 p-2 flex items-center rounded-full text-purple-800  bg-purple-100 '><GraduationCap size={30}/> </span>
       
       {/* card text */}
        <div>
        <h1 className='text-white font-bold mb-2'> Student Data</h1>
        <p className='text-slate-100 text-sm'>Manage and review student information and records</p>
   


     </div>
    </div>


    {/*Course Assignment Card  */}

    <div className='flex flex-col  bg-green-700 rounded-lg shadow-sm border border-green-900 p-3 gap-7 w-1/4 hover:bg-green-900 transition cursor-pointer'>
     
        <span className='w-12 h-12 p-2 flex items-center rounded-full text-green-800  bg-green-300 '><FileCheck size={30}/> </span>
       
       {/* card text */}
        <div>
        <h1 className='text-white font-bold mb-2'> Generate Report</h1>
        <p className='text-slate-100 text-sm'>Generate  reports on various academic metrics</p>
   


     </div>
    </div>
 </div>

    </div>
  )
}

export default ManagementConsole