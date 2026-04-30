import React from 'react'
import { Select, Spinner } from 'flowbite-react'
import { Filter, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Previouscumulative from './Previouscumulative.jsx'
import CureentCourses from './Cureentcourses.jsx'
import SemesterSummary from './SemesterSummary.jsx'
import Carryover from './Carryover.jsx'

const PendingResults = () => {
  const [departments, setDepartments] = React.useState([])
  const [programmes, setProgrammes] = React.useState([])
  const [levels, setLevels] = React.useState([])
  const [selectedDepartment, setSelectedDepartment] = React.useState('')
  const [selectedProgramme, setSelectedProgramme] = React.useState('')
  const [selectedLevel, setSelectedLevel] = React.useState('')
  const [previousCumulative, setPreviousCumulative] = React.useState([])
  const [currentCumulative, setCurrentCumulative] = React.useState([])
  const [semesterSummary, setSemesterSummary] = React.useState([])
  const [carryOver, setCarryOver] = React.useState([])




  const [students, setStudents] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [sessionInfo, setSessionInfo] = React.useState({ session: '', semester: '' })
  const [actionState, setActionState] = React.useState('')
  
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

  const fetchLevelResults = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) {
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        departmentID: selectedDepartment,
        programmeID: selectedProgramme,
        levelID: selectedLevel
      })

      const response = await fetch(`/api/senate/results/levelResults?${params.toString()}`, {
        credentials: 'include'
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to fetch level results')
        setStudents([])
        return
      }

      setStudents(data.students || [])
      setSessionInfo({
        session: data.session || '',
        semester: data.semester || ''
      })
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching level results:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }


  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/senate/results/filters', { credentials: 'include' })
      const data = await response.json()
      if (data.success) {
        setDepartments(data.departments)
        setProgrammes(data.programmes)
        setLevels(data.levels)
        setSessionInfo({ session: data.session, semester: data.semester })
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }


  const handleDownload = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) {
      alert('Please select department, programme, and level')
      return
    }

    setActionState('download')
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
      setActionState('')
    }
  }

  const handleApprove = async () => {
    if (!selectedDepartment || !selectedProgramme || !selectedLevel) {
      alert('Please select department, programme, and level')
      return
    }

    if (!confirm('Are you sure you want to approve these level results?')) {
      return
    }

    setActionState('approve')
    try {
      const response = await fetch('/api/senate/results/approveLevelResults', {
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

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to approve results')
        return
      }

      alert(data.message || 'Level results approved successfully by Senate')
      await fetchLevelResults()
    } catch (error) {
      console.error('Error approving results:', error)
      alert('An error occurred while approving results')
    } finally {
      setActionState('')
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

    setActionState('reject')
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
      setActionState('')
    }
  }



  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-3 mb-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-black'>Pending Results - Senate Approval</h1>
          <p className='text-sm text-slate-600'>
            Review and approve HOD-approved results by department, programme, and level
            {sessionInfo.session && ` - ${sessionInfo.semester} Semester, ${sessionInfo.session}`}
          </p>
          {selectedDepartment && selectedProgramme && selectedLevel && (
            <p className='text-sm text-slate-500 mt-1'>Loaded students: {students.length}</p>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <button
            onClick={handleDownload}
            disabled={!selectedDepartment || !selectedProgramme || !selectedLevel || actionState !== ''}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {actionState === 'download' ? <Loader2 size={18} className='animate-spin' /> : <Download size={18} />}
            {actionState === 'download' ? 'Downloading...' : 'Download Results'}
          </button>

          <button
            onClick={handleApprove}
            disabled={!selectedDepartment || !selectedProgramme || !selectedLevel || actionState !== ''}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {actionState === 'approve' ? <Loader2 size={18} className='animate-spin' /> : <CheckCircle size={18} />}
            {actionState === 'approve' ? 'Approving...' : 'Approve Results'}
          </button>

          <button
            onClick={handleReject}
            disabled={!selectedDepartment || !selectedProgramme || !selectedLevel || actionState !== ''}
            className='flex items-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {actionState === 'reject' ? <Loader2 size={18} className='animate-spin' /> : <XCircle size={18} />}
            {actionState === 'reject' ? 'Rejecting...' : 'Reject Results'}
          </button>
        </div>
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
   <>
     <Previouscumulative
       selectedDepartment={selectedDepartment}
       selectedProgramme={selectedProgramme}
       selectedLevel={selectedLevel}
     /> 

      <CureentCourses 
      selectedDepartment={selectedDepartment}
      selectedProgramme={selectedProgramme}
      selectedLevel={selectedLevel}
      />

      <SemesterSummary 
      selectedDepartment={selectedDepartment}
      selectedProgramme={selectedProgramme}
      selectedLevel={selectedLevel}
      />

      <Carryover 
      selectedDepartment={selectedDepartment}
      selectedProgramme={selectedProgramme}
      selectedLevel={selectedLevel}
      />
   </>
    </div>
  )
}

export default PendingResults
