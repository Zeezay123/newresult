import { Label, Select, TextInput } from 'flowbite-react'
import React from 'react'
import Button from '../../components/ui/Button'
import { Search } from 'lucide-react'

const SetScore = () => {
    
    const [courses, setCourses] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [scoreTypes, setScoreTypes] = React.useState([]);
    const [scoreAssignments, setScoreAssignments] = React.useState([]);
    const [selectedCourse, setSelectedCourse] = React.useState('');
    const [selectedScoreType, setSelectedScoreType] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = React.useState(1);
   
    React.useEffect(() => {
     
        fetchScoreTypes();   
        fetchCourses();
        fetchScoreAssignments();

    }, [])

    React.useEffect(() => {
       
        const handler = setTimeout(()=> {
            setDebouncedTerm(searchTerm)}, 1000); 

            return () => {
                clearTimeout(handler);
            }

    }, [searchTerm]);

   
    const handleSetScoreType = async () => {
        if (!selectedCourse || !selectedScoreType) {
            alert('Please select both a course and a score type.');
            return;
        }

        try {

            const ressponse = await fetch('/api/hod/scoretypes/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    course_id: selectedCourse,
                    ScoreID: selectedScoreType
                })
            });

            const data = await ressponse.json();

            if (!ressponse.ok) {
                throw new Error(data.message || 'Failed to set score type');
            }

            alert('Score type assigned successfully.');
            fetchScoreAssignments(); // Refresh the assignments list

        } catch (error) {
            alert('Failed to set score type. Please try again.');
            console.error('Error setting score type:', error);
        }
    }

    const fetchScoreTypes = async () => {
     
        try{
            const response = await fetch('/api/hod/scoretypes', { credentials: 'include' });
           
           

            if (!response.ok) {
                throw new Error('Failed to fetch score types');
            }
           
           
            const data = await response.json();
            setScoreTypes(data.data || []);
            console.log("Fetched Score Types:", data);
          
        }catch(err){
            console.error("Error fetching score types:", err);
        }

    }
   const fetchCourses = async () => {
      
        
        try {
         
            const response = await fetch(`/api/hod/courses/getcourses`, {
                credentials: 'include' 
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
              console.log("Fetched Courses:", data);
       setCourses(data.courses || []);
            

        } catch (err) {
            setError(err.message);
            console.error('Error fetching courses:', err);
        } 
        
    };

   const fetchScoreAssignments = async ()=>{
   try {

       const response  = await fetch('/api/hod/scoretypes/assignedScoreTypes', { credentials: 'include' });
       const data = await response.json();

       if(!response.ok){
        throw new Error('Failed to fetch score assignments');
       }

       console.log("Fetched Score Assignments:", data);
       setScoreAssignments(data.data || []);
    
   } catch (error) {
    console.error("Error fetching score assignments:", error);
   }
   }

   const pagenation = (totalItems, itemsPerPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
   }



   const filteredAssignments = debouncedTerm ? scoreAssignments.filter(assignment =>
    assignment.course_code.toLowerCase().includes(debouncedTerm.toLowerCase())
   ) : scoreAssignments;

    const itemstoDisplay = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 const totalItems = filteredAssignments.length;

 
 console.log("Courses:", selectedCourse, 'score type:', selectedScoreType);


   return (
    <div className='flex flex-col p-4'>
        <div >
            <h1 className='text-2xl font-semibold '>Set Score Type</h1>
            <p className='text-gray-500 mb-4 text-sm'>Configure the scoring system for your courses. If score should be 30/70 split, 40/60, or another ratio, select the appropriate option.</p>
            
        </div>

        <div className='flex flex-col gap-4 bg-white  rounded-lg shadow '>

            <div className='border-b p-3 border-gray-300'>
                <h2 className='text-lg font-medium '> New Score Assignment </h2>
                <p className='text-sm text-gray-500 mb-2 '> Set the score type for a specific course. This will determine how scores are calculated and displayed for that course. </p>
            </div>


            {/* Form for setting score type */}

<div className='flex flex-col md:items-center md:flex-row gap-4 px-4'>  

   <div className='mb-4 md:w-80'>
                    <Label htmlFor='course' className='block text-sm font-semibold text-gray-700 mb-1'>
                        Select Course
                    </Label>
                    <Select id='course' className='sm:text-sm' onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse}>
                        <option value=''>-- Choose a course --</option>
                          {courses.map((course) => (
                            <option key={course.course_id} value={course.course_id}>{course.course_code} - {course.course_title}</option>
                          ))}
                    </Select>
                </div>


         <div className='mb-4 md:w-80'>
                    <Label htmlFor='scoreType' className='block text-sm font-semibold text-gray-700 mb-1'>
                        Select Score Type
                    </Label>
                    <Select id='scoreType' className='sm:text-sm' onChange={(e) => setSelectedScoreType(e.target.value)} value={selectedScoreType}>
                        <option value=''>-- Choose a score type --</option>
                       {scoreTypes.map((type) => (
                        <option key={type.ScoreID} value={type.ScoreID}>{type.ScoreType} </option>
                       ))}
                
                    </Select>
                </div>


            <div>   <Button text="Set Score Type" className='self-end mt-2' onClick={handleSetScoreType} />    </div>  

</div>
            
        </div>

        {/* Notice */}

        <div className='flex text-amber-700 font-medium gap-2 items-center border rounded-lg border-amber-400 p-4  my-3 bg-amber-400/70 backdrop-blur-3xl'> <span className='flex items-center text-lg'>*</span> <span> Notice all courses are generally regarded as 30/70 therefore only select courses are listed below</span> </div>

        {/* Table for displaying score assignments */}

        <div className='flex flex-col gap-4 bg-white  rounded-lg shadow mt-6 '>
            <div className='border-b  border-gray-300 px-4 py-2 '>
                <h2 className='text-lg font-semibold  '> Current Score Assignments </h2>
                <p className='text-sm text-gray-500 '> View the current score type assignments for your courses. This table will show which courses have which score types assigned. </p>
            </div>
            
         {/* search filter */}
           <div className='flex flex-col px-4 py-2 bg-slate-100 border-y border-gray-300 '>
           <div className='flex gap-2 items-center'> <Search size={18} className='text-gray-500  ' />  
              <TextInput 
             className='w-80 my-2'
             placeholder='search by course code'
             Search 
             onChange={(e) => setSearchTerm(e.target.value)}
             /></div> 
             
         
           </div>

           {/* Table  */}

              <div className='overflow-x-auto w-full'>

                <table className='table-auto w-full text-left border-collapse'>
                    <thead>
                        <tr className='p-4'>
                            <th className='p-4'>Course Code</th>
                            <th className='p-4'>Course Name</th>
                            <th className='p-4'>Score Type</th>
                        </tr>
                    </thead>

                    <tbody>
                   {itemstoDisplay.map((assignment) => (
                    <tr key={`${assignment.CourseID}-${assignment.ScoreID}`} className='border-t text-sm border-slate-200 hover:bg-gray-50 transition-colors'>
                        <td className='p-4'>{assignment.course_code}</td>
                        <td className='p-4'>{assignment.course_title}</td>
                        <td className='p-4'>{assignment.ScoreType}</td>
                    </tr>
                   ))}
                    </tbody>
                </table>

                <div className='flex gap-2 items-center justify-between m'>
                 <div className='text-sm p-4 font-medium flex items-center gap-2'>  <span>  {currentPage} </span>  of <span>   {pagenation(totalItems, itemsPerPage).length} </span> </div>  

                 <div className='flex items-center p-4 gap-4'>  
                    <button onClick={()=>setCurrentPage(prev => Math.max(prev - 1, 1))} className={`border px-2 rounded-sm ${currentPage === 1 ? ' bg-slate-200 border-gray-200 text-gray-900 cursor-not-allowed' : 'hover:bg-gray-200'}`}> Prev </button>
                  
                   <div className='flex items-center gap-1'> 
                     {pagenation(totalItems, itemsPerPage).map((page) => (
                        <button 
                        key={page}
                        className={` ${page === currentPage ? 'px-2 bg-blue-500 text-white rounded-full' : 'px-2  border border-slate-500 rounded-full'} `}
                        onClick={() => setCurrentPage(page)}
                        >
                        {page}
                        </button>
                    ))}</div>
                
                <button onClick={()=>setCurrentPage(prev => Math.min(prev + 1, pagenation(totalItems, itemsPerPage).length))}  className={`border px-2 rounded-sm ${currentPage === pagenation(totalItems, itemsPerPage).length ? ' bg-slate-200 border-gray-200 text-gray-900 cursor-not-allowed' : 'hover:bg-gray-200'}`}> Next </button>
                
                 </div>
                </div>
              </div>

            
            </div>
    </div>
  )
}

export default SetScore