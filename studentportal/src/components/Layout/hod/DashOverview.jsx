import React from 'react'
import { sumaryData,assignData, resultData } from '../../data/dashboardCard'
import {Button} from 'flowbite-react'
import ManagementConsole from './ManagementConsole'
import ActivityLog from './ActivityLog'
import { useSelector } from 'react-redux'


const DashOverview = () => {
const hodId = useSelector((state) => state.user.department);
const [dashboardStats, setDashboardStats] = React.useState({
  courses: 0,
  students: 0,
  lecturers: 0,
  results: 0
});

React.useEffect(() => {
  
fetchDashboardData();
  
}, []);

 const fetchDashboardData = async () => {
  try{
    const [courseRes, studentsRes, lecturersCountRes] = await Promise.all([
      fetch(`/api/hod/courses/stats/${hodId}`, { 
        credentials: 'include',
       
      }),
      fetch(`/api/hod/students/${hodId}`, { 
        credentials: 'include',
       
      }),
      fetch(`/api/hod/lecturers/count`, { 
        credentials: 'include',
      
      })
    ]);

    if(!courseRes.ok || !studentsRes.ok || !lecturersCountRes.ok){
      return console.error("Failed to fetch one or more dashboard data");
    }

    const [coursesData, studentsData, lecturersCountData] = await Promise.all([
      courseRes.json(), 
      studentsRes.json(), 
      lecturersCountRes.json()
    ]);

    // Update dashboard stats with fetched data
    setDashboardStats({
      courses: coursesData.stats?.total || coursesData.courses?.length || 0,
      students: studentsData.students?.length || 0,
      lecturers: lecturersCountData.count || 0,
      results: 0 // No results fetch yet
    });
  }catch(err){
    console.error("Error fetching dashboard data:", err);
  }
}


  return (
    <main className='flex flex-col w-full'>
        <section className='grid md:grid-cols-4 w-full py-4 gap-4 mt-5 rounded-xl'>
     {sumaryData.map((data, index)=>{
       // Get the actual count based on card name
       let actualNumber = data.number;
       let actualComment = data.Comment;
       
       if (data.name === 'Number of Courses') {
         actualNumber = dashboardStats.courses;
         actualComment = `Active Course${dashboardStats.courses !== 1 ? 's' : ''}`;
       } else if (data.name === 'Students') {
         actualNumber = dashboardStats.students;
         actualComment = `Active Student${dashboardStats.students !== 1 ? 's' : ''}`;
       } else if (data.name === 'Lecturer') {
         actualNumber = dashboardStats.lecturers;
         actualComment = `Active Lecturer${dashboardStats.lecturers !== 1 ? 's' : ''}`;
       } else if (data.name === 'Results') {
         actualNumber = dashboardStats.results;
         actualComment = 'Empty Result Table';
       }
       
       return (
      <div key={index} className='flex flex-col p-4  rounded-xl gap-6 shadow-sm bg-white '> 

      <div className='flex items-center justify-between'>

        <div className='font-medium text-sm  text-gray-900'> {data.name}</div>

        <div className={
          `bg-slate-50 flex items-center justify-center1 p-1 rounded-md
          ${data.name === 'Students' ?
             'text-blue-700' : data.name === 'Lecturer'? 
             'text-red-600' : data.name === 'Results' ? 'text-yellow-400' : 'text-green-600'  }
          `
          } > <data.icon size={18}/> </div>
      </div>

    
     <div className=''>
      <div className='font-bold text-2xl'> {actualNumber}</div>
      <span className=' text-slate-500 text-sm font-normal'>{actualComment}</span>
      </div>


       </div>
       );
     }) }
    </section>

<ManagementConsole/>

<ActivityLog/>


  

 
    </main>
  )
}

export default DashOverview