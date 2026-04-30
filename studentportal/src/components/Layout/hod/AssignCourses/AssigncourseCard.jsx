import React, { useEffect, useState } from 'react'
import { Select, Spinner, TextInput } from 'flowbite-react'
import { BookCheck, BookCopy, FileWarning, Users } from 'lucide-react'
import { useSelector } from 'react-redux'

const AssigncourseCard = ({ onFilterChange }) => {
  const [selectedSession, setSelectedSession] = useState('2');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    unallocatedCourses: 0,
    allocatedCourses: 0,
    availableLecturers: 0
  });

  const [cardStat, setCardStat] = useState({
    total: 0,
    assigned:0,
    unassigned:0, 
    lecturers:0 
  })


  const [loading, setLoading] = useState(false);
  const hodId = useSelector((state) => state.user.department);

  useEffect(() => {
    // fetchStatistics();
  }, [selectedSession, selectedSemester, selectedLevel]);

useEffect(()=>{
 
  fetchcardData();

},[])


const fetchcardData = async ()=>{
try {
  
     const [courseRes, lecturersRes] = await Promise.all([
  fetch(`/api/hod/courses/stats/${hodId}`, { credentials: 'include' }),
  fetch(`/api/hod/lecturers/getlecturers`, { credentials: 'include' })
])

  if(!courseRes.ok || !lecturersRes.ok){
    console.error("Failed to fetch one or more card data");
    return;
  }

  const [coursesData, lecturersData] = await Promise.all([
    courseRes.json(), 
    lecturersRes.json()
  ]);

  console.log('ll',lecturersData)
  console.log('ss',coursesData)
        setCardStat({
          total: coursesData.stats?.total,
          assigned: coursesData.stats?.assigned,
          unassigned: coursesData.stats?.total - coursesData.stats?.assigned,
          lecturers: lecturersData.lecturers?.length
        });

      console.log("Card Stats:", cardStat);

} catch (error) {
  console.log('cant do things', + error.message)
}
}

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        session: selectedSession,
        semester: selectedSemester,
        level: selectedLevel
      });
    }
  }, [selectedSession, selectedSemester, selectedLevel]);

  // const fetchStatistics = async () => {
  //   try {
  //     setLoading(true);
  //     const params = new URLSearchParams();
  //     if (selectedSession) params.append('sessionID', selectedSession);
  //     if (selectedSemester) params.append('semesterID', selectedSemester);
  //     if (selectedLevel) params.append('levelID', selectedLevel);

  //     // Fetch all courses
  //     const coursesResponse = await fetch(`/api/hod/courses/getcourses/${hodId}?${params}`, {
  //       credentials: 'include'
  //     });
  //     const coursesData = await coursesResponse.json();

  //     // Fetch lecturers
  //     const lecturersResponse = await fetch('/api/hod/lecturers/getlecturers', {
  //       credentials: 'include'
  //     });
  //     const lecturersData = await lecturersResponse.json();

  //     if (coursesData.success && lecturersData.success) {
  //       const totalCourses = coursesData.count;
  //       const allocatedCourses = coursesData.courses.filter(c => c.AssignedLecturer).length;
  //       const unallocatedCourses = totalCourses - allocatedCourses;

  //       setStats({
  //         totalCourses,
  //         unallocatedCourses,
  //         allocatedCourses,
  //         availableLecturers: lecturersData.count
  //       });
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch statistics:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
 
 
  return (
    <div className='flex flex-col gap-4 mb-6 p-4 border border-gray-300 rounded-lg shadow-lg bg-white '>
        {/* header */}
       

        {/* semester and session */}
        <div className='flex items-center gap-4 mt-6'>

            {/* semester search input */}
      

          
              {/* Session search input */}
          <div className='flex flex-col  gap-2'>
            <span className='text-black text-sm'> Session </span>
            {/* <Select className='w-40' value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
              <option value=""> Select Session </option>
              <option value='1'> 24/25 </option>
              <option value='2'> 25/26 </option>
            </Select> */}

            <TextInput
            value={'25/26'}
              readOnly
              disabled
            />
          </div>

              {/* semestersearch input */}
          <div className='flex flex-col  gap-2'>
            <span className='text-black text-sm'> Semester </span>
            {/* <Select className='w-40' value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              <option value=""> Select Semester </option>
              <option value='1'> First Semester </option>
              <option value='2'> Second Semester </option>
            </Select> */}

            <TextInput
            value={'First Semester'}
              readOnly
              disabled
            />
          </div>


              {/* semestersearch input */}
          <div className='flex flex-col  gap-2'>
            <span className='text-black text-sm'> Level </span>
            <Select className='w-40' value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
              <option value=""> Select Level </option>
              <option value='1'> 100 </option>
              <option value='2'> 200 </option>
              <option value='3'> 300 </option>
              <option value='4'> 400 </option>
              <option value='5'> 050 </option>
            </Select>
          </div>

          </div>

        {/* cards */}

          {loading ? (
            <div className='flex justify-center items-center py-10'>
              <Spinner size='xl' />
            </div>
          ) : (
          <div className='flex gap-2 my-5 '>
          
          <div className='flex border border-gray-300 rounded-lg shadow-sm p-4 w-md justify-between items-center'>
            <div className='flex flex-col gap-3'>
                <h1>Total Courses</h1>
                <h1 className='font-bold text-2xl'>{cardStat.total}</h1>
            </div>

            <span className='flex items-center justify-center bg-blue-100 p-2 text-blue-700 rounded-full'>
                <BookCopy/>
            </span>
          </div>


          <div className='flex border border-gray-300 rounded-lg shadow-sm p-4 w-md justify-between items-center'>
            <div className='flex flex-col gap-3'>
                <h1>Unallocated Courses</h1>
                <h1 className='font-bold text-2xl'>{cardStat.unassigned}</h1>
            </div>

            <span className='flex items-center justify-center bg-yellow-100 p-2 text-amber-500 rounded-full'>
                <FileWarning />
            </span>
          </div>



          <div className='flex border border-gray-300 rounded-lg shadow-sm p-4 w-md justify-between items-center'>
            <div className='flex flex-col gap-3'>
                <h1>Allocated Courses</h1>
                <h1 className='font-bold text-2xl'>{cardStat.assigned}</h1>
            </div>

            <span className='flex items-center justify-center bg-green-100 p-2 text-green-700 rounded-full'>
                <BookCheck/>
            </span>
          </div>


          <div className='flex border border-gray-300 rounded-lg shadow-sm p-4 w-md justify-between items-center'>
            <div className='flex flex-col gap-3'>
                <h1>Available Lecturers</h1>
                <h1 className='font-bold text-2xl'>{cardStat.lecturers}</h1>
            </div>

            <span className='flex items-center justify-center bg-blue-100 p-2 text-blue-700 rounded-full'>
                <Users/>
            </span>
          </div>

          </div>
          )}
    </div>
  )
}

export default AssigncourseCard