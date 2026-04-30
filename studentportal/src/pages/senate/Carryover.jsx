import { ChevronDown } from 'lucide-react'
import React from 'react'

const Carryover = ({ selectedDepartment, selectedProgramme, selectedLevel }) => {
  const [loading, setLoading] = React.useState(false)
  const [students, setStudents] = React.useState([])
  const [courses, setCourses] = React.useState([])
  const [session, setSession] = React.useState('')
  const [semester, setSemester] = React.useState('')
  const [error, setError] = React.useState(null)
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  React.useEffect(() => {
    if (selectedDepartment && selectedLevel && selectedProgramme) {
      fetchCarryover()
    }
  }, [selectedDepartment, selectedLevel, selectedProgramme])

  const fetchCarryover = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/senate/results/carryover', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentID: parseInt(selectedDepartment),
          programmeID: parseInt(selectedProgramme),
          levelID: parseInt(selectedLevel)
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError('Failed to fetch carryover data')
        return
      }

      setSession(data.session)
      setSemester(data.semester)

      const { failedCarryovers, missedCarryovers, currentSemesterRetakes } = data

      // Build unique courses from failed + missed lists
      const uniqueCourses = new Map()
      failedCarryovers.forEach(row => {
        if (!uniqueCourses.has(row.course_id)) {
          uniqueCourses.set(row.course_id, {
            courseID: row.course_id,
            courseCode: row.course_code,
            courseName: row.course_title,
            creditUnits: row.credit_unit
          })
        }
      })
      missedCarryovers.forEach(row => {
        if (!uniqueCourses.has(row.course_id)) {
          uniqueCourses.set(row.course_id, {
            courseID: row.course_id,
            courseCode: row.course_code,
            courseName: row.course_title,
            creditUnits: row.credit_unit
          })
        }
      })
      setCourses(Array.from(uniqueCourses.values()))

      // Build student map grouped by matric
      const studentMap = new Map()
      failedCarryovers.forEach(row => {
        const key = row.MatricNo
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            MatricNo: row.MatricNo,
            LastName: row.LastName,
            OtherNames: row.OtherNames,
            Gender: row.Gender,
            failedCourses: [],
            missedCourses: [],
            retakeCourses: []
          })
        }
        studentMap.get(key).failedCourses.push(row)
      })
      missedCarryovers.forEach(row => {
        const key = row.MatNo
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            MatricNo: row.MatNo,
            LastName: row.LastName,
            OtherNames: row.OtherNames,
            Gender: row.Gender,
            failedCourses: [],
            missedCourses: [],
            retakeCourses: []
          })
        }
        studentMap.get(key).missedCourses.push(row)
      })
      currentSemesterRetakes.forEach(row => {
        if (studentMap.has(row.MatricNo)) {
          studentMap.get(row.MatricNo).retakeCourses.push(row)
        }
      })

      setStudents(Array.from(studentMap.values()))
    } catch (err) {
      console.error('Error fetching carryover:', err)
      setError('Error fetching carryover data')
    } finally {
      setLoading(false)
    }
  }

  const paginate = (items) => {
    const start = (currentPage - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }

  const totalPages = Math.ceil(students.length / itemsPerPage)

  const getCellContent = (student, courseID) => {
    const retake = student.retakeCourses.find(r => r.course_id === courseID)
    if (retake) return <div><span>{retake.TotalScore} </span><span className='font-semibold'>{retake.Grade}</span></div>

    const failed = student.failedCourses.find(f => f.course_id === courseID)
    if (failed) return <span className='text-red-500 font-semibold'>F</span>

    const missed = student.missedCourses.find(m => m.course_id === courseID)
    if (missed) return <span className='text-orange-500 font-semibold'>Missed</span>

    return '-'
  }

  return (
    <div className='bg-white rounded-md shadow flex flex-col gap-4 py-2'>
      <div className='flex items-center gap-2 px-4 py-2'>
        <div>
          <h1 className='font-semibold text-black'>Carryover Courses</h1>
          <p className='text-slate-600 text-sm'>Failed and missed core courses for the selected level</p>
        </div>
        <ChevronDown onClick={() => setIsCollapsed(!isCollapsed)} className={`ml-auto cursor-pointer transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} size={20} />
      </div>

      {!selectedDepartment && !selectedProgramme && !selectedLevel
        ? <div className='p-4 text-sm text-slate-600 text-center'>Please select a department, programme and level to view results</div>
        : isCollapsed ? null : (
          <div>
            {loading && <div className='p-4 text-sm text-center text-slate-500'>Loading...</div>}
            {error && <div className='p-4 text-sm text-center text-red-500'>{error}</div>}
            {!loading && !error && (
              <table className='w-full'>
                <thead className='bg-slate-50'>
                  <tr className='text-left px-4 py-2 text-sm text-slate-600'>
                    <th className='text-left px-4 py-2'>Matric No</th>
                    <th className='text-left px-4 py-2'>Name</th>
                    <th className='text-left px-4 py-2'>Gender</th>
                    {courses.map((course, index) => (
                      <th key={index} className='text-center px-4 py-2'>
                        <div className='flex flex-col items-center'>
                          <span>{course.courseCode}</span>
                          <span>({course.creditUnits}cu)</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginate(students).map((student, index) => (
                    <tr key={index} className='text-xs border-b text-black border-slate-200 hover:bg-slate-50 transition-colors'>
                      <td className='text-left p-4 border border-slate-200'>{student.MatricNo}</td>
                      <td className='text-left p-4 border border-slate-200'><span>{student.LastName} </span><span>{student.OtherNames}</span></td>
                      <td className='text-left p-4 border border-slate-200'>{student.Gender}</td>
                      {courses.map((course, courseIndex) => (
                        <td key={courseIndex} className='text-center border border-slate-200 p-2'>
                          {getCellContent(student, course.courseID)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      }

      {selectedDepartment && selectedLevel && selectedProgramme && !isCollapsed && students.length > 0 && (
        <div className='w-full py-2 px-4 flex items-center justify-between'>
          <div className='flex gap-2 text-sm font-medium text-slate-600'>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length}
          </div>
          <div className='flex gap-3 text-sm'>
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className={`border px-2 rounded border-slate-700 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`}>Previous</button>
            <span className='px-3 py-1 text-sm'>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className={`border px-2 rounded border-slate-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Carryover