import React, { useState, useEffect, use } from 'react'
import { Select, TextInput, Spinner, Modal, Progress, ModalBody, ModalHeader } from 'flowbite-react'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileSpreadsheet, AlertCircle, Download } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useSelector } from 'react-redux'

const ReviewTestResults = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState([]); //for the view details modal
  const [actionLoading, setActionLoading] = useState(false);

  const hodId = useSelector((state) => state.user.department);


 

  useEffect(() => {
   
    fetchTestResults();
  }, [selectedSemester, selectedLevel, searchTerm]);

 



const fetchTestResults = async () =>{


  try{
    
  const params = new URLSearchParams();
  if (selectedSemester) params.append('semesterID', selectedSemester);
  if (selectedLevel) params.append('levelID', selectedLevel);
  if (searchTerm) params.append('search', searchTerm);


  const res = await fetch(`/api/hod/results/testResults/${hodId}?${params.toString()}`,
    
    { credentials: 'include' });

    if(!res.ok){
      console.error("Failed to fetch test results", res.statusText);
    return
    }


  const data = await res.json();

 setSubmissions(data.results);

  console.log(data)

  }catch(error){
     console.error("fetchTestResults error:", error);
  }
  
}

// handle view details
const handleViewDetails = async (courseID, submittedBy) => {

  

  try{

    const res = await fetch(`/api/hod/results/viewTestResults/${hodId}`,{
      method:'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({
        courseID,
        semesterID: selectedSemester,
        staffCode: submittedBy
      })
    })

    if(!res.ok){
      console.error("Failed to fetch test result details", res.statusText);
      return;
    } 

    const data = await res.json();

    console.log("Selected Submission Details:", data);
    setSelectedSubmission(data.students);
     
    console.log("Selected Submission State:", selectedSubmission);
    setShowViewModal(true);
  }
  catch(error){
    console.error("handleViewDetails error:", error);
  }

}

// handle download
const handleDownload = async (courseID, staffCode) => {
  setActionLoading(true);
  
  try {
    const params = new URLSearchParams({
      courseID,
      staffCode
    });

    const res = await fetch(`/api/hod/results/downloadTestResults/${hodId}?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      console.error("Failed to download test results", res.statusText);
      alert("Failed to download test results");
      return;
    }

    // Get filename from Content-Disposition header
    const contentDisposition = res.headers.get('Content-Disposition');
    let filename = 'test_results.xlsx';
    
    if (contentDisposition) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    // Create blob from response
    const blob = await res.blob();
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error("handleDownload error:", error);
    alert("An error occurred while downloading the file");
  } finally {
    setActionLoading(false);
  }
}





  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-black'>Review Test Results</h1>
        <p className='text-sm text-slate-600'>Review and approve test/CA scores submitted by lecturers</p>
      </div>

      {/* Statistics Cards */}
      {/* <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Pending Review</p>
              <p className='text-2xl font-bold text-gray-900'>{filteredSubmissions.length}</p>
            </div>
            <Clock size={32} className='text-amber-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Total Courses</p>
              <p className='text-2xl font-bold text-gray-900'>{submissions.length}</p>
            </div>
            <FileSpreadsheet size={32} className='text-blue-500' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Total Students</p>
              <p className='text-2xl font-bold text-gray-900'>
                {filteredSubmissions.reduce((sum, sub) => sum + sub.studentsCount, 0)}
              </p>
            </div>
            <CheckCircle size={32} className='text-green-500' />
          </div>
        </div>
     
      </div> */}

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <Filter size={20} />
          <h2 className='font-semibold'>Filters</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Select >
            <option value="">All Sessions</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </Select>
          <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            <option value="">All Semesters</option>
            <option value="First">First Semester</option>
            <option value="Second">Second Semester</option>
          </Select>
          <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
            <option value="">All Levels</option>
            <option value="100L">100 Level</option>
            <option value="200L">200 Level</option>
            <option value="300L">300 Level</option>
            <option value="400L">400 Level</option>
          </Select>
          <TextInput
            icon={Search}
            placeholder="Search by course or lecturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='font-semibold text-lg'>Pending Test Results</h2>
          <p className='text-sm text-gray-500'>Review submissions waiting for approval</p>
        </div>

        { submissions.length === 0 ? (
          <div className='flex flex-col justify-center items-center py-20 text-gray-500'>
            <CheckCircle size={48} className='mb-4 text-gray-300' />
            <p className='text-lg font-medium'>No pending submissions</p>
            <p className='text-sm'>All test results have been reviewed</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Course</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Lecturer</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Level</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Students</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {submissions.map((submission) => {
             
                  
                  return (
                    <tr key={submission.CourseID} className='hover:bg-gray-50'>
                      <td className='px-4 py-4'>
                        <div className='flex flex-col'>
                          <span className='font-medium text-gray-900'>{submission.CourseCode}</span>
                          <span className='text-sm text-gray-500'>{submission.CourseName}</span>
                        </div>
                      </td>
                      <td className='px-4 py-4 text-sm'>{submission.LecturerName}</td>
                      <td className='px-4 py-4 text-sm'>{submission.LevelName}</td>
                      <td className='px-4 py-4 text-sm'>{submission.StudentCount}</td>            
                        <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewDetails(submission.CourseID, submission.SubmittedBy)}
                            className='flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors'
                            title='View Details'
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(submission.CourseID, submission.SubmittedBy)}
                            disabled={actionLoading}
                            className='flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            title='Download Results'
                          >
                            <Download size={16} />
                            Download
                          </button>
                        
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal show={showViewModal} size="5xl" dismissible onClose={() => setShowViewModal(false)}>
        <ModalHeader>Test Result Details</ModalHeader>
        <ModalBody>
          {selectedSubmission && selectedSubmission.length > 0 && (
            <div className='space-y-4'>
              {/* Course Information */}
              <div className='grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <div>
                  <p className='text-sm text-gray-500'>Course</p>
                  <p className='font-semibold text-gray-900'>{selectedSubmission[0].CourseCode}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Lecturer</p>
                  <p className='font-semibold text-gray-900'>{selectedSubmission[0].LecturerName}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Level</p>
                  <p className='font-semibold text-gray-900'>{selectedSubmission[0].levelName}L</p>
                </div>
              </div>

              {/* Student Results Table */}
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                  <h3 className='font-semibold text-gray-900'>Student Results</h3>
                  <p className='text-sm text-gray-500'>Individual student scores ({selectedSubmission.length} students)</p>
                </div>
                
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>S/N</th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Matric No</th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Student Name</th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Level</th>
                        <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>CA Score</th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {selectedSubmission.map((student, index) => (
                        <tr key={index} className='hover:bg-gray-50'>
                          <td className='px-4 py-3 text-sm text-gray-900'>{index + 1}</td>
                          <td className='px-4 py-3 text-sm font-medium text-gray-900'>{student.MatricNo}</td>
                          <td className='px-4 py-3 text-sm text-gray-900'>{student.StudentName}</td>
                          <td className='px-4 py-3 text-sm text-gray-900'>{student.levelName}L</td>
                          <td className='px-4 py-3 text-center'>
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                              {student.CA_Score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  )
}

export default ReviewTestResults
