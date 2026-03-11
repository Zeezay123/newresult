import React from 'react'
import { BookCopyIcon, User2 } from 'lucide-react'

const Submitted = ({semester, session}) => {


    const cardData = [
    {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    },

      {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    },

      {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    },
      {
        title: 'Total Courses Assigned',
        value: 10,
        icon: BookCopyIcon,
        comment: 'Courses assigned to you this semester',
    }
]

    
  return (

    <div className='flex flex-col mt-4 '> 
    <div className='flex gap-4 mt-4'>
        
        {/* cards */}
    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses Assigned</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>





    {/* course assigned card */}
    <div className='w-md bg-white  shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Total Courses Submitted</h2>
          <span className='bg-green-100 text-green-600 rounded-full p-2'> <User2/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>




    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Pending Approvals</h2>
          <span className='bg-amber-100 text-amber-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>




    {/* course assigned card */}
    <div className='w-md bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
       <div className='flex items-center justify-between'>
         <h2 className='text-slate-600 font-medium mb-2'>Courses Rejected</h2>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2'> <BookCopyIcon/>  </span> </div> 

        <h1 className='font-bold text-3xl my-4'> 10 </h1>
        <p className='text-sm text-gray-500'> Courses assigned to you this semester </p>
    </div>


        
      
 
</div>
    {/* table */}
    
        <table className='mt-4'>
            <thead className='bg-slate-50 border-b w-full border-slate-200 mt-4'>
                <tr className='bg-blue-100 text-left text-slate-500 font-normal  '>
                <th className='font-normal p-4'> Course Code </th>
                <th className='font-normal p-4'> Course Title </th>
                <th className='font-normal p-4'> Category </th>
                <th className='font-normal p-4'> Type </th>
                <th className='font-normal p-4'> Level </th>
                <th className='font-normal p-4'>Students</th>
                <th className='font-normal p-4'> Submitted Date </th>
                <th className='font-normal p-4'> Status </th>
            </tr>
        </thead>
    </table>
 

        </div>
  )
}

export default Submitted