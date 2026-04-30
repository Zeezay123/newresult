import React from 'react'
import { Select, Spinner } from 'flowbite-react'
import { Filter, Download, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useSelector } from 'react-redux'

const LevelResult = () => {
  const [previousCumulative, setPreviousCumulative] = React.useState([])
  const [currentCourses, setCurrentCourses] = React.useState([])
  const [semesterSummary, setSemesterSummary] = React.useState([])
  const [carryovers, setCarryovers] = React.useState([])
  const [programmes, setProgrammes] = React.useState([])
  const [levels, setLevels] = React.useState([])
  const [selectedProgramme, setSelectedProgramme] = React.useState('')
  const [selectedLevel, setSelectedLevel] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [initializing, setInitializing] = React.useState(true)
  const [sessionInfo, setSessionInfo] = React.useState({ session: '', semester: '' })
  const [actionState, setActionState] = React.useState('')

  const [currentPage1, setCurrentPage1] = React.useState(1)
  const [currentPage2, setCurrentPage2] = React.useState(1)
  const [currentPage3, setCurrentPage3] = React.useState(1)
  const [currentPage4, setCurrentPage4] = React.useState(1)
  const itemsPerPage = 20

  const [isTable1Collapsed, setIsTable1Collapsed] = React.useState(false)
  const [isTable2Collapsed, setIsTable2Collapsed] = React.useState(false)
  const [isTable3Collapsed, setIsTable3Collapsed] = React.useState(false)
  const [isTable4Collapsed, setIsTable4Collapsed] = React.useState(false)

  const hodId = useSelector((state) => state.user.department)

  React.useEffect(() => {
    fetchProgrammesAndLevels()
  }, [])

  React.useEffect(() => {
    if (selectedProgramme && selectedLevel) {
      fetchAllResults(selectedProgramme, selectedLevel)
    }
  }, [selectedProgramme, selectedLevel])

  const getRequestBody = (programmeId = selectedProgramme, levelId = selectedLevel) => ({
    ProgrammeID: programmeId,
    LevelID: levelId
  })

  const fetchProgrammesAndLevels = async () => {
    try {
      setInitializing(true)
      const response = await fetch('/api/hod/results/programmes-levels/', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch programmes and levels')
      }

      const data = await response.json()
      const fetchedProgrammes = data.programmes || []
      const fetchedLevels = data.levels || []

      setProgrammes(fetchedProgrammes)
      setLevels(fetchedLevels)

      if (fetchedProgrammes.length > 0) {
        setSelectedProgramme(String(fetchedProgrammes[0].ProgrammeID))
      }
      if (fetchedLevels.length > 0) {
        setSelectedLevel(String(fetchedLevels[0].LevelID))
      }
    } catch (error) {
      console.error('Error fetching programmes and levels:', error)
    } finally {
      setInitializing(false)
    }
  }

  const fetchAllResults = async (programmeId = selectedProgramme, levelId = selectedLevel) => {
    try {
      setLoading(true)

      const buildRequestOptions = () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(getRequestBody(programmeId, levelId))
      })

      const [prevCumRes, currentCoursesRes, summaryRes, carryoversRes] = await Promise.all([
        fetch('/api/hod/results/previous-cumulative', buildRequestOptions()),
        fetch('/api/hod/results/current-courses', buildRequestOptions()),
        fetch('/api/hod/results/semester-summary', buildRequestOptions()),
        fetch('/api/hod/results/carryovers', buildRequestOptions())
      ])

      if (prevCumRes.ok) {
        const data = await prevCumRes.json()
        setPreviousCumulative(data.data || [])
      } else {
        setPreviousCumulative([])
      }

      if (currentCoursesRes.ok) {
        const data = await currentCoursesRes.json()
        setCurrentCourses(data.students || [])
        setSessionInfo({ session: data.session || '', semester: data.semester || '' })
      } else {
        setCurrentCourses([])
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSemesterSummary(data.data || [])
      } else {
        setSemesterSummary([])
      }

      if (carryoversRes.ok) {
        const data = await carryoversRes.json()
        setCarryovers(data.students || [])
      } else {
        setCarryovers([])
      }

      setCurrentPage1(1)
      setCurrentPage2(1)
      setCurrentPage3(1)
      setCurrentPage4(1)
    } catch (error) {
      console.error('Error fetching level results:', error)
      setPreviousCumulative([])
      setCurrentCourses([])
      setSemesterSummary([])
      setCarryovers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResults = async () => {
    if (!selectedProgramme || !selectedLevel) return

    setActionState('download')
    try {
      const params = new URLSearchParams({
        programmeID: selectedProgramme,
        levelId: selectedLevel
      })

      const response = await fetch(`/api/hod/results/downloadLevelResults/${hodId}?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        alert(data?.message || 'Failed to download results')
        return
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'Level_Results.xlsx'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/) 
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1]
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchor)
    } catch (error) {
      console.error('Error downloading results:', error)
      alert('An error occurred while downloading results')
    } finally {
      setActionState('')
    }
  }

  const handleApproveResults = async () => {
    if (!selectedProgramme || !selectedLevel) return
    if (!window.confirm('Approve these advisor-approved level results for senate review?')) {
      return
    }

    setActionState('approve')
    try {
      const response = await fetch(`/api/hod/results/approveLevelResults/${hodId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getRequestBody())
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to approve level results')
        return
      }

      alert(data.message || 'Level results approved successfully')
      await fetchAllResults()
    } catch (error) {
      console.error('Error approving level results:', error)
      alert('An error occurred while approving level results')
    } finally {
      setActionState('')
    }
  }

  const handleRejectResults = async () => {
    if (!selectedProgramme || !selectedLevel) return
    if (!window.confirm('Reject these level results and keep them from senate review?')) {
      return
    }

    setActionState('reject')
    try {
      const response = await fetch(`/api/hod/results/rejectLevelResults/${hodId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getRequestBody())
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to reject level results')
        return
      }

      alert(data.message || 'Level results rejected successfully')
      await fetchAllResults()
    } catch (error) {
      console.error('Error rejecting level results:', error)
      alert('An error occurred while rejecting level results')
    } finally {
      setActionState('')
    }
  }

  const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)
  }

  const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage)

  const PaginationControls = ({ currentPage, setCurrentPage, totalItems }) => {
    const totalPages = getTotalPages(totalItems)
    if (totalPages <= 1) return null

    return (
      <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
        <div className='text-sm text-gray-700'>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems.length)} of {totalItems.length} entries
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className='px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
          >
            Previous
          </button>
          <span className='px-3 py-1 text-sm'>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className='px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  const selectedProgrammeName = programmes.find((programme) => String(programme.ProgrammeID) === selectedProgramme)?.ProgrammeName
  const selectedLevelName = levels.find((level) => String(level.LevelID) === selectedLevel)?.LevelName

  if (initializing) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner size='xl' />
      </div>
    )
  }

  return (
    <main className='flex flex-col w-full p-4 gap-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='py-2'>
          <h1 className='text-3xl font-bold text-black'>Level Results</h1>
          <p className='text-sm text-slate-500'>
            HOD review of advisor-approved level results before senate can access them
            {sessionInfo.session && sessionInfo.semester && ` for ${sessionInfo.semester} Semester, ${sessionInfo.session}`}
          </p>
          {selectedProgrammeName && selectedLevelName && (
            <p className='text-sm text-slate-600 mt-1'>Currently viewing {selectedProgrammeName} - {selectedLevelName}</p>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <button
            onClick={handleDownloadResults}
            disabled={!selectedProgramme || !selectedLevel || actionState !== ''}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {actionState === 'download' ? <Loader2 size={18} className='animate-spin' /> : <Download size={18} />}
            {actionState === 'download' ? 'Downloading...' : 'Download Results'}
          </button>

          <button
            onClick={handleApproveResults}
            disabled={!selectedProgramme || !selectedLevel || actionState !== ''}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {actionState === 'approve' ? <Loader2 size={18} className='animate-spin' /> : <CheckCircle size={18} />}
            {actionState === 'approve' ? 'Approving...' : 'Approve For Senate'}
          </button>

          {/* <button
            onClick={handleRejectResults}
            disabled={!selectedProgramme || !selectedLevel || actionState !== ''}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {actionState === 'reject' ? <Loader2 size={18} className='animate-spin' /> : <XCircle size={18} />}
            {actionState === 'reject' ? 'Rejecting...' : 'Reject Results'}
          </button> */}
        </div>
      </div>

      <section className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <Filter size={20} />
          <h2 className='font-semibold'>Filters</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Programme</label>
            <Select value={selectedProgramme} onChange={(e) => setSelectedProgramme(e.target.value)}>
              <option value=''>Select Programme</option>
              {programmes.map((programme) => (
                <option key={programme.ProgrammeID} value={programme.ProgrammeID}>
                  {programme.ProgrammeName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Level</label>
            <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
              <option value=''>Select Level</option>
              {levels.map((level) => (
                <option key={level.LevelID} value={level.LevelID}>
                  {level.LevelName}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <Spinner size='xl' />
        </div>
      ) : (
        <>
          <section className='bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900'>
            These results have been approved at advisor level and are awaiting final HOD decision before senate can view them.
          </section>

          <section className='bg-white rounded-lg shadow-sm'>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50' onClick={() => setIsTable1Collapsed(!isTable1Collapsed)}>
              <div>
                <h2 className='font-semibold text-lg'>Previous Cumulative Results</h2>
                <p className='text-sm text-gray-500'>Academic performance up to, but not including, the current semester</p>
              </div>
              <button className='p-2'>
                {isTable1Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            {!isTable1Collapsed && (
              <>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-50 border-b'>
                      <tr>
                        <th className='px-4 py-3 text-left font-semibold'>S/N</th>
                        <th className='px-4 py-3 text-left font-semibold'>Matric No</th>
                        <th className='px-4 py-3 text-center font-semibold'>Core Units</th>
                        <th className='px-4 py-3 text-center font-semibold'>Total Units</th>
                        <th className='px-4 py-3 text-center font-semibold'>Units Passed</th>
                        <th className='px-4 py-3 text-center font-semibold'>Cum. Points</th>
                        <th className='px-4 py-3 text-center font-semibold'>CGPA</th>
                        <th className='px-4 py-3 text-center font-semibold'>O/S</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousCumulative.length === 0 ? (
                        <tr>
                          <td colSpan='8' className='px-4 py-8 text-center text-gray-500'>No previous cumulative data available for this programme and level</td>
                        </tr>
                      ) : (
                        paginate(previousCumulative, currentPage1).map((student, idx) => (
                          <tr key={student.MatNo || student.MatricNo} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3'>{((currentPage1 - 1) * itemsPerPage) + idx + 1}</td>
                            <td className='px-4 py-3 font-medium'>{student.MatNo || student.MatricNo}</td>
                            <td className='px-4 py-3 text-center'>{student.TotalCoreUnits || 0}</td>
                            <td className='px-4 py-3 text-center'>{student.TotalUnitsTaken || 0}</td>
                            <td className='px-4 py-3 text-center'>{student.TotalUnitsPassed || 0}</td>
                            <td className='px-4 py-3 text-center'>{student.CumulativeGradePoints || 0}</td>
                            <td className='px-4 py-3 text-center font-semibold'>{student.CGPA || '0.00'}</td>
                            <td className='px-4 py-3 text-center text-red-600 font-medium'>{student.CoreUnitsFailed || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationControls currentPage={currentPage1} setCurrentPage={setCurrentPage1} totalItems={previousCumulative} />
              </>
            )}
          </section>

          <section className='bg-white rounded-lg shadow-sm'>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50' onClick={() => setIsTable2Collapsed(!isTable2Collapsed)}>
              <div>
                <h2 className='font-semibold text-lg'>Current Semester Courses</h2>
                <p className='text-sm text-gray-500'>All approved exam results for the selected level and programme</p>
              </div>
              <button className='p-2'>
                {isTable2Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            {!isTable2Collapsed && (
              <>
                <div className='overflow-x-auto'>
                  {currentCourses.length === 0 ? (
                    <div className='px-4 py-8 text-center text-gray-500'>No current semester courses found</div>
                  ) : (
                    <table className='w-full text-xs border-collapse'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-4 py-3 text-left font-semibold border border-gray-300 sticky left-0 bg-gray-50 z-10'>Matric No</th>
                          <th className='px-4 py-3 text-left font-semibold border border-gray-300 bg-gray-50'>Name</th>
                          {(() => {
                            const allCourses = new Map()
                            currentCourses.forEach((student) => {
                              student.courses.forEach((course) => {
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
                              <th key={course.CourseCode} className='px-3 py-2 text-center font-semibold border border-gray-300 min-w-[80px]'>
                                <div className='font-mono font-bold text-sm'>{course.CourseCode}</div>
                                <div className='text-[10px] font-normal text-gray-600 mt-1'>
                                  ({course.CreditUnits}U <span className={course.CourseType === 'C' ? 'text-blue-600' : 'text-green-600'}>{course.CourseType === 'C' ? 'C' : 'E'}</span>)
                                </div>
                              </th>
                            ))
                          })()}
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(currentCourses, currentPage2).map((student) => {
                          const allCourses = new Map()
                          currentCourses.forEach((entry) => {
                            entry.courses.forEach((course) => {
                              if (!allCourses.has(course.CourseCode)) {
                                allCourses.set(course.CourseCode, course.CourseCode)
                              }
                            })
                          })

                          return (
                            <tr key={student.MatricNo} className='border-b hover:bg-gray-50'>
                              <td className='px-4 py-3 font-mono font-semibold border border-gray-300 sticky left-0 bg-white z-10'>{student.MatricNo}</td>
                              <td className='px-3 py-3 font-medium border border-gray-300'>{student.LastName} {student.OtherNames}</td>
                              {Array.from(allCourses.keys()).map((courseCode) => {
                                const course = student.courses.find((item) => item.CourseCode === courseCode)
                                return (
                                  <td key={courseCode} className='px-3 py-3 text-center border border-gray-300'>
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
                                      <span className='text-gray-400 text-xs'>-</span>
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
                <PaginationControls currentPage={currentPage2} setCurrentPage={setCurrentPage2} totalItems={currentCourses} />
              </>
            )}
          </section>

          <section className='bg-white rounded-lg shadow-sm'>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50' onClick={() => setIsTable3Collapsed(!isTable3Collapsed)}>
              <div>
                <h2 className='font-semibold text-lg'>Semester Summary</h2>
                <p className='text-sm text-gray-500'>Current semester performance and cumulative totals</p>
              </div>
              <button className='p-2'>
                {isTable3Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            {!isTable3Collapsed && (
              <>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>S/N</th>
                        <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>Matric No</th>
                        <th rowSpan='2' className='px-4 py-3 text-left font-semibold border-r'>Name</th>
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
                      {semesterSummary.length === 0 ? (
                        <tr>
                          <td colSpan='13' className='px-4 py-8 text-center text-gray-500'>No summary data available</td>
                        </tr>
                      ) : (
                        paginate(semesterSummary, currentPage3).map((student, idx) => (
                          <tr key={student.MatNo} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3 border-r'>{((currentPage3 - 1) * itemsPerPage) + idx + 1}</td>
                            <td className='px-4 py-3 font-medium border-r'>{student.MatNo}</td>
                            <td className='px-4 py-3 font-medium border-r'>{student.LastName} {student.OtherNames}</td>
                            <td className='px-4 py-3 text-center bg-blue-50'>{student.CurrentSemesterUnits || 0}</td>
                            <td className='px-4 py-3 text-center bg-blue-50'>{student.CurrentSemesterUnitsPassed || 0}</td>
                            <td className='px-4 py-3 text-center bg-blue-50'>{student.CurrentSemesterGradePoints || 0}</td>
                            <td className='px-4 py-3 text-center bg-blue-50 font-semibold'>{student.CurrentGPA || '0.00'}</td>
                            <td className='px-4 py-3 text-center bg-blue-50 text-red-600 border-r'>{student.CurrentCoreUnitsFailed || 0}</td>
                            <td className='px-4 py-3 text-center bg-green-50'>{student.CumulativeUnits || 0}</td>
                            <td className='px-4 py-3 text-center bg-green-50'>{student.CumulativeUnitsPassed || 0}</td>
                            <td className='px-4 py-3 text-center bg-green-50'>{student.CumulativeGradePoints || 0}</td>
                            <td className='px-4 py-3 text-center bg-green-50 font-semibold text-lg'>{student.CGPA || '0.00'}</td>
                            <td className='px-4 py-3 text-center bg-green-50 text-red-600'>{student.CumulativeCoreUnitsFailed || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationControls currentPage={currentPage3} setCurrentPage={setCurrentPage3} totalItems={semesterSummary} />
              </>
            )}
          </section>

          <section className='bg-white rounded-lg shadow-sm'>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50' onClick={() => setIsTable4Collapsed(!isTable4Collapsed)}>
              <div>
                <h2 className='font-semibold text-lg'>Carryover Courses</h2>
                <p className='text-sm text-gray-500'>Failed core courses from the previous semester</p>
              </div>
              <button className='p-2'>
                {isTable4Collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            {!isTable4Collapsed && (
              <>
                <div className='overflow-x-auto'>
                  {carryovers.length === 0 ? (
                    <div className='px-4 py-8 text-center text-gray-500'>No carryover courses found</div>
                  ) : (
                    <table className='w-full text-sm border-collapse'>
                      <thead className='bg-gray-50 border-b-2'>
                        <tr>
                          <th className='px-4 py-3 text-left font-semibold border'>S/N</th>
                          <th className='px-4 py-3 text-left font-semibold border'>Matric No</th>
                          <th className='px-4 py-3 text-left font-semibold border'>Carryover Courses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(carryovers, currentPage4).map((student, idx) => (
                          <tr key={student.MatricNo} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3 border'>{((currentPage4 - 1) * itemsPerPage) + idx + 1}</td>
                            <td className='px-4 py-3 font-mono font-semibold border'>{student.MatricNo}</td>
                            <td className='px-4 py-3 border'>
                              <span className='font-mono text-red-600 font-semibold'>{student.failedCourses.map((course) => course.CourseCode).join(', ')}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <PaginationControls currentPage={currentPage4} setCurrentPage={setCurrentPage4} totalItems={carryovers} />
              </>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default LevelResult