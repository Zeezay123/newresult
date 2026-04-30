import React from 'react'
import { Select, Spinner } from 'flowbite-react'

const StudentReport = () => {
  const [departments, setDepartments] = React.useState([])
  const [programmes, setProgrammes] = React.useState([])
  const [levels, setLevels] = React.useState([])
  const [selectedDepartment, setSelectedDepartment] = React.useState('')
  const [selectedProgramme, setSelectedProgramme] = React.useState('')
  const [selectedLevel, setSelectedLevel] = React.useState('')
  const [students, setStudents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [initializing, setInitializing] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetchFilters()
  }, [])

  React.useEffect(() => {
    if (selectedDepartment && selectedProgramme && selectedLevel) {
      fetchStudentReport(selectedDepartment, selectedProgramme, selectedLevel)
    }
  }, [selectedDepartment, selectedProgramme, selectedLevel])

  const fetchFilters = async () => {
    try {
      setInitializing(true)
      setError('')

      const response = await fetch('/api/dean/results/filters', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to load filters')
      }

      const data = await response.json()
      const nextDepartments = data.departments || []
      const nextProgrammes = data.programmes || []
      const nextLevels = data.levels || []

      setDepartments(nextDepartments)
      setProgrammes(nextProgrammes)
      setLevels(nextLevels)

      if (nextDepartments.length > 0) {
        setSelectedDepartment(String(nextDepartments[0].DepartmentID))
      }

      if (nextProgrammes.length > 0) {
        setSelectedProgramme(String(nextProgrammes[0].ProgrammeID))
      }

      if (nextLevels.length > 0) {
        setSelectedLevel(String(nextLevels[0].LevelID))
      }
    } catch (fetchError) {
      console.error('Error loading dean report filters:', fetchError)
      setError('Unable to load report filters.')
    } finally {
      setInitializing(false)
    }
  }

  const fetchStudentReport = async (departmentId, programmeId, levelId) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/dean/results/semester-summary', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentID: departmentId,
          programmeID: programmeId,
          levelID: levelId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load student report')
      }

      const data = await response.json()
      setStudents(data.data || [])
    } catch (fetchError) {
      console.error('Error loading dean student report:', fetchError)
      setStudents([])
      setError('Unable to load student report.')
    } finally {
      setLoading(false)
    }
  }

  const normalizedStudents = React.useMemo(() => {
    return students.map((student) => ({
      matricNo: student.MatNo,
      name: `${student.LastName || ''} ${student.OtherNames || ''}`.trim(),
      cgpa: Number.parseFloat(student.CGPA || 0),
      currentGpa: Number.parseFloat(student.CurrentGPA || 0)
    }))
  }, [students])

  const probationStudents = React.useMemo(() => {
    return normalizedStudents
      .filter((student) => student.cgpa <= 1.5)
      .sort((left, right) => left.cgpa - right.cgpa || left.name.localeCompare(right.name))
  }, [normalizedStudents])

  const bestStudents = React.useMemo(() => {
    return normalizedStudents
      .filter((student) => student.cgpa > 1.5)
      .sort((left, right) => right.cgpa - left.cgpa || left.name.localeCompare(right.name))
      .slice(0, 1)
  }, [normalizedStudents])

  const selectedDepartmentName = departments.find((department) => String(department.DepartmentID) === selectedDepartment)?.DepartmentName
  const selectedProgrammeName = programmes.find((programme) => String(programme.ProgrammeID) === selectedProgramme)?.ProgrammeName
  const selectedLevelName = levels.find((level) => String(level.LevelID) === selectedLevel)?.LevelName

  const renderTable = (rows, emptyMessage, variant) => {
    if (rows.length === 0) {
      return <div className='px-4 py-8 text-sm text-slate-500'>{emptyMessage}</div>
    }

    return (
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200 text-sm'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='px-4 py-3 text-left font-medium text-slate-700'>S/N</th>
              <th className='px-4 py-3 text-left font-medium text-slate-700'>Student</th>
              <th className='px-4 py-3 text-left font-medium text-slate-700'>Matric No</th>
              <th className='px-4 py-3 text-left font-medium text-slate-700'>CGPA</th>
              <th className='px-4 py-3 text-left font-medium text-slate-700'>Current GPA</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200'>
            {rows.map((student, index) => (
              <tr key={`${variant}-${student.matricNo}`} className='hover:bg-slate-50'>
                <td className='px-4 py-3 text-slate-700'>{index + 1}</td>
                <td className='px-4 py-3 font-medium text-slate-900'>{student.name || 'Unnamed Student'}</td>
                <td className='px-4 py-3 text-slate-700'>{student.matricNo}</td>
                <td className='px-4 py-3 text-slate-700'>{student.cgpa.toFixed(2)}</td>
                <td className='px-4 py-3 text-slate-700'>{student.currentGpa.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='rounded-lg bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900'>Student Report</h1>
            <p className='text-sm text-slate-600'>View probation and best-student reports for the selected department, programme, and level.</p>
          </div>

          <div className='grid w-full gap-3 md:grid-cols-3 lg:w-auto'>
            <div className='min-w-55'>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Department</label>
              <Select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} disabled={initializing}>
                {departments.map((department) => (
                  <option key={department.DepartmentID} value={department.DepartmentID}>
                    {department.DepartmentName}
                  </option>
                ))}
              </Select>
            </div>

            <div className='min-w-55'>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Programme</label>
              <Select value={selectedProgramme} onChange={(event) => setSelectedProgramme(event.target.value)} disabled={initializing}>
                {programmes.map((programme) => (
                  <option key={programme.ProgrammeID} value={programme.ProgrammeID}>
                    {programme.ProgrammeName}
                  </option>
                ))}
              </Select>
            </div>

            <div className='min-w-45'>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Level</label>
              <Select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} disabled={initializing}>
                {levels.map((level) => (
                  <option key={level.LevelID} value={level.LevelID}>
                    {level.LevelName}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {(selectedDepartmentName || selectedProgrammeName || selectedLevelName) && (
          <div className='mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            Showing report for {selectedDepartmentName || 'Selected Department'}{selectedProgrammeName ? `, ${selectedProgrammeName}` : ''}{selectedLevelName ? `, ${selectedLevelName}` : ''}
          </div>
        )}
      </div>

      {error ? (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      {initializing || loading ? (
        <div className='flex items-center justify-center rounded-lg bg-white p-12 shadow-sm'>
          <Spinner size='lg' />
          <span className='ml-3 text-sm text-slate-600'>Loading student report...</span>
        </div>
      ) : (
        <>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-lg bg-white p-5 shadow-sm'>
              <div className='text-sm text-slate-500'>Total Students</div>
              <div className='mt-2 text-2xl font-semibold text-slate-900'>{normalizedStudents.length}</div>
            </div>
            <div className='rounded-lg bg-white p-5 shadow-sm'>
              <div className='text-sm text-slate-500'>Probation</div>
              <div className='mt-2 text-2xl font-semibold text-red-600'>{probationStudents.length}</div>
            </div>
            <div className='rounded-lg bg-white p-5 shadow-sm'>
              <div className='text-sm text-slate-500'>Best Students</div>
              <div className='mt-2 text-2xl font-semibold text-emerald-600'>{bestStudents.length}</div>
            </div>
          </div>

          <div className='rounded-lg bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-4'>
              <h2 className='text-base font-semibold text-slate-900'>Probation List</h2>
              <p className='mt-1 text-sm text-slate-600'>Students with CGPA less than or equal to 1.50.</p>
            </div>
            {renderTable(probationStudents, 'No student is currently on probation for this selection.', 'probation')}
          </div>

          <div className='rounded-lg bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-4'>
              <h2 className='text-base font-semibold text-slate-900'>Best Students</h2>
              <p className='mt-1 text-sm text-slate-600'>Student with the highest CGPA for the selected department, programme, and level.</p>
            </div>
            {renderTable(bestStudents, 'No best-student record is available for this selection.', 'best')}
          </div>
        </>
      )}
    </div>
  )
}

export default StudentReport