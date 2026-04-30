import React from 'react'
import { Table, TextInput, Badge } from 'flowbite-react'
import { Search, Download } from 'lucide-react'
import { useSelector } from 'react-redux'

const Students = () => {
  const [students, setStudents] = React.useState([])
  const [filteredStudents, setFilteredStudents] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const departmentId = useSelector((state) => state.user?.department)
  const levelId = useSelector((state) => state.user?.levelID)

  React.useEffect(() => {
    fetchStudents()
  }, [])

  React.useEffect(() => {
    filterStudents()
  }, [searchTerm, students])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/advisor/students/${departmentId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to fetch students')
        return
      }

      const data = await response.json()
      setStudents(data.students || [])
      setFilteredStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students)
      return
    }

    const filtered = students.filter(
      (student) =>
        student.MatricNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.OtherNames?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredStudents(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Matric No', 'Last Name', 'Other Names', 'Level', 'Email']
    const rows = filteredStudents.map((s) => [
      s.MatricNo,
      s.LastName,
      s.OtherNames,
      s.LevelName,
      s.Email || 'N/A'
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students.csv'
    a.click()
  }

  return (
    <main className="flex flex-col w-full p-4">
      <div className="py-4 px-2">
        <h1 className="text-3xl font-bold text-black">Students</h1>
        <p className="text-sm text-slate-500">View students in your assigned level</p>
      </div>

      {/* Search and Export */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <TextInput
              icon={Search}
              placeholder="Search by matric number or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Active Students</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredStudents.filter((s) => s.Status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Inactive Students</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredStudents.filter((s) => s.Status !== 'Active').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 bg-white rounded-lg">Loading students...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500">No students found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Matric No</Table.HeadCell>
                <Table.HeadCell>Last Name</Table.HeadCell>
                <Table.HeadCell>Other Names</Table.HeadCell>
                <Table.HeadCell>Level</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredStudents.map((student) => (
                  <Table.Row key={student.StudentID} className="bg-white hover:bg-slate-50">
                    <Table.Cell className="font-medium text-gray-900">
                      {student.MatricNo}
                    </Table.Cell>
                    <Table.Cell>{student.LastName}</Table.Cell>
                    <Table.Cell>{student.OtherNames}</Table.Cell>
                    <Table.Cell>{student.LevelName || 'N/A'}</Table.Cell>
                    <Table.Cell>{student.Email || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      {student.Status === 'Active' ? (
                        <Badge color="success">Active</Badge>
                      ) : (
                        <Badge color="gray">{student.Status || 'Inactive'}</Badge>
                      )}
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

export default Students
