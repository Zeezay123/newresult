import { Modal, ModalBody, ModalHeader } from 'flowbite-react'
import React from 'react'

const ReusableModal = ({onClose,open,title,children}) => {
  return (
    <Modal show={open} onClose={onClose} popup>
        <ModalHeader/>
        <ModalBody>
          {children}
        </ModalBody>
    </Modal>
  )
}

export default ReusableModal