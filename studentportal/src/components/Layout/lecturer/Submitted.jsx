import React from 'react'
import { BookCopyIcon, CheckCircle2, FileX2 } from 'lucide-react'

const Submitted = ({semester, session}) => {

  const [results, setResults] = React.useState([])
  const [programmes, setProgrammes] = React.useState([])
  const [levels, setLevels] = React.useState([])
  const [selectedProgramme, setSelectedProgramme] = React.useState('')
  const [selectedLevel, setSelectedLevel] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const pageSize = 10

  React.useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [programmesResponse, levelsResponse] = await Promise.all([
          fetch('/api/programmes', { credentials: 'include' }),
          fetch('/api/levels/getlevels', { credentials: 'include' }),
        ])

        if (programmesResponse.ok) {
          const programmeData = await programmesResponse.json()
          setProgrammes(programmeData.programmes || [])
        }

        if (levelsResponse.ok) {
          const levelData = await levelsResponse.json()
          setLevels(levelData.levels || [])
        }
      } catch (fetchError) {
        console.error('Error fetching submission filters:', fetchError)
      }
    }

    fetchFilterOptions()
  }, [])

  React.useEffect(() => {
    if (!semester || !session) {
      setResults([])
      return
    }

    const fetchSubmittedResults = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          semesterId: semester,
          sessionId: session,
        })

        const response = await fetch(`/api/lecturers/submittedcourses?${params.toString()}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch submitted courses')
        }

        const data = await response.json()
        setResults(data.results || [])
      } catch (fetchError) {
        console.error('Error fetching submitted courses:', fetchError)
        setError(fetchError.message)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubmittedResults()
  }, [semester, session])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedProgramme, selectedLevel, results])


  const filteredResults = results.filter((item) => {
    const matchesProgramme = !selectedProgramme || String(item.ProgrammeID || '') === selectedProgramme
    const matchesLevel = !selectedLevel || String(item.LevelID || '') === selectedLevel

    return matchesProgramme && matchesLevel
  })

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize))
  const paginatedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const cardData = [
    {
      title: 'Test Submitted',
      value: filteredResults.filter((item) => item.ResultType === 'Test').length,
      icon: BookCopyIcon,
      comment: 'Test results submitted this semester',
      iconClassName: 'bg-blue-100 text-blue-600',
    },

    {
      title: 'Exam Submitted',
      value: filteredResults.filter((item) => item.ResultType === 'Exam').length,
      icon: BookCopyIcon,
      comment: 'Exam results submitted this semester',
      iconClassName: 'bg-green-100 text-green-600',
    },

    {
      title: 'Submissions Approved',
      value: filteredResults.filter((item) => item.Status === 'Approved').length,
      icon: CheckCircle2,
      comment: 'Submissions approved for this semester',
      iconClassName: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Rejected',
      value: filteredResults.filter((item) => item.Status === 'Rejected').length,
      icon: FileX2,
      comment: 'Submissions rejected for this semester',
      iconClassName: 'bg-red-100 text-red-600',
    }
  ]

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      case 'Submitted':
        return 'bg-blue-100 text-blue-700'
      case 'Pending':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

    
  return (

    <div className='flex flex-col mt-4 '> 
      <div className='grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 xl:grid-cols-4'>
        
        {/* cards */}
  {cardData.map((card) => {
    const Icon = card.icon

    return (
      <div key={card.title} className='bg-white shadow-sm border border-slate-200/20 p-5 rounded-lg'>
        <div className='flex items-center justify-between'>
          <h2 className='text-slate-600 font-medium mb-2'>{card.title}</h2>
          <span className={`${card.iconClassName} rounded-full p-2`}>
            <Icon size={20} />
          </span>
        </div>

        <h1 className='font-bold text-3xl my-4'>{card.value}</h1>
        <p className='text-sm text-gray-500'>{card.comment}</p>
      </div>
    )
  })}


        
      
 
      </div>

      <div className='mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <h3 className='text-base font-semibold text-slate-900'>Filter submissions</h3>
          <p className='text-sm text-slate-500'>Filter by programme and level, then browse the table pages.</p>
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-600'>Programme</label>
            <select
              value={selectedProgramme}
              onChange={(event) => setSelectedProgramme(event.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none'
            >
              <option value=''>All Programmes</option>
              {programmes.map((programme) => (
                <option key={programme.ProgrammeID} value={programme.ProgrammeID}>
                  {programme.ProgrammeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-600'>Level</label>
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none'
            >
              <option value=''>All Levels</option>
              {levels.map((level) => (
                <option key={level.LevelID} value={level.LevelID}>
                  {level.LevelName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className='mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white'>
    <table className='w-full'>
      <thead className='bg-slate-50 border-b w-full border-slate-200 mt-4'>
        <tr className='bg-blue-100 text-left text-slate-500 font-normal text-sm'>
                <th className='font-normal p-4'> Course Code </th>
                <th className='font-normal p-4'> Course Title </th>
                <th className='font-normal p-4'> Programme </th>
                <th className='font-normal p-4'> Category </th>
                <th className='font-normal p-4'> Type </th>
                <th className='font-normal p-4'> Level </th>
                <th className='font-normal p-4'>Submitted Students</th>
                <th className='font-normal p-4'>Total Students</th>
                <th className='font-normal p-4'> Submitted Date </th>
                <th className='font-normal p-4'> Status </th>
            </tr>
        </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan='10' className='p-6 text-center text-sm text-slate-500'>Loading submitted courses...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan='10' className='p-6 text-center text-sm text-red-600'>{error}</td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan='10' className='p-6 text-center text-sm text-slate-500'>No submitted courses found for the selected filters.</td>
                </tr>
              ) : (
                paginatedResults.map((result) => (
                  <tr key={`${result.CourseID}-${result.ResultType}`} className='border-b border-slate-100 text-sm text-slate-700'>
                    <td className='p-4 font-medium text-slate-900'>{result.CourseCode || 'N/A'}</td>
                    <td className='p-4'>{result.CourseTitle || 'N/A'}</td>
                    <td className='p-4'>{result.ProgrammeName || 'N/A'}</td>
                    <td className='p-4'>{result.Category || 'N/A'}</td>
                    <td className='p-4'>{result.ResultType || 'N/A'}</td>
                    <td className='p-4'>{result.LevelName || 'N/A'}</td>
                    <td className='p-4'>{result.StudentCount || 0}</td>
                    <td className='p-4'>{result.TotalStudents || 0}</td>
                    <td className='p-4'>
                      {result.SubmittedDate
                        ? new Date(result.SubmittedDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className='p-4'>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClassName(result.Status)}`}>
                        {result.Status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
    </table>
      </div>

      {!loading && !error && filteredResults.length > 0 && (
        <div className='mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between'>
          <p className='text-sm text-slate-500'>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredResults.length)}-
            {Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length} submissions
          </p>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className='rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Previous
            </button>
            <span className='text-sm text-slate-600'>Page {currentPage} of {totalPages}</span>
            <button
              type='button'
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
              className='rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      )}
 

        </div>
  )
}

export default Submitted