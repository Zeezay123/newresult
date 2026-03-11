import React, { useEffect, useState } from "react";
import {
  Check,
  Filter,
  Plus,
  X,
  AlertCircle,
  Info,
  Download,
  Dot,
} from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  TextInput,
  Spinner,
  Label,
} from "flowbite-react";
import Button from "../../../ui/Button";
import { useSelector } from "react-redux";
import AssignCourseParams from "./AssignCourseParams";
import AssignedTable from "./AssignedTable";

const AssignToLecture = ({

  onAssignmentSuccess,
}) => {
  const [idToAssign, setIdToAssign] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  const [selectedLecturer, setSelectedLecturer] = React.useState(null);

  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const hodId = useSelector((state) => state.user.department);



  // Fetch lecturers from API
  // useEffect(() => {
  //   fetchLecturers();
  // }, [searchTerm, orderBy]);

  // Fetch unassigned courses
  useEffect(() => {

  }, []);






    


  return (
    <div className="w-full border border-slate-200 bg-white p-4 rounded-lg shadow-lg ">
     
      


     <AssignCourseParams onAssignmentSuccess={onAssignmentSuccess} />

{/* Assigned Table */}




    </div>
  );
};

export default AssignToLecture;
