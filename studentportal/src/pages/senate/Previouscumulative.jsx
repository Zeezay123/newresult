import { ChevronDown } from 'lucide-react'
import React from 'react'

const Previouscumulative = ({ selectedDepartment, selectedProgramme, selectedLevel }) => {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  React.useEffect(() => {
    if (selectedDepartment && selectedLevel && selectedProgramme) {
      fetchPreviousCumulative()
    }
  }, [selectedDepartment, selectedLevel, selectedProgramme])

  const fetchPreviousCumulative = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/senate/results/previouscumres', {
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
      } else {
        setError('Failed to fetch previous cumulative results')
      }
    } catch (err) {
      console.error('Error fetching previous cumulative results:', err)
      setError('Error fetching previous cumulative results')
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
          <h1 className='font-semibold text-black'>Previous Cumulative Results</h1>
          <p className='text-slate-600 text-sm'>Cumulative academic performance before the current session</p>
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
                  <tr className='text-left text-sm text-slate-600'>
                    <th className='text-left px-4 py-2'>Matric No</th>
                    <th className='text-left px-4 py-2'>Name</th>
                    <th className='text-left px-4 py-2'>Gender</th>
                    <th className='text-center px-4 py-2'>Total Units</th>
                    <th className='text-center px-4 py-2'>Units Passed</th>
                    <th className='text-center px-4 py-2'>Core Units Failed</th>
                    <th className='text-center px-4 py-2'>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(data).map((student, index) => (
                    <tr key={index} className='text-xs border-b text-black border-slate-200 hover:bg-slate-50 transition-colors'>
                      <td className='text-left p-4 border border-slate-200'>{student.MatNo}</td>
                      <td className='text-left p-4 border border-slate-200'><span>{student.LastName} </span><span>{student.OtherNames}</span></td>
                      <td className='text-left p-4 border border-slate-200'>{student.Gender}</td>
                      <td className='text-center p-4 border border-slate-200'>{student.TotalCreditUnits}</td>
                      <td className='text-center p-4 border border-slate-200'>{student.TotalCreditUnitsPassed}</td>
                      <td className='text-center p-4 border border-slate-200'>{student.TotalCoreUnitsFailed}</td>
                      <td className='text-center p-4 border border-slate-200 font-semibold'>{student.CGPA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default Previouscumulative