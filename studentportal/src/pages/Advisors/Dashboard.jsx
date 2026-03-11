import React from 'react'
import DashboardCard from '../../components/Layout/advisor/DashboardCard'
import ResultsTable from '../../components/Layout/advisor/ResultsTable'

const Dashboard = () => {
  return (
    <main className='flex flex-col w-full p-4'>
      
      <div className='py-4 px-2'>
        <h1 className='text-3xl font-bold text-black'>Level Advisor Dashboard</h1>  
        <p className='text-sm text-slate-500'>Review and approve student results</p>
      </div>  

      <DashboardCard />
      
      <div className='mt-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Recent Results</h2>
        <ResultsTable />
      </div>
      
    </main>
  )
}

export default Dashboard