import { ChevronDown } from 'lucide-react'
import React from 'react'

const SemesterSummary = ({ selectedDepartment, selectedProgramme, selectedLevel }) => {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [session, setSession] = React.useState('')
  const [semester, setSemester] = React.useState('')
  const [error, setError] = React.useState(null)
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  React.useEffect(() => {
    if (selectedDepartment && selectedLevel && selectedProgramme) {
      fetchSemesterSummary()
    }
  }, [selectedDepartment, selectedLevel, selectedProgramme])

  const fetchSemesterSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/senate/results/semestersummary', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentID: parseInt(selectedDepartment),
          programmeID: parseInt(selectedProgramme),
          levelID: parseInt(selectedLevel)
        })
      })
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setSession(result.session)
        setSemester(result.semester)
      } else {
        setError('Failed to fetch semester summary')
      }
    } catch (err) {
      console.error('Error fetching semester summary:', err)
      setError('Error fetching semester summary')
    } finally {
      setLoading(false)
    }
  }

  const paginate = (items) => {
    const start = (currentPage - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }

  const totalPages = Math.ceil(data.length / itemsPerPage)

  return (
    <div className='bg-white rounded-md shadow flex flex-col gap-4 py-2'>
      <div className='flex items-center gap-2 px-4 py-2'>
        <div>
          <h1 className='font-semibold text-black'>Semester Summary</h1>
          <p className='text-slate-600 text-sm'>{session && semester ? `${session} — ${semester}` : 'Current semester GPA and cumulative results'}</p>
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
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>S/N</th>
                      <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>Matric No</th>
                      <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>Name</th>
                      <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>Gender</th>
                      <th colSpan='5' className='px-4 py-2 text-center font-semibold bg-blue-50 border-b'>Current Semester</th>
                      <th colSpan='5' className='px-4 py-2 text-center font-semibold bg-green-50 border-l'>Cumulative Total</th>
                    </tr>
                    <tr>
                      <th className='px-4 py-2 text-center font-semibold bg-blue-50'>Total Units</th>
                      <th className='px-4 py-2 text-center font-semibold bg-blue-50'>Total Passed</th>
                      <th className='px-4 py-2 text-center font-semibold bg-blue-50'>GP</th>
                      <th className='px-4 py-2 text-center font-semibold bg-blue-50'>GPA</th>
                      <th className='px-4 py-2 text-center font-semibold bg-blue-50 border-r'>Units O/S</th>
                      <th className='px-4 py-2 text-center font-semibold bg-green-50'>Total Units</th>
                      <th className='px-4 py-2 text-center font-semibold bg-green-50'>Total Passed</th>
                      <th className='px-4 py-2 text-center font-semibold bg-green-50'>GP</th>
                      <th className='px-4 py-2 text-center font-semibold bg-green-50'>CGPA</th>
                      <th className='px-4 py-2 text-center font-semibold bg-green-50'>O/S Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan='14' className='px-4 py-8 text-center text-gray-500'>No summary data available</td>
                      </tr>
                    ) : (
                      paginate(data).map((student, index) => (
                        <tr key={index} className='border-b hover:bg-gray-50'>
                          <td className='px-4 py-3 border-r'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className='px-4 py-3 font-medium border-r'>{student.MatNo}</td>
                          <td className='px-4 py-3 font-medium border-r'>{student.LastName} {student.OtherNames}</td>
                          <td className='px-4 py-3 border-r'>{student.Gender}</td>
                          <td className='px-4 py-3 text-center bg-blue-50'>{student.TotalUnitsTaken || 0}</td>
                          <td className='px-4 py-3 text-center bg-blue-50'>{student.TotalUnitsPassed || 0}</td>
                          <td className='px-4 py-3 text-center bg-blue-50'>{student.TotalGradePoints || 0}</td>
                          <td className='px-4 py-3 text-center bg-blue-50 font-semibold'>{student.GPA || '0.00'}</td>
                          <td className='px-4 py-3 text-center bg-blue-50 text-red-600 border-r'>{student.TotalUnitsFailed || 0}</td>
                          <td className='px-4 py-3 text-center bg-green-50'>{student.CummulativeUnit || 0}</td>
                          <td className='px-4 py-3 text-center bg-green-50'>{student.CumulativeUnitsPassed || 0}</td>
                          <td className='px-4 py-3 text-center bg-green-50'>{student.CumulativeGradePoints || 0}</td>
                          <td className='px-4 py-3 text-center bg-green-50 font-semibold text-lg'>{student.CGPA || '0.00'}</td>
                          <td className='px-4 py-3 text-center bg-green-50 text-red-600'>{student.CumulativeUnitsFailed || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      }

      {selectedDepartment && selectedLevel && selectedProgramme && !isCollapsed && data.length > 0 && (
        <div className='w-full py-2 px-4 flex items-center justify-between'>
          <div className='flex gap-2 text-sm font-medium text-slate-600'>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
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

export default SemesterSummary