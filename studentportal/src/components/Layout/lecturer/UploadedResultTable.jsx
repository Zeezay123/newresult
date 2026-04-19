import { Label, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from 'flowbite-react'
import React,{useState, useEffect} from 'react'
import Button from '../../ui/Button'
import { Check, Upload, X } from 'lucide-react'
import { useSelector } from 'react-redux'




const UploadedResultTable = (children) => {
 const lectid = useSelector((state) => state.user.id);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [editScores, setEditScores] = useState({CA_Score: '', Exam_Score: ''});

    useEffect(()=>{
     
        const handler = setTimeout(()=>{
            setDebouncedSearchTerm(searchTerm);
        }, 1000);
    
        return ()=>{ clearTimeout(handler)}

    }, [searchTerm, children])



useEffect(()=>{
    if(children.uploadSuccess){
        fetchResults();
    }
}, [children.uploadSuccess, debouncedSearchTerm]);

const fetchResults = async()=>{
   
    const params = new URLSearchParams();

    params.append('courseID', children.selectedCourse);
    params.append('search', debouncedSearchTerm);

    try {
         
 const response = await fetch(`/api/lecturers/results/getUploadedResults/${lectid}?${params.toString()}`,
     { credentials: 'include' })

    if(!response.ok){
      alert("Failed to fetch uploaded results")
      return
    }

    const data = await response.json();

    setResults(data.data);

    console.log("Uploaded Results Data:", data);
   console.log("Uploaded Results:", results);

    } catch (error) {
        console.log("Error fetching uploaded results:", error);
    }
}


const remarksColor = (remark)=>{
    const remarkLower = remark.toLowerCase();
    const colorMap = {
        'pass':{color:'border border-green-800 bg-green-200 text-green-800', icon: Check},
        'fail':{color:'border border-red-800 bg-red-200 text-red-800', icon: X},
    }

    const config = colorMap[remarkLower] || {color:'border border-gray-800 bg-gray-200 text-gray-800', icon: null};
    const Icon = config.icon;
   return <span className={`${config.color} flex items-center  justify-center gap-1 px-2 py-1 rounded-full   font-semibold`} > 
     <Icon size={12} />
     {remark}
    </span>
}

const handleSaveChanges = async()=>{
    //update on save

  const {CA_Score, Exam_Score } = editScores;
 
  if (!selectedResult) return alert('No result selected');
   
  try {
    const response = await fetch(`/api/lecturers/results/updateResult`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ MatricNo: selectedResult.MatricNo, CA_Score, Exam_Score, SessionID: children.selectedSession, SemesterID: children.selectedSemester, CourseID: children.selectedCourse  }),
    })

    if (!response.ok) {
      alert('Failed to update result');
        return;
    }

   setIsModalOpen(false);
    const data = await response.json();
    console.log('Update result response:', data);

    // Refresh results after update
   fetchResults();
   

      }
   catch (error) {
    console.log("Error updating result:", error);
  }

    console.log("Saving changes for:", selectedResult, "with scores:", editScores);
}

  return (
    <div className='flex flex-col mt-5 border shadow-sm rounded-lg p-4 border-slate-200'>
        
        <h1 className='font-semibold text-lg'>Uploaded Result</h1>
        
        {/* search and upload button */}
        <div className='flex justify-between items-center mt-4'> 
        <TextInput
        className='w-80'
        placeholder='Search by name or matric number'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        />


    {/* submit to HOD */}

        <Button icon={Upload} text="Submit to HOD" className='cursor-pointer' />   


       </div>

       <table className='mt-4'>
        <thead className='bg-slate-50 border-b w-full border-slate-200 mt-4'>
            <tr className='bg-blue-100 text-left text-gray-900 font-light text-sm '>
                <th className='text-left p-4'> S/N </th>
                <th className='text-left p-4'> MatricNumber </th>
                <th className='text-left p-4'> Name </th>
                <th className='text-left p-4'>Level</th>
                <th className='text-left p-4'>CA Score</th>
                <th className='text-left p-4'>Exam Score</th>
                <th className='text-left p-4'>Total Score</th>
                <th className='text-left p-4'>Grade</th>
                <th className='text-left p-4'>Remark</th>
                <th className='text-left p-4'>Update</th>
            </tr>
        </thead>

        <tbody>
            {results.length === 0 ? (
                <tr><td colSpan='10' className='text-lg text-gray-500 p-2 font-semibold text-center'>No results found</td></tr>
            ):(results.map((result, index)=>(
                <tr key={index} className=' border-b border-slate-200 py-4 hover:bg-gray-50 transition-colors'>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{index + 1}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{result.MatricNo || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{result.Name || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{result.levelName || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{result.CA_Score || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{result.Exam_Score || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{result.TotalScore || 'N/A'}</td>
                    <td className='p-4 text-sm text-black font-bold '>{result.Grade || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '>{ remarksColor(result.Remarks) || 'N/A'}</td>
                    <td className='p-4 text-sm text-gray-800 font-medium '> <Button text="Edit" className='cursor-pointer' onClick={() => {
                        setSelectedResult(result);
                        setIsModalOpen(true);
                        setEditScores({ CA_Score: result.CA_Score, Exam_Score: result.Exam_Score})
                    }} /> </td>
                </tr>
            )))}
        </tbody>
       </table>


       {/* Edit individual result */}

       <Modal show={isModalOpen} dismissible popup={true} onClose={() => setIsModalOpen(false)} >
        <ModalHeader> Adjust the Scores for {selectedResult ? selectedResult.Name : ''} </ModalHeader>
        <ModalBody> 
        <div className='flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-3'>    <div>
                <Label htmlFor='matric'> Matric Number </Label>
                <TextInput id='matric' value={selectedResult ? selectedResult.MatricNo : ''} disabled={true} className='mt-2' />
            </div>
            <div>
                <Label htmlFor='name'> Name </Label>
                <TextInput id='name' value={selectedResult ? selectedResult.Name : ''} disabled={true} className='mt-2' />
            </div>
            </div> 
        <div className='grid grid-cols-2 gap-3'>    <div>
                <Label htmlFor='caScore'> CA Score </Label>
                <TextInput id='caScore' value={editScores.CA_Score} 
                 className='mt-2'
                 type='number'
                 onChange={(e)=>setEditScores((prev) => ({ ...prev, CA_Score: e.target.value }))} />
            </div>
            <div>
                <Label htmlFor='examScore'> Exam Score </Label>
                <TextInput id='examScore' value={editScores.Exam_Score} 
                 className='mt-2'
                 type='number'
                 onChange={(e)=>setEditScores((prev) => ({ ...prev, Exam_Score: e.target.value }))} />
            </div>
            </div> 
        </div>

        </ModalBody>

        <ModalFooter>
        <Button text="Save Changes" className='cursor-pointer' onClick={() => handleSaveChanges()} /> 
        <Button text="Cancel" className='cursor-pointer' onClick={()=>setIsModalOpen(false)} />
        </ModalFooter>
        
       </Modal>
        
        </div>
  )
}

export default UploadedResultTable