import React from 'react'
import { Table, Badge, Button,TableBody,TableHead, TableHeadCell, TableCell, TableRow } from 'flowbite-react'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const ResultsTable = () => {
  const [results, setResults] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const departmentId = useSelector((state) => state.user?.department)
  const navigate = useNavigate()

  React.useEffect(() => {

  }, [])

  // const fetchResults = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await fetch(`/api/advisor/results/by-course`, {
  //       credentials: 'include'
  //     })

  //     if (!response.ok) {
  //       console.error('Failed to fetch results')
  //       return
  //     }

  //     const data = await response.json()
  //     // Show only pending and recent results (limit to 10)
  //     const recentResults = (data.results || [])
  //       .filter(r => r.AdvisorApprovalStatus === 'Pending')
  //       .slice(0, 10)
  //     setResults(recentResults)
  //   } catch (error) {
  //     console.error('Error fetching results:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleApprove = async (courseID, staffCode) => {
    if (!confirm('Are you sure you want to approve this course result?')) return

    try {
      const response = await fetch(`/api/advisor/results/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          courseID, 
          staffCode, 
          status: 'Approved' 
        })
      })

      if (!response.ok) {
        alert('Failed to approve results')
        return
      }

      alert('Results approved successfully')
      fetchResults()
    } catch (error) {
      console.error('Error approving results:', error)
      alert('Error approving results')
    }
  }

  const handleReject = async (courseID, staffCode) => {
    if (!confirm('Are you sure you want to reject this course result?')) return

    try {
      const response = await fetch(`/api/advisor/results/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          courseID, 
          staffCode, 
          status: 'Rejected' 
        })
      })

      if (!response.ok) {
        alert('Failed to reject results')
        return
      }

      alert('Results rejected')
      fetchResults()
    } catch (error) {
      console.error('Error rejecting results:', error)
      alert('Error rejecting results')
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
        return <Badge color="gray">{status || 'N/A'}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-10 bg-white rounded-lg">Loading results...</div>
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-slate-500">No pending results to review</p>
        <Button 
          color="light" 
          className="mt-4"
          onClick={() => navigate('/advisor/results')}
        >
          View All Results
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableHeadCell>Course Code</TableHeadCell>
            <TableHeadCell>Course Title</TableHeadCell>
            <TableHeadCell>Lecturer</TableHeadCell>
            <TableHeadCell>Students</TableHeadCell>
            <TableHeadCell>Session</TableHeadCell>
            <TableHeadCell>Semester</TableHeadCell>
            <TableHeadCell>HOD Status</TableHeadCell>
            <TableHeadCell>Advisor Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {results.map((result) => (
              <TableRow key={`${result.CourseID}-${result.SubmittedBy}`} className="bg-white hover:bg-slate-50">
                <TableCell className="font-medium text-gray-900">
                  {result.CourseCode}
                </TableCell>
                <TableCell>{result.CourseName}</TableCell>
                <TableCell>{result.LecturerName || 'N/A'}</TableCell>
                <TableCell>{result.StudentCount || 0}</TableCell>
                <TableCell>{result.SessionName || 'N/A'}</TableCell>
                <TableCell>{result.SemesterName || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(result.HodApprovalStatus)}</TableCell>
                <TableCell>{getStatusBadge(result.AdvisorApprovalStatus)}</TableCell>
                <TableCell>
                  {result.AdvisorApprovalStatus === 'Pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        color="success"
                        onClick={() => handleApprove(result.CourseID, result.SubmittedBy)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleReject(result.CourseID, result.SubmittedBy)}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Badge color="gray">No action</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-slate-200 text-center">
        <Button 
          color="light"
          onClick={() => navigate('/advisor/results')}
        >
          View All Results
        </Button>
      </div>
    </div>
  )
}

export default ResultsTable
