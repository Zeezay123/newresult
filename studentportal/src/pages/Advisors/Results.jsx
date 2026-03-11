import React from 'react'
import { Loader2, ChevronDown, ChevronUp, Download, Check, X } from 'lucide-react'


const Results = () => {
  const [previousCumulative, setPreviousCumulative] = React.useState([])
  const [currentCourses, setCurrentCourses] = React.useState([])
  const [semesterSummary, setSemesterSummary] = React.useState([])
  const [carryovers, setCarryovers] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [sessionInfo, setSessionInfo] = React.useState({ session: '', semester: '' })
  const [approving, setApproving] = React.useState(false)
  const [rejecting, setRejecting] = React.useState(false)
  const [showRejectModal, setShowRejectModal] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [downloading, setDownloading] = React.useState(false)
  
  // Pagination states
  const [currentPage1, setCurrentPage1] = React.useState(1)
  const [currentPage2, setCurrentPage2] = React.useState(1)
  const [currentPage3, setCurrentPage3] = React.useState(1)
  const [currentPage4, setCurrentPage4] = React.useState(1)
  const itemsPerPage = 20
  
  // Collapse states
  const [isTable1Collapsed, setIsTable1Collapsed] = React.useState(false)
  const [isTable2Collapsed, setIsTable2Collapsed] = React.useState(false)
  const [isTable3Collapsed, setIsTable3Collapsed] = React.useState(false)
  const [isTable4Collapsed, setIsTable4Collapsed] = React.useState(false)

  React.useEffect(() => {
    fetchAllResults()
  }, [])

  const fetchAllResults = async () => {

    try {
      // Fetch all 4 endpoints in parallel
      const [prevCumRes, currentCoursesRes, summaryRes, carryoversRes] = await Promise.all([
        fetch('/api/advisor/previous-cumulative', { credentials: 'include' }),
        fetch('/api/advisor/current-courses', { credentials: 'include' }),
        fetch('/api/advisor/semester-summary', { credentials: 'include' }),
        fetch('/api/advisor/carryovers', { credentials: 'include' })
      ])

      if (prevCumRes.ok) {
        const data = await prevCumRes.json()
        setPreviousCumulative(data.data || [])
      }

      if (currentCoursesRes.ok) {
        const data = await currentCoursesRes.json()
        setCurrentCourses(data.students || [])
        setSessionInfo({ session: data.session, semester: data.semester })
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSemesterSummary(data.data || [])
      }

      if (carryoversRes.ok) {
        const data = await carryoversRes.json()
        setCarryovers(data.students || [])
      }

    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveResults = async () => {
    if (!window.confirm('Are you sure you want to approve all level results for this semester?')) {
      return
    }

    setApproving(true)
    try {
      const response = await fetch('/api/advisor/approve-level', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Results approved successfully')
        // Refresh the results after approval
        await fetchAllResults()
      } else {
        alert(data.message || 'Failed to approve results')
      }
    } catch (error) {
      console.error('Error approving results:', error)
      alert('An error occurred while approving results')
    } finally {
      setApproving(false)
    }
  }

  const handleRejectResults = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setRejecting(true)
    try {
      const response = await fetch('/api/advisor/reject-level', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Results rejected successfully')
        setShowRejectModal(false)
        setRejectionReason('')
        // Refresh the results after rejection
        await fetchAllResults()
      } else {
        alert(data.message || 'Failed to reject results')
      }
    } catch (error) {
      console.error('Error rejecting results:', error)
      alert('An error occurred while rejecting results')
    } finally {
      setRejecting(false)
    }
  }

  const handleDownloadResults = async () => {
    setDownloading(true)
    try {
      const response = await fetch('/api/advisor/download-level', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        // Get the filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = 'Level_Results.xlsx'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        // Convert response to blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('Results downloaded successfully')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to download results')
      }
    } catch (error) {
      console.error('Error downloading results:', error)
      alert('An error occurred while downloading results')
    } finally {
      setDownloading(false)
    }
  }

  // Pagination helper
  const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }

  const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage)

  const PaginationControls = ({ currentPage, setCurrentPage, totalItems }) => {
    const totalPages = getTotalPages(totalItems)
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems.length)} of {totalItems.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    )
  }

  return (
    <main className="flex flex-col w-full p-4 gap-6">
      <div className='flex items-center justify-between'> 
        
        <div className="py-4 px-2">
          <h1 className="text-3xl font-bold text-black">Class Results Sheet</h1>
          <p className="text-sm text-slate-500">
            View student results for {sessionInfo.semester}, {sessionInfo.session}
          </p>
        </div>

        <div className='flex items-center gap-4'> 
          <button 
            onClick={handleDownloadResults}
            disabled={downloading}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {downloading ? (
              <>
                <Loader2 size={20} className="animate-spin"/>
                Downloading...
              </>
            ) : (
              <>
                <Download size={20}/>
                Download Results
              </>
            )}
          </button>

          <button 
            onClick={handleApproveResults}
            disabled={approving}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {approving ? (
              <>
                <Loader2 size={20} className="animate-spin"/>
                Approving...
              </>
            ) : (
              <>
                <Check size={20}/>
                Approve Level Results
              </>
            )}
          </button>

          <button 
            onClick={() => setShowRejectModal(true)}
            disabled={rejecting}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <X size={20}/>
            Reject Level Results
          </button>
        </div>
      </div>  

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Reject Level Results</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting the results. This will be sent back to the HOD.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-lg p-3 mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={rejecting}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                disabled={rejecting}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectResults}
                disabled={rejecting || !rejectionReason.trim()}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {rejecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin"/>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X size={18}/>
                    Reject Results
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table 1: Previous Cumulative Results */}
      <section className="bg-white rounded-lg shadow-sm">
        <div 
          className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsTable1Collapsed(!isTable1Collapsed)}
        >
          <div>
            <h2 className="font-semibold text-lg">Previous Cumulative Results</h2>
            <p className="text-sm text-gray-500">Academic performance up to (not including) current semester</p>
          </div>
          <button className="p-2">
            {isTable1Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
        {!isTable1Collapsed && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">S/N</th>
                    <th className="px-4 py-3 text-left font-semibold">Matric No</th>
                    <th className="px-4 py-3 text-center font-semibold">Core Units</th>
                    <th className="px-4 py-3 text-center font-semibold">Total Units</th>
                    <th className="px-4 py-3 text-center font-semibold">Units Passed</th>
                    <th className="px-4 py-3 text-center font-semibold">Cum. Points</th>
                    <th className="px-4 py-3 text-center font-semibold">CGPA</th>
                    <th className="px-4 py-3 text-center font-semibold">Core Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {previousCumulative.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No previous semester data (100 level first semester students)
                      </td>
                    </tr>
                  ) : (
                    paginate(previousCumulative, currentPage1).map((student, idx) => (
                      <tr key={student.MatricNo} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{((currentPage1 - 1) * itemsPerPage) + idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{student.MatricNo}</td>
                        <td className="px-4 py-3 text-center">{student.TotalCoreUnits || 0}</td>
                        <td className="px-4 py-3 text-center">{student.TotalUnitsTaken || 0}</td>
                        <td className="px-4 py-3 text-center">{student.TotalUnitsPassed || 0}</td>
                        <td className="px-4 py-3 text-center">{student.CumulativeGradePoints || 0}</td>
                        <td className="px-4 py-3 text-center font-semibold">{student.CGPA || '0.00'}</td>
                        <td className="px-4 py-3 text-center text-red-600 font-medium">
                          {student.CoreUnitsFailed || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls 
              currentPage={currentPage1} 
              setCurrentPage={setCurrentPage1} 
              totalItems={previousCumulative} 
            />
          </>
        )}
      </section>

      {/* Table 2: Current Semester Courses */}
      <section className="bg-white rounded-lg shadow-sm">
        <div 
          className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsTable2Collapsed(!isTable2Collapsed)}
        >
          <div>
            <h2 className="font-semibold text-lg">Current Semester Courses</h2>
            <p className="text-sm text-gray-500">All courses taken in {sessionInfo.semester}, {sessionInfo.session}</p>
          </div>
          <button className="p-2">
            {isTable2Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
        {!isTable2Collapsed && (
          <>
            <div className="overflow-x-auto">
              {currentCourses.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No courses found for current semester
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border border-gray-300 sticky left-0 bg-gray-50 z-10">
                        Matric No
                      </th>
                  {(() => {
                    // Get all unique courses across all students
                    const allCourses = new Map()
                    currentCourses.forEach(student => {
                      student.courses.forEach(course => {
                        if (!allCourses.has(course.CourseCode)) {
                          allCourses.set(course.CourseCode, {
                            CourseCode: course.CourseCode,
                            CourseType: course.CourseType,
                            CreditUnits: course.CreditUnits
                          })
                        }
                      })
                    })

                    return Array.from(allCourses.values()).map((course) => (
                      <th key={course.CourseCode} className="px-3 py-2 text-center font-semibold border border-gray-300 min-w-[80px]">
                        <div className="font-mono font-bold text-sm">{course.CourseCode}</div>
                        <div className="text-[10px] font-normal text-gray-600 mt-1">
                          ({course.CreditUnits}U {' '}
                          <span className={`${
                            course.CourseType === 'core' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {course.CourseType === 'core' ? 'C' : 'E'}
                          </span>)
                        </div>
                      </th>
                    ))
                  })()}
                </tr>
              </thead>
              <tbody>
                {paginate(currentCourses, currentPage2).map((student) => {
                  // Get all unique courses for header consistency
                  const allCourses = new Map()
                  currentCourses.forEach(s => {
                    s.courses.forEach(course => {
                      if (!allCourses.has(course.CourseCode)) {
                        allCourses.set(course.CourseCode, course.CourseCode)
                      }
                    })
                  })

                  return (
                    <tr key={student.MatricNo} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold border border-gray-300 sticky left-0 bg-white z-10">
                        {student.MatricNo}
                      </td>
                      {Array.from(allCourses.keys()).map((courseCode) => {
                        const course = student.courses.find(c => c.CourseCode === courseCode)
                        return (
                          <td key={courseCode} className="px-3 py-3 text-center border border-gray-300">
                            {course ? (
                              <span className={`font-semibold text-sm ${
                                course.Grade === 'A' ? 'text-green-600' :
                                course.Grade === 'B' ? 'text-blue-600' :
                                course.Grade === 'C' ? 'text-yellow-600' :
                                course.Grade === 'D' ? 'text-orange-600' :
                                course.Grade === 'F' ? 'text-red-600' :
                                'text-gray-900'
                              }`}>
                                {course.TotalScore}{course.Grade}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        <PaginationControls 
          currentPage={currentPage2} 
          setCurrentPage={setCurrentPage2} 
          totalItems={currentCourses} 
        />
      </>
    )}
  </section>

      {/* Table 3: Semester Summary (Current + Cumulative) */}
      <section className="bg-white rounded-lg shadow-sm">
        <div 
          className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsTable3Collapsed(!isTable3Collapsed)}
        >
          <div>
            <h2 className="font-semibold text-lg">Semester Summary</h2>
            <p className="text-sm text-gray-500">Current semester performance and cumulative totals</p>
          </div>
          <button className="p-2">
            {isTable3Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
        {!isTable3Collapsed && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th rowSpan="2" className="px-4 py-3 text-left font-semibold border-r">S/N</th>
                    <th rowSpan="2" className="px-4 py-3 text-left font-semibold border-r">Matric No</th>
                    
                    <th colSpan="5" className="px-4 py-2 text-center font-semibold bg-blue-50 border-b">
                      Current Semester
                    </th>
                    <th colSpan="5" className="px-4 py-2 text-center font-semibold bg-green-50 border-l">
                      Cumulative Total
                    </th>
                  </tr>
                  <tr>
                    {/* Current Semester Headers */}
                    <th className="px-4 py-2 text-center font-semibold bg-blue-50">Units</th>
                    <th className="px-4 py-2 text-center font-semibold bg-blue-50">Passed</th>
                    <th className="px-4 py-2 text-center font-semibold bg-blue-50">Points</th>
                    <th className="px-4 py-2 text-center font-semibold bg-blue-50">GPA</th>
                    <th className="px-4 py-2 text-center font-semibold bg-blue-50 border-r">Core Failed</th>
                    
                    {/* Cumulative Headers */}
                    <th className="px-4 py-2 text-center font-semibold bg-green-50">Units</th>
                    <th className="px-4 py-2 text-center font-semibold bg-green-50">Passed</th>
                    <th className="px-4 py-2 text-center font-semibold bg-green-50">Points</th>
                    <th className="px-4 py-2 text-center font-semibold bg-green-50">CGPA</th>
                    <th className="px-4 py-2 text-center font-semibold bg-green-50">Core Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterSummary.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                        No summary data available
                      </td>
                    </tr>
                  ) : (
                    paginate(semesterSummary, currentPage3).map((student, idx) => (
                      <tr key={student.MatricNo} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 border-r">{((currentPage3 - 1) * itemsPerPage) + idx + 1}</td>
                        <td className="px-4 py-3 font-medium border-r">{student.MatricNo}</td>
                        
                        {/* Current Semester */}
                        <td className="px-4 py-3 text-center bg-blue-50">{student.CurrentSemesterUnits || 0}</td>
                        <td className="px-4 py-3 text-center bg-blue-50">{student.CurrentSemesterUnitsPassed || 0}</td>
                        <td className="px-4 py-3 text-center bg-blue-50">{student.CurrentSemesterGradePoints || 0}</td>
                        <td className="px-4 py-3 text-center bg-blue-50 font-semibold">{student.CurrentGPA || '0.00'}</td>
                        <td className="px-4 py-3 text-center bg-blue-50 text-red-600 border-r">
                          {student.CurrentCoreUnitsFailed || 0}
                        </td>
                        
                        {/* Cumulative */}
                        <td className="px-4 py-3 text-center bg-green-50">{student.CumulativeUnits || 0}</td>
                        <td className="px-4 py-3 text-center bg-green-50">{student.CumulativeUnitsPassed || 0}</td>
                        <td className="px-4 py-3 text-center bg-green-50">{student.CumulativeGradePoints || 0}</td>
                        <td className="px-4 py-3 text-center bg-green-50 font-semibold text-lg">
                          {student.CGPA || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-center bg-green-50 text-red-600">
                          {student.CumulativeCoreUnitsFailed || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls 
              currentPage={currentPage3} 
              setCurrentPage={setCurrentPage3} 
              totalItems={semesterSummary} 
            />
          </>
        )}
      </section>

      {/* Table 4: Carryover Courses */}
      <section className="bg-white rounded-lg shadow-sm">
        <div 
          className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsTable4Collapsed(!isTable4Collapsed)}
        >
          <div>
            <h2 className="font-semibold text-lg">Carryover Courses (Previous Semester)</h2>
            <p className="text-sm text-gray-500">Failed core courses that need to be retaken</p>
          </div>
          <button className="p-2">
            {isTable4Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
        {!isTable4Collapsed && (
          <>
            <div className="overflow-x-auto">
              {carryovers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No carryover courses found 
                </div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 border-b-2">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border">S/N</th>
                      <th className="px-4 py-3 text-left font-semibold border">Matric No</th>
                      <th className="px-4 py-3 text-left font-semibold border">Carryover Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(carryovers, currentPage4).map((student, idx) => (
                      <tr key={student.MatricNo} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 border">{((currentPage4 - 1) * itemsPerPage) + idx + 1}</td>
                        <td className="px-4 py-3 font-mono font-semibold border">
                          {student.MatricNo}
                        </td>
                        <td className="px-4 py-3 border">
                          <span className="font-mono text-red-600 font-semibold">
                            {student.failedCourses.map(course => course.CourseCode).join(', ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <PaginationControls 
              currentPage={currentPage4} 
              setCurrentPage={setCurrentPage4} 
              totalItems={carryovers} 
            />
          </>
        )}
      </section>
    </main>
  )
}

export default Results