import React from 'react'
import { Select, Spinner } from 'flowbite-react'
import { Filter, Users, TrendingUp, BookOpen, GraduationCap, Download, CheckCircle, XCircle } from 'lucide-react'

const PendingResults = () => {
  const [departments, setDepartments] = React.useState([])
  const [programmes, setProgrammes] = React.useState([])
  const [levels, setLevels] = React.useState([])
  const [selectedDepartment, setSelectedDepartment] = React.useState('')
  const [selectedProgramme, setSelectedProgramme] = React.useState('')
  const [selectedLevel, setSelectedLevel] = React.useState('')
  const [students, setStudents] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [sessionInfo, setSessionInfo] = React.useState({ session: '', semester: '' })
  const [actionLoading, setActionLoading] = React.useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 20

  React.useEffect(() => {
    fetchFilters()
  }, [])

  React.useEffect(() => {
    if (selectedDepartment && selectedProgramme && selectedLevel) {
      fetchLevelResults()
    }
  }, [selectedDepartment, selectedProgramme, selectedLevel])

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/senate/results/filters', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
        setProgrammes(data.programmes || [])
        setLevels(data.levels || [])
        setSessionInfo({ session: data.session, semester: data.semester })
        
        // Auto-select first options if available
        if (data.departments && data.departments.length > 0) {
          setSelectedDepartment(data.departments[0].DepartmentID.toString())
        }
        if (data.programmes && data.programmes.length > 0) {
          setSelectedProgramme(data.programmes[0].ProgrammeID.toString())
        }
        if (data.levels && data.levels.length > 0) {
          setSelectedLevel(data.levels[0].LevelID.toString())
        }
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchLevelResults = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/senate/results/levelResults?departmentID=${selectedDepartment}&programmeID=${selectedProgramme}&levelID=${selectedLevel}`, 
        { credentials: 'include' }
      )
      
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setSessionInfo({ session: data.session, semester: data.semester })
      } else {
        console.error('Failed to fetch level results')
        setStudents([])
      }
    } catch (error) {
      console.error('Error fetching level results:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) {
      alert('Please select department, programme, and level')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(
        `/api/senate/results/downloadLevelResults?departmentID=${selectedDepartment}&programmeID=${selectedProgramme}&levelID=${selectedLevel}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (!response.ok) {
        alert('Failed to download results')
        return
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'senate_results.xlsx'
      
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition)
        if (matches && matches[1]) {
          filename = matches[1]
        }
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error downloading results:', error)
      alert('An error occurred while downloading the file')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) {
      alert('Please select department, programme, and level')
      return
    }

    if (!confirm('Are you sure you want to approve these level results? This is the final approval.')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/senate/results/approveLevelResults`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentID: parseInt(selectedDepartment),
          programmeID: parseInt(selectedProgramme),
          levelID: parseInt(selectedLevel)
        })
      })

      if (!response.ok) {
        alert('Failed to approve results')
        return
      }

      const data = await response.json()
      alert(data.message || 'Level results approved successfully by Senate')
      
      // Refresh the results
      fetchLevelResults()

    } catch (error) {
      console.error('Error approving results:', error)
      alert('An error occurred while approving results')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) {
      alert('Please select department, programme, and level')
      return
    }

    if (!confirm('Are you sure you want to reject these level results?')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/senate/results/rejectLevelResults`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentID: parseInt(selectedDepartment),
          programmeID: parseInt(selectedProgramme),
          levelID: parseInt(selectedLevel)
        })
      })

      if (!response.ok) {
        alert('Failed to reject results')
        return
      }

      const data = await response.json()
      alert(data.message || 'Level results rejected by Senate')
      
      // Refresh the results
      fetchLevelResults()

    } catch (error) {
      console.error('Error rejecting results:', error)
      alert('An error occurred while rejecting results')
    } finally {
      setActionLoading(false)
    }
  }

  const Pagination = ({ currentPage, setCurrentPage, totalItems }) => {
    const totalPages = Math.ceil(totalItems.length / itemsPerPage)

    if (totalItems.length === 0) return null

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
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

  if (loading && !selectedDepartment && !selectedProgramme && !selectedLevel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-black'>Pending Results - Senate Approval</h1>
        <p className='text-sm text-slate-600'>
          Review and approve HOD-approved results by department, programme, and level
          {sessionInfo.session && ` - ${sessionInfo.semester} Semester, ${sessionInfo.session}`}
        </p>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <Filter size={20} />
          <h2 className='font-semibold'>Filters</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Department</label>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.DepartmentID} value={dept.DepartmentID}>
                  {dept.DepartmentName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Programme</label>
            <Select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
            >
              <option value="">Select Programme</option>
              {programmes.map((programme) => (
                <option key={programme.ProgrammeID} value={programme.ProgrammeID}>
                  {programme.ProgrammeName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Level</label>
            <Select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">Select Level</option>
              {levels.map((level) => (
                <option key={level.LevelID} value={level.LevelID}>
                  {level.LevelName}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!loading && selectedDepartment && selectedProgramme && selectedLevel && students.length > 0 && (
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleDownload}
              disabled={actionLoading}
              className='flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-300'
            >
              <Download size={16} />
              Download Results
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className='flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <CheckCircle size={16} />
              Approve Results (Final)
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className='flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <XCircle size={16} />
              Reject Results
            </button>
          </div>
        </div>
      )}

      {loading && selectedDepartment && selectedProgramme && selectedLevel && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="xl" />
        </div>
      )}

      {!loading && selectedDepartment && selectedProgramme && selectedLevel && students.length > 0 && (
        <>
          {/* Summary Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>Total Students</p>
                  <p className='text-2xl font-bold text-gray-900'>{students.length}</p>
                </div>
                <Users size={32} className='text-blue-500' />
              </div>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>Average GPA</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {students.length > 0 
                      ? (students.reduce((sum, s) => sum + (s.GPA || 0), 0) / students.length).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
                <TrendingUp size={32} className='text-green-500' />
              </div>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>Average CGPA</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {students.length > 0 
                      ? (students.reduce((sum, s) => sum + (s.CGPA || 0), 0) / students.length).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
                <GraduationCap size={32} className='text-purple-500' />
              </div>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>Total Courses</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {students[0]?.courses.length || 0}
                  </p>
                </div>
                <BookOpen size={32} className='text-orange-500' />
              </div>
            </div>
          </div>

          {/* Student Results Table */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='p-4 border-b border-gray-200'>
              <h2 className='font-semibold text-lg'>Student Results</h2>
              <p className='text-sm text-gray-500'>Individual student performance with courses and GPA</p>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-20 border-r'>Matric No</th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-[120px] bg-gray-50 z-20 border-r'>Student Name</th>
                    {students[0]?.courses.map((course, idx) => (
                      <th key={idx} className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[100px]'>
                        <div>{course.CourseCode}</div>
                        <div className="text-xs font-normal text-gray-600">({course.CreditUnits}U)</div>
                      </th>
                    ))}
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-blue-50 border-l'>GPA</th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-green-50'>CGPA</th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-100'>Units</th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-100'>Passed</th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-100'>Failed</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((student, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-4 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r'>{student.MatricNo}</td>
                      <td className='px-4 py-4 text-sm text-gray-900 sticky left-[120px] bg-white z-10 border-r'>{student.StudentName}</td>
                      {student.courses.map((course, courseIdx) => (
                        <td key={courseIdx} className='px-4 py-4 text-sm text-center'>
                          <div className="font-medium text-gray-900">{course.TotalScore}</div>
                          <div className="text-xs text-gray-600">({course.Grade})</div>
                        </td>
                      ))}
                      <td className='px-4 py-4 text-sm text-center font-semibold bg-blue-50 border-l'>
                        {student.GPA ? student.GPA.toFixed(2) : '0.00'}
                      </td>
                      <td className='px-4 py-4 text-sm text-center font-semibold bg-green-50'>
                        {student.CGPA ? student.CGPA.toFixed(2) : '0.00'}
                      </td>
                      <td className='px-4 py-4 text-sm text-center bg-gray-50'>
                        {student.TotalCreditUnits || 0}
                      </td>
                      <td className='px-4 py-4 text-sm text-center text-green-600 bg-gray-50 font-medium'>
                        {student.TotalCreditUnitsPassed || 0}
                      </td>
                      <td className='px-4 py-4 text-sm text-center text-red-600 bg-gray-50 font-medium'>
                        {student.TotalCreditUnitsFailed || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={students} />
          </div>
        </>
      )}

      {!loading && selectedDepartment && selectedProgramme && selectedLevel && students.length === 0 && (
        <div className='flex flex-col justify-center items-center py-20 text-gray-500 bg-white rounded-lg shadow-sm'>
          <GraduationCap size={48} className='mb-4 text-gray-300' />
          <p className='text-lg font-medium'>No results found</p>
          <p className='text-sm'>No HOD-approved results available for the selected filters</p>
        </div>
      )}
    </div>
  )
}

export default PendingResults
