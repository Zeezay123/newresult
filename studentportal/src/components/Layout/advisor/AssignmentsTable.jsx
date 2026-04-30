import React from 'react'
import { Table, Badge } from 'flowbite-react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useSelector } from 'react-redux'

const AssignmentsTable = () => {
  const [assignments, setAssignments] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const departmentId = useSelector((state) => state.user?.department)

  React.useEffect(() => {
    fetchAssignments()
  }, [])

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
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
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
      alert('Error approving assignment')
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
      alert('Error rejecting assignment')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge color="success" icon={CheckCircle}>Approved</Badge>
      case 'Rejected':
        return <Badge color="failure" icon={XCircle}>Rejected</Badge>
      case 'Pending':
        return <Badge color="warning" icon={Clock}>Pending</Badge>
      default:
        return <Badge color="gray">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading assignments...</div>
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-slate-500">No course assignments found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Course Code</Table.HeadCell>
            <Table.HeadCell>Course Title</Table.HeadCell>
            <Table.HeadCell>Lecturer</Table.HeadCell>
            <Table.HeadCell>Session</Table.HeadCell>
            <Table.HeadCell>Semester</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {assignments.map((assignment) => (
              <Table.Row key={assignment.AssignmentID} className="bg-white hover:bg-slate-50">
                <Table.Cell className="font-medium text-gray-900">
                  {assignment.CourseCode}
                </Table.Cell>
                <Table.Cell>{assignment.CourseTitle}</Table.Cell>
                <Table.Cell>{assignment.LecturerName || 'N/A'}</Table.Cell>
                <Table.Cell>{assignment.SessionName || 'N/A'}</Table.Cell>
                <Table.Cell>{assignment.SemesterName || 'N/A'}</Table.Cell>
                <Table.Cell>
                  {getStatusBadge(assignment.Approved_by_Level_Advisor)}
                </Table.Cell>
                <Table.Cell>
                  {assignment.Approved_by_Level_Advisor === 'Pending' && (
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
                  )}
                  {assignment.Approved_by_Level_Advisor !== 'Pending' && (
                    <span className="text-slate-400 text-sm">No action</span>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default AssignmentsTable
