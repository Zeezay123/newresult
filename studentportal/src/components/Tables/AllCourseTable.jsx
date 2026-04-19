import React,{useState, useEffect} from 'react'
import { Popover, Select, Spinner, TextInput } from 'flowbite-react'
import { ChevronLeft, ChevronRight, Info, PlusCircle, Search } from 'lucide-react'
import Button from '../ui/Button'
import { useSelector } from 'react-redux'


const AllCourseTable = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)
    // const [courseCategory, setCourseCategory] = useState('')
    const [courseType, setCourseType] = useState('')
    const [programmeID, setProgrammeID] = useState('')
    const [assignmentStatus, setAssignmentStatus] = useState('all')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState([]) 
    




    useEffect(() => {
     
        const handler = setTimeout(() => {
            setDebouncedTerm(searchTerm)
        }, 1000); 
        return () => {
            clearTimeout(handler);
        };


        
    }, [searchTerm]);

    // Fetch once; search/filters/pagination are handled on the frontend.
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        
        try {
         
            const response = await fetch(`/api/hod/courses/getcourses`, {
                credentials: 'include' 
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            setCourses(data.courses || []);
            

        } catch (err) {
            setError(err.message);
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) => {
      const title = (course.course_title || '').toLowerCase();
      const code = (course.course_code || '').toLowerCase();
      const assigned = Boolean(course.LecturerID);

      const matchesSearch = !debouncedTerm
        || title.includes(debouncedTerm.toLowerCase())
        || code.includes(debouncedTerm.toLowerCase());

      const matchesType = !courseType || (course.course_type || '') === courseType;

      // Programme is stored as comma-separated ids in the current schema.
      const matchesProgramme = !programmeID
        || String(course.programme_id || '')
          .split(',')
          .map((v) => v.trim())
          .includes(programmeID);

      const matchesAssignmentStatus = assignmentStatus === 'all'
        || (assignmentStatus === 'assigned' && assigned)
        || (assignmentStatus === 'unassigned' && !assigned);

      return matchesSearch && matchesType && matchesProgramme && matchesAssignmentStatus;
    });

    const computedTotalPages = Math.max(1, Math.ceil(filteredCourses.length / limit));
    const pageNumbers = Array.from({ length: computedTotalPages }, (_, i) => i + 1);
    const safePage = Math.min(page, computedTotalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);

    useEffect(() => {
      setTotalPages(pageNumbers);
      if (page !== safePage) {
        setPage(safePage);
      }
    }, [filteredCourses.length, limit, page, safePage]);

    useEffect(() => {
      setPage(1);
    }, [debouncedTerm, courseType, programmeID, assignmentStatus, limit]);



  return (
    <div className='border  m-4 rounded-lg shadow-sm bg-white border-slate-100 '>
        <header className='border-b m-5 pb-4 mb-6 border-gray-300 '>
           <h1 className='text-sm py-2 font-semibold'>All Courses</h1>
       <div className='flex items-center justify-between w-full'> 
      
      <div className='flex items-center gap-6'>  
         <div className='flex gap-2 items-center'>
            <TextInput
                type='search'
                icon={Search}
                onChange={(e)=>setSearchTerm(e.target.value)}
                placeholder='Search Courses'
                value={searchTerm}
                className='w-70'
                sizing="sm"
               
            /> 
            <Button icon={Search}/>
        </div> 

        <div className=' flex gap-4'> 
        {/* <Select className='w-40' sizing="sm" value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)}>
            <option value=''> Select Category </option>
            <option value='general'> General </option>
            <option value='faculty'> Faculty </option>
            <option value='department'> Department </option>
      
        </Select> */}

      <div className='flex items-center'>   <Select className='w-40' sizing='sm' value={courseType} onChange={(e) => setCourseType(e.target.value)}>
            <option value=''> Select Type </option>
            <option value='C'> Core </option>
            <option value='E'> Elective </option>
        </Select>
</div> 

         <div className='flex items-center'> <Select className='w-40' sizing='sm' value={programmeID} onChange={(e) => setProgrammeID(e.target.value)}>
            <option value=''> Select Programme </option>
            <option value='1'> Undergraduate Regular </option>
            <option value='2'> Postgraduate Regular </option>
            <option value='3'> Diploma </option>
            <option value='4'> JUPEB </option>
        </Select> 
      

<div className='mt-1'> 
<Popover  
          trigger="hover"
          content={
            <div className="space-y-2 p-3 ">
              <p className="font-normal text-sm text-gray-900 dark:text-white">
                <span className='font-medium'> Filter by programmes:</span> Undergraduate  <br /> Postgraduate, diploma etc </p>
           
             
            </div>
          }
        >
          <Info size={18} className="ml-2 text-gray-400 " />
        </Popover>
</div>

       {/* end */}
           </div>
        
        </div>
        
        </div>

      
</div>

        </header>

    <div className='flex mx-5'> <span className='text-sm font-normal'>Show only:</span>
    
     <div className='flex items-center gap-2 ml-4'>
        <input type='radio' name='assignmentFilter' checked={assignmentStatus === 'all'} onChange={() => setAssignmentStatus('all')} /> 
        <span className='text-sm font-normal'> All</span>
         </div>

      <div className='flex items-center gap-2 ml-4'>
        <input type='radio' name='assignmentFilter' checked={assignmentStatus === 'assigned'} onChange={() => setAssignmentStatus('assigned')} /> 
        <span className='text-sm font-normal'> Courses already assigned to lecturers</span>
         </div>
      <div className='flex items-center gap-2 ml-4'>
        <input type='radio' name='assignmentFilter' checked={assignmentStatus === 'unassigned'} onChange={() => setAssignmentStatus('unassigned')} />
        <span className='text-sm font-normal'> Courses not assigned to lecturer</span>
         </div>
        
        
         </div>

      <table className='w-full text-sm text-left text-gray-500 font-[inter] mt-4 '>
        <thead className='bg-slate-50 border-b w-full border-slate-200 '>
            <tr className='font-light text-xs text-gray-900 '>
                <th className='text-left p-4'> Course Code </th>
                <th className='text-left p-4'> Course Title </th>
          
                <th className='text-left p-4'> Department </th>
                <th className='text-left p-4'> Level </th>  
                <th className='text-left p-4'> Assigned Discipline </th>
                <th className='text-left p-4'> Assigned Lecturer </th>
                <th className='text-left p-4'> Assignment Status </th>
                <th className='text-left p-4'> Assigned date </th>
            </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="text-center p-8">
                <Spinner size="lg" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="11" className="text-center p-8 text-red-500">
                Error: {error}
              </td>
            </tr>
          ) : paginatedCourses.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center p-8 text-gray-400">
                No courses found
              </td>
            </tr>
          ) : (
            paginatedCourses.map((course) => (
              <tr key={course.course_id} className=' border-slate-200 hover:bg-gray-50 text-xs'>
                <td className='p-4 font-medium text-gray-900'>{course.course_code}</td>
                <td className='p-4'>{course.course_title}</td>
                <td className='p-4'>{course.DepartmentName || 'All'}</td>
                <td className='p-4'>{course.LevelName || '-'}</td>
                <td className='p-4'>{course.DisciplineID || '-'}</td>
              
                <td className='p-4'>{course.AssignedLecturer || 'Not assigned'}</td>
                <td className='p-4'>
                  <span className={`px-2 py-1 rounded text-xs ${
                    (course.AssignmentStatus || '').toLowerCase() === 'assigned'
                      ? 'bg-green-100 text-green-800 font-bold text-[10px]' 
                      : 'bg-red-200 text-red-800 rounded font-bold text-[10px]'
                  }`}>
                    {course.AssignmentStatus || 'unassigned'}
                  </span>
                </td>
                <td className='p-4'>
                  {course.AssignedDate 
                    ? new Date(course.AssignedDate).toLocaleDateString() 
                    : '-'
                  }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

   <div className='flex p-4 items-center justify-between' >

    <div className='flex text-gray-500 text-xs ' >
      Showing {filteredCourses.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + limit, filteredCourses.length)} of {filteredCourses.length}
    </div>

    <div className='flex items-center gap-4'> 
      {/* previous */}

     <span onClick={()=>setPage((prev)=> Math.max(prev - 1, 1))}
     className={`flex items-center justify-center  rounded-full border border-slate-300 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={page === 1}> <ChevronLeft size={20} /> </span>      

      {/* page numbers */}
      <span className='flex text-xs gap-3 items-center  text-gray-500'> 
      
      {totalPages.map((pageNum) => (
        <span key={pageNum} onClick={() => setPage(pageNum)}
         className={`border text-center border-slate-300 w-6 h-6 rounded-full flex items-center
           justify-center ${pageNum === page ? 'bg-blue-500 text-white' : ''} `}>{pageNum}</span>
      ))}
      
      </span> 
      
      {/* next */}
      <span onClick={()=>setPage((prev) =>Math.min(prev + 1, computedTotalPages))}
       className={`flex items-center justify-center  rounded-full border border-slate-300 ${safePage === computedTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={safePage === computedTotalPages}> <ChevronRight size={20} /> </span>      
      </div>
    </div>
    </div>
  )
}

export default AllCourseTable