import React from 'react'
import DashboardCard from '../../components/Layout/lecturer/DashboardCard'
import DashboardTable from '../../components/Layout/lecturer/DashboardTable'


const Dashboard = () => {
 
  return (
 <main className='flex flex-col w-full p-4'>
  
  <div className='py-4 px-2'>
<h1 className='text-3xl font-bold text-black '>Lecturer Dashboard</h1>  
<p className='text-sm text-slate-500'>Overview of students and courses</p>
    </div>  

    <DashboardCard/>
    
 
     
    <DashboardTable />  
    
    
    </main>
  )
}

export default Dashboard