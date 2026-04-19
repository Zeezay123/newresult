import React from 'react'
import Submitted from '../../components/Layout/lecturer/Submitted'
import { Select } from 'flowbite-react'

const Courses = () => {
 const [selectedSession, setSelectedSession] = React.useState('')
 const [selectedSemester, setSelectedSemester] = React.useState('')
 const [sessions, setSessions] = React.useState([])
 const [semesters, setSemesters] = React.useState([])



 const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/active-session', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSessions(data.session ? [data.session] : [])
        setSelectedSession(data.session ? data.session.SessionID : '')
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }
 
  const fetchActiveSemester = async () => {
    try{

      const response = await fetch('/api/sessions/getActiveSemester', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch active semester')
      }
      const data = await response.json()
      setSemesters(data.semester ? [data.semester] : [])
      setSelectedSemester(data.semester ? data.semester.SemesterID : '')
    } catch (error) {
      console.error('Error fetching active semester:', error)
    }
  }

  React.useEffect(() => {
    fetchSessions();
    fetchActiveSemester();
  }, []);




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
                {sessions.map((session) => (
                  <option key={session.SessionID} value={session.SessionID}>
                    {session.SessionName}
                  </option>
                ))} 
            </Select>
        </div>

        <div className='w-40'>
            <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                <option value=''> Select Semester </option>
              {semesters.map((semester) => (
                  <option key={semester.SemesterID} value={semester.SemesterID}>
                    {semester.SemesterName}
                  </option>
                ))} 
            </Select>
        </div>
       
    </div>
    
     </div>

        {/* table component */}
        <Submitted session={selectedSession} semester={selectedSemester} />
    </div>
  )
}

export default Courses