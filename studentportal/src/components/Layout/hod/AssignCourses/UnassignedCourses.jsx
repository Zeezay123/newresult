import { TextInput } from 'flowbite-react'
import { title } from 'process'
import React,{useState,useEffect} from 'react'
import { Spinner } from 'flowbite-react'
import { useSelector } from 'react-redux'

const UnassignedCourses = ({ selectedSession, selectedSemester, selectedLevel }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const hodid = useSelector((state) => state.user.department);
     console.log("HOD ID in UnassignedCourses:", hodid);    
    useEffect(() => {
        // fetchUnassignedCourses();
    }, [selectedSession, selectedSemester, selectedLevel]);

    const fetchUnassignedCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/hod/courses/unassignedcourses/${hodid}`, {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Transform data to match component structure
                const transformed = data.courses.map(course => ({
                    title: course.CourseName,
                    code: course.CourseCode,
                    level: course.LevelName,
                    units: course.CreditUnits + ' Units',
                    type: course.CourseType
                }));
                setCourses(transformed);
            }
        } catch (err) {
            console.error('Failed to fetch unassigned courses:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className='flex flex-col bg-white w-md p-4 rounded-lg overflow-y-auto h-[600px]  shadow-sm '> 
   <div className='flex items-center justify-between  border-b-2 border-amber-500/30 '> 
     <div className='flex items-center gap-2  my-2'> 
     <span className='bg-amber-400 rounded-full w-2 h-2'> </span>
        <h1 className='font-bold'> Unassigned Courses</h1> 
     </div>
      
      <span className='bg-white/10 border border-slate-300 rounded px-2 text-xs py-1 '> {courses.length} Courses </span>
     </div>

    <div className='my-4'>  
    <TextInput
    placeholder='Search course by code or name'
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    /></div>

    <div className='flex flex-col'>
        { loading ? (<div className='flex justify-center py-10'><Spinner size='lg' /></div>) : error ? <p className='text-red-500'>{error}</p> : !filteredCourses || filteredCourses.length == 0 ? (
            <p className='text-center text-gray-500 py-10'>No courses available</p>
        ) : (
            filteredCourses.map((course,index)=>(
            <div key={index} className='hover:bg-blue-100 bg-slate-200/10 backdrop-blur-lg border border-slate-400/30 rounded-lg shadow-sm flex flex-col p-4 mb-3'>
                <div className='flex justify-between items-center'>

                    <div className='flex flex-col mb-4'> 
                    <span className='text-sm font-bold'>{course.code} </span>
                     <span className='text-xs text-gray-700'> {course.title}</span> </div>
                    
                      <span className='border px-2 rounded border-blue-300 py-1 text-xs font-normal text-gray-700'>{course.units}</span></div>
                 
                 <div className='flex justify-between items-center mt-4 text-xs'><span>{course.level}</span> <span>{course.type}</span></div>
                 </div>
        )))}

    </div>

    </div>
  )
}

export default UnassignedCourses