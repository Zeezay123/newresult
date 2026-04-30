import React from 'react'
import { Table, Badge, TextInput } from 'flowbite-react'
import { Search } from 'lucide-react'
import { useSelector } from 'react-redux'

const CourseAssignments = () => {
  const [assignments, setAssignments] = React.useState([])
  const [filteredAssignments, setFilteredAssignments] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('All')
  const departmentId = useSelector((state) => state.user?.department)

  React.useEffect(() => {
    fetchAssignments()
  }, [])

  React.useEffect(() => {
    filterAssignments()
  }, [searchTerm, filterStatus, assignments])

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/advisor/course-assignments/${departmentId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to fetch assignments')
        return
      }

      const data = await response.json()
      setAssignments(data.assignments || [])
      setFilteredAssignments(data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = [...assignments]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.CourseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.CourseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.LecturerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter((a) => a.Approved_by_Level_Advisor === filterStatus)
    }

    setFilteredAssignments(filtered)
  }

  const handleApprove = async (assignmentId) => {
    try {
      const response = await fetch(`/api/advisor/approve-assignment/${assignmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Approved' })
      })

      if (!response.ok) {
        alert('Failed to approve assignment')
        return
      }

      alert('Assignment approved successfully')
      fetchAssignments()
    } catch (error) {
      console.error('Error approving assignment:', error)
    }
  }

  const handleReject = async (assignmentId) => {
    try {
      const response = await fetch(`/api/advisor/approve-assignment/${assignmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Rejected' })
      })

      if (!response.ok) {
        alert('Failed to reject assignment')
        return
      }

      alert('Assignment rejected')
      fetchAssignments()
    } catch (error) {
      console.error('Error rejecting assignment:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge color="success">Approved</Badge>
      case 'Rejected':
        return <Badge color="failure">Rejected</Badge>
      case 'Pending':
        return <Badge color="warning">Pending</Badge>
      default:
        return <Badge color="gray">{status}</Badge>
    }
  }

  return (
    <main className="flex flex-col w-full p-4">
      <div className="py-4 px-2">
        <h1 className="text-3xl font-bold text-black">Course Assignments</h1>
        <p className="text-sm text-slate-500">Review and manage course assignments for your level</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <TextInput
              icon={Search}
              placeholder="Search by course code, title, or lecturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('Pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'Pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('Approved')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'Approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus('Rejected')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'Rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 bg-white rounded-lg">Loading...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500">No assignments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Course Code</Table.HeadCell>
                <Table.HeadCell>Course Title</Table.HeadCell>
                <Table.HeadCell>Lecturer</Table.HeadCell>
                <Table.HeadCell>Credit Units</Table.HeadCell>
                <Table.HeadCell>Session</Table.HeadCell>
                <Table.HeadCell>Semester</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredAssignments.map((assignment) => (
                  <Table.Row key={assignment.AssignmentID} className="bg-white hover:bg-slate-50">
                    <Table.Cell className="font-medium text-gray-900">
                      {assignment.CourseCode}
                    </Table.Cell>
                    <Table.Cell>{assignment.CourseTitle}</Table.Cell>
                    <Table.Cell>{assignment.LecturerName || 'N/A'}</Table.Cell>
                    <Table.Cell>{assignment.CreditUnits || 'N/A'}</Table.Cell>
                    <Table.Cell>{assignment.SessionName || 'N/A'}</Table.Cell>
                    <Table.Cell>{assignment.SemesterName || 'N/A'}</Table.Cell>
                    <Table.Cell>{getStatusBadge(assignment.Approved_by_Level_Advisor)}</Table.Cell>
                    <Table.Cell>
                      {assignment.Approved_by_Level_Advisor === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(assignment.AssignmentID)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(assignment.AssignmentID)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No action</span>
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

export default CourseAssignments
