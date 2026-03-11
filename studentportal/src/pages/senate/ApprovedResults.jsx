import React from 'react'
import { Table, Badge, TextInput, Select } from 'flowbite-react'
import { Search, Download } from 'lucide-react'

const ApprovedResults = () => {
  const [results, setResults] = React.useState([])
  const [filteredResults, setFilteredResults] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterDepartment, setFilterDepartment] = React.useState('All')
  const [filterSession, setFilterSession] = React.useState('All')

  React.useEffect(() => {
    fetchResults()
  }, [])

  React.useEffect(() => {
    filterResults()
  }, [searchTerm, filterDepartment, filterSession, results])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/senate/results?status=Approved`, {
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to fetch results')
        return
      }

      const data = await response.json()
      setResults(data.results || [])
      setFilteredResults(data.results || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterResults = () => {
    let filtered = [...results]

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.MatricNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.StudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.CourseCode?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterDepartment !== 'All') {
      filtered = filtered.filter((r) => r.DepartmentName === filterDepartment)
    }

    if (filterSession !== 'All') {
      filtered = filtered.filter((r) => r.SessionName === filterSession)
    }

    setFilteredResults(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Matric No', 'Student', 'Course Code', 'Course Title', 'Department', 'Session', 'Semester', 'Score', 'Grade']
    const rows = filteredResults.map((r) => [
      r.MatricNo,
      r.StudentName,
      r.CourseCode,
      r.CourseTitle,
      r.DepartmentName,
      r.SessionName,
      r.SemesterName,
      r.TotalScore,
      r.Grade
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'approved_results.csv'
    a.click()
  }

  const getGradeBadge = (grade) => {
    const colors = {
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'warning',
      'E': 'failure',
      'F': 'failure'
    }
    return <Badge color={colors[grade] || 'gray'}>{grade}</Badge>
  }

  const departments = [...new Set(results.map((r) => r.DepartmentName).filter(Boolean))]
  const sessions = [...new Set(results.map((r) => r.SessionName).filter(Boolean))]

  return (
    <main className="flex flex-col w-full p-4">
      <div className="py-4 px-2">
        <h1 className="text-3xl font-bold text-black">Approved Results</h1>
        <p className="text-sm text-slate-500">View all senate-approved results</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            icon={Search}
            placeholder="Search by matric, name, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Select>
          <Select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="All">All Sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session}>{session}</option>
            ))}
          </Select>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Total Approved</p>
          <p className="text-2xl font-bold text-green-600">{filteredResults.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Average Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredResults.length > 0 
              ? (filteredResults.reduce((sum, r) => sum + (r.TotalScore || 0), 0) / filteredResults.length).toFixed(1)
              : 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Pass Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredResults.length > 0 
              ? ((filteredResults.filter(r => r.Grade !== 'F').length / filteredResults.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Fail Rate</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredResults.length > 0 
              ? ((filteredResults.filter(r => r.Grade === 'F').length / filteredResults.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 bg-white rounded-lg">Loading results...</div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500">No approved results found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Matric No</Table.HeadCell>
                <Table.HeadCell>Student</Table.HeadCell>
                <Table.HeadCell>Course</Table.HeadCell>
                <Table.HeadCell>Department</Table.HeadCell>
                <Table.HeadCell>Session</Table.HeadCell>
                <Table.HeadCell>Semester</Table.HeadCell>
                <Table.HeadCell>Score</Table.HeadCell>
                <Table.HeadCell>Grade</Table.HeadCell>
                <Table.HeadCell>Approved Date</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredResults.map((result) => (
                  <Table.Row key={result.ResultID} className="bg-white hover:bg-slate-50">
                    <Table.Cell className="font-medium text-gray-900">
                      {result.MatricNo}
                    </Table.Cell>
                    <Table.Cell>{result.StudentName || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <div>
                        <div className="font-medium">{result.CourseCode}</div>
                        <div className="text-sm text-slate-500">{result.CourseTitle}</div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{result.DepartmentName || 'N/A'}</Table.Cell>
                    <Table.Cell>{result.SessionName || 'N/A'}</Table.Cell>
                    <Table.Cell>{result.SemesterName || 'N/A'}</Table.Cell>
                    <Table.Cell>{result.TotalScore}</Table.Cell>
                    <Table.Cell>{getGradeBadge(result.Grade)}</Table.Cell>
                    <Table.Cell>
                      {result.ApprovedDate 
                        ? new Date(result.ApprovedDate).toLocaleDateString()
                        : 'N/A'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      )}
    </main>
  )
}

export default ApprovedResults
