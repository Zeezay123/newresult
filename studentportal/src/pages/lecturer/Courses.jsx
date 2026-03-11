import React from 'react'
import Submitted from '../../components/Layout/lecturer/Submitted'
import { Select } from 'flowbite-react'

const Courses = () => {
 const [selectedSession, setSelectedSession] = React.useState('')
 const [selectedSemester, setSelectedSemester] = React.useState('')

  return (
    <div className='flex flex-col p-4 '>
     
     <div className='flex place-items-end justify-between'>


      <div> 
        <h1 className='font-[inter] text-black font-bold text-xl md:text-3xl '> 
    Submitted Courses
        </h1>
        <p className='text-gray-600'>List of courses that have been submitted by the lecturer.</p>
    </div>



  {/* session and semester  */}

    <div className='flex space-x-2 '>
      
        <div className='w-40'>
            <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                <option value=''> Select Session </option>
                <option value='1'> 2023/2024 </option>
                <option value='2'> 2024/2025 </option>
            </Select>
        </div>

        <div className='w-40'>
            <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                <option value=''> Select Semester </option>
                <option value='1'> First Semester </option>
                <option value='2'> Second Semester </option>
            </Select>
        </div>
      
    </div>
    
     </div>

        {/* table component */}
        <Submitted semester={selectedSemester} session={selectedSession} />
    </div>
  )
}

export default Courses