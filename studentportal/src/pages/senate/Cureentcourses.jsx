import { ChevronDown } from 'lucide-react'
import React from 'react'

const Cureentcourses = ({ selectedDepartment, selectedProgramme, selectedLevel }) => {

    const [curentCourses, setCurrentCourses] = React.useState([])

    const [loading, setLoading] = React.useState(false)
    const [students, setStudents] = React.useState([])
    const [courses, setCourses] = React.useState([])
    const [error, setError] = React.useState(null)
    const [success, setSuccess] = React.useState(null)
    const [itemsCount, setItemsCount] = React.useState(0)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [itemsPerPage, setItemsPerPage] = React.useState(5)
    const [isCollapsed, setIsCollapsed] = React.useState(true)

React.useEffect(() => {
 if(selectedDepartment && selectedLevel && selectedProgramme){
     fetchCurrentCourses()
 }  

 console.log('datas :', selectedDepartment, selectedLevel, selectedProgramme )

 },[selectedDepartment, selectedLevel, selectedProgramme])

 const fetchCurrentCourses = async () => {
    try{
       const response = await fetch('/api/senate/results/currentcourses', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentID: parseInt(selectedDepartment),
          programmeID: parseInt(selectedProgramme),
          levelID: parseInt(selectedLevel)
        })
       })   
    
       if(!response.ok){
        alert('error fetching result', response.statusTalk)
       }

       const data = await response.json()
       setStudents(data.students)
       console.log('students :', data.students)

       const uniqueCourses = new Map()
       data.students.forEach(student => {
        student.courses.forEach((course)=>{
            if(!uniqueCourses.has(course.CourseID)){
                uniqueCourses.set(course.CourseID, {courseID: course.CourseID, courseCode: course.CourseCode, courseName: course.CourseName, creditUnits: course.CreditUnits, TotalScore: course.TotalScore, Grade: course.Grade, GradePoint: course.GradePoint})
            }
        })
       })
      setCourses(Array.from(uniqueCourses.values()))
  


    } catch(error){
        console.log('Error fetching current courses:', error)
    }
  }




  const pagenate=(items,currentPage )=>{
     
    const startIndex = (currentPage - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)

  }


const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage)
const pageControls =({currentPage, setCurrentPage, items})=>{
    const totalPages = getTotalPages(items)
    if (totalPages < 1) return null

    return (
      <div className='flex items-center justify-between w-full mt-4'>
         
        <div className='flex gap-2 text-sm font-medium text-slate-600'>Showing <div> {(currentPage - 1) * itemsPerPage + 1} </div> to {Math.min(currentPage * itemsPerPage, items.length)} of {items.length} </div>


        <div className='flex gap-3 text-sm'>

          <button onClick={()=> setCurrentPage(currentPage - 1)} disabled={currentPage <= 1}  className={`border px-2 rounded border-slate-700 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`} > Previous </button>
           <span className='px-3 py-1 text-sm'>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className={`border px-2 rounded border-slate-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`}> Next </button>

        </div>
        
        

      </div>
    )
}


console.log('students :', students)
console.log('courses :', courses)

  return (
    <div className='bg-white  rounded-md shadow flex flex-col gap-4 py-2'>
  <div className='flex items-center gap-2 px-4 py-2'>
   <div>  <h1 className='font-semibold text-black '>
      Current Semester Courses
    </h1>
    <p className='text-slate-600 text-sm'>All Approved Exam results for the selected level,programme, faculty and department</p></div>

     

   <ChevronDown onClick={() => setIsCollapsed(!isCollapsed)} className={`ml-auto cursor-pointer transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} size={20} />
  </div>
{/* table part */}

{ !selectedDepartment && !selectedProgramme && !selectedLevel ? <div className='p-4 text-sm text-slate-600 text-center'>Please select a department, programme and level to view results</div>  
:  (isCollapsed ? null : 

 <div>  <table className='w-full'>
  <thead className='bg-slate-50 w-full' >  
  <tr className='text-left px-4 py-2 text-sm text-slate-600' >
    <th className='text-left px-4 py-2'>Matric No</th>
    <th className='text-left px-4 py-2'>Name</th>
    <th className='text-left px-4 py-2'>Gender</th>
    {courses.map((course, index) => (
        <th key={index} className='text-center px-4 py-2'>  <div className='flex flex-col items-center justify-between'> <span>{course.courseCode}  </span><span>({course.creditUnits}cu) </span> </div></th>
    ))}

  </tr>

  </thead> 

  <tbody>
    {pagenate(students, currentPage).map((student, index) => (
        <tr key={index} className='text-xs border-b text-black border-slate-200 hover:bg-slate-50 transition-colors'>
            <td className=' text-left p-4 border border-slate-200'>{student.MatricNo}</td>
            <td className='text-left p-4 border border-slate-200'><span>{student.LastName}  </span> <span>{student.OtherNames}</span></td>
            <td className='text-left p-4 border border-slate-200'>{student.Gender}</td>
            {courses.map((course, courseIndex) => {
                const studentCourse = student.courses.find(c => c.CourseID === course.courseID)
                return (
                    <td key={courseIndex} className='text-center border border-slate-200'>

                        {studentCourse ? 
                        (
                        <div>   
                           <span> {studentCourse.TotalScore} </span>
                           <span> {studentCourse.Grade} </span>
                           
                            </div>) : '-'}
                    </td>
                )
            })}
        </tr>
    ))}




  </tbody>

</table> </div> )

  } 
  { selectedDepartment && selectedLevel && selectedProgramme && !isCollapsed ? <div className='w-full py-2 px-4'> {pageControls({currentPage, setCurrentPage, items:students})} </div> : null }
    </div>
  ) 
}

export default Cureentcourses