import React from 'react'
import { Table, Badge } from 'flowbite-react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useSelector } from 'react-redux'

const ResultsTable = ({ status = 'Pending' }) => {
  const [results, setResults] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    fetchResults()
  }, [status])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/senate/results?status=${status}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to fetch results')
        return
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (resultId) => {
    if (!confirm('Are you sure you want to approve this result?')) return;

    try {
      const response = await fetch(`/api/senate/approve-result/${resultId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Approved' })
      })

      if (!response.ok) {
        alert('Failed to approve result')
        return
      }

      alert('Result approved successfully')
      fetchResults()
    } catch (error) {
      console.error('Error approving result:', error)
      alert('Error approving result')
    }
  }

  const handleReject = async (resultId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/senate/approve-result/${resultId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Rejected', reason })
      })

      if (!response.ok) {
        alert('Failed to reject result')
        return
      }

      alert('Result rejected')
      fetchResults()
    } catch (error) {
      console.error('Error rejecting result:', error)
      alert('Error rejecting result')
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

  if (loading) {
    return <div className="text-center py-10">Loading results...</div>
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-slate-500">No {status.toLowerCase()} results found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Matric No</Table.HeadCell>
            <Table.HeadCell>Student Name</Table.HeadCell>
            <Table.HeadCell>Course</Table.HeadCell>
            <Table.HeadCell>Department</Table.HeadCell>
            <Table.HeadCell>Session</Table.HeadCell>
            <Table.HeadCell>Semester</Table.HeadCell>
            <Table.HeadCell>Score</Table.HeadCell>
            <Table.HeadCell>Grade</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            {status === 'Pending' && <Table.HeadCell>Actions</Table.HeadCell>}
          </Table.Head>
          <Table.Body className="divide-y">
            {results.map((result) => (
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
                  {getStatusBadge(result.ResultStatus)}
                </Table.Cell>
                {status === 'Pending' && (
                  <Table.Cell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(result.ResultID)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(result.ResultID)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ResultsTable
