import React, { useState } from 'react'
import { subData } from '../../data/dashboardCard.js'
import { Button, FileInput, Modal, ModalBody, ModalHeader, Popover, TextInput } from 'flowbite-react'
import { BadgeInfo, Download, Filter } from 'lucide-react'
import ReusableModal from '../../ui/ReusableModal.jsx'
import Navbar from '../Navbar.jsx'


const Submissions = () => {

 const [selectedRow, setSelectedRow] = useState([])
 const [selectAll, setSelectAll] = useState(false) 
 const [openModal, setOpenModal] =useState(false)
const [modalContent, setModalContent] = useState({title:'', body:''})
const tableData = subData

const handleSelectAll=()=>{
  if(selectAll){
    setSelectedRow([])
  }
  else {
    setSelectedRow(subData.map((data)=> data.id ))
  }

  setSelectAll(!selectAll)
}

const handleRowSelect =(id)=>{
   
  if(selectedRow.includes(id)){
    setSelectedRow(selectedRow.filter((data)=> data !== id))
  }

  else setSelectedRow([...selectedRow, id])

}


const handleDownload =()=>{
  const selected = id
}

const handleYes=()=>{
console.log('yes')
}
const handleOpenModal =(type)=>{

  setModalContent({
    title:'',
    body:( <div className="text-center">
            <BadgeInfo className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to {type} this course?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="red" onClick={() => { handleYes(type), setOpenModal(false)}}>
                Yes, I'm sure
              </Button>
              <Button color="alternative" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>)
  })
setOpenModal(true)
}

  return (
    <main className='grid grid-rows-1 p-8 gap-7 overflow max-w-7xl mx-auto rounded-lg '>
 
    <div className='grid grid-rows-1 place-content-start p-4'>
      
       <h1 className='font-[inter] font-bold text-xl md:text-3xl'>Dashboard</h1>
      <h5 className='font-[inter] text-sm text-slate-600'> An Overview of Result Portal </h5>
     </div>
   <div className='flex items-center justify-between md:px-10'> 
    <div></div>

    <div className='flex gap-5 items-center'>

      <div className='flex gap-2 justify-center items-center font-[inter] font-medium text-xs text-slate-600 border-slate-300 border rounded-md py-2 px-3'> <Filter className='w-4 h-4'/> Sort</div>
      {/* <div>Filter</div> */}
      <Button size='xs' className='gap-2' > <Download className='w-4 h-4 '/> Download </Button>

    </div>
   </div>


<div className='text-xs  font-[inter]   flex md:items-center w-full'>
  <table className='flex flex-col justify-center items-center w-fit px-auto mx-auto'>
    <thead>
    <tr className=''>
      <th>
        
       <Popover 
       trigger='hover'
       content={
        <div className='p-4 font-normal'>  <p>select all Courses at once </p> </div>
       }
       >
        
         <TextInput
       type='checkbox'
       checked={selectAll}
       onChange={handleSelectAll}

       /> </Popover>  </th>
      <th  className='w-30'>Department </th>
      <th  className='w-30'> Course Code </th>
      <th  className='w-20'> Level</th>
      <th  className='w-20'> Semester</th>
      <th  className='w-20'> Lecturer</th>
      <th className='w-20'> Date</th>
      <th className='w-20'>Approve</th>
      <th className='w-20'>Reject</th>
      <th className='w-20'>Download</th>
    </tr>
    </thead>
    <tbody>
     {tableData.map((data,index)=>(
      <tr key={index}>
       <td> <TextInput 
       type='checkbox'
       checked={selectedRow.includes(data.id)}
       onChange={()=>handleRowSelect(data.id)} />  </td>
       <td className='w-30'>{data.depart}</td>
       <td  className='w-30'>{data.code}</td>
       <td  className='w-20'>{data.level}</td>
       <td  className='w-20'>{data.semester}</td>
       <td  className='w-20'>{data.Lecturer}</td>
       <td  className='w-20'>sun day</td>

       <td  className='w-20 cursor-pointer'> <Popover trigger='hover' 
       content={ <div className='p-4 font-normal'>  <p >Click on this to approve Course result </p> </div>}> 
        
        <span className='text-green-600 font-bold' onClick={()=>handleOpenModal('approve')}> Approve</span>
        </Popover> 
        </td>
      
       <td  className='w-20 cursor-pointer'>
       <Popover trigger='hover' 
       content={ <div className='p-4 font-normal'>  <p >Click on this to reject Course result </p> </div>}>

        <span className='text-red-700 font-bold' onClick={()=>handleOpenModal('reject')}> Reject</span>
       </Popover>
         </td>
       
       <td className='w-20 cursor-pointer'>
        <Popover trigger='hover' 
       content={ <div className='p-4 font-normal'>  <p >Click on this to download Course Result </p> </div>}> 

        <span className='flex items-center justify-center w-full'> 
          <Download className='w-4 h-4 text-blue-600' /></span>
          
        </Popover>
          </td>
      
      </tr>
     ))}
    </tbody>
  </table>
</div>

{/* <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
  <ModalHeader/>
  <ModalBody>
    <div className="text-center">
            <BadgeInfo className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this product?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="red" onClick={() => setOpenModal(false)}>
                Yes, I'm sure
              </Button>
              <Button color="alternative" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
  </ModalBody>
</Modal> */}

<ReusableModal
open={openModal}
onClose={()=>setOpenModal(false)}
>
{modalContent.body}
</ReusableModal>

    </main>
  )
}

export default Submissions