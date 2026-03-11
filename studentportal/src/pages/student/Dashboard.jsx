import React, {  useState } from 'react'
import { Select, Badge, Spinner } from 'flowbite-react'
import { CheckCircle, ClockAlert, Download, FileCheck, FileX, Filter } from 'lucide-react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'



const Dashboard = () => {
   
const [selectedSession, setSelectedSession] = useState('');
const [selectedSemester, setSelectedSemester] = useState('');
const [availableSessions, setAvailableSessions] = useState([]);
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [sessionInfo, setSessionInfo] = useState({ sessionName: '', semesterName: '', isCurrent: false });
const [gpaInfo, setGpaInfo] = useState({ gpa: null, cgpa: null, totalUnits: 0, unitsPassed: 0, unitsFailed: 0 });

const studentID = useSelector((state) => state.user.id);

console.log('studentID', studentID)


useEffect(()=>{
  fetchAvailableSessions();
},[])

useEffect(() => {
  if (selectedSession && selectedSemester) {
    fetchResult();
  }
}, [selectedSession, selectedSemester]);

const fetchAvailableSessions = async () => {
  try {
    const res = await fetch(`/api/students/results/available-sessions/?MatricNo=${studentID}`, { credentials: 'include' });
    
    if (!res.ok) {
      console.error("Failed to fetch available sessions", res.statusText);
      return;
    }

    const data = await res.json();
    console.log('available sessions', data);

    setAvailableSessions(data.availableSessions || []);
    
    // Set active session and semester as default
    if (data.activeSession && data.activeSemester) {
      setSelectedSession(data.activeSession.SessionID.toString());
      setSelectedSemester(data.activeSemester.SemesterID.toString());
    } else if (data.availableSessions && data.availableSessions.length > 0) {
      // If no active, use the most recent
      setSelectedSession(data.availableSessions[0].SessionID.toString());
      setSelectedSemester(data.availableSessions[0].SemesterID.toString());
    }

  } catch (err) {
    console.error("Error fetching available sessions:", err);
  }
};

const fetchResult = async () => {
  if (!selectedSession || !selectedSemester) return;

  setLoading(true);
  try {
    const res = await fetch(
      `/api/students/results/getresults/?MatricNo=${studentID}&SessionID=${selectedSession}&SemesterID=${selectedSemester}`,
      { credentials: 'include' }
    );
    
    if (!res.ok) {
      console.error("Failed to fetch results", res.statusText);
      setResults([]);
      setLoading(false);
      return;
    }

    const data = await res.json();
    console.log('results', data);

    setResults(data.results || []);
    setSessionInfo({
      sessionName: data.sessionName || '',
      semesterName: data.semesterName || '',
      isCurrent: data.isCurrent || false
    });
    setGpaInfo({
      gpa: data.gpa,
      cgpa: data.cgpa,
      totalUnits: data.totalUnits || 0,
      unitsPassed: data.unitsPassed || 0,
      unitsFailed: data.unitsFailed || 0
    });

  } catch (err) {
    console.error("Error fetching results:", err);
    setResults([]);
  } finally {
    setLoading(false);
  }
};

const credits = results?.reduce((sum, units)=> sum + (units.CreditUnits || 0), 0)

  return (
    <main className='flex flex-col gap-4 p-4'>
     
     {/* Header */}
    <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-black'>Result Dashboard</h1>
        <p className='text-sm text-slate-600'>
          View your academic results and progress
          {sessionInfo.sessionName && ` - ${sessionInfo.semesterName} Semester, ${sessionInfo.sessionName}`}
          {sessionInfo.isCurrent && (
            <Badge color="success" size="sm" className="ml-2">Current Semester</Badge>
          )}
        </p>
      </div>


     {/* Filters */}

<div className='bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <Filter size={20} className='text-gray-600' />
            <h2 className='font-semibold text-lg'>Filters</h2>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Session</label>
              <Select 
                value={selectedSession} 
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  // Find matching semester for this session
                  const sessionsForSelected = availableSessions.filter(s => s.SessionID.toString() === e.target.value);
                  if (sessionsForSelected.length > 0) {
                    setSelectedSemester(sessionsForSelected[0].SemesterID.toString());
                  }
                }}
              >
                <option value="">Select Session</option>
                {[...new Set(availableSessions.map(s => s.SessionID))].map(sessionId => {
                  const session = availableSessions.find(s => s.SessionID === sessionId);
                  return (
                    <option key={sessionId} value={sessionId}>
                      {session.SessionName}
                    </option>
                  );
                })}
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Semester</label>
              <Select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedSession}
              >
                <option value="">Select Semester</option>
                {availableSessions
                  .filter(s => s.SessionID.toString() === selectedSession)
                  .map((session, index) => (
                    <option key={index} value={session.SemesterID}>
                      {session.SemesterName} ({session.CourseCount} courses)
                    </option>
                  ))}
              </Select>
            </div>
          </div>
        </div>
      </div>


      {/* Summary Cards */}
      <section className='grid md:grid-cols-4 w-full gap-4 mb-6'>
        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>GPA</div>
            <div className='bg-blue-50 flex items-center justify-center p-2 rounded-md text-blue-700'>
              <FileCheck size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{gpaInfo.gpa ? gpaInfo.gpa.toFixed(2) : '-'}</div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>CGPA</div>
            <div className='bg-purple-50 flex items-center justify-center p-2 rounded-md text-purple-600'>
              <FileCheck size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{gpaInfo.cgpa ? gpaInfo.cgpa.toFixed(2) : '-'}</div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Total Units</div>
            <div className='bg-green-50 flex items-center justify-center p-2 rounded-md text-green-600'>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{gpaInfo.totalUnits || '-'}</div>
            <div className='text-xs text-gray-500 mt-1'>
              {gpaInfo.unitsPassed || 0} passed
            </div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Failed Units</div>
            <div className='bg-red-50 flex items-center justify-center p-2 rounded-md text-red-600'>
              <FileX size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{gpaInfo.unitsFailed || '0'}</div>
          </div>
        </div>
      </section>

