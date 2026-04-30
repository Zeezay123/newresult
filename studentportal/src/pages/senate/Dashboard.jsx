import React from 'react'
import DashboardCard from '../../components/Layout/senate/DashboardCard'
import ResultsTable from '../../components/Layout/senate/ResultsTable'

const Dashboard = () => {
  return (
    <main className='flex flex-col w-full p-4'>
      
      <div className='py-4 px-2'>
        <h1 className='text-3xl font-bold text-black'>Senate Dashboard</h1>  
        <p className='text-sm text-slate-500'>Review and approve university results</p>
      </div>  

      <DashboardCard />
      
      <div className='mt-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Recent Pending Results</h2>
        <ResultsTable status="Pending" />
      </div>
      
    </main>
  )
}

export default Dashboard
