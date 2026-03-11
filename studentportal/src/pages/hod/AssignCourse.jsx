import React from 'react'
import { ExpandContext } from './Dashboard.jsx'
import Sidebar from '../../components/Layout/Sidebar.jsx'
import Mainbody from '../../components/Layout/hod/Mainbody.jsx'
import AllCourses from '../../components/Layout/hod/AssignCourses/AllCourses.jsx'


const AssignCourse = () => {


  return (
    

       <div className='flex flex-col w-full gap-2'>
       
      

        
        <AllCourses /> 
        
        </div>
 
   
      
  )
}

export default AssignCourse