{/* table */}

<section className='bg-white shadow rounded-lg'>

{/* header */}
<div className='flex p-4 items-center justify-between font-medium text-sm text-gray-900'> 
  <h1> Course Results </h1>   

<div className='flex items-center gap-2 text-blue-800 cursor-pointer hover:text-blue-900'>  
  <span className=''> <Download size={18}/></span>

 <span className='font-medium text-sm'> Download Result  </span> 
   
   </div>
 </div>
{/* table body */}

{loading ? (
  <div className='flex justify-center items-center py-20'>
    <Spinner size="xl" />
  </div>
) : !results || results.length === 0 ? (
              <div className='flex justify-center items-center py-10'>
                <p className='text-gray-500'>
                  {!selectedSession || !selectedSemester 
                    ? 'Please select a session and semester to view results.' 
                    : 'No results found for the selected session and semester.'}
                </p>
              </div>
            ) : (
<div className='overflow-x-auto'>
<table className='w-full mt-4'>
  <thead className='bg-slate-50 w-full '  >
    <tr className='text-left text-xs font- text-gray-800 border-b border-slate-300 w-full '>
      <th className='p-4'>Course Code</th>
      <th className='p-4'>Course Title</th>
      <th className='p-4'>Credit Units</th>
      <th className='p-4'>Total Score</th>
      <th className='p-4'>Grade</th>
      <th className='p-4'>Grade Point</th>
    </tr>
  </thead>


<tbody>
  {
    results?.map((result, index) => (
      <tr key={index} className='border-b border-slate-100 hover:bg-slate-50'>
        <td className='p-4 font-medium text-xs text-slate-800'>{result.CourseCode}</td>
        <td className='p-4 text-xs font-medium text-slate-600'>{result.CourseName}</td>
        <td className='p-4 text-xs font-medium text-slate-600'>{result.CreditUnits}</td>
        <td className='p-4 text-xs font-medium text-slate-600'>{result.TotalScore}</td>
        <td className='p-4 text-xs font-medium text-slate-600'>{result.Grade}</td>
        <td className='p-4 text-xs font-medium text-slate-600'>{result.GradePoint}</td>
      </tr>
    ))
  }
</tbody>

</table></div>)} 



</section>


    </main>
  )
}

export default Dashboard