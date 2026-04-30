import { Label, Select, TextInput, Button, Modal, Spinner, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { Search, Trash2, AlertCircle, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const AssignedTable = ({refreshKey, onAssignmentSuccess}) => {
  const [lecturers, setLecturers] = useState([])
  const [filteredLecturers, setFilteredLecturers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [orderBy, setOrderBy] = useState('')
  const [showUnassignModal, setShowUnassignModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [unassigning, setUnassigning] = useState(false)

  useEffect(() => {
    fetchLecturers()
  }, [orderBy, refreshKey])

  useEffect(() => {
    // Filter lecturers based on search
    if (search) {
      const filtered = lecturers.filter(lecturer => 
        lecturer.LastName?.toLowerCase().includes(search.toLowerCase()) ||
        lecturer.OtherNames?.toLowerCase().includes(search.toLowerCase()) ||
        lecturer.Email?.toLowerCase().includes(search.toLowerCase()) ||
        lecturer.AssignedCourses?.toLowerCase().includes(search.toLowerCase()) ||
        lecturer.AssignedCourseNames?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredLecturers(filtered)
    } else {
      setFilteredLecturers(lecturers)
    }
  }, [search, lecturers])

  const fetchLecturers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/hod/lecturers/getlecturers?orderBy=${orderBy}&search=${search}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch lecturers')
      }

      const data = await response.json()
      
      // Filter out lecturers with no assignments
      const lecturersWithAssignments = data.lecturers.filter(
        lecturer => lecturer.TotalCoursesAssigned > 0
      )
      
      setLecturers(lecturersWithAssignments)
      setFilteredLecturers(lecturersWithAssignments)
    } catch (error) {
      console.error('Error fetching lecturers:', error)
      alert('Failed to load lecturers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignClick = (assignmentID, courseCode, lecturerName) => {
    setSelectedAssignment({ assignmentID, courseCode, lecturerName })
    setShowUnassignModal(true)
  }

  const handleUnassign = async () => {
    if (!selectedAssignment) return

    setUnassigning(true)
    try {
      const response = await fetch('/api/hod/lecturers/unassigncourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          assignmentID: selectedAssignment.assignmentID
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unassign course')
      }

      alert('Course unassigned successfully!')
      setShowUnassignModal(false)
      setSelectedAssignment(null)
      fetchLecturers() // Refresh the list
      
    } catch (error) {
      console.error('Error unassigning course:', error)
      alert(error.message || 'Failed to unassign course. Please try again.')
    } finally {
      setUnassigning(false)
    }
  }

  const parseAssignments = (lecturer) => {
    const courseCodes = lecturer.AssignedCourses?.split(', ') || []
    const courseNames = lecturer.AssignedCourseNames?.split(', ') || []
    const assignmentIDs = lecturer.AssignmentIDs?.split(', ') || []
    const teachingProgrammeNames = lecturer.TeachingProgrammeNames?.split(', ') || []
    const teachingDepartmentNames = lecturer.TeachingDepartmentNames?.split(', ') || []

    return courseCodes.map((code, index) => ({
      code,
      name: courseNames[index] || '',
      assignmentID: assignmentIDs[index] || '',
      teachingProgramme: teachingProgrammeNames[index] || 'N/A',
      teachingDepartment: teachingDepartmentNames[index] || 'N/A'
    }))
  }

  return (
    <div className='flex flex-col bg-white rounded-lg gap-4 mt-5 shadow-md'>
      {/* header */}
      <div className='p-4 border-b'>
        <h1 className='font-semibold text-black text-lg'>Assigned Courses</h1>
        <p className='text-sm text-slate-600'>View and manage all course assignments</p>
      </div>

      {/* filters */}
      <div className='flex flex-col bg-slate-50 px-4 py-3'>
        <div className='flex items-center gap-2 mb-3'>
          <Search className='text-gray-500' size={16} />
          <h1 className='font-semibold text-sm'>Search & Filters</h1>
        </div>

        <div className='flex gap-4 flex-wrap'>
          <div className='flex flex-col gap-2 flex-1 min-w-[300px]'>
            <Label htmlFor="search" className='text-sm font-medium'>Search</Label>
            <TextInput
              sizing='sm'
              type="text"
              id='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by lecturer name, email or course'
              icon={Search}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor="orderBy" className='text-sm font-medium'>Sort By</Label>
            <Select
              id='orderBy'
              sizing="sm"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="">Default (A-Z)</option>
              <option value="asc">Courses (Low to High)</option>
              <option value="desc">Courses (High to Low)</option>
            </Select>
          </div>

          <div className='flex items-end'>
            <Button
              size="sm"
              color="gray"
              onClick={fetchLecturers}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* table */}
      <div className='overflow-x-auto'>
        {loading ? (
          <div className='flex justify-center items-center p-8'>
            <Spinner size="lg" />
            <span className='ml-3'>Loading lecturers...</span>
          </div>
        ) : filteredLecturers.length === 0 ? (
          <div className='flex flex-col justify-center items-center p-8 text-gray-500'>
            <AlertCircle size={48} className='mb-2' />
            <p className='text-lg font-medium'>No assigned courses found</p>
            <p className='text-sm'>Assign courses to lecturers to see them here</p>
          </div>
        ) : (
          <table className='w-full text-sm text-left'>
            <thead className='bg-slate-100 border-y border-slate-100 text-xs uppercase'>
              <tr>
                <th className='p-4'>Lecturer</th>
              
                <th className='p-4'>Total Courses</th>
                <th className='p-4'>Assigned Courses</th>
                <th className='p-4'>Teaching Programme</th>
                <th className='p-4'>Teaching Department</th>
              </tr>
            </thead>
            <tbody className=''>
              {filteredLecturers.map((lecturer) => {
                const assignments = parseAssignments(lecturer)
                return (
                  <tr key={lecturer.LecturerID} className='hover:bg-gray-50'>
                    <td className='p-4'>
                      <div className='font-medium text-gray-900'>
                        {lecturer.LastName} {lecturer.OtherNames}
                      </div>
                    </td>
                 
                    <td className='p-4'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        {lecturer.TotalCoursesAssigned} {lecturer.TotalCoursesAssigned === 1 ? 'course' : 'courses'}
                      </span>
                    </td>
                    <td className='p-4'>
                      <div className='flex flex-col gap-1'>
                        {assignments.map((assignment, index) => (
                          <div key={index} className='flex items-center justify-between bg-slate-50 p-1 rounded group'>
                            <div className='flex-1'>
                              <span className='font-medium text-xs text-gray-900'>{assignment.code}</span>
                              <span className='text-gray-600 ml-2 text-xs'>
                                {assignment.name?.length > 40
                                  ? assignment.name.substring(0, 40) + '...'
                                  : assignment.name}
                              </span>
                            </div>
                            <button
                              onClick={() => handleUnassignClick(
                                assignment.assignmentID,
                                assignment.code,
                                `${lecturer.LastName} ${lecturer.OtherNames}`
                              )}
                              className='ml-2 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                              title='Unassign this course'
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className='p-4'>
                      <div className='flex flex-col gap-1'>
                        {assignments.map((assignment, index) => (
                          <div key={index} className='bg-slate-50 p-2 rounded text-xs'>
                            {assignment.teachingProgramme}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className='p-4'>
                      <div className='flex flex-col gap-1'>
                        {assignments.map((assignment, index) => (
                          <div key={index} className='bg-slate-50 p-2 rounded text-xs'>
                            {assignment.teachingDepartment}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination info */}
      {!loading && filteredLecturers.length > 0 && (
        <div className='px-4 py-3 border-t flex items-center justify-between'>
          <div className='text-sm text-gray-600'>
            Showing {filteredLecturers.length} lecturer{filteredLecturers.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Unassign Confirmation Modal */}
      <Modal show={showUnassignModal} onClose={() => setShowUnassignModal(false)} size="md">
        <ModalHeader>Confirm Unassignment</ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='text-amber-500 flex-shrink-0 mt-1' size={24} />
              <div>
                <p className='text-gray-700'>
                  Are you sure you want to unassign <strong>{selectedAssignment?.courseCode}</strong> from{' '}
                  <strong>{selectedAssignment?.lecturerName}</strong>?
                </p>
                <p className='text-sm text-gray-500 mt-2'>
                  This action will remove this course assignment. The lecturer will no longer have access to manage this course.
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray"
            onClick={() => setShowUnassignModal(false)}
            disabled={unassigning}
          >
            Cancel
          </Button>
          <Button
            color="failure"
            onClick={handleUnassign}
            disabled={unassigning}
          >
            {unassigning ? (
              <>
                <Spinner size="sm" className='mr-2' />
                Unassigning...
              </>
            ) : (
              <>
                <Trash2 size={16} className='mr-2' />
                Unassign Course
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default AssignedTable