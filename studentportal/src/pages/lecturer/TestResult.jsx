import { Select, Label, FileInput } from 'flowbite-react'
import { ArrowDownToLine, CloudDownload, Loader2, SlidersHorizontal, Upload } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import UploadedResultTable from '../../components/Layout/lecturer/UploadedResultTable'
import { useSelector } from 'react-redux'
import Button from '../../components/ui/Button'
import Uploadinstructions from '../../components/ui/Uploadinstructions'

const TestResult = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [resultType, setResultType] = useState('Test') // Test or Exam
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = React.useRef(null)
  const lecturerId = useSelector((state) => state.user.id);
  const [uploadSuccess, setUploadSuccess] = useState(null);
   
  

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/lecturers/getcourses/${lecturerId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedCourse) {
      alert('Please select a Course');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/lecturers/results/download-template?courseId=${selectedCourse}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Results_Template_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    } finally {
      setLoading(false);
    }
  };
 
const handleUpload = async () =>{
    if (!selectedFile) {
        alert('Please select a file to upload');
        return;
    }

    if (!selectedCourse) {
      alert('Please select a Course');
      return;
    }

    if (!resultType) {
      alert('Please select Result Type (Test or Exam)');
      return;
    }
   
    
  

    try{
       const response = await fetch(`/api/lecturers/results/upload/${lecturerId}?courseId=${selectedCourse}&ResultType=${resultType}`, {
        method: 'POST',
        credentials: 'include',
        body: selectedFile
       });
  const data = await response.json();
       if(!response.ok){
        alert('File upload failed: ' + (data.message || 'Unknown error'));
        
       } else {
         alert(`${resultType} scores uploaded successfully!`);
         setUploadSuccess(data.success);
         setSelectedFile(null);
         if (fileInputRef.current) {
           fileInputRef.current.value = '';
         }
       }
        
      console.log("File upload response:", data);

    }catch(error){
        console.error("File upload error:", error);
        alert('An error occurred during upload');
    }
}

 const handleFileChange = async (e) => {
   
  
    // Implement file upload logic here

    setUploading(true);

    const file = e.target.files[0];
const formData = new FormData();
       formData.append('file', file)
    console.log("Selected file:", formData);

    setSelectedFile(formData);

    setUploading(false);

 } 

  return (
    <div className='flex flex-col p-4'>
     
       {/* Dynamic Header based on Result Type */}
       <div className='flex items-center justify-between'> 
         <div>
           <h1 className='text-2xl font-semibold flex items-center gap-2'>
             <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
               resultType === 'Test' 
                 ? 'bg-blue-100 text-blue-700' 
                 : 'bg-purple-100 text-purple-700'
             }`}>
               {resultType}
             </span>
             Upload {resultType} Scores
           </h1>
           <p className='text-xs mt-1'>Submit students {resultType} Scores here</p>
         </div>
       </div>

       {/* top card divs */}

       <div className='mt-4 flex gap-4 justify-between'> 

       <div className='flex flex-col bg-white border-2 border-blue-950/20 backdrop-blur-lg   rounded-lg p-4 gap-10 flex-1'>
      
       <div className='flex items-center gap-2'> <span className='text-blue-700'><SlidersHorizontal size={20}/> </span>  <span className='font-semibold text-black '>Session Configuration</span></div>
       
       {/* session semester div */}
       <div className='flex gap-4 flex-wrap'>
        {/* Result Type Selector */}
        <div>
            <Label htmlFor="result-type"> Result Type</Label>
            <Select 
              id="result-type" 
              className='w-40 mt-2'
              value={resultType}
              onChange={(e) => setResultType(e.target.value)}
            > 
                <option value="Test">Test</option>
                <option value="Exam">Exam</option>
            </Select>
        </div>

        <div >
            <Label htmlFor="course"> Course</Label>
            <Select 
              id="course" 
              className='w-50 mt-2'
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            > 
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.CourseID} value={course.CourseID}>
                    {course.CourseCode} - {course.CourseName}
                  </option>
                ))}
            </Select>
        </div>
       </div>
       </div>



       {/* second part of card */}

     
 

</div>

{/* instructions */}
<Uploadinstructions type={resultType}/>

{/* upload box */}
<div className={`w-full border-2 border-dashed h-fit rounded-2xl mt-5 p-4 ${
  resultType === 'Test' 
    ? 'border-blue-700 bg-blue-50/30' 
    : 'border-purple-700 bg-purple-50/30'
}`}>
    <div className='w-full flex items-center justify-end gap-1 cursor-pointer' onClick={handleDownloadTemplate}>
       
             {loading ? (
        <>
          <Loader2 size={18} className={`animate-spin ${
            resultType === 'Test' ? 'text-blue-700' : 'text-purple-700'
          }`} /> 
          <span className={`text-sm font-semibold ${
            resultType === 'Test' ? 'text-blue-700' : 'text-purple-700'
          }`}>Generating...</span>
        </>
      ) : (
        <>
          <ArrowDownToLine size={18} className={resultType === 'Test' ? 'text-blue-700' : 'text-purple-700'} /> 
          <span className={`text-sm font-semibold ${
            resultType === 'Test' ? 'text-blue-700' : 'text-purple-700'
          }`}>Download Template</span>
        </>
      )}
          </div>

<div className='flex flex-col p-4 justify-between items-center gap-2'>
    
    <span className={`flex items-center justify-center p-4 rounded-full ${
      resultType === 'Test' 
        ? 'bg-blue-300/30 text-blue-900' 
        : 'bg-purple-300/30 text-purple-900'
    }`}>
        <CloudDownload size={24}/>
    </span> 

   <div className='flex items-center flex-col gap-1'> <h1 className='text-center text-black font-medium'>Drag and Drop your {resultType.toLowerCase()} score sheet here <br /> or <br /> </h1>
  <div className='w-full flex items-center justify-center'>    <input 
    ref={fileInputRef}
    type="file" 
    className={`w-45 text-sm cursor-pointer underline ${
      resultType === 'Test' ? 'text-blue-900' : 'text-purple-900'
    }`}
    onChange={(e) => handleFileChange(e)}
    accept=".csv,.xls,.xlsx"
  />  </div>
   <p className='text-xs text-center'> Supports .csv, .xls, .xlsx formats (2MB)</p>

   <Button 
     text={`Upload ${resultType} Scores`}
     className='w-50' 
     onClick={handleUpload} 
     disabled={!selectedFile || !selectedCourse}
   />
   {selectedFile && (
     <p className='text-xs text-green-600 mt-2'>
       ✓ File selected: {selectedFile.get('file')?.name || 'Ready to upload'}
     </p>
   )}
    </div>
    
</div>

</div>

{/* <UploadedResultTable uploadSuccess={uploadSuccess} selectedCourse={selectedCourse} resultType={resultType} /> */}
    </div>
  )
}

export default TestResult