import React from "react"
import { BookOpenText,Users,School,ChartSpline,ClipboardClock,TriangleAlert,ListCheck} from "lucide-react"
import avatar from '../../assets/avatar.jpg'






//dashboard summary data
export const sumaryData = [
    {
        name: 'Number of Courses',
        icon: BookOpenText,
        number: 20,
        Comment:'Active Courses'
    },
 {
        name: 'Students',
        icon: Users,
        number: 350,
        Comment:'Active Students'
    },

     {
        name: 'Lecturer',
        icon: School,
        number: 50,
        Comment:'Active Lecturers'
    },


    
     {
        name: 'Results',
        icon: ChartSpline,
        number: '80%',
        Comment:'Active Courses'
    },

]


//dashboard assignment data

export const assignCourseData = [
   
   {
        name: 'Total Courses',
        number: 20,
        icon:BookOpenText,
        action:{
            name:'All Courses',
            icon:Users,
        }
   },
   
    {
        name: 'Pending Approval',
        number: 12,
        icon:ClipboardClock,
        action:{
            name:'Action requires',
            icon:TriangleAlert,
        }
    },

    {
        name: 'Approved Courses',
        number: 8,
        icon:ListCheck,
        action:{
            name:'Courses Approved',
            icon:Users,
        }
    },
    {
        name: 'Published Courses',
        number: 5,
        icon:BookOpenText,  
        action:{
            name:'Courses Published',
            icon:Users,
        }
    }
]














export const assignData = {
     
    
        title:"Lecturers  Assignment",
        items: [
            {
        name: 'Olivia Martin',
        email:'olivia.Martin@gmail.com',
        session: 2025,
        image:avatar
    }, 
       {
        name: 'Olivia Martin',
        email:'olivia.Martin@gmail.com',
        session: 2025,
        image:avatar
    },
       {
        name: 'Olivia Martin',
        email:'olivia.Martin@gmail.com',
        session: 2025,
        image:avatar
    },
     {
        name: 'Olivia Martin',
        email:'olivia.Martin@gmail.com',
        session: 2025,
        image:avatar
    },
     {
        name: 'Olivia Martin',
        email:'olivia.Martin@gmail.com',
        session: 2025,
        image:avatar
    },
     {
        name: 'Olivia Martin',
        email:'olivia.Martin@gmail.com',
        session: 2025,
        image:avatar
    },
        ]
}

export const resultData =  {
     
    
        title:"Result Approval",
        items: [
            {
        name: 'CSC 101 - Fall 2023',
        email:'Submitted by Dr. Johnson (45 students)',
        status: 'Pending'
    }, 
       {
         name: 'CSC 101 - Fall 2023',
        email:'Submitted by Dr. Johnson (45 students)',
        status: 'Pending'
    },
       {
         name: 'CSC 101 - Fall 2023',
        email:'Submitted by Dr. Johnson (45 students)',
        status: 'Pending'
    },
     {
         name: 'CSC 101 - Fall 2023',
        email:'Submitted by Dr. Johnson (45 students)',
        status: 'Pending'
    },
     {
         name: 'CSC 101 - Fall 2023',
        email:'Submitted by Dr. Johnson (45 students)',
        status: 'Pending'
    },
     {
         name: 'CSC 101 - Fall 2023',
        email:'Submitted by Dr. Johnson (45 students)',
        status: 'Pending'
    },
        ]
}


export const subData = [
   {
    id:0,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:1,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:2,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:3,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:4,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:5,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:6,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:17,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:7,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:8,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:9,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:10,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:11,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:12,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:13,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:14,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:15,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   },
   {
    id:16,
    depart: 'Computer Science',
    code: 'CSC101', 
    level:'100L',
    semester: 1,
    Lecturer: 'Dr. Nathan',
    Date: Date.now(),
    file:''
   }    

]

// export const getCardData =(section)=>{

//  switch(section){
//     case 'overview':
//         return sumaryData;   
//     case 'assignCourse':
//         return assignCourseData;
//     default:
//         return sumaryData;
// }
// }


