import React from 'react'
import UnassignedCourses from '../../components/Layout/hod/AssignCourses/UnassignedCourses'
import AssignToLecture from '../../components/Layout/hod/AssignCourses/AssignToLecture'
import AssigncourseCard from '../../components/Layout/hod/AssignCourses/AssigncourseCard'
import AssignedTable from '../../components/Layout/hod/AssignCourses/AssignedTable'

const AssignToLecturer = () => {
const [selectedSession, setSelectedSession] = React.useState('')  
const [selectedSemester, setSelectedSemester] = React.useState('')
const [selectedLevel, setSelectedLevel] = React.useState('')
const [refreshKey, setRefreshKey] = React.useState(0)

const handleFilterChange = (filters) => {
  setSelectedSession(filters.session);
  setSelectedSemester(filters.semester);
  setSelectedLevel(filters.level);
}

const handleAssignmentSuccess = () => {
  // Trigger refresh by updating key
  setRefreshKey(prev => prev + 1);
}


  return (
    <div className='flex flex-col gap-2 p-4'>
    <div className='flex flex-col gap-2 mb-7'>
           <h1 className='text-2xl font-bold text-black'>Course Allocation</h1>
           <p className='text-sm text-slate-600'>Assign and Deallocate course to lecturers</p>
        </div>
    {/* <AssigncourseCard onFilterChange={handleFilterChange} key={refreshKey} /> */}

       <div className='flex gap-2'> 
      
        <AssignToLecture 
        
          onAssignmentSuccess={handleAssignmentSuccess}
          key={`lecturers-${refreshKey}`}
        />
        
        </div> 

        <AssignedTable refreshKey={refreshKey}  onAssignmentSuccess={handleAssignmentSuccess} />
    </div>
  )
}

export default AssignToLecturer