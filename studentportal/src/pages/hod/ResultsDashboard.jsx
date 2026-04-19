import React, { useState, useEffect, useMemo } from 'react'
import { Select, TextInput, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react'
import { FileCheck, FileX, ClockAlert, CheckCircle, Search, Filter, Eye, UserCheck, XCircle, Users, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useSelector } from 'react-redux'

const ResultsDashboard = () => {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0
  });
  
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [levels, setLevels] = useState([]);

  const hodId = useSelector((state) => state.user.department);

  // Fetch results data
  useEffect(() => {
    fetchExamResults();
    fetchSessions();
    fetchActiveSemester();
    fetchLevels();
  }, [selectedSemester, selectedLevel, searchTerm]);



 const fetchSessions = async () => {
    try {
   const response = await fetch('/api/sessions/active-session', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSessions(data.session ? [data.session] : [])
        setSelectedSession(data.session ? data.session.SessionID : '')
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }
 
  const fetchActiveSemester = async () => {
    try{

      const response = await fetch('/api/sessions/getActiveSemester', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch active semester')
      }
      const data = await response.json()
      setSemesters(data.semester ? [data.semester] : [])
      setSelectedSemester(data.semester ? data.semester.SemesterID : '')
    } catch (error) {
      console.error('Error fetching active semester:', error)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/levels/getLevels', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch levels');
      }
      const data = await response.json();
      setLevels(data.levels || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  }

  
  // Calculate stats when results change
  useEffect(() => {
    if (results.length > 0) {
      const pending = results.filter(r => r.ResultStatus === 'Submitted').length;
      const approved = results.filter(r => r.ResultStatus === 'Approved').length;
      const rejected = results.filter(r => r.ResultStatus === 'Rejected').length;
      
      setStats({
        totalSubmissions: results.length,
        pendingApproval: pending,
        approved: approved,
        rejected: rejected
      });
    }
  }, [results]);

  // Filter results based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredResults(results);
    } else {
      const statusMap = {
        'Pending': 'Submitted',
        'Approved': 'Approved',
        'Rejected': 'Rejected'
      };
      setFilteredResults(results.filter(r => r.ResultStatus === statusMap[statusFilter]));
    }
  }, [statusFilter, results]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semesterID', selectedSemester);
      if (selectedLevel) params.append('levelID', selectedLevel);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/hod/results/allExamResults/?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        console.error("Failed to fetch exam results", res.statusText);
        return;
      }

      const data = await res.json();
      setResults(data.results);
      console.log(data);

    } catch (error) {
      console.error("fetchExamResults error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleViewResult = (result) => {
    setSelectedResult(result);
    setViewModalOpen(true);
  };

  const handleApprove = async (result) => {
    if (!confirm(`Approve exam results for ${result.CourseCode}?`)) return;
    
    try {
      const res = await fetch(`/api/hod/results/approveOrReject/${hodId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseID: result.CourseID,
          staffCode: result.SubmittedBy,
          status: 'Approved'
        })
      });

      if (res.ok) {
        alert('Results approved successfully');
        fetchExamResults();
      } else {
        alert('Failed to approve results');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving results');
    }
  };

  const handleReject = async (result) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/hod/results/approveOrReject/${hodId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseID: result.CourseID,
          staffCode: result.SubmittedBy,
          status: 'Rejected'
        })
      });

      if (res.ok) {
        alert('Results rejected');
        fetchExamResults();
      } else {
        alert('Failed to reject results');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Error rejecting results');
    }
  };
  

  const reportStats = useMemo(() => {
    const fully = filteredResults.filter(r => r.TotalStudents > 0 && r.StudentCount >= r.TotalStudents).length;
    const partial = filteredResults.filter(r => r.TotalStudents > 0 && r.StudentCount > 0 && r.StudentCount < r.TotalStudents).length;
    const missing = filteredResults.filter(r => !r.TotalStudents || r.TotalStudents === 0).length;
    return { fully, partial, missing, total: filteredResults.length };
  }, [filteredResults]);

  const getStatusBadge = (status) => {
    // Map database status to display status
    const displayStatus = status === 'Submitted' ? 'Pending' : status;
    
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: ClockAlert },
      'Approved': { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle }
    };
    
    const config = statusConfig[displayStatus] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <span className={`${config.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border`}>
        <Icon size={14} />
        {displayStatus}
      </span>
    );
  };

  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-black'>Results Management</h1>
        <p className='text-sm text-slate-800'>Review and approve submitted course results</p>
      </div>

      {/* Statistics Cards */}
      <section className='grid md:grid-cols-4 w-full gap-4 mb-6'>
        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Total Submissions</div>
            <div className='bg-blue-50 flex items-center justify-center p-2 rounded-md text-blue-700'>
              <FileCheck size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.totalSubmissions}</div>
            <span className='text-slate-500 text-sm'>All submissions</span>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Pending Approval</div>
            <div className='bg-yellow-50 flex items-center justify-center p-2 rounded-md text-yellow-600'>
              <ClockAlert size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.pendingApproval}</div>
            <span className='text-slate-500 text-sm'>Awaiting review</span>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Approved</div>
            <div className='bg-green-50 flex items-center justify-center p-2 rounded-md text-green-600'>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.approved}</div>
            <span className='text-slate-500 text-sm'>Successfully approved</span>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Rejected</div>
            <div className='bg-red-50 flex items-center justify-center p-2 rounded-md text-red-600'>
              <FileX size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{stats.rejected}</div>
            <span className='text-slate-500 text-sm'>Rejected results</span>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <Filter size={20} className='text-gray-600' />
            <h2 className='font-semibold text-lg'>Filters</h2>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Session</label>
              <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                <option value="">All Sessions</option>
                {sessions.map((session) => (
                  <option key={session.SessionID} value={session.SessionID}>
                    {session.SessionName}
                  </option>
                ))}

              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Semester</label>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                <option value="">All Semesters</option>
                {semesters.map((semester) => (
                  <option key={semester.SemesterID} value={semester.SemesterID}>
                    {semester.SemesterName}
                  </option>
                ))}

              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Level</label>
              <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level.LevelID} value={level.LevelID}>
                    {level.LevelName}
                  </option>
                ))}
              
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Status</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Search</label>
              <TextInput
                icon={Search}
                placeholder="Course or Lecturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mini Report: Submission Coverage */}
      {!loading && filteredResults.length > 0 && (
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center gap-2 mb-3'>
            <Users size={18} className='text-gray-600' />
            <h2 className='font-semibold text-base'>Submission Coverage Report</h2>
            <span className='text-xs text-gray-400 ml-1'>— registered students vs submitted results per course</span>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200'>
              <CheckCircle size={22} className='text-green-600 shrink-0' />
              <div>
                <p className='text-xl font-bold text-green-700'>{reportStats.fully}</p>
                <p className='text-xs text-green-700 font-medium'>Fully Submitted</p>
                <p className='text-xs text-gray-500'>All registered students covered</p>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200'>
              <ClockAlert size={22} className='text-yellow-600 shrink-0' />
              <div>
                <p className='text-xl font-bold text-yellow-700'>{reportStats.partial}</p>
                <p className='text-xs text-yellow-700 font-medium'>Partially Submitted</p>
                <p className='text-xs text-gray-500'>Some students not yet included</p>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200'>
              <AlertCircle size={22} className='text-red-600 shrink-0' />
              <div>
                <p className='text-xl font-bold text-red-700'>{reportStats.missing}</p>
                <p className='text-xs text-red-700 font-medium'>No Registrations Found</p>
                <p className='text-xs text-gray-500'>Registration data unavailable</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
          <div>
            <h2 className='font-semibold text-lg'>Submitted Results</h2>
            <p className='text-sm text-gray-500'>Showing {filteredResults.length} of {results.length} results</p>
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Spinner size='xl' />
            <span className='ml-3 text-gray-600'>Loading results...</span>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className='flex flex-col justify-center items-center py-20 text-gray-500'>
            <FileCheck size={48} className='mb-4 text-gray-300' />
            <p className='text-lg font-medium'>No results found</p>
            <p className='text-sm'>Try adjusting your filters</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Course</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Level</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Lecturer</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Submitted / Registered</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Result Type</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredResults.map((result, index) => (
                  <tr key={index} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-4'>
                      <div className='flex flex-col'>
                        <span className='font-medium text-gray-900'>{result.course_code}</span>
                        <span className='text-sm text-gray-500'>{result.course_title}</span>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{result.LevelName}</td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{result.LecturerName}</td>
                    <td className='px-4 py-4'>
                      <div className='flex flex-col gap-1'>
                        <span className='text-sm font-medium text-gray-900'>
                          {result.StudentCount} / {result.TotalStudents || 0}
                        </span>
                        {result.TotalStudents > 0 && (
                          <div className='w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                            <div
                              className={`h-full rounded-full ${
                                result.StudentCount >= result.TotalStudents
                                  ? 'bg-green-500'
                                  : result.StudentCount > 0
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.round((result.StudentCount / result.TotalStudents) * 100))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{result.ResultType}</td>
                    <td className='px-4 py-4'>{getStatusBadge(result.ResultStatus)}</td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleViewResult(result)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors'
                          title='View Details'
                        >
                          <Eye size={18} />
                        </button>
                        {/* {result.ResultStatus === 'Submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(result)}
                              className='p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors'
                              title='Approve'
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(result)}
                              className='p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors'
                              title='Reject'
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Result Modal */}
      <Modal show={viewModalOpen} onClose={() => setViewModalOpen(false)} size='4xl'>
        <ModalHeader>Result Details - {selectedResult?.courseCode}</ModalHeader>
        <ModalBody>
          {selectedResult && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Course</label>
                  <p className='text-base font-semibold'>{selectedResult.course_code} - {selectedResult.course_title}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Level</label>
                  <p className='text-base font-semibold'>{selectedResult.LevelName}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Lecturer</label>
                  <p className='text-base font-semibold'>{selectedResult.LecturerName}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Submitted / Registered</label>
                  <p className='text-base font-semibold'>{selectedResult.StudentCount} / {selectedResult.TotalStudents || 0}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Submitted Date</label>
                  <p className='text-base font-semibold'>{new Date(selectedResult.SubmittedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>Status</label>
                  <div className='mt-1'>{getStatusBadge(selectedResult.ResultStatus)}</div>
                </div>
              </div>

              {/* <div className='border-t pt-4'>
                <h3 className='font-semibold mb-3'>Grade Distribution</h3>
                <div className='grid grid-cols-6 gap-2 text-center'>
                  <div className='bg-green-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-green-700'>8</p>
                    <p className='text-xs text-gray-600'>A</p>
                  </div>
                  <div className='bg-blue-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-blue-700'>12</p>
                    <p className='text-xs text-gray-600'>B</p>
                  </div>
                  <div className='bg-yellow-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-yellow-700'>15</p>
                    <p className='text-xs text-gray-600'>C</p>
                  </div>
                  <div className='bg-orange-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-orange-700'>7</p>
                    <p className='text-xs text-gray-600'>D</p>
                  </div>
                  <div className='bg-red-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-red-700'>2</p>
                    <p className='text-xs text-gray-600'>E</p>
                  </div>
                  <div className='bg-gray-50 p-3 rounded'>
                    <p className='text-2xl font-bold text-gray-700'>1</p>
                    <p className='text-xs text-gray-600'>F</p>
                  </div>
                </div>
              </div> */}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button text="Close" onClick={() => setViewModalOpen(false)} className='bg-gray-500 hover:bg-gray-600' />
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default ResultsDashboard