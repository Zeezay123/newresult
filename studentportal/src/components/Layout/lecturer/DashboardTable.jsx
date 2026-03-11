import React from 'react'
import {useSelector} from 'react-redux'


const DashboardTable = () => {
const [courses, setCourses] = React.useState([])
const [loading, setLoading] = React.useState(false)
const [error, setError] = React.useState(null)
const lecturerId = useSelector((state) => state.user.id);


React.useEffect(() => {
fetchCourses();
}, [])

const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try{
      const response = await fetch(`/api/lecturers/getcourses`, { credentials: 'include' });

      if(!response.ok){
        throw new Error("Failed to fetch lecturer courses");
        
      }
        const data = await response.json();
  
        console.log("Lecturer Courses Data:", data);
        setCourses(data.courses || []);

    }catch(error){
        console.error("Error fetching lecturer courses:", error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

  return (
    <div className='bg-white rounded-lg shadow-sm  flex flex-col p-4  '>
       <h1 className='text-lg font-semibold text-black p-2 '> Assigned Courses </h1>

       {loading ? (
        <div className='flex justify-center items-center py-8'>
            <p className='text-gray-500'>Loading courses...</p>
        </div>
       ) : error ? (
        <div className='flex justify-center items-center py-8'>
            <p className='text-red-500'>Error: {error}</p>
        </div>
       ) : courses.length === 0 ? (
        <div className='flex justify-center items-center py-8'>
            <p className='text-gray-500'>No courses assigned yet</p>
        </div>
       ) : (
       <table className='w-full text-sm text-left text-gray-500 mt-4'>
        <thead className='bg-slate-50 border-b w-full border-slate-200'>
            <tr className='font-light text-sm text-gray-900 '>
                <th className='text-left p-4'> Course Code </th>
                <th className='text-left p-4'> Course Title </th>
                <th className='text-left p-4'> Department </th>
                <th className='text-left p-4'> Type </th>
                <th className='text-left p-4'> Units </th>
                <th className='text-left p-4'> Level </th>
                <th className='text-left p-4'> Session </th>
                <th className='text-left p-4'> Semester </th>
                <th className='text-left p-4'> Assigned Date </th>
            </tr>
        </thead>

        <tbody>
            {courses.map((course, index) => (
                <tr key={course.AssignmentID || index} className='border-b border-slate-100 hover:bg-gray-50'>
                    <td className='p-4 font-medium text-gray-900'> {course.CourseCode} </td>
                    <td className='p-4 text-gray-700'> {course.CourseName} </td>
                    <td className='p-4 text-gray-700'> {course.DepartmentName || 'N/A'} </td>
                    <td className='p-4 text-gray-700'> {course.CourseType} </td>
                    <td className='p-4 text-gray-700'> {course.CreditUnits} </td>
                    <td className='p-4 text-gray-700'> {course.Level} </td>
                    <td className='p-4 text-gray-700'> {course.SessionName || 'N/A'} </td>
                    <td className='p-4 text-gray-700'> {course.SemesterName || 'N/A'} </td>
                    <td className='p-4 text-gray-700'> {formatDate(course.AssignedDate)} </td>
                </tr>
            ))}
        </tbody>
       </table>
       )}
    </div>
  )
}

export default DashboardTable