import React from 'react'
import { Badge, Select, Spinner, Modal, ModalBody, ModalHeader } from 'flowbite-react'
import { ClipboardList, RotateCcw, Loader2, Eye } from 'lucide-react'

const getStatusColor = (status) => {
  if (status === 'Approved') return 'success'
  if (status === 'Rejected') return 'failure'
  return 'warning'
}

const LecturerResubmission = () => {
  const [departments, setDepartments] = React.useState([])
  const [programmes, setProgrammes] = React.useState([])
  const [levels, setLevels] = React.useState([])
  const [selectedDepartment, setSelectedDepartment] = React.useState('')
  const [selectedProgramme, setSelectedProgramme] = React.useState('')
  const [selectedLevel, setSelectedLevel] = React.useState('')
  const [results, setResults] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [actionKey, setActionKey] = React.useState('')
  const [sessionInfo, setSessionInfo] = React.useState({ session: '', semester: '' })
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [detailRows, setDetailRows] = React.useState([])
  const [selectedRow, setSelectedRow] = React.useState(null)

  React.useEffect(() => {
    fetchFilters()
  }, [])

  React.useEffect(() => {
    fetchResubmissions()
  }, [selectedDepartment, selectedProgramme, selectedLevel])

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/dean/results/filters', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch dean filters')
      }

      const data = await response.json()
      setDepartments(data.departments || [])
      setProgrammes(data.programmes || [])
      setLevels(data.levels || [])
      setSessionInfo({ session: data.session || '', semester: data.semester || '' })

      if ((data.departments || []).length > 0) {
        setSelectedDepartment(String(data.departments[0].DepartmentID))
      }
      if ((data.programmes || []).length > 0) {
        setSelectedProgramme(String(data.programmes[0].ProgrammeID))
      }
      if ((data.levels || []).length > 0) {
        setSelectedLevel(String(data.levels[0].LevelID))
      }
    } catch (error) {
      console.error('Error fetching dean filters:', error)
    }
  }

  const fetchResubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedDepartment) params.append('departmentID', selectedDepartment)
      if (selectedProgramme) params.append('programmeID', selectedProgramme)
      if (selectedLevel) params.append('levelID', selectedLevel)

      const response = await fetch(`/api/dean/results/lecturer-resubmissions?${params.toString()}`, { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch dean lecturer resubmissions')
      }

      const data = await response.json()
      setResults(data.results || [])
      setSessionInfo({ session: data.session || '', semester: data.semester || '' })
    } catch (error) {
      console.error('Error fetching lecturer resubmissions:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleReopen = async (row) => {
    if (!window.confirm(`Reopen ${row.CourseCode} for ${row.LecturerName}?`)) {
      return
    }

    const key = `${row.CourseID}-${row.LecturerID}`

    try {
      setActionKey(key)
      const response = await fetch('/api/dean/results/reopen-lecturer-results', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseID: row.CourseID,
          lecturerID: row.LecturerID
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to reopen lecturer results')
        return
      }

      alert(data.message || 'Lecturer results reopened successfully')
      await fetchResubmissions()
    } catch (error) {
      console.error('Error reopening lecturer results:', error)
      alert('An error occurred while reopening results')
    } finally {
      setActionKey('')
    }
  }

  const handleViewDetails = async (row) => {
    try {
      setSelectedRow(row)
      setDetailOpen(true)
      setDetailLoading(true)

      const params = new URLSearchParams({
        courseID: String(row.CourseID),
        lecturerID: String(row.LecturerID)
      })

      const response = await fetch(`/api/dean/results/lecturer-resubmissions/details?${params.toString()}`, { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch lecturer resubmission details')
      }

      const data = await response.json()
      setDetailRows(data.results || [])
    } catch (error) {
      console.error('Error fetching lecturer resubmission details:', error)
      setDetailRows([])
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <main className='flex flex-col gap-4 p-4'>
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-black font-bold text-2xl'>Dean Lecturer Resubmission</h1>
        <p className='text-sm text-slate-600'>Faculty-level control page for reopening lecturer submissions and receiving corrected resubmissions.</p>
        {sessionInfo.session ? <div className='text-sm text-slate-500'>{sessionInfo.semester} Semester, {sessionInfo.session}</div> : null}
      </div>

      <section className='rounded-lg bg-white p-5 shadow-sm'>
        <div className='grid gap-4 md:grid-cols-3'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Department</label>
            <Select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
              {departments.map((item) => (
                <option key={item.DepartmentID} value={item.DepartmentID}>{item.DepartmentName}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Programme</label>
            <Select value={selectedProgramme} onChange={(event) => setSelectedProgramme(event.target.value)}>
              {programmes.map((item) => (
                <option key={item.ProgrammeID} value={item.ProgrammeID}>{item.ProgrammeName}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Level</label>
            <Select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
              {levels.map((item) => (
                <option key={item.LevelID} value={item.LevelID}>{item.LevelName}</option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className='rounded-lg bg-white shadow-sm'>
        <div className='border-b border-slate-200 px-5 py-4'>
          <h2 className='text-lg font-semibold text-slate-900'>Resubmission Workflow</h2>
          <p className='mt-1 text-sm text-slate-600'>Course-level lecturer submissions eligible for dean reopen actions.</p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center p-10'>
            <Spinner size='lg' />
            <span className='ml-3 text-sm text-slate-600'>Loading lecturer submissions...</span>
          </div>
        ) : results.length === 0 ? (
          <div className='p-10 text-sm text-slate-500 text-center'>No lecturer submissions found for the selected filters.</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200 text-sm'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Course</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Lecturer</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Department</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Programme</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Level</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Students</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Result Status</th>
                  <th className='px-4 py-3 text-left font-medium text-slate-700'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {results.map((row) => {
                  const key = `${row.CourseID}-${row.LecturerID}`
                  return (
                    <tr key={key} className='hover:bg-slate-50'>
                      <td className='px-4 py-3 text-slate-900'>
                        <div className='font-medium'>{row.CourseCode}</div>
                        <div className='text-xs text-slate-500'>{row.CourseTitle}</div>
                      </td>
                      <td className='px-4 py-3 text-slate-700'>{row.LecturerName}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.DepartmentName}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.ProgrammeName}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.LevelName}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.StudentCount}</td>
                      <td className='px-4 py-3'>
                        <Badge color={getStatusColor(row.ResultStatus)}>{row.ResultStatus}</Badge>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <button
                            onClick={() => handleViewDetails(row)}
                            className='inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors'
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => handleReopen(row)}
                            disabled={actionKey !== ''}
                            className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                          >
                            {actionKey === key ? <Loader2 size={16} className='animate-spin' /> : <RotateCcw size={16} />}
                            {actionKey === key ? 'Reopening...' : 'Reopen'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>



      <Modal show={detailOpen} size='6xl' dismissible onClose={() => setDetailOpen(false)}>
        <ModalHeader>
          Submission Details {selectedRow ? `- ${selectedRow.CourseCode} / ${selectedRow.LecturerName}` : ''}
        </ModalHeader>
        <ModalBody>
          {detailLoading ? (
            <div className='flex items-center justify-center py-10'>
              <Spinner size='lg' />
              <span className='ml-3 text-sm text-slate-600'>Loading submission details...</span>
            </div>
          ) : detailRows.length === 0 ? (
            <div className='py-10 text-center text-sm text-slate-500'>No student rows are available for this lecturer submission.</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-slate-200 text-sm'>
                <thead className='bg-slate-50'>
                  <tr>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Matric No</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Student</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>CA</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Exam</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Total</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Grade</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Result Status</th>
                    <th className='px-4 py-3 text-left font-medium text-slate-700'>Dean</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200'>
                  {detailRows.map((row) => (
                    <tr key={row.ResultID} className='hover:bg-slate-50'>
                      <td className='px-4 py-3 font-medium text-slate-900'>{row.MatricNo}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.StudentName}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.CA_Score ?? '-'}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.Exam_Score ?? '-'}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.TotalScore ?? '-'}</td>
                      <td className='px-4 py-3 text-slate-700'>{row.Grade || '-'}</td>
                      <td className='px-4 py-3'>
                        <Badge color={getStatusColor(row.ResultStatus)}>
                          {row.ResultStatus}
                        </Badge>
                      </td>
                      <td className='px-4 py-3'>
                        <Badge color={row.Bsc_Approval === 'Approved' ? 'success' : row.Bsc_Approval === 'Rejected' ? 'failure' : 'warning'}>
                          {row.Bsc_Approval || 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModalBody>
      </Modal>
    </main>
  )
}

export default LecturerResubmission