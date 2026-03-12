import { BookCopyIcon, User2 } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

const DashboardCard = () => {
const [loading, setLoading] = React.useState(false)
const [error, setError] = React.useState(null)
const [courseCount, setCourseCount] = React.useState(0)
const [studentCount, setStudentCount] = React.useState(0)
const lectid = useSelector((state) => state.user.id);

React.useEffect(()=>{
// fetchCourseCount();
// fetchStudentCount()
},[])

const fetchCourseCount = async ()=>{
  
  try{
 const response = await fetch(`/api/lecturers/getcourses`,
     { credentials: 'include' })

    if(!response.ok){
      alert("Failed to fetch course count")
      return
    }

    const data = await response.json();
    setCourseCount(data.count)


  }catch(error){
    console.log("Error fetching course count:", error);
  }
  
 
}


const fetchStudentCount = async ()=>{ 

  try{ 
    
    const response = await fetch(`/api/lecturers/students/getStudents`,
     { credentials: 'include' })

     if(!response.ok){
      alert("Can't fetch student count")
     }

     const data = await response.json();
     
     setStudentCount(data.count)


  }catch(error){
    console.log("Error fetching student count:", error);
  }

}


  return (
    <div className=' mt-6 mb-10  flex  gap-4'>
    
    
    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses Assigned</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> {courseCount} </h1>
    
    </div>





    {/* course assigned card */}
    <div className='w-md bg-white  shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Number of Students</h2>
          <span className='bg-green-100 text-green-600 rounded-full p-2'> <User2/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> {studentCount} </h1>
     
    </div>




    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Pending Submissions</h2>
          <span className='bg-amber-100 text-amber-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
       
    </div>




    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses Submitted</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        
    </div>


    
    </div>
  )
}

export default DashboardCard