import { FileCheck, Users, TrendingUp, AlertCircle } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

const DashboardCard = () => {
  const [loading, setLoading] = React.useState(false)
  const [stats, setStats] = React.useState({
    pendingResults: 0,
    approvedResults: 0,
    totalDepartments: 0,
    totalStudents: 0
  })

  React.useEffect(() => {
    fetchPendingResults();
    fetchApprovedResults();
    fetchStudents();
  }, [])

  const fetchPendingResults = async () => {
    setLoading(true);
    try {
      // Fetch pending results
      const resultsRes = await fetch(`/api/senate/results/stat/pendingResults`, 
        { credentials: 'include' });


      if(!resultsRes.ok){
        console.log('Error fetching pending results:', resultsRes.statusText);
        return;
      }

      const resultsData = await resultsRes.json();

      setStats(prevStats => ({
        ...prevStats,
        pendingResults: resultsData.pendingCount || 0
      }));

      console.log('Dashboard stats response:', resultsData); 

    } catch (error) {
      console.log("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }


  const fetchApprovedResults = async () => {
    setLoading(true);
    try {
      // Fetch approved results
      const resultsRes = await fetch(`/api/senate/results/stat/approvedResults`, 
        { credentials: 'include' });
      
      if(!resultsRes.ok){
        console.log('Error fetching approved results:', resultsRes.statusText);
        return;
      }

        const resultsData = await resultsRes.json();

      setStats(prevStats => ({
        ...prevStats,
        approvedResults: resultsData.approvedCount || 0
      }));

      console.log('Dashboard stats response:', resultsData); 

    } catch (error) {
      console.log("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchStudents = async () =>{
    setLoading(true);
    try {
      // Fetch approved results
      const studentsRes = await fetch(`/api/senate/results/stat/studentStats`, 
        { credentials: 'include' });


        if(!studentsRes.ok){
          console.log('Error fetching student stats:', studentsRes.statusText);
          return;
        }

      const studentsData = await studentsRes.json();

      setStats(prevStats => ({
        ...prevStats,
        totalStudents: studentsData.studentCount || 0,
      
      }));

      console.log('Dashboard stats response for students:', studentsData);
  }catch (error) {
      console.log("Error fetching dashboard stats:", error);
    }
  }

  return (
    <div className='mt-6 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
    
      {/* Pending Results */}
      <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
        <div className='flex items-center justify-between'>
          <h2 className='text-slate-600 font-medium mb-2'>Pending Review</h2>
          <span className='bg-amber-100 text-amber-600 rounded-full p-2'> 
            <AlertCircle size={20}/>  
          </span> 
        </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.pendingResults} </h1>
        <p className='text-sm text-slate-500'>Results awaiting approval</p>
      </div>

      {/* Approved Results */}
      <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
        <div className='flex items-center justify-between'>
          <h2 className='text-slate-600 font-medium mb-2'>Approved Results</h2>
          <span className='bg-green-100 text-green-600 rounded-full p-2'> 
            <FileCheck size={20}/>  
          </span> 
        </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.approvedResults} </h1>
        <p className='text-sm text-slate-500'>Results approved this session</p>
      </div>


      {/* Total Students */}
      <div className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
        <div className='flex items-center justify-between'>
          <h2 className='text-slate-600 font-medium mb-2'>Total Students</h2>
          <span className='bg-purple-100 text-purple-600 rounded-full p-2'> 
            <TrendingUp size={20}/>  
          </span> 
        </div> 
        <h1 className='font-bold text-3xl my-4'> {stats.totalStudents} </h1>
        <p className='text-sm text-slate-500'>Enrolled students</p>
      </div>

    </div>
  )
}

export default DashboardCard
