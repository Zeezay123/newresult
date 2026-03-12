import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './Routes/auth.route.js';
import coursesRoutes from './Routes/hod/courses.route.js';
import lecturersRoutes from './Routes/hod/lecturers.route.js';
import departmentRoutes from './Routes/department.route.js';
import studentsRoutes from './Routes/hod/students.route.js';
import HodResultRoutes from './Routes/hod/results.route.js';
import levelandlecturersRoutes from './Routes/hod/advisor.route.js';

import sessionSemesterRoutes from './Routes/sessem.route.js';
import levelRoutes from './Routes/level.route.js';
import programmeRoutes from './Routes/Advisor/programmes.route.js';
// lecturersRoutes
import lecturersCourseRoutes from './Routes/lecturer/courses.route.js';
import lecturersResultsRoutes from './Routes/lecturer/results.route.js';
import lecturesStudentsRoutes from './Routes/lecturer/students.route.js'
import lectureRoleRoutes from './Routes/lecturer/role.route.js';

// advisor routes
import advisorResultRoutes from './Routes/Advisor/result.route.js';

// senate routes
import senateResultRoutes from './Routes/senate/results.route.js';

//student routes
import studentResultRoutes from './Routes/student/result.route.js';

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

    app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods:['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:['Content-Type', 'Authorization']
    }))

app.options('/{*any}', cors({
    origin: corsOrigins,
    credentials: true,
    methods:['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:['Content-Type', 'Authorization']
}))


app.use(bodyParser.json());
app.use(cookieParser()); // Add cookie parser middleware

app.use('/api/auth', authRoutes);
app.use('/api/hod/courses', coursesRoutes)
app.use('/api/hod/lecturers', lecturersRoutes)
app.use('/api/hod/students', studentsRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/hod/results', HodResultRoutes);
app.use(`/api/sessions`, sessionSemesterRoutes)
app.use('/api/levels', levelRoutes);
app.use('/api/hod/advisors', levelandlecturersRoutes)
// lecturersRoutes

app.use('/api/lecturers', lecturersCourseRoutes)
app.use('/api/lecturers/results', lecturersResultsRoutes)
app.use('/api/lecturers/students', lecturesStudentsRoutes)
app.use('/api/lecturers/roles', lectureRoleRoutes)

// advisor routes
app.use('/api/advisor', advisorResultRoutes);
app.use('/api/programmes/', programmeRoutes);

// senate routes
app.use('/api/senate/results', senateResultRoutes);

// studentsRoutes
app.use('/api/students/results', studentResultRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    console.error('Error:', message);
    
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})


