import React, { useState, useEffect } from 'react'
import { Select, Label, TextInput, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { SlidersHorizontal, Upload, Check, X, Edit2, Search, Send, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useSelector } from 'react-redux'

const UploadedResults = () => {
  const lectid = useSelector((state) => state.user.id)
  
  // State for filters
  const [sessions, setSessions] = useState([])
  const [semesters, setSemesters] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  
  // State for results and UI
  const [results, setResults] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [editScores, setEditScores] = useState({ CA_Score: '', Exam_Score: '' })
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(false)
  const [error, setError] = useState(null)
  const [ResultType, setResultType] = useState(true)

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Fetch initial data
  useEffect(() => {
    fetchSessions()
    fetchSemesters()
    fetchCourses()
  }, [])

  // Fetch results when filters change
  useEffect(() => {
    if (selectedCourse) {
      fetchResults()
    }
  }, [selectedCourse, debouncedSearchTerm])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/active-session', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSessions(data.session ? [data.session] : [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/sessions/getsemesters', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSemesters(data.semesters || [])
      }
    } catch (error) {
      console.error('Error fetching semesters:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/lecturers/getcourses/`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchResults = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('courseID', selectedCourse)
    params.append('sessionID', selectedSession)
    params.append('semesterID', selectedSemester)
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)

    try {
      const response = await fetch(`/api/lecturers/results/getUploadedResults/?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }

      const data = await response.json()
      setResults(data.data || [])
      const type = Array.isArray(data.data) && data.data.some(rt => String(rt.ResultType || '').toLowerCase() === 'test')
      setResultType(type)
      

    } catch (error) {
      console.error('Error fetching results:', error)
      alert('Failed to fetch results')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (result) => {
    setSelectedResult(result)
    setEditScores({ CA_Score: result.CA_Score, Exam_Score: result.Exam_Score })
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    const { CA_Score, Exam_Score } = editScores

    if (!selectedResult) return alert('No result selected')

    try {
      const response = await fetch(`/api/lecturers/results/updateResult/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          MatricNo: selectedResult.MatricNo,
          CA_Score,
          Exam_Score,
          SessionID: selectedSession,
          SemesterID: selectedSemester,
          CourseID: selectedCourse
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update result')
      }

      alert('Result updated successfully')
      setIsModalOpen(false)
      fetchResults()
    } catch (error) {
      console.error('Error updating result:', error)
      alert('Failed to update result')
    }
  }

  const handleSubmitToHOD = () => {
    if (results.length === 0) {
      alert('No results to submit')
      return
    }
    setIsSubmitModalOpen(true)
  }

  const confirmSubmitToHOD = async () => {
    setSubmitting(true)
    if(!selectedCourse){
     
        alert('no course selected')
        console.log('items in them', {selectedCourse})
        
    }
    
    console.log('correct passage items in them', {selectedCourse})


    try {
      
        
        // API call to submit results to HOD
        const url = ResultType
          ? `/api/lecturers/results/submitToHOD/?ResultType=Test`
          : `/api/lecturers/results/submitToHOD/?ResultType=Exam`

        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            courseID: selectedCourse
          })
        })

        if(!response.ok){
            console.log('No response from server', response.statusText);
        }
 
        const data = await response.json();
        console.log('Response from server:', data);

   
      setIsSubmitModalOpen(false)
      alert(data.message)
      // Refresh or navigate after submission
    } catch (error) {
      console.log('Error submitting to HOD:', error)
      alert('Failed to submit results')
    } finally {
      setSubmitting(false)
    }
  }

  const remarksColor = (remark) => {
    const remarkLower = remark?.toLowerCase()
    const colorMap = {
      'pass': { color: 'border border-green-800 bg-green-200 text-green-800', icon: Check },
      'fail': { color: 'border border-red-800 bg-red-200 text-red-800', icon: X }
    }
    const config = colorMap[remarkLower] || { color: 'border border-gray-800 bg-gray-200 text-gray-800', icon: null }
    const Icon = config.icon
    
    return (
      <span className={`${config.color} flex items-center justify-center gap-1 px-2 py-1 rounded-full font-semibold text-xs`}>
        {Icon && <Icon size={12} />}
        {remark}
      </span>
    )
  }

  const getCourseName = () => {
    const course = courses.find(c => c.CourseID == selectedCourse)
    return course ? `${course.CourseCode} - ${course.CourseName}` : ''
  }

  const getSessionName = () => {
    const session = sessions.find(s => s.SessionID == selectedSession)
    return session?.SessionName || ''
  }

  const getSemesterName = () => {
    const semester = semesters.find(s => s.SemesterID == selectedSemester)
    return semester?.SemesterName || ''
  }

  return (
    <div className='flex flex-col p-4'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-semibold'>Review Uploaded Results</h1>
        <p className='text-xs text-gray-600'>Review and submit results to HOD for approval</p>
      </div>

      {/* Filters Section */}
      <div className='mt-4 bg-white border-2 border-blue-950/20 rounded-lg p-4'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-blue-700'>
            <SlidersHorizontal size={20} />
          </span>
          <span className='font-semibold text-black'>Filter Results</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <Label htmlFor="session">Academic Session</Label>
            <Select
              id="session"
              className='mt-2'
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session.SessionID} value={session.SessionID}>
                  {session.SessionName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="semester">Academic Semester</Label>
            <Select
              id="semester"
              className='mt-2'
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester.SemesterID} value={semester.SemesterID}>
                  {semester.SemesterName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="course">Course</Label>
            <Select
              id="course"
              className='mt-2'
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table Section */}
      { selectedCourse && (
        <div className='mt-4 bg-white border-2 border-blue-950/20 rounded-lg p-4'>
          {/* Course Info Banner */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='font-semibold text-blue-900 mb-1'>{getCourseName()}</h3>
                <p className='text-sm text-blue-800'>
                  {getSessionName()} • {getSemesterName()} • {results.length} students
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='bg-yellow-100 text-yellow-700 border border-yellow-300 px-3 py-1 rounded-full text-xs font-medium'>
                  Draft
                </span>
              </div>
            </div>
          </div>

          {/* Search and Submit */}
          <div className='flex justify-between items-center mb-4'>
            <div className='w-80'>
              
              <TextInput
                className=''
                placeholder='Search by name or matric number'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button 
              icon={Send} 
              text="Submit to HOD" 
              className='cursor-pointer bg-blue-600 hover:bg-blue-700' 
              onClick={handleSubmitToHOD}
              disabled={results.length === 0}
            />
          </div>

          {/* Results Table */}
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-blue-100 border-b border-slate-200'>
                <tr className='text-left text-gray-900 font-semibold text-sm'>
                  <th className='p-4'>S/N</th>
                  <th className='p-4'>Matric Number</th>
                  <th className='p-4'>Name</th>
                  <th className='p-4'>Level</th>
                  <th className='p-4'>CA Score</th>
                  <th className='p-4'>Exam Score</th>
                  <th className='p-4'>Total Score</th>
                  <th className='p-4'>Grade</th>
                  <th className='p-4'>Remark</th>
                  <th className='p-4'>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan='10' className='text-center p-8'>
                      <div className='flex flex-col items-center gap-2'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                        <span className='text-gray-500'>Loading results...</span>
                      </div>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan='10' className='text-center p-8'>
                      <div className='flex flex-col items-center gap-2'>
                        <AlertCircle size={48} className='text-gray-400' />
                        <span className='text-lg text-gray-500 font-semibold'>No results found</span>
                        <span className='text-sm text-gray-400'>Upload results first or adjust your filters</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => (
                    <tr key={index} className='border-b border-slate-200 hover:bg-gray-50 transition-colors'>
                      <td className='p-4 text-sm text-gray-800 font-medium'>{index + 1}</td>
                      <td className='p-4 text-sm text-gray-800 font-medium'>{result.MatricNo || 'N/A'}</td>
                      <td className='p-4 text-sm text-gray-800 font-medium'>{result.Name || 'N/A'}</td>
                      <td className='p-4 text-sm text-gray-800 font-medium'>{result.levelName || 'N/A'}</td>
                      <td className='p-4 text-sm text-gray-800 font-medium'>{result.CA_Score || 0}</td>
                      <td className='p-4 text-sm text-gray-800 font-medium'>{result.Exam_Score || 0}</td>
                      <td className='p-4 text-sm text-gray-800 font-semibold'>{result.TotalScore || 0}</td>
                      <td className='p-4 text-sm text-black font-bold'>{result.Grade || 'N/A'}</td>
                      <td className='p-4 text-sm'>{remarksColor(result.Remarks)}</td>
                      <td className='p-4'>
                        <button
                          onClick={() => handleEditClick(result)}
                          className='flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium'
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Summary */}
          {results.length > 0 && (
            <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Total Students:</span>
                  <span className='ml-2 font-semibold text-gray-900'>{results.length}</span>
                </div>
                <div>
                  <span className='text-gray-600'>Pass:</span>
                  <span className='ml-2 font-semibold text-green-600'>
                    {results.filter(r => r.Remarks?.toLowerCase() === 'pass').length}
                  </span>
                </div>
                <div>
                  <span className='text-gray-600'>Fail:</span>
                  <span className='ml-2 font-semibold text-red-600'>
                    {results.filter(r => r.Remarks?.toLowerCase() === 'fail').length}
                  </span>
                </div>
                <div>
                  <span className='text-gray-600'>Average Score:</span>
                  <span className='ml-2 font-semibold text-gray-900'>
                    {(results.reduce((sum, r) => sum + (r.TotalScore || 0), 0) / results.length).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={isModalOpen} dismissible popup={true} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Edit Score - {selectedResult?.Name}</ModalHeader>
        <ModalBody>
          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label htmlFor='matric'>Matric Number</Label>
                <TextInput
                  id='matric'
                  value={selectedResult?.MatricNo || ''}
                  disabled={true}
                  className='mt-2'
                />
              </div>
              <div>
                <Label htmlFor='name'>Name</Label>
                <TextInput
                  id='name'
                  value={selectedResult?.Name || ''}
                  disabled={true}
                  className='mt-2'
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label htmlFor='caScore'>CA Score (Max: 30)</Label>
                <TextInput
                  id='caScore'
                  value={editScores.CA_Score}
                  className='mt-2'
                  type='number'
                  min='0'
                  max='30'
                  onChange={(e) => setEditScores((prev) => ({ ...prev, CA_Score: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor='examScore'>Exam Score (Max: 70)</Label>
                <TextInput
                  id='examScore'
                  value={editScores.Exam_Score}
                  className='mt-2'
                  type='number'
                  min='0'
                  max='70'
                  onChange={(e) => setEditScores((prev) => ({ ...prev, Exam_Score: e.target.value }))}
                />
              </div>
            </div>
            <div className='p-3 bg-blue-50 border border-blue-200 rounded'>
              <p className='text-sm text-blue-800'>
                <strong>Total Score:</strong> {(parseFloat(editScores.CA_Score) || 0) + (parseFloat(editScores.Exam_Score) || 0)}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button text="Save Changes" className='cursor-pointer bg-blue-600' onClick={handleSaveChanges} />
          <Button text="Cancel" className='cursor-pointer bg-gray-500' onClick={() => setIsModalOpen(false)} />
        </ModalFooter>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal show={isSubmitModalOpen} dismissible popup={true} onClose={() => setIsSubmitModalOpen(false)}>
        <ModalHeader>Confirm Submission</ModalHeader>
        <ModalBody>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <AlertCircle size={24} className='text-yellow-600' />
              <div>
                <p className='font-semibold text-yellow-900'>Important Notice</p>
                <p className='text-sm text-yellow-800'>
                  Once submitted, you won't be able to edit these results until they are reviewed by the HOD.
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='font-semibold text-gray-900'>Submission Summary:</p>
              <div className='space-y-1 text-sm text-gray-700'>
                <p>• Course: <strong>{getCourseName()}</strong></p>
                <p>• Session: <strong>{getSessionName()}</strong></p>
                <p>• Semester: <strong>{getSemesterName()}</strong></p>
                <p>• Total Students: <strong>{results.length}</strong></p>
              </div>
            </div>

            <p className='text-sm text-gray-600'>
              Are you sure you want to submit these results to the HOD for approval?
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            text={submitting ? "Submitting..." : "Yes, Submit"} 
            className='cursor-pointer bg-blue-600' 
            icon={submitting ? null : CheckCircle}
            onClick={confirmSubmitToHOD}
            disabled={submitting}
          />
          <Button 
            text="Cancel" 
            className='cursor-pointer bg-gray-500' 
            onClick={() => setIsSubmitModalOpen(false)}
            disabled={submitting}
          />
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default UploadedResults