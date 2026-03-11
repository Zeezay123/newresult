import { BookCopyIcon, User2, ClipboardCheck, AlertCircle } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

const DashboardCard = () => {
const [loading, setLoading] = React.useState(false)
const [stats, setStats] = React.useState({
  pendingResults: 0,
  students: 0,
  approvedResults: 0,
  totalCourses: 0
})
const advisorId = useSelector((state) => state.user.id);
const departmentId = useSelector((state) => state.user.department);

React.useEffect(()=>{
  
},[])

// const fetchDashboardStats = async ()=>{
//   setLoading(true);
//   try{
//     // Fetch results grouped by course
//     const resultsRes = await fetch(`/api/advisor/results/by-course`, 
//       { credentials: 'include' });

//     if(!resultsRes.ok){
//       console.error("Failed to fetch dashboard stats");
//       return;
//     }

//     const resultsData = await resultsRes.json();
//     const courseResults = resultsData.results || [];
    
//     // Count courses by approval status
//     const pending = courseResults.filter(r => r.AdvisorApprovalStatus === 'Pending').length;
//     const approved = courseResults.filter(r => r.AdvisorApprovalStatus === 'Approved').length;
    
//     // Calculate total students (sum of student counts across all courses)
//     const totalStudents = courseResults.reduce((sum, course) => sum + (course.StudentCount || 0), 0);

//     setStats({
//       pendingResults: pending,
//       students: totalStudents,
//       approvedResults: approved,
//       totalCourses: courseResults.length
//     });

//   }catch(error){
//     console.log("Error fetching dashboard stats:", error);
//   } finally {
//     setLoading(false);
//   }
// }

  return (
    <div className='mt-6 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
    
    {/* Pending Results */}
    <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Pending Approvals</h2>
          <span className='bg-amber-100 text-amber-600 rounded-full p-2'> 
            <AlertCircle size={20}/>  
          </span> 
       </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.pendingResults} </h1>
        <p className='text-sm text-slate-500'>Course results awaiting review</p>
    </div>

    {/* Total Students */}
    <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Students</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> 
            <User2 size={20}/>  
          </span> 
       </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.students} </h1>
        <p className='text-sm text-slate-500'>Students with results</p>
    </div>

    {/* Approved Results */}
    <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Approved</h2>
          <span className='bg-green-100 text-green-600 rounded-full p-2'> 
            <ClipboardCheck size={20}/>  
          </span> 
       </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.approvedResults} </h1>
        <p className='text-sm text-slate-500'>Approved course results</p>
    </div>

    {/* Total Courses */}
    <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses</h2>
          <span className='bg-indigo-100 text-indigo-600 rounded-full p-2'> 
            <BookCopyIcon size={20}/>  
          </span> 
       </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.totalCourses} </h1>
        <p className='text-sm text-slate-500'>Courses with results</p>
    </div>

    </div>
  )
}

export default DashboardCard
