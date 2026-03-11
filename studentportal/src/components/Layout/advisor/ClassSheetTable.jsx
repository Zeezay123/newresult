import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ClassSheetTable = ({ meta, students, carryoverCourses, prevCarryOver }) => {
  const [page, setPage] = React.useState(1)
  const itemsPerPage = 10

  if (!students || students.length === 0) {
    return (
      <div className='flex justify-center items-center py-20'>
        <p className='text-gray-500'>No student results available</p>
      </div>
    )
  }

  // Get unique courses from first student to use as column headers
  const allCourses = students.length > 0 
    ? [...new Set(students.flatMap(s => s.courses.map(c => c.CourseCode)))]
    : []

  // Pagination
  const totalPages = Math.ceil(students.length / itemsPerPage)
  const startIdx = (page - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const paginatedStudents = students.slice(startIdx, endIdx)

  return (
    <div className='w-full'>
      {/* Header Info */}
      <div className='bg-white p-6 rounded-lg shadow-sm mb-6'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <p className='text-gray-600 font-medium'>Department</p>
            <p className='text-gray-900 font-semibold'>{meta.department || '-'}</p>
          </div>
          <div>
            <p className='text-gray-600 font-medium'>Programme</p>
            <p className='text-gray-900 font-semibold'>{meta.programme || '-'}</p>
          </div>
          <div>
            <p className='text-gray-600 font-medium'>Level</p>
            <p className='text-gray-900 font-semibold'>{meta.level || '-'}</p>
          </div>
          <div>
            <p className='text-gray-600 font-medium'>Session/Semester</p>
            <p className='text-gray-900 font-semibold'>{meta.session} - {meta.semester}</p>
          </div>
        </div>
      </div>

      {/* Class Sheet Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='font-semibold text-lg'>Class Sheet</h2>
          <p className='text-sm text-gray-500'>Student results for {meta.semester}, {meta.session}</p>
        </div>

        {/* Scrollable Table Container */}
        <div className='overflow-x-auto'>
          <table className='w-full text-xs border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                {/* Fixed Columns */}
                <th className='px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-24'>
                  S/N
                </th>
                <th className='px-4 py-3 text-left font-semibold text-gray-900 sticky left-24 bg-gray-50 z-10 w-32'>
                  Matric No
                </th>

                {/* Summary of Previous Semesters */}
                <th colSpan="4" className='px-2 py-2 text-center font-bold text-gray-900 bg-gray-100 border-l border-gray-300 border-r border-gray-300'>
                  SUMMARY OF PREVIOUS SEMESTERS
                </th>
                <th colSpan="5" className='px-2 py-2 text-center font-bold text-gray-900 bg-blue-50 border-r border-gray-300'>
                  CUMULATIVE
                </th>
                <th colSpan="4" className='px-2 py-2 text-center font-bold text-gray-900 bg-gray-100 border-l border-gray-300 border-r border-gray-300'>
                  List of Courses
                </th>
                <th colSpan="5" className='px-2 py-2 text-center font-bold text-gray-900 bg-blue-50 border-r border-gray-300'>
                  Carried Over Courses
                </th>




                {/* This row will be replaced with actual headers below */}
              </tr>
              <tr className='bg-gray-50 border-b border-gray-200'>
                {/* Repeat Fixed Columns for alignment */}
                <th className='px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-24'>
                  S/N
                </th>
                <th className='px-4 py-3 text-left font-semibold text-gray-900 sticky left-24 bg-gray-50 z-10 w-32'>
                  Matric No
                </th>

                {/* Summary Columns */}
                <th className='px-2 py-3 text-center font-semibold text-gray-900 border-l border-gray-300'>
                  Units Taken
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900'>
                  Units Passed
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900'>
                  GPA
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900 border-r border-gray-300'>
                  Units O/S
                </th>

                {/* Cumulative Columns */}
                <th className='px-2 py-3 text-center font-semibold text-gray-900 bg-blue-50 border-l border-gray-300'>
                  Cum. Units
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900 bg-blue-50'>
                  Cum. Passed
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900 bg-blue-50'>
                  Cum. Failed
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900 bg-blue-50'>
                  CGPA
                </th>
                <th className='px-2 py-3 text-center font-semibold text-gray-900 bg-blue-50 border-r border-gray-300'>
                  Status
                </th>

                {/* Current Semester Courses */}
                {allCourses.map((courseCode) => (
                  <th
                    key={courseCode}
                    className='px-2 py-3 text-center font-semibold text-gray-900 border-l border-gray-300 min-w-20'
                  >
                    <div className='text-xs'>{courseCode}</div>
                  </th>
                ))}

                {/* Carryover Courses */}
                {carryoverCourses && carryoverCourses.length > 0 && (
                  <>
                    {carryoverCourses.map((course) => (
                      <th
                        key={`carryover-${course.CourseID}`}
                        className='px-2 py-3 text-center font-semibold text-gray-900 bg-yellow-50 border-l border-gray-300 min-w-20'
                      >
                        <div className='text-xs'>{course.CourseCode}</div>
                      </th>
                    ))}
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedStudents.map((student, idx) => {
                // Create a map of course codes to grades for this student
                const courseGradeMap = {}
                student.courses.forEach(course => {
                  courseGradeMap[course.CourseCode] = course
                })

                return (
                  <tr key={student.MatricNo} className='border-b border-gray-200 hover:bg-gray-50'>
                    {/* Fixed Columns */}
                    <td className='px-4 py-2 text-gray-900 sticky left-0 bg-white z-10 w-24'>
                      {startIdx + idx + 1}
                    </td>
                    <td className='px-4 py-2 text-gray-900 font-medium sticky left-24 bg-white z-10 w-32'>
                      {student.MatricNo}
                    </td>

                    {/* Summary Columns */}
                    <td className='px-2 py-2 text-center text-gray-900 border-l border-gray-300'>
                      {student.TotalCreditUnits || '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900'>
                      {student.TotalCreditUnitsPassed || '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900 font-semibold'>
                      {student.GPA ? parseFloat(student.GPA).toFixed(2) : '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900 border-r border-gray-300'>
                      {student.TotalCreditUnitsFailed || '-'}
                    </td>

                    {/* Cumulative Columns */}
                    <td className='px-2 py-2 text-center text-gray-900 bg-blue-50 border-l border-gray-300'>
                      {student.CumulativeCreditUnits || '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900 bg-blue-50'>
                      {student.CumulativeCreditUnitsPassed || '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900 bg-blue-50'>
                      {student.CumulativeCreditUnitsFailed || '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900 bg-blue-50 font-semibold'>
                      {student.CGPA ? parseFloat(student.CGPA).toFixed(2) : '-'}
                    </td>
                    <td className='px-2 py-2 text-center text-gray-900 bg-blue-50 border-r border-gray-300 text-xs font-medium'>
                      {student.CGPA >= 2.0 ? (
                        <span className='text-green-600'>Good</span>
                      ) : (
                        <span className='text-red-600'>Low</span>
                      )}
                    </td>

                    {/* Course Grades */}
                    {allCourses.map((courseCode) => {
                      const courseData = courseGradeMap[courseCode]
                      return (
                        <td
                          key={courseCode}
                          className='px-2 py-2 text-center text-gray-900 border-l border-gray-300 font-medium'
                        >
                          {courseData ? (
                            <div className='flex flex-col items-center gap-0.5'>
                              <span className='text-xs text-gray-600'>
                                {courseData.TotalScore || '-'}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  courseData.Grade === 'A'
                                    ? 'text-green-700'
                                    : courseData.Grade === 'F'
                                    ? 'text-red-700'
                                    : 'text-gray-700'
                                }`}
                              >
                                {courseData.Grade || '-'}
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      )
                    })}

                    {/* Carryover Courses (empty for now, can be populated if data exists) */}
                    {carryoverCourses && carryoverCourses.length > 0 && (
                      <>
                        {carryoverCourses.map((course) => (
                          <td
                            key={`carryover-${course.CourseID}`}
                            className='px-2 py-2 text-center text-gray-900 bg-yellow-50 border-l border-gray-300 font-medium'
                          >
                            -
                          </td>
                        ))}
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between p-4 border-t border-gray-200'>
            <div className='text-xs text-gray-600'>
              Showing {startIdx + 1} to {Math.min(endIdx, students.length)} of {students.length} students
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`p-1 rounded border border-gray-300 ${
                  page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <div className='flex gap-1'>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-2 py-1 rounded text-xs border ${
                      pageNum === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`p-1 rounded border border-gray-300 ${
                  page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    
    </div>
  )
}

export default ClassSheetTable
