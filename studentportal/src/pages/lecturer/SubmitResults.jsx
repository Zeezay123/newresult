import { Select, Label, FileInput } from 'flowbite-react'
import { ArrowDownToLine, CloudDownload, Loader2, SlidersHorizontal, Upload } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import UploadedResultTable from '../../components/Layout/lecturer/UploadedResultTable'
import { useSelector } from 'react-redux'
import Button from '../../components/ui/Button'
import ManualUpload from '../../components/Layout/lecturer/ManualUpload'

const SubmitResults = () => {
  const [sessions, setSessions] = useState([])
  const [semesters, setSemesters] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = React.useRef(null)
  const lecturerId = useSelector((state) => state.user.id);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const [showManualUpload, setShowManualUpload] = useState(false);


  useEffect(() => {
    fetchSessions();
    fetchSemesters();
    fetchCourses();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/active-session', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.session ? [data.session] : []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/sessions/getsemesters', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSemesters(data.semesters || []);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/lecturers/getcourses`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedSession || !selectedSemester || !selectedCourse) {
      alert('Please select Session, Semester, and Course');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/lecturers/results/download-template?courseId=${selectedCourse}&sessionId=${selectedSession}&semesterId=${selectedSemester}`,
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

    try{
    //    if (!selectedSession || !selectedSemester || !selectedCourse) {
    //   alert('Please select Session, Semester, and Course');
    //   return;
    // }


       const response = await fetch(`/api/lecturers/results/upload?courseId=${selectedCourse}&sessionId=${selectedSession}&semesterId=${selectedSemester}`, {
        method: 'POST',
        credentials: 'include',
        body: selectedFile
       });
  const data = await response.json();
       if(!response.ok){
        alert('File upload failed: ' + (data.message || 'Unknown error'));
        
       } 
        
      console.log("File upload response:", data);

      setUploadSuccess(data.success);

    }catch(error){
        console.error("File upload error:", error);
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
     

       <div> <h1 className='text-2xl font-semibold'> Upload Scores</h1>
          <p className='text-xs'>Submit students results here</p>
       </div>

       {/* top card divs */}

       <div className='mt-4 flex gap-4 justify-between'> 

       <div className='flex flex-col bg-white border-2 border-blue-950/20 backdrop-blur-lg   rounded-lg p-4 gap-10 flex-1'>
      
       <div className='flex items-center gap-2'> <span className='text-blue-700'><SlidersHorizontal size={20}/> </span>  <span className='font-semibold text-black '>Session Configuration</span></div>
       
       {/* session semester div */}
       <div className='flex gap-4'>
        <div >
            <Label htmlFor="academic-session"> Academic Session</Label>
            <Select 
              id="academic-session" 
              className='w-40 mt-2'
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            > 
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session.SessionID} value={session.SessionID}>
                    {session.SessionName}
                  </option>
                ))}
            </Select>
        </div>

        <div >
            <Label htmlFor="academic-semester"> Academic Semester</Label>
            <Select 
              id="academic-semester" 
              className='w-40 mt-2'
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            > 
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.SemesterID} value={semester.SemesterID}>
                    {semester.SemesterName}
                  </option>
                ))}
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

       <div className='flex flex-col    gap-3 w-md'>
        <div className='flex w-full justify-between'>
           
            <div className='border border-slate-300/20 px-2 py-3 w-55 rounded-xl bg-blue-950'>
         
   
                <h1 className='text-white font-semibold'>Total Students</h1>
  
                <p className='text-xl text-white font-bold'>120</p>
            </div>

            <div className='border border-slate-300/20 px-2 py-3 w-55 rounded-xl bg-green-950'>
                <h1 className='text-white font-semibold'>Submitted</h1>
                <span className='text-white font-semibold'> <span>  45</span>/<span className='font-semibold'>120</span></span>
            </div>
        </div>


        {/* pending results */}
        <div className='border border-slate-300/20 bg-amber-900 px-2 py-3 w-full rounded-xl flex justify-between'>
           <div>   <h1 className='text-white font-semibold'> Pending Results</h1>
            <p className='text-white font-bold'>75 Students </p></div>  


            <div className='w-8 h-8 bg-amber-500/30  rounded-full mt-2 flex items-center justify-center text-amber-400'>  <Loader2 /> </div>
        </div>
       </div>

</div>

<div className=' w-full border-2 border-dashed h-fit rounded-2xl mt-5 border-blue-700 p-4'>
    <div className='w-full flex items-center justify-end gap-1 cursor-pointer' onClick={handleDownloadTemplate}>
       
             {loading ? (
        <>
          <Loader2 size={18} className='text-blue-700 animate-spin' /> 
          <span className='text-sm text-blue-700 font-semibold'>Generating...</span>
        </>
      ) : (
        <>
          <ArrowDownToLine size={18} className='text-blue-700' /> 
          <span className='text-sm text-blue-700 font-semibold'>Download Template</span>
        </>
      )}
          </div>

<div className='flex flex-col p-4 justify-between items-center gap-2'>
    
    <span className='flex items-center justify-center p-4 bg-blue-300/30 rounded-full text-blue-900'>
        <CloudDownload size={24}/>
    </span> 

   <div className='flex items-center flex-col gap-1'> <h1 className='text-center text-black font-medium'>Drag and Drop your score sheet here <br /> or <br /> </h1>
  <div className='w-full flex items-center justify-center'>    <input type="file" className='w-45 text-sm text-blue-900 cursor-pointer underline' onChange={(e) => handleFileChange(e)}/>  </div>
   <p className='text-xs text-center'> Supports .csv, .xls, .xlsx formats (2MB)</p>

   <Button text="Upload" className='w-40' onClick={handleUpload} />
    </div>
    
</div>

</div>

<UploadedResultTable uploadSuccess={uploadSuccess} selectedSemester={selectedSemester} selectedCourse={selectedCourse} selectedSession={selectedSession} />
   
   


  

    </div>
  )
}

export default SubmitResults