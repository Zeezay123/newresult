import { BookCopyIcon, User2, ClipboardCheck, AlertCircle } from 'lucide-react'
import React from 'react'

const DashboardCard = () => {
const [loading, setLoading] = React.useState(false)
const [stats, setStats] = React.useState({
  pendingResults: 0,
  students: 0,
  approvedResults: 0
})

React.useEffect(()=>{
  fetchDashboardStats()
},[])

const fetchDashboardStats = async ()=>{
  setLoading(true);
  try{
    const response = await fetch('/api/advisor/dashboard-stats', {
      credentials: 'include'
    });

    if(!response.ok){
      console.error('Failed to fetch advisor dashboard stats');
      return;
    }

    const payload = await response.json();
    const data = payload?.data || {};

    setStats({
      pendingResults: Number(data.pendingApprovals || 0),
      students: Number(data.totalStudents || 0),
      approvedResults: Number(data.approvedResults || 0)
    });
  }catch(error){
    console.log('Error fetching dashboard stats:', error);
  } finally {
    setLoading(false);
  }
}

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
        <h1 className='font-bold text-3xl my-4'> {loading ? '...' : stats.pendingResults} </h1>
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
        <h1 className='font-bold text-3xl my-4'> {loading ? '...' : stats.students} </h1>
        <p className='text-sm text-slate-500'>Students in your assigned level and programme</p>
    </div>

    {/* Approved Results */}
    <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Approved</h2>
          <span className='bg-green-100 text-green-600 rounded-full p-2'> 
            <ClipboardCheck size={20}/>  
          </span> 
       </div> 
        <h1 className='font-bold text-3xl my-4'> {loading ? '...' : stats.approvedResults} </h1>
        <p className='text-sm text-slate-500'>Approved course results</p>
    </div>



    </div>
  )
}

export default DashboardCard
