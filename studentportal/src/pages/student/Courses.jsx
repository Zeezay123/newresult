import React, { useState, useEffect } from 'react'
import { Badge, Spinner, Tabs } from 'flowbite-react'
import { BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useSelector } from 'react-redux'

const Courses = () => {
  const [passedCourses, setPassedCourses] = useState([]);
  const [failedCoreCourses, setFailedCoreCourses] = useState([]);
  const [missedCoreCourses, setMissedCoreCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('passed');

  const studentID = useSelector((state) => state.user.id);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Fetch passed courses
      const passedRes = await fetch(
        `/api/students/results/passed-courses/?MatricNo=${studentID}`,
        { credentials: 'include' }
      );

      // Fetch failed core courses
      const failedRes = await fetch(
        `/api/students/results/failed-core-courses/?MatricNo=${studentID}`,
        { credentials: 'include' }
      );

      // Fetch missed core courses (unregistered)
      const missedRes = await fetch(
        `/api/students/results/missed-core-courses/?MatricNo=${studentID}`,
        { credentials: 'include' }
      );

      if (passedRes.ok) {
        const passedData = await passedRes.json();
        setPassedCourses(passedData.passedCourses || []);
      }

      if (failedRes.ok) {
        const failedData = await failedRes.json();
        setFailedCoreCourses(failedData.failedCoreCourses || []);
      }

      if (missedRes.ok) {
        const missedData = await missedRes.json();
        setMissedCoreCourses(missedData.missedCoreCourses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group passed courses by type
  const coreCourses = passedCourses.filter(c => c.CourseType === 'core' || c.CourseType === 'Compulsory');
  const electiveCourses = passedCourses.filter(c => c.CourseType === 'Elective');
  const otherCourses = passedCourses.filter(c => c.CourseType !== 'core' && c.CourseType !== 'Compulsory' && c.CourseType !== 'Elective');

  const totalPassedUnits = passedCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0);
  const totalFailedUnits = failedCoreCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0);
  const totalMissedUnits = missedCoreCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0);
  const totalOutstandingUnits = totalFailedUnits + totalMissedUnits;

  return (
    <main className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-black'>My Courses</h1>
        <p className='text-sm text-slate-600'>View all your courses - passed, failed, and missed (unregistered)</p>
      </div>

      {/* Summary Cards */}
      <section className='grid md:grid-cols-5 w-full gap-4 mb-6'>
        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Total Passed</div>
            <div className='bg-green-50 flex items-center justify-center p-2 rounded-md text-green-600'>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{passedCourses.length}</div>
            <div className='text-xs text-gray-500 mt-1'>{totalPassedUnits} units</div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Core Courses</div>
            <div className='bg-blue-50 flex items-center justify-center p-2 rounded-md text-blue-600'>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{coreCourses.length}</div>
            <div className='text-xs text-gray-500 mt-1'>
              {coreCourses.reduce((sum, c) => sum + (c.CreditUnits || 0), 0)} units
            </div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Electives</div>
            <div className='bg-purple-50 flex items-center justify-center p-2 rounded-md text-purple-600'>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{electiveCourses.length}</div>
            <div className='text-xs text-gray-500 mt-1'>
              {electiveCourses.reduce((sum, c) => sum + (c.CreditUnits || 0), 0)} units
            </div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Failed Core</div>
            <div className='bg-red-50 flex items-center justify-center p-2 rounded-md text-red-600'>
              <XCircle size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{failedCoreCourses.length}</div>
            <div className='text-xs text-gray-500 mt-1'>{totalFailedUnits} units</div>
          </div>
        </div>

        <div className='flex flex-col p-4 rounded-xl gap-4 shadow-sm bg-white'>
          <div className='flex items-center justify-between'>
            <div className='font-medium text-sm text-gray-900'>Missed Courses</div>
            <div className='bg-orange-50 flex items-center justify-center p-2 rounded-md text-orange-600'>
              <AlertCircle size={20} />
            </div>
          </div>
          <div>
            <div className='font-bold text-3xl'>{missedCoreCourses.length}</div>
            <div className='text-xs text-gray-500 mt-1'>{totalMissedUnits} units (Not in CGPA)</div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className='bg-white shadow rounded-lg p-4'>
        <div className='border-b border-gray-200 mb-4'>
          <nav className='flex gap-8'>
            <button
              onClick={() => setActiveTab('passed')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'passed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Passed Courses ({passedCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('missed')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'missed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Missed Courses ({missedCoreCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('failed')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'failed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Failed Core Courses ({failedCoreCourses.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {/* Passed Courses Tab */}
            {activeTab === 'passed' && (
              <div>
                {passedCourses.length === 0 ? (
                  <div className='flex justify-center items-center py-10'>
                    <p className='text-gray-500'>No passed courses found.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className='bg-slate-50'>
                        <tr className='text-left text-xs font-medium text-gray-800 border-b border-slate-300'>
                          <th className='p-4'>Course Code</th>
                          <th className='p-4'>Course Title</th>
                          <th className='p-4'>Type</th>
                          <th className='p-4'>Credit Units</th>
                          <th className='p-4'>Grade</th>
                          <th className='p-4'>Grade Point</th>
                          <th className='p-4'>Session</th>
                          <th className='p-4'>Semester</th>
                          <th className='p-4'>Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passedCourses.map((course, index) => (
                          <tr key={index} className='border-b border-slate-100 hover:bg-slate-50'>
                            <td className='p-4 font-medium text-xs text-slate-800'>{course.CourseCode}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.CourseName}</td>
                            <td className='p-4 text-xs'>
                              <Badge color={course.CourseType === 'Core' || course.CourseType === 'Compulsory' ? 'info' : 'purple'} size="sm">
                                {course.CourseType}
                              </Badge>
                            </td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.CreditUnits}</td>
                            <td className='p-4 text-xs'>
                              <Badge 
                                color={
                                  course.Grade === 'A' ? 'success' :
                                  course.Grade === 'B' ? 'info' :
                                  course.Grade === 'C' ? 'warning' :
                                  'gray'
                                } 
                                size="sm"
                              >
                                {course.Grade}
                              </Badge>
                            </td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.GradePoint}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.SessionName}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.SemesterName}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.LevelName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Failed Core Courses Tab */}
            {activeTab === 'failed' && (
              <div>
                {failedCoreCourses.length === 0 ? (
                  <div className='flex justify-center items-center py-10'>
                    <p className='text-gray-500'>No failed core courses. Great job!</p>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <p className='text-sm text-red-800'>
                        <strong>Failed Courses:</strong> These are courses you registered for and took exams but failed. 
                        They are included in your CGPA calculation and must be retaken.
                      </p>
                    </div>
                    <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className='bg-slate-50'>
                        <tr className='text-left text-xs font-medium text-gray-800 border-b border-slate-300'>
                          <th className='p-4'>Course Code</th>
                          <th className='p-4'>Course Title</th>
                          <th className='p-4'>Type</th>
                          <th className='p-4'>Credit Units</th>
                          <th className='p-4'>Grade</th>
                          <th className='p-4'>Score</th>
                          <th className='p-4'>Session</th>
                          <th className='p-4'>Semester</th>
                          <th className='p-4'>Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedCoreCourses.map((course, index) => (
                          <tr key={index} className='border-b border-slate-100 hover:bg-slate-50'>
                            <td className='p-4 font-medium text-xs text-slate-800'>{course.CourseCode}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.CourseName}</td>
                            <td className='p-4 text-xs'>
                              <Badge color="failure" size="sm">
                                {course.CourseType}
                              </Badge>
                            </td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.CreditUnits}</td>
                            <td className='p-4 text-xs'>
                              <Badge color="failure" size="sm">
                                {course.Grade}
                              </Badge>
                            </td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.TotalScore}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.SessionName}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.SemesterName}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.LevelName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </div>
            )}

            {/* Missed Core Courses Tab */}
            {activeTab === 'missed' && (
              <div>
                {missedCoreCourses.length === 0 ? (
                  <div className='flex justify-center items-center py-10'>
                    <p className='text-gray-500'>No missed courses. You're all caught up!</p>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                      <p className='text-sm text-orange-800'>
                        <strong>Missed Courses:</strong> These are required Core/Compulsory courses you haven't registered for yet. 
                        They are NOT included in your CGPA calculation. You must register and complete these courses.
                      </p>
                    </div>
                    <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className='bg-slate-50'>
                        <tr className='text-left text-xs font-medium text-gray-800 border-b border-slate-300'>
                          <th className='p-4'>Course Code</th>
                          <th className='p-4'>Course Title</th>
                          <th className='p-4'>Type</th>
                          <th className='p-4'>Credit Units</th>
                          <th className='p-4'>Level</th>
                          <th className='p-4'>Semester</th>
                          <th className='p-4'>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missedCoreCourses.map((course, index) => (
                          <tr key={index} className='border-b border-slate-100 hover:bg-slate-50'>
                            <td className='p-4 font-medium text-xs text-slate-800'>{course.CourseCode}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.CourseName}</td>
                            <td className='p-4 text-xs'>
                              <Badge color="warning" size="sm">
                                {course.CourseType}
                              </Badge>
                            </td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.CreditUnits}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.LevelName}</td>
                            <td className='p-4 text-xs font-medium text-slate-600'>{course.SemesterName}</td>
                            <td className='p-4 text-xs'>
                              <Badge color="warning" size="sm">
                                Not Registered
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Courses
