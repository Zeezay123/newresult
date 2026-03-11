import { Dot, Info } from 'lucide-react'
import React from 'react'

const Uploadinstructions = ({ type }) => {
  if (type !== 'Test') {
      return (
    <div className='w-full p-4 border border-amber-300/50 rounded-sm bg-amber-50 my-2'>
     <div className='flex mb-2 items-center gap-2'> <Info size={18} className='text-amber-600 '/>  <h2 className='text-lg text-amber-800 font-semibold'>Upload Instructions</h2></div> 
    
    <ul className='px-6 list-disc'>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Download the template - it includes student data. <strong> (Make sure to select the Session, Semester, and Course) </strong></li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Only fill in the Exam SCORE column (do not modify Test SCORE).</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/>The system will automatically calculate TOTAL = CA SCORE + EXAM SCORE (don't worry about the Grade)</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Ensure all student matric numbers are accurate (Do not Edit)</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Exam scores should be out of the maximum Exam score (typically 70 marks)</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Double-check all entries for accuracy before uploading. (Don't worry you can edit directly after Upload)</li>
    </ul>
    
    </div>
  )
  }
    return (
    <div className='w-full p-4 border border-amber-300/50 rounded-sm bg-amber-50 my-2'>
     <div className='flex mb-2 items-center gap-2'> <Info size={18} className='text-amber-600 '/>  <h2 className='text-lg text-amber-800 font-semibold'>Upload Instructions</h2></div> 
    
    <ul className='px-6 list-disc'>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Download the template - it includes student data. <strong> (Make sure to select the Session, Semester, and Course) </strong></li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Only fill in the Test SCORE column (do not modify Exam SCORE).</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/>The system will automatically calculate TOTAL = CA SCORE + EXAM SCORE (don't worry about the Exam Score yet)</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Ensure all student matric numbers are accurate (Do not Edit)</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Test scores should be out of the maximum Test score (typically 30 marks)</li>
        <li className='text-sm font-normal text-amber-800 flex items-center gap-1 mb-1'><Dot/> Double-check all entries for accuracy before uploading. (Don't worry you can edit directly after Upload)</li>
    </ul>
    
    </div>
  )
}

export default Uploadinstructions