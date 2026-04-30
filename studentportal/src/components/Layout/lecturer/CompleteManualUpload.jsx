import React from 'react'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Button from '../../ui/Button'
import { Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from 'flowbite-react'
import { Trash2 } from 'lucide-react'

const CompleteManualUpload = ({onClose, selectedCourse, resultType, courses}) => {
  const [uploadSummary, setUploadSummary] = useState('')

    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadError, setUploadError ] = useState([])
    const [succModal, setSuccModal]= useState(false)
    const [caScoreType, setCaScoreType] = useState('')
    const [exScoreType, setExScoreType] = useState('')
    const [studentsData, setStudentsData] = useState([])
    let maxScore;

  
    useEffect(()=>{
        fetchecoursetype()
        fetchStudents()
    }, [selectedCourse])
   
    const [tableRow, setTableRow] = useState([{
     id: 1,    
     Matric:'',
     Name:'',
     Score: ''
    }])


    const fetchStudents = async()=>{
        try {

            const response = await fetch(`/api/lecturers/results/uploadtemplate?courseId=${selectedCourse}`, {credentials:'include'})
            if(!response.ok){
                alert('error fetching students for the course')
            }

            const data = await response.json()
            console.log('Fetched Students for Manual Upload:', data);
            const studentsData = data.data || [];
            
           setStudentsData(studentsData);
              setTableRow(studentsData.map((student, index) => ({
                id: student.StudentID,
                Matric: student.mat_no,
                Name: `${student.LastName} ${student.OtherNames}`,
                Score: ''
              })));
        } catch (error) {
            console.error('cant fetch stus')
        }
    }
   
    const fetchecoursetype = async()=>{
        try {
        const response = await fetch(`/api/lecturers/scoretypes/assignedscoretypes?course_id=${selectedCourse}`, {credentials:'include'})
        if(!response.ok){
            alert('error fetching course score type')
        } 
        const data = await response.json()
        console.log('Assigned Score Types:', data);
        setCaScoreType(data.ca || '')
        setExScoreType(data.ex || '')
        
        
    } catch(error){
        console.error('Error fetching assigned score types:', error);
    }
    }

     maxScore = String(resultType).toLowerCase() === 'exam' ? exScoreType : caScoreType;
        

  const handleUpload =async()=>{
     const response =await fetch(`/api/lecturers/results/mResultupload`, 
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },

            credentials:'include',
            body:JSON.stringify({
                tableRow:tableRow,
            CourseID: selectedCourse,
        ResultType:resultType})

        })
        if(!response.ok){
         alert('error uploading ')
        }
        
        const data  =await response.json()
        console.log(data)
        setUploadSummary(data.summary || [])
        setUploadMessage(data.message)

        setUploadError(data.errors || [])
        setSuccModal(true)
       
        
      
  }
  console.log('succ modal',succModal)



      let courseSelect = courses.filter(course => course.course_id == selectedCourse);

   
  
     const handleOnClose=()=>{
      
        setUploadSummary('')
        setUploadMessage('')
        setUploadError([])
        onClose()

     }


    const handleScoreChange = (rowId, rawValue) => {
        if (rawValue === '') {
            setTableRow(prev => prev.map(item => item.id == rowId ? { ...item, Score: '' } : item));
            return;
        }

        const exceedsMax = rawValue > maxScore;
        const nextScore = rawValue > maxScore ? 0 : Math.max(0, rawValue);

        if (exceedsMax) {
            alert(`Score cannot exceed ${maxScore}`);
        }

        setTableRow(prev => prev.map(item => item.id == rowId ? { ...item, Score: nextScore } : item));
    }



const getResultDesgin = (resultType) =>{
    const typeConfig = {
        Test: 'bg-blue-100 text-blue-700 text-sm px-2 mx-2 font-bold py-1 ',
        Exam: 'bg-purple-100 text-purple-700 text-sm font-bold px-2 mx-2 p-1'
    }

    const result = resultType === 'Test' ? typeConfig.Test : typeConfig.Exam

    return <span className={`flex items-center justify-center ${result} rounded`}> {resultType} </span>

}

console.log('table row', tableRow  )

  return (
    <div>
    
    <Modal  show={true}  popup={true} size='4xl' dismissible onClose={handleOnClose}>
    <ModalHeader>
    <div className='text-lg  px-4 flex flex-wrap  gap-2 items-center '> <span className='flex items-center '>  Upload  {getResultDesgin(resultType)} for : </span><span className= 'text-wrap flex flex-wrap w-fit'> {courseSelect[0]?.course_code} {courseSelect[0]?.course_title} </span> </div> 
   
   
   
    </ModalHeader> 


    <ModalBody className='border-t border-slate-200 py-3'>

         <div className=''>  
   { uploadMessage && <div className='rounded-sm p-4  bg-amber-100 text-amber-700 text-sm '> {uploadMessage} </div>}
 { uploadSummary  && <div className='flex gap-4 text-sm bg-blue-100 p-4 my-2'> <span className='text-green-800'>  Successful Uploads: {uploadSummary.successful || 0}</span> <span className='text-red-600'> Failed uploads: {uploadSummary.failed || 0}  </span></div>}
  { uploadError.length > 0 && <div className='p-4 bg-red-200 my-2'>    
             
             {uploadError.map((error)=>(
                <div className='flex flex-wrap gap-4 text-red-700 text-sm'>  
                    <span className=''> {error.Matric}</span>  <span> {error.error}</span>
                </div>
             ))}
            
             </div>}

 </div>  
        <table className='w-full'>
            <thead>
                <tr className='text-left text-sm p-2 s'>
                    <th className='p-2'>Matric Number</th>
                    <th className='p-2'>Name</th>
                    <th className='p-2'>Score</th>
                </tr>
            </thead>

            <tbody> 
                {tableRow.map((row, index) => (
                    <tr key={row.id} >
                        <td className='p-2 '> <TextInput  type='text' value={row.Matric} readOnly onChange={(e)=>setTableRow(prev=> prev.map(item => row.id == item.id ? {...item, Matric: e.target.value} : item) )}   /> </td>
                        <td className='p-2 '> <TextInput  type='text' value={row.Name} readOnly /> </td>
                        <td className='p-2'> <TextInput type='number' max={maxScore} value={row.Score} onChange={(e)=>handleScoreChange(row.id, e.target.value)} />  </td>
                        {/* <td><span className='text-red-700' onClick={()=>handleRemoveRow(row.id)}> <Trash2 size={18}/></span></td> */}
                    </tr>

                ))}
            </tbody>

        </table>
{/* <div className='p-2'> <Button className='w-full '  text='Add New Row' onClick={handleAddRow}/>  </div> */}

       <div className='flex items-center gap-4 w-full p-2'>
        <Button text='Upload' className='w-full bg-red-700' onClick={handleUpload}/>  
        <Button text='Cancel' className='w-full bg-gray-800'/>
       
         </div>   
    </ModalBody>

 
  </Modal>



    </div>
  )
}

export default CompleteManualUpload