-- Active: 1770911680026@@172.168.30.60@1433@DPortal
-- ============================================
-- INSERT COURSES FOR FACULTIES AND DEPARTMENTS
-- ============================================
-- Faculty 2 (Departments 3, 4)
-- Faculty 5 (Departments 1, 25)
-- Faculty 9 (Department 51)
-- Faculty 1 (Departments 33, 34, 35)
-- ============================================

-- First, let's check faculty codes to ensure proper matric number generation
-- Assuming faculty codes: FOS (Faculty of Science), FMS (Faculty of Management Sciences), etc.

-- ============================================
-- COURSES FOR FACULTY 2 - DEPARTMENTS 3 & 4
-- ============================================

-- Department 3 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('BIO201', 'Cell Biology', 3, 3, 1, 2, 'department', 'Core', 2),
('BIO202', 'Genetics', 3, 3, 1, 2, 'department', 'Core', 2),
('BIO203', 'Ecology', 2, 3, 1, 2, 'department', 'Core', 2),
('BIO301', 'Molecular Biology', 3, 3, 1, 3, 'department', 'Core', 2),
('BIO302', 'Microbiology', 3, 3, 1, 3, 'department', 'Core', 2),
('BIO401', 'Biotechnology', 3, 3, 1, 4, 'department', 'Core', 2),
('BIO402', 'Research Project', 6, 3, 1, 4, 'department', 'Core', 2);

-- Department 4 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('CHM201', 'Organic Chemistry I', 3, 4, 1, 2, 'department', 'Core', 2),
('CHM202', 'Inorganic Chemistry I', 3, 4, 1, 2, 'department', 'Core', 2),
('CHM203', 'Physical Chemistry I', 2, 4, 1, 2, 'department', 'Core', 2),
('CHM301', 'Organic Chemistry II', 3, 4, 1, 3, 'department', 'Core', 2),
('CHM302', 'Analytical Chemistry', 3, 4, 1, 3, 'department', 'Core', 2),
('CHM401', 'Industrial Chemistry', 3, 4, 1, 4, 'department', 'Core', 2),
('CHM402', 'Research Project', 6, 4, 1, 4, 'department', 'Core', 2);

-- ============================================
-- COURSES FOR FACULTY 5 - DEPARTMENTS 1 & 25
-- ============================================

-- Department 1 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('CSC201', 'Data Structures', 3, 1, 1, 2, 'department', 'Core', 5),
('CSC202', 'Database Management Systems', 3, 1, 1, 2, 'department', 'Core', 5),
('CSC203', 'Object-Oriented Programming', 2, 1, 1, 2, 'department', 'Core', 5),
('CSC301', 'Software Engineering', 3, 1, 1, 3, 'department', 'Core', 5),
('CSC302', 'Computer Networks', 3, 1, 1, 3, 'department', 'Core', 5),
('CSC401', 'Artificial Intelligence', 3, 1, 1, 4, 'department', 'Core', 5),
('CSC402', 'Final Year Project', 6, 1, 1, 4, 'department', 'Core', 5);

-- Department 25 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('MTH201', 'Calculus II', 3, 25, 1, 2, 'department', 'Core', 5),
('MTH202', 'Linear Algebra', 3, 25, 1, 2, 'department', 'Core', 5),
('MTH203', 'Differential Equations', 2, 25, 1, 2, 'department', 'Core', 5),
('MTH301', 'Real Analysis', 3, 25, 1, 3, 'department', 'Core', 5),
('MTH302', 'Abstract Algebra', 3, 25, 1, 3, 'department', 'Core', 5),
('MTH401', 'Complex Analysis', 3, 25, 1, 4, 'department', 'Core', 5),
('MTH402', 'Research Project', 6, 25, 1, 4, 'department', 'Core', 5);

-- ============================================
-- COURSES FOR FACULTY 9 - DEPARTMENT 51
-- ============================================

INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('ENG201', 'Engineering Mathematics III', 3, 51, 1, 2, 'department', 'Core', 9),
('ENG202', 'Thermodynamics', 3, 51, 1, 2, 'department', 'Core', 9),
('ENG203', 'Mechanics of Materials', 2, 51, 1, 2, 'department', 'Core', 9),
('ENG301', 'Fluid Mechanics', 3, 51, 1, 3, 'department', 'Core', 9),
('ENG302', 'Heat Transfer', 3, 51, 1, 3, 'department', 'Core', 9),
('ENG401', 'Design Project I', 3, 51, 1, 4, 'department', 'Core', 9),
('ENG402', 'Design Project II', 6, 51, 1, 4, 'department', 'Core', 9);

-- ============================================
-- COURSES FOR FACULTY 1 - DEPARTMENTS 33, 34, 35
-- ============================================

-- Department 33 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('ACC201', 'Financial Accounting II', 3, 33, 1, 2, 'department', 'Core', 1),
('ACC202', 'Cost Accounting', 3, 33, 1, 2, 'department', 'Core', 1),
('ACC203', 'Auditing I', 2, 33, 1, 2, 'department', 'Core', 1),
('ACC301', 'Management Accounting', 3, 33, 1, 3, 'department', 'Core', 1),
('ACC302', 'Taxation', 3, 33, 1, 3, 'department', 'Core', 1),
('ACC401', 'Advanced Auditing', 3, 33, 1, 4, 'department', 'Core', 1),
('ACC402', 'Research Project', 6, 33, 1, 4, 'department', 'Core', 1);

-- Department 34 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('BUS201', 'Business Statistics', 3, 34, 1, 2, 'department', 'Core', 1),
('BUS202', 'Marketing Management', 3, 34, 1, 2, 'department', 'Core', 1),
('BUS203', 'Human Resource Management', 2, 34, 1, 2, 'department', 'Core', 1),
('BUS301', 'Strategic Management', 3, 34, 1, 3, 'department', 'Core', 1),
('BUS302', 'Operations Management', 3, 34, 1, 3, 'department', 'Core', 1),
('BUS401', 'Entrepreneurship', 3, 34, 1, 4, 'department', 'Core', 1),
('BUS402', 'Business Project', 6, 34, 1, 4, 'department', 'Core', 1);

-- Department 35 Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('ECO201', 'Microeconomics', 3, 35, 1, 2, 'department', 'Core', 1),
('ECO202', 'Macroeconomics', 3, 35, 1, 2, 'department', 'Core', 1),
('ECO203', 'Development Economics', 2, 35, 1, 2, 'department', 'Core', 1),
('ECO301', 'Econometrics', 3, 35, 1, 3, 'department', 'Core', 1),
('ECO302', 'International Economics', 3, 35, 1, 3, 'department', 'Core', 1),
('ECO401', 'Economic Policy', 3, 35, 1, 4, 'department', 'Core', 1),
('ECO402', 'Research Project', 6, 35, 1, 4, 'department', 'Core', 1);

-- ============================================
-- FACULTY-LEVEL COURSES (Available to all departments in the faculty)
-- ============================================

-- Faculty 2 (Science) - Faculty Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('SCI101', 'Introduction to Science', 2, NULL, 1, 1, 'faculty', 'Core', 2),
('SCI102', 'General Physics', 3, NULL, 1, 1, 'faculty', 'Core', 2),
('SCI103', 'General Chemistry', 3, NULL, 1, 1, 'faculty', 'Core', 2),
('SCI104', 'General Mathematics', 3, NULL, 1, 1, 'faculty', 'Core', 2),
('SCI201', 'Research Methodology', 2, NULL, 1, 2, 'faculty', 'Core', 2),
('SCI301', 'Scientific Computing', 3, NULL, 1, 3, 'faculty', 'Elective', 2);

-- Faculty 5 (Computing/Technology) - Faculty Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('FCT101', 'Introduction to Computing', 2, NULL, 1, 1, 'faculty', 'Core', 5),
('FCT102', 'Discrete Mathematics', 3, NULL, 1, 1, 'faculty', 'Core', 5),
('FCT201', 'Technical Report Writing', 2, NULL, 1, 2, 'faculty', 'Core', 5),
('FCT301', 'Numerical Analysis', 3, NULL, 1, 3, 'faculty', 'Elective', 5),
('FCT302', 'Computational Theory', 3, NULL, 1, 3, 'faculty', 'Elective', 5);

-- Faculty 9 (Engineering) - Faculty Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('FEN101', 'Engineering Drawing', 3, NULL, 1, 1, 'faculty', 'Core', 9),
('FEN102', 'Engineering Mathematics I', 3, NULL, 1, 1, 'faculty', 'Core', 9),
('FEN201', 'Engineering Mathematics II', 3, NULL, 1, 2, 'faculty', 'Core', 9),
('FEN301', 'Engineering Management', 2, NULL, 1, 3, 'faculty', 'Elective', 9),
('FEN302', 'Quality Control', 3, NULL, 1, 3, 'faculty', 'Elective', 9);

-- Faculty 1 (Management Sciences) - Faculty Courses
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('FMS101', 'Introduction to Management', 2, NULL, 1, 1, 'faculty', 'Core', 1),
('FMS102', 'Business Mathematics', 3, NULL, 1, 1, 'faculty', 'Core', 1),
('FMS201', 'Business Communication', 2, NULL, 1, 2, 'faculty', 'Core', 1),
('FMS301', 'Research Methods in Business', 3, NULL, 1, 3, 'faculty', 'Core', 1),
('FMS302', 'Business Ethics', 2, NULL, 1, 3, 'faculty', 'Elective', 1);

-- ============================================
-- GENERAL/UNIVERSITY-WIDE COURSES (Available to all students)
-- ============================================

INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('GST101', 'Use of English I', 2, NULL, 1, 1, 'general', 'Core', NULL),
('GST102', 'Use of English II', 2, NULL, 1, 1, 'general', 'Core', NULL),
('GST103', 'Nigerian Peoples and Culture', 2, NULL, 1, 1, 'general', 'Core', NULL),
('GST201', 'Entrepreneurship Studies', 2, NULL, 1, 2, 'general', 'Core', NULL),
('GST202', 'Philosophy and Logic', 2, NULL, 1, 2, 'general', 'Elective', NULL),
('GST301', 'Introduction to ICT', 2, NULL, 1, 3, 'general', 'Elective', NULL);

-- ============================================
-- ELECTIVE COURSES FOR DEPARTMENTS
-- ============================================

-- Department 3 (Biology) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('BIO303', 'Marine Biology', 3, 3, 1, 3, 'department', 'Elective', 2),
('BIO304', 'Immunology', 2, 3, 1, 3, 'department', 'Elective', 2),
('BIO403', 'Bioinformatics', 3, 3, 1, 4, 'department', 'Elective', 2);

-- Department 4 (Chemistry) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('CHM303', 'Environmental Chemistry', 3, 4, 1, 3, 'department', 'Elective', 2),
('CHM304', 'Polymer Chemistry', 2, 4, 1, 3, 'department', 'Elective', 2),
('CHM403', 'Petrochemistry', 3, 4, 1, 4, 'department', 'Elective', 2);

-- Department 1 (Computer Science) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('CSC303', 'Machine Learning', 3, 1, 1, 3, 'department', 'Elective', 5),
('CSC304', 'Cloud Computing', 3, 1, 1, 3, 'department', 'Elective', 5),
('CSC403', 'Blockchain Technology', 3, 1, 1, 4, 'department', 'Elective', 5),
('CSC404', 'Cyber Security', 3, 1, 1, 4, 'department', 'Elective', 5);

-- Department 25 (Mathematics) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('MTH303', 'Mathematical Modeling', 3, 25, 1, 3, 'department', 'Elective', 5),
('MTH304', 'Operations Research', 2, 25, 1, 3, 'department', 'Elective', 5),
('MTH403', 'Topology', 3, 25, 1, 4, 'department', 'Elective', 5);

-- Department 51 (Engineering) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('ENG303', 'Renewable Energy Systems', 3, 51, 1, 3, 'department', 'Elective', 9),
('ENG304', 'Robotics', 3, 51, 1, 3, 'department', 'Elective', 9),
('ENG403', 'Advanced Manufacturing', 3, 51, 1, 4, 'department', 'Elective', 9);

-- Department 33 (Accounting) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('ACC303', 'Forensic Accounting', 3, 33, 1, 3, 'department', 'Elective', 1),
('ACC304', 'Public Sector Accounting', 2, 33, 1, 3, 'department', 'Elective', 1),
('ACC403', 'International Accounting', 3, 33, 1, 4, 'department', 'Elective', 1);

-- Department 34 (Business Administration) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('BUS303', 'International Business', 3, 34, 1, 3, 'department', 'Elective', 1),
('BUS304', 'Supply Chain Management', 2, 34, 1, 3, 'department', 'Elective', 1),
('BUS403', 'Business Analytics', 3, 34, 1, 4, 'department', 'Elective', 1);

-- Department 35 (Economics) Electives
INSERT INTO dbo.course (CourseCode, CourseName, CreditUnits, DepartmentID, ProgrammeID, LevelID, CourseCategory, CourseType, FacultyID)
VALUES 
('ECO303', 'Monetary Economics', 3, 35, 1, 3, 'department', 'Elective', 1),
('ECO304', 'Public Finance', 2, 35, 1, 3, 'department', 'Elective', 1),
('ECO403', 'Health Economics', 3, 35, 1, 4, 'department', 'Elective', 1);

-- ============================================
-- ALTER APPUSERS TABLE TO ADD STAFFID COLUMN
-- ============================================

-- Add StaffID column to appusers table
ALTER TABLE dbo.appusers
ADD  StaffCode VARCHAR(50) NULL;

-- Add foreign key constraint
ALTER TABLE dbo.appusers
ADD CONSTRAINT FK_appusers_staff
    FOREIGN KEY (StaffCode)
    REFERENCES dbo.staff(StaffCode);

-- ============================================
-- INSERT STAFF RECORDS FIRST (BEFORE APPUSERS)
-- ============================================

-- Staff for Department 3 (Biology) - Faculty 2
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF018', 'Okonkwo', 'Chioma', 2, 3, 'chioma.okonkwo@delsu.edu.ng', '08011111001', GETDATE()),
('STAFF019', 'Okoro', 'Faith', 2, 3, 'faith.okoro@delsu.edu.ng', '08011111002', GETDATE()),
('STAFF020', 'Obi', 'David', 2, 3, 'david.obi@delsu.edu.ng', '08011111003', GETDATE()),
('STAFF021', 'Eze', 'Blessing', 2, 3, 'blessing.eze@delsu.edu.ng', '08011111004', GETDATE()),
('STAFF022', 'Udeh', 'Ngozi', 2, 3, 'ngozi.udeh@delsu.edu.ng', '08011111005', GETDATE());

-- Staff for Department 4 (Chemistry) - Faculty 2
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF023', 'Musa', 'Ibrahim', 2, 4, 'ibrahim.musa@delsu.edu.ng', '08011111006', GETDATE()),
('STAFF024', 'Akinola', 'James', 2, 4, 'james.akinola@delsu.edu.ng', '08011111007', GETDATE()),
('STAFF025', 'Nwosu', 'Mary', 2, 4, 'mary.nwosu@delsu.edu.ng', '08011111008', GETDATE()),
('STAFF026', 'Oluwole', 'Peter', 2, 4, 'peter.oluwole@delsu.edu.ng', '08011111009', GETDATE()),
('STAFF027', 'Garba', 'Amina', 2, 4, 'amina.garba@delsu.edu.ng', '08011111010', GETDATE());

-- Staff for Department 1 (Computer Science) - Faculty 5
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF028', 'Johnson', 'Adeyemi', 5, 1, 'adeyemi.johnson@delsu.edu.ng', '08011111011', GETDATE()),
('STAFF029', 'Eze', 'Grace', 5, 1, 'grace.eze@delsu.edu.ng', '08011111012', GETDATE()),
('STAFF030', 'Okafor', 'Peter', 5, 1, 'peter.okafor@delsu.edu.ng', '08011111013', GETDATE()),
('STAFF031', 'Nnamdi', 'Chinedu', 5, 1, 'chinedu.nnamdi@delsu.edu.ng', '08011111014', GETDATE()),
('STAFF032', 'Williams', 'Oluwaseun', 5, 1, 'oluwaseun.williams@delsu.edu.ng', '08011111015', GETDATE()),
('STAFF033', 'Afolabi', 'Jennifer', 5, 1, 'jennifer.afolabi@delsu.edu.ng', '08011111016', GETDATE());

-- Staff for Department 25 (Mathematics) - Faculty 5
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF034', 'Adebanjo', 'Grace', 5, 25, 'grace.adebanjo@delsu.edu.ng', '08011111017', GETDATE()),
('STAFF035', 'Okeke', 'Emmanuel', 5, 25, 'emmanuel.okeke@delsu.edu.ng', '08011111018', GETDATE()),
('STAFF036', 'Yusuf', 'Fatima', 5, 25, 'fatima.yusuf@delsu.edu.ng', '08011111019', GETDATE()),
('STAFF037', 'Adeyemi', 'Victor', 5, 25, 'victor.adeyemi@delsu.edu.ng', '08011111020', GETDATE()),
('STAFF038', 'Onyekachi', 'Chiamaka', 5, 25, 'chiamaka.onyekachi@delsu.edu.ng', '08011111021', GETDATE());

-- Staff for Department 51 (Engineering) - Faculty 9
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF039', 'Bello', 'Ahmed', 9, 51, 'ahmed.bello@delsu.edu.ng', '08011111022', GETDATE()),
('STAFF040', 'Ude', 'Ngozi', 9, 51, 'ngozi.ude@delsu.edu.ng', '08011111023', GETDATE()),
('STAFF041', 'Aliyu', 'Yusuf', 9, 51, 'yusuf.aliyu@delsu.edu.ng', '08011111024', GETDATE()),
('STAFF042', 'Oladipo', 'Daniel', 9, 51, 'daniel.oladipo@delsu.edu.ng', '08011111025', GETDATE()),
('STAFF043', 'Abdullahi', 'Halima', 9, 51, 'halima.abdullahi@delsu.edu.ng', '08011111026', GETDATE());

-- Staff for Department 33 (Accounting) - Faculty 1
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF044', 'Okonkwo', 'Samuel', 1, 33, 'samuel.okonkwo@delsu.edu.ng', '08011111027', GETDATE()),
('STAFF045', 'Adewale', 'Olayinka', 1, 33, 'olayinka.adewale@delsu.edu.ng', '08011111028', GETDATE()),
('STAFF046', 'Suleiman', 'Zainab', 1, 33, 'zainab.suleiman@delsu.edu.ng', '08011111029', GETDATE()),
('STAFF047', 'Hassan', 'Bashir', 1, 33, 'bashir.hassan@delsu.edu.ng', '08011111030', GETDATE()),
('STAFF048', 'Onyekachi', 'Amarachi', 1, 33, 'amarachi.onyekachi@delsu.edu.ng', '08011111031', GETDATE());

-- Staff for Department 34 (Business Administration) - Faculty 1
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF049', 'Adebayo', 'Folake', 1, 34, 'folake.adebayo@delsu.edu.ng', '08011111032', GETDATE()),
('STAFF050', 'Afolabi', 'Segun', 1, 34, 'segun.afolabi@delsu.edu.ng', '08011111033', GETDATE()),
('STAFF051', 'Yusuf', 'Mariam', 1, 34, 'mariam.yusuf@delsu.edu.ng', '08011111034', GETDATE()),
('STAFF052', 'Chukwudi', 'Michael', 1, 34, 'michael.chukwudi@delsu.edu.ng', '08011111035', GETDATE()),
('STAFF053', 'Adebisi', 'Esther', 1, 34, 'esther.adebisi@delsu.edu.ng', '08011111036', GETDATE());

-- Staff for Department 35 (Economics) - Faculty 1
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF054', 'Chukwu', 'Michael', 1, 35, 'michael.chukwu@delsu.edu.ng', '08011111037', GETDATE()),
('STAFF055', 'Ogunbiyi', 'Folake', 1, 35, 'folake.ogunbiyi@delsu.edu.ng', '08011111038', GETDATE()),
('STAFF056', 'Abubakar', 'Ibrahim', 1, 35, 'ibrahim.abubakar@delsu.edu.ng', '08011111039', GETDATE()),
('STAFF057', 'Udeh', 'Chiamaka', 1, 35, 'chiamaka.udeh@delsu.edu.ng', '08011111040', GETDATE()),
('STAFF058', 'Garba', 'Ahmed', 1, 35, 'ahmed.garba@delsu.edu.ng', '08011111041', GETDATE());

-- General Studies Staff (No specific department)
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF059', 'Thomas', 'Elizabeth', NULL, NULL, 'elizabeth.thomas@delsu.edu.ng', '08011111042', GETDATE()),
('STAFF060', 'Akande', 'Joseph', NULL, NULL, 'joseph.akande@delsu.edu.ng', '08011111043', GETDATE()),
('STAFF061', 'Ojo', 'Blessing', NULL, NULL, 'blessing.ojo@delsu.edu.ng', '08011111044', GETDATE());

-- ============================================
-- INSERT HODS AND LECTURERS INTO APPUSERS TABLE
-- ============================================

-- HODs for each department
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
-- Faculty 2 HODs
('Chioma', 'chioma.okonkwo@delsu.edu.ng', 'Admin', '12345', 3, 'STAFF018', GETDATE()), -- Biology HOD
('Musa', 'ibrahim.musa@delsu.edu.ng', 'Admin', '12345', 4, 'STAFF023', GETDATE()),-- Chemistry HOD
('Dr. Adeyemi Johnson', 'adeyemi.johnson@delsu.edu.ng', 'Admin', '12345', 1, 'STAFF028', GETDATE()), -- Computer Science HOD
('Prof. Grace Adebanjo', 'grace.adebanjo@delsu.edu.ng', 'Admin', '12345', 25, 'STAFF034', GETDATE()), -- Mathematics HOD
('Engr. Ahmed Bello', 'ahmed.bello@delsu.edu.ng', 'Admin', '12345', 51, 'STAFF039', GETDATE()), -- Engineering HOD
('Prof. Samuel Okonkwo', 'samuel.okonkwo@delsu.edu.ng', 'Admin', '12345', 33, 'STAFF044', GETDATE()), -- Accounting HOD
('Dr. Folake Adebayo', 'folake.adebayo@delsu.edu.ng', 'Admin', '12345', 34, 'STAFF049', GETDATE()), -- Business Admin HOD
('Dr. Michael Chukwu', 'michael.chukwu@delsu.edu.ng', 'Admin', '12345', 35, 'STAFF054', GETDATE()); -- Economics HOD

-- Lecturers for Department 3 (Biology)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Faith Okoro', 'faith.okoro@delsu.edu.ng', 'Lecturer', '12345', 3, 'STAFF019', GETDATE()),
('Mr. David Obi', 'david.obi@delsu.edu.ng', 'Lecturer', '12345', 3, 'STAFF020', GETDATE()),
('Dr. Blessing Eze', 'blessing.eze@delsu.edu.ng', 'Lecturer', '12345', 3, 'STAFF021', GETDATE()),
('Prof. Ngozi Udeh', 'ngozi.udeh@delsu.edu.ng', 'Lecturer', '12345', 3, 'STAFF022', GETDATE());

-- Lecturers for Department 4 (Chemistry)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. James Akinola', 'james.akinola@delsu.edu.ng', 'Lecturer', '12345', 4, 'STAFF024', GETDATE()),
('Mrs. Mary Nwosu', 'mary.nwosu@delsu.edu.ng', 'Lecturer', '12345', 4, 'STAFF025', GETDATE()),
('Dr. Peter Oluwole', 'peter.oluwole@delsu.edu.ng', 'Lecturer', '12345', 4, 'STAFF026', GETDATE()),
('Prof. Amina Garba', 'amina.garba@delsu.edu.ng', 'Lecturer', '12345', 4, 'STAFF027', GETDATE());

-- Lecturers for Department 1 (Computer Science)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Grace Eze', 'grace.eze@delsu.edu.ng', 'Lecturer', '12345', 1, 'STAFF029', GETDATE()),
('Mr. Peter Okafor', 'peter.okafor@delsu.edu.ng', 'Lecturer', '12345', 1, 'STAFF030', GETDATE()),
('Dr. Chinedu Nnamdi', 'chinedu.nnamdi@delsu.edu.ng', 'Lecturer', '12345', 1, 'STAFF031', GETDATE()),
('Prof. Oluwaseun Williams', 'oluwaseun.williams@delsu.edu.ng', 'Lecturer', '12345', 1, 'STAFF032', GETDATE()),
('Dr. Jennifer Afolabi', 'jennifer.afolabi@delsu.edu.ng', 'Lecturer', '12345', 1, 'STAFF033', GETDATE());

-- Lecturers for Department 25 (Mathematics)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Emmanuel Okeke', 'emmanuel.okeke@delsu.edu.ng', 'Lecturer', '12345', 25, 'STAFF035', GETDATE()),
('Mrs. Fatima Yusuf', 'fatima.yusuf@delsu.edu.ng', 'Lecturer', '12345', 25, 'STAFF036', GETDATE()),
('Dr. Victor Adeyemi', 'victor.adeyemi@delsu.edu.ng', 'Lecturer', '12345', 25, 'STAFF037', GETDATE()),
('Prof. Chiamaka Onyekachi', 'chiamaka.onyekachi@delsu.edu.ng', 'Lecturer', '12345', 25, 'STAFF038', GETDATE());

-- Lecturers for Department 51 (Engineering)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Ngozi Ude', 'ngozi.ude@delsu.edu.ng', 'Lecturer', '12345', 51, 'STAFF040', GETDATE()),
('Engr. Yusuf Aliyu', 'yusuf.aliyu@delsu.edu.ng', 'Lecturer', '12345', 51, 'STAFF041', GETDATE()),
('Dr. Daniel Oladipo', 'daniel.oladipo@delsu.edu.ng', 'Lecturer', '12345', 51, 'STAFF042', GETDATE()),
('Prof. Halima Abdullahi', 'halima.abdullahi@delsu.edu.ng', 'Lecturer', '12345', 51, 'STAFF043', GETDATE());

-- Lecturers for Department 33 (Accounting)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Olayinka Adewale', 'olayinka.adewale@delsu.edu.ng', 'Lecturer', '12345', 33, 'STAFF045', GETDATE()),
('Mrs. Zainab Suleiman', 'zainab.suleiman@delsu.edu.ng', 'Lecturer', '12345', 33, 'STAFF046', GETDATE()),
('Dr. Bashir Hassan', 'bashir.hassan@delsu.edu.ng', 'Lecturer', '12345', 33, 'STAFF047', GETDATE()),
('Prof. Amarachi Onyekachi', 'amarachi.onyekachi@delsu.edu.ng', 'Lecturer', '12345', 33, 'STAFF048', GETDATE());

-- Lecturers for Department 34 (Business Administration)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Segun Afolabi', 'segun.afolabi@delsu.edu.ng', 'Lecturer', '12345', 34, 'STAFF050', GETDATE()),
('Mrs. Mariam Yusuf', 'mariam.yusuf@delsu.edu.ng', 'Lecturer', '12345', 34, 'STAFF051', GETDATE()),
('Dr. Michael Chukwudi', 'michael.chukwudi@delsu.edu.ng', 'Lecturer', '12345', 34, 'STAFF052', GETDATE()),
('Prof. Esther Adebisi', 'esther.adebisi@delsu.edu.ng', 'Lecturer', '12345', 34, 'STAFF053', GETDATE());

-- Lecturers for Department 35 (Economics)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Folake Ogunbiyi', 'folake.ogunbiyi@delsu.edu.ng', 'Lecturer', '12345', 35, 'STAFF055', GETDATE()),
('Mr. Ibrahim Abubakar', 'ibrahim.abubakar@delsu.edu.ng', 'Lecturer', '12345', 35, 'STAFF056', GETDATE()),
('Dr. Chiamaka Udeh', 'chiamaka.udeh@delsu.edu.ng', 'Lecturer', '12345', 35, 'STAFF057', GETDATE()),
('Prof. Ahmed Garba', 'ahmed.garba@delsu.edu.ng', 'Lecturer', '12345', 35, 'STAFF058', GETDATE());

-- General Studies Lecturers (No specific department - departmentID is NULL)
INSERT INTO dbo.appusers (name, email, Role, password, departmentID, StaffCode, DateCreated)
VALUES
('Dr. Elizabeth Thomas', 'elizabeth.thomas@delsu.edu.ng', 'Lecturer', '12345', NULL, 'STAFF059', GETDATE()),
('Mr. Joseph Akande', 'joseph.akande@delsu.edu.ng', 'Lecturer', '12345', NULL, 'STAFF060', GETDATE()),
('Dr. Blessing Ojo', 'blessing.ojo@delsu.edu.ng', 'Lecturer', '12345', NULL, 'STAFF061', GETDATE());

-- ============================================
-- INSERT STUDENTS WITH FACULTY-BASED MATRIC NUMBERS
-- ============================================

-- Staff for Department 3 (Biology) - Faculty 2
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF018', 'Okonkwo', 'Chioma', 2, 3, 'chioma.okonkwo@delsu.edu.ng', '08011111001', GETDATE()),
('STAFF019', 'Okoro', 'Faith', 2, 3, 'faith.okoro@delsu.edu.ng', '08011111002', GETDATE()),
('STAFF020', 'Obi', 'David', 2, 3, 'david.obi@delsu.edu.ng', '08011111003', GETDATE()),
('STAFF021', 'Eze', 'Blessing', 2, 3, 'blessing.eze@delsu.edu.ng', '08011111004', GETDATE()),
('STAFF022', 'Udeh', 'Ngozi', 2, 3, 'ngozi.udeh@delsu.edu.ng', '08011111005', GETDATE());

-- Staff for Department 4 (Chemistry) - Faculty 2
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF023', 'Musa', 'Ibrahim', 2, 4, 'ibrahim.musa@delsu.edu.ng', '08011111006', GETDATE()),
('STAFF024', 'Akinola', 'James', 2, 4, 'james.akinola@delsu.edu.ng', '08011111007', GETDATE()),
('STAFF025', 'Nwosu', 'Mary', 2, 4, 'mary.nwosu@delsu.edu.ng', '08011111008', GETDATE()),
('STAFF026', 'Oluwole', 'Peter', 2, 4, 'peter.oluwole@delsu.edu.ng', '08011111009', GETDATE()),
('STAFF027', 'Garba', 'Amina', 2, 4, 'amina.garba@delsu.edu.ng', '08011111010', GETDATE());

-- Staff for Department 1 (Computer Science) - Faculty 5
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF028', 'Johnson', 'Adeyemi', 5, 1, 'adeyemi.johnson@delsu.edu.ng', '08011111011', GETDATE()),
('STAFF029', 'Eze', 'Grace', 5, 1, 'grace.eze@delsu.edu.ng', '08011111012', GETDATE()),
('STAFF030', 'Okafor', 'Peter', 5, 1, 'peter.okafor@delsu.edu.ng', '08011111013', GETDATE()),
('STAFF031', 'Nnamdi', 'Chinedu', 5, 1, 'chinedu.nnamdi@delsu.edu.ng', '08011111014', GETDATE()),
('STAFF032', 'Williams', 'Oluwaseun', 5, 1, 'oluwaseun.williams@delsu.edu.ng', '08011111015', GETDATE()),
('STAFF033', 'Afolabi', 'Jennifer', 5, 1, 'jennifer.afolabi@delsu.edu.ng', '08011111016', GETDATE());

-- Staff for Department 25 (Mathematics) - Faculty 5
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF034', 'Adebanjo', 'Grace', 5, 25, 'grace.adebanjo@delsu.edu.ng', '08011111017', GETDATE()),
('STAFF035', 'Okeke', 'Emmanuel', 5, 25, 'emmanuel.okeke@delsu.edu.ng', '08011111018', GETDATE()),
('STAFF036', 'Yusuf', 'Fatima', 5, 25, 'fatima.yusuf@delsu.edu.ng', '08011111019', GETDATE()),
('STAFF037', 'Adeyemi', 'Victor', 5, 25, 'victor.adeyemi@delsu.edu.ng', '08011111020', GETDATE()),
('STAFF038', 'Onyekachi', 'Chiamaka', 5, 25, 'chiamaka.onyekachi@delsu.edu.ng', '08011111021', GETDATE());

-- Staff for Department 51 (Engineering) - Faculty 9
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF039', 'Bello', 'Ahmed', 9, 51, 'ahmed.bello@delsu.edu.ng', '08011111022', GETDATE()),
('STAFF040', 'Ude', 'Ngozi', 9, 51, 'ngozi.ude@delsu.edu.ng', '08011111023', GETDATE()),
('STAFF041', 'Aliyu', 'Yusuf', 9, 51, 'yusuf.aliyu@delsu.edu.ng', '08011111024', GETDATE()),
('STAFF042', 'Oladipo', 'Daniel', 9, 51, 'daniel.oladipo@delsu.edu.ng', '08011111025', GETDATE()),
('STAFF043', 'Abdullahi', 'Halima', 9, 51, 'halima.abdullahi@delsu.edu.ng', '08011111026', GETDATE());

-- Staff for Department 33 (Accounting) - Faculty 1
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF044', 'Okonkwo', 'Samuel', 1, 33, 'samuel.okonkwo@delsu.edu.ng', '08011111027', GETDATE()),
('STAFF045', 'Adewale', 'Olayinka', 1, 33, 'olayinka.adewale@delsu.edu.ng', '08011111028', GETDATE()),
('STAFF046', 'Suleiman', 'Zainab', 1, 33, 'zainab.suleiman@delsu.edu.ng', '08011111029', GETDATE()),
('STAFF047', 'Hassan', 'Bashir', 1, 33, 'bashir.hassan@delsu.edu.ng', '08011111030', GETDATE()),
('STAFF048', 'Onyekachi', 'Amarachi', 1, 33, 'amarachi.onyekachi@delsu.edu.ng', '08011111031', GETDATE());

-- Staff for Department 34 (Business Administration) - Faculty 1
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF049', 'Adebayo', 'Folake', 1, 34, 'folake.adebayo@delsu.edu.ng', '08011111032', GETDATE()),
('STAFF050', 'Afolabi', 'Segun', 1, 34, 'segun.afolabi@delsu.edu.ng', '08011111033', GETDATE()),
('STAFF051', 'Yusuf', 'Mariam', 1, 34, 'mariam.yusuf@delsu.edu.ng', '08011111034', GETDATE()),
('STAFF052', 'Chukwudi', 'Michael', 1, 34, 'michael.chukwudi@delsu.edu.ng', '08011111035', GETDATE()),
('STAFF053', 'Adebisi', 'Esther', 1, 34, 'esther.adebisi@delsu.edu.ng', '08011111036', GETDATE());

-- Staff for Department 35 (Economics) - Faculty 1
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF054', 'Chukwu', 'Michael', 1, 35, 'michael.chukwu@delsu.edu.ng', '08011111037', GETDATE()),
('STAFF055', 'Ogunbiyi', 'Folake', 1, 35, 'folake.ogunbiyi@delsu.edu.ng', '08011111038', GETDATE()),
('STAFF056', 'Abubakar', 'Ibrahim', 1, 35, 'ibrahim.abubakar@delsu.edu.ng', '08011111039', GETDATE()),
('STAFF057', 'Udeh', 'Chiamaka', 1, 35, 'chiamaka.udeh@delsu.edu.ng', '08011111040', GETDATE()),
('STAFF058', 'Garba', 'Ahmed', 1, 35, 'ahmed.garba@delsu.edu.ng', '08011111041', GETDATE());

-- General Studies Staff (No specific department)
INSERT INTO dbo.staff (StaffCode, LastName, OtherNames, FacultyID, DepartmentID, Email, Phone, DateCreated)
VALUES
('STAFF059', 'Thomas', 'Elizabeth', NULL, NULL, 'elizabeth.thomas@delsu.edu.ng', '08011111042', GETDATE()),
('STAFF060', 'Akande', 'Joseph', NULL, NULL, 'joseph.akande@delsu.edu.ng', '08011111043', GETDATE()),
('STAFF061', 'Ojo', 'Blessing', NULL, NULL, 'blessing.ojo@delsu.edu.ng', '08011111044', GETDATE());

-- ============================================
-- INSERT STUDENTS WITH FACULTY-BASED MATRIC NUMBERS
-- ============================================
-- Format: FacultyCode/YearOfAdmission/SessionYear/RandomNumber
-- Example: FOS/24/25/450604
-- ============================================

-- First, we need to get faculty codes. Assuming:
-- Faculty 1 = FMS (Faculty of Management Sciences)
-- Faculty 2 = FOS (Faculty of Science)
-- Faculty 5 = FCT (Faculty of Computing/Technology)
-- Faculty 9 = FEN (Faculty of Engineering)

-- ============================================
-- STUDENTS FOR FACULTY 2 (Science) - Departments 3 & 4
-- ============================================

-- Department 3 (Biology) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FOS/24/25/450601', 'REG2024450601', 'Adeyemi', 'Abiodun Chioma', 1, 2, 2, 3, 2, 2, 'abiodun.adeyemi@student.edu', '08012345601', GETDATE(), 'Active'),
('FOS/24/25/450602', 'REG2024450602', 'Okafor', 'Emmanuel Tunde', 1, 2, 2, 3, 2, 2, 'emmanuel.okafor@student.edu', '08012345602', GETDATE(), 'Active'),
('FOS/24/25/450603', 'REG2024450603', 'Mohammed', 'Fatima Aisha', 1, 2, 2, 3, 2, 2, 'fatima.mohammed@student.edu', '08012345603', GETDATE(), 'Active'),
('FOS/24/25/450604', 'REG2024450604', 'Nwosu', 'Chukwuemeka Ikenna', 1, 2, 2, 3, 2, 2, 'chukwuemeka.nwosu@student.edu', '08012345604', GETDATE(), 'Active'),
('FOS/24/25/450605', 'REG2024450605', 'Oluwaseun', 'Blessing Ife', 1, 2, 2, 3, 2, 2, 'blessing.oluwaseun@student.edu', '08012345605', GETDATE(), 'Active');

-- Department 3 (Biology) Students - Level 300
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FOS/23/24/350601', 'REG2023350601', 'Adekunle', 'Oluwaseyi Grace', 1, 2, 2, 3, 3, 1, 'oluwaseyi.adekunle@student.edu', '08012345606', GETDATE(), 'Active'),
('FOS/23/24/350602', 'REG2023350602', 'Bello', 'Ibrahim Musa', 1, 2, 2, 3, 3, 1, 'ibrahim.bello@student.edu', '08012345607', GETDATE(), 'Active'),
('FOS/23/24/350603', 'REG2023350603', 'Eze', 'Ngozi Chiamaka', 1, 2, 2, 3, 3, 1, 'ngozi.eze@student.edu', '08012345608', GETDATE(), 'Active');

-- Department 4 (Chemistry) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FOS/24/25/450701', 'REG2024450701', 'Balogun', 'Taiwo Kehinde', 1, 4, 2, 4, 2, 2, 'taiwo.balogun@student.edu', '08012345701', GETDATE(), 'Active'),
('FOS/24/25/450702', 'REG2024450702', 'Abdullahi', 'Amina Zainab', 1, 4, 2, 4, 2, 2, 'amina.abdullahi@student.edu', '08012345702', GETDATE(), 'Active'),
('FOS/24/25/450703', 'REG2024450703', 'Williams', 'David Oluwatobi', 1, 4, 2, 4, 2, 2, 'david.williams@student.edu', '08012345703', GETDATE(), 'Active'),
('FOS/24/25/450704', 'REG2024450704', 'Okoro', 'Chidinma Joy', 1, 4, 2, 4, 2, 2, 'chidinma.okoro@student.edu', '08012345704', GETDATE(), 'Active');

-- ============================================
-- STUDENTS FOR FACULTY 5 (Computing/Tech) - Departments 1 & 25
-- ============================================

-- Department 1 (Computer Science) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FCT/24/25/450801', 'REG2024450801', 'Ajayi', 'Adebayo Samuel', 1, 1, 5, 1, 2, 2, 'adebayo.ajayi@student.edu', '08012345801', GETDATE(), 'Active'),
('FCT/24/25/450802', 'REG2024450802', 'Yusuf', 'Maryam Hauwa', 1, 1, 5, 1, 2, 2, 'maryam.yusuf@student.edu', '08012345802', GETDATE(), 'Active'),
('FCT/24/25/450803', 'REG2024450803', 'Obi', 'Victor Chinedu', 1, 1, 5, 1, 2, 2, 'victor.obi@student.edu', '08012345803', GETDATE(), 'Active'),
('FCT/24/25/450804', 'REG2024450804', 'Adebisi', 'Esther Funmilayo', 1, 1, 5, 1, 2, 2, 'esther.adebisi@student.edu', '08012345804', GETDATE(), 'Active'),
('FCT/24/25/450805', 'REG2024450805', 'Ibrahim', 'Ahmed Usman', 1, 1, 5, 1, 2, 2, 'ahmed.ibrahim@student.edu', '08012345805', GETDATE(), 'Active');

-- Department 1 (Computer Science) Students - Level 400
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FCT/22/23/250801', 'REG2022250801', 'Ogunleye', 'Olayinka Precious', 1, 1, 5, 1, 4, 1, 'olayinka.ogunleye@student.edu', '08012345806', GETDATE(), 'Active'),
('FCT/22/23/250802', 'REG2022250802', 'Abdulkadir', 'Yusuf Aliyu', 1, 1, 5, 1, 4, 1, 'yusuf.abdulkadir@student.edu', '08012345807', GETDATE(), 'Active');

-- Department 25 (Mathematics) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FCT/24/25/450901', 'REG2024450901', 'Nnamdi', 'Chioma Gloria', 1, 5, 5, 25, 2, 2, 'chioma.nnamdi@student.edu', '08012345901', GETDATE(), 'Active'),
('FCT/24/25/450902', 'REG2024450902', 'Abubakar', 'Mohammed Sani', 1, 5, 5, 25, 2, 2, 'mohammed.abubakar@student.edu', '08012345902', GETDATE(), 'Active'),
('FCT/24/25/450903', 'REG2024450903', 'Ezeife', 'Jennifer Onyinye', 1, 5, 5, 25, 2, 2, 'jennifer.ezeife@student.edu', '08012345903', GETDATE(), 'Active');

-- ============================================
-- STUDENTS FOR FACULTY 9 (Engineering) - Department 51
-- ============================================

INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FEN/24/25/451001', 'REG2024451001', 'Garba', 'Abdulrahman Idris', 1, 6, 9, 51, 2, 2, 'abdulrahman.garba@student.edu', '08012346001', GETDATE(), 'Active'),
('FEN/24/25/451002', 'REG2024451002', 'Nwafor', 'Grace Oluchi', 1, 6, 9, 51, 2, 2, 'grace.nwafor@student.edu', '08012346002', GETDATE(), 'Active'),
('FEN/24/25/451003', 'REG2024451003', 'Oladipo', 'Daniel Adeyemi', 1, 6, 9, 51, 2, 2, 'daniel.oladipo@student.edu', '08012346003', GETDATE(), 'Active'),
('FEN/24/25/451004', 'REG2024451004', 'Bala', 'Halima Fatima', 1, 6, 9, 51, 2, 2, 'halima.bala@student.edu', '08012346004', GETDATE(), 'Active');

-- ============================================
-- STUDENTS FOR FACULTY 1 (Management Sciences) - Departments 33, 34, 35
-- ============================================

-- Department 33 (Accounting) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FMS/24/25/451101', 'REG2024451101', 'Adewale', 'Oluwatoyin Ayomide', 1, 10, 1, 33, 2, 2, 'oluwatoyin.adewale@student.edu', '08012346101', GETDATE(), 'Active'),
('FMS/24/25/451102', 'REG2024451102', 'Hassan', 'Bashir Umar', 1, 10, 1, 33, 2, 2, 'bashir.hassan@student.edu', '08012346102', GETDATE(), 'Active'),
('FMS/24/25/451103', 'REG2024451103', 'Onyekachi', 'Amarachi Favour', 1, 10, 1, 33, 2, 2, 'amarachi.onyekachi@student.edu', '08012346103', GETDATE(), 'Active');

-- Department 34 (Business Administration) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FMS/24/25/451201', 'REG2024451201', 'Afolabi', 'Segun Olamide', 1, 11, 1, 34, 2, 2, 'segun.afolabi@student.edu', '08012346201', GETDATE(), 'Active'),
('FMS/24/25/451202', 'REG2024451202', 'Suleiman', 'Zainab Mariam', 1, 11, 1, 34, 2, 2, 'zainab.suleiman@student.edu', '08012346202', GETDATE(), 'Active'),
('FMS/24/25/451203', 'REG2024451203', 'Okafor', 'Michael Chukwudi', 1, 11, 1, 34, 2, 2, 'michael.okafor@student.edu', '08012346203', GETDATE(), 'Active');

-- Department 35 (Economics) Students - Level 200
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 
('FMS/24/25/451301', 'REG2024451301', 'Ogunbiyi', 'Folake Titilayo', 1, 8, 1, 35, 2, 2, 'folake.ogunbiyi@student.edu', '08012346301', GETDATE(), 'Active'),
('FMS/24/25/451302', 'REG2024451302', 'Aliyu', 'Ibrahim Abubakar', 1, 8, 1, 35, 2, 2, 'ibrahim.aliyu@student.edu', '08012346302', GETDATE(), 'Active'),
('FMS/24/25/451303', 'REG2024451303', 'Udeh', 'Chiamaka Blessing', 1, 8, 1, 35, 2, 2, 'chiamaka.udeh@student.edu', '08012346303', GETDATE(), 'Active');

-- ============================================
-- VERIFICATION QUERIES (OPTIONAL - Run to verify data)
-- ============================================

-- Count courses by faculty
-- SELECT FacultyID, COUNT(*) as CourseCount FROM dbo.course GROUP BY FacultyID ORDER BY FacultyID;

-- Count students by faculty
-- SELECT FacultyID, COUNT(*) as StudentCount FROM dbo.student GROUP BY FacultyID ORDER BY FacultyID;

-- View students with their matric numbers
-- SELECT MatricNo, FirstName, Surname, DepartmentID, FacultyID, LevelID FROM dbo.student ORDER BY FacultyID, DepartmentID;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Faculty codes used:
--    - FOS = Faculty of Science (Faculty 2)
--    - FCT = Faculty of Computing/Technology (Faculty 5)
--    - FEN = Faculty of Engineering (Faculty 9)
--    - FMS = Faculty of Management Sciences (Faculty 1)
--
-- 2. Matric number format: FacultyCode/YearOfAdmission/SessionYear/RandomNumber
--    Example: FOS/24/25/450604
--    - FOS = Faculty of Science
--    - 24 = Year 2024 admission
--    - 25 = Session 2024/2025
--    - 450604 = Unique identifier
--
-- 3. Students are distributed across different levels (200, 300, 400)
--
-- 4. All students have Status = 'Active'
--
-- 5. Email format: firstname.surname@student.edu
--
-- 6. Phone numbers start with 080123456XX
-- ============================================


-- Registration for courses can be handled in a separate script as needed.
CREATE TABLE dbo.course_registration (
    RegistrationID INT PRIMARY KEY IDENTITY(1,1),
    StudentID INT NOT NULL,  -- Links to student.StudentID or MatricNo
    CourseID INT NOT NULL,   -- Links to course.CourseID
    SessionID INT NOT NULL,  -- Links to sessions.SessionID
    SemesterID INT NOT NULL, -- Links to semesters.SemesterID
    RegistrationDate DATETIME DEFAULT GETDATE(),
    RegistrationStatus VARCHAR(20) DEFAULT 'registered', -- registered, dropped, completed
    
    FOREIGN KEY (StudentID) REFERENCES dbo.student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES dbo.course(CourseID),
    FOREIGN KEY (SessionID) REFERENCES dbo.sessions(SessionID),
    FOREIGN KEY (SemesterID) REFERENCES dbo.semesters(SemesterID),
    
    CONSTRAINT UQ_StudentCourseSession UNIQUE (StudentID, CourseID, SessionID, SemesterID)
);

-- ============================================
-- POPULATE COURSE REGISTRATIONS
-- ============================================
-- Auto-register students for courses based on:
-- 1. Department courses (matching department and level)
-- 2. Faculty courses (matching faculty and level)
-- 3. General courses (matching level)
-- ============================================

-- Register students for DEPARTMENT courses (matching department and level)
INSERT INTO dbo.course_registration (StudentID, CourseID, SessionID, SemesterID, RegistrationDate, RegistrationStatus)
SELECT DISTINCT
    s.StudentID,
    c.CourseID,
    s.SessionID,
    1 as SemesterID, -- First semester
    GETDATE(),
    'registered'
FROM dbo.student s
INNER JOIN dbo.course c ON s.DepartmentID = c.DepartmentID 
    AND s.LevelID = c.LevelID
    AND c.CourseCategory = 'department'
WHERE s.[Status] = 'Active';

-- Register students for FACULTY courses (matching faculty and level)
INSERT INTO dbo.course_registration (StudentID, CourseID, SessionID, SemesterID, RegistrationDate, RegistrationStatus)
SELECT DISTINCT
    s.StudentID,
    c.CourseID,
    s.SessionID,
    1 as SemesterID, -- First semester
    GETDATE(),
    'registered'
FROM dbo.student s
INNER JOIN dbo.course c ON s.FacultyID = c.FacultyID 
    AND s.LevelID = c.LevelID
    AND c.CourseCategory = 'faculty'
WHERE s.[Status] = 'Active';

-- Register students for GENERAL courses (matching level only)
INSERT INTO dbo.course_registration (StudentID, CourseID, SessionID, SemesterID, RegistrationDate, RegistrationStatus)
SELECT DISTINCT
    s.StudentID,
    c.CourseID,
    s.SessionID,
    1 as SemesterID, -- First semester
    GETDATE(),
    'registered'
FROM dbo.student s
INNER JOIN dbo.course c ON s.LevelID = c.LevelID
    AND c.CourseCategory = 'general'
WHERE s.[Status] = 'Active';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check registration counts by student
-- SELECT s.MatricNo, s.LastName, s.OtherNames, COUNT(cr.RegistrationID) as CoursesRegistered
-- FROM dbo.student s
-- LEFT JOIN dbo.course_registration cr ON s.StudentID = cr.StudentID
-- GROUP BY s.MatricNo, s.LastName, s.OtherNames
-- ORDER BY CoursesRegistered DESC;

-- Check registrations by department
-- SELECT d.DepartmentName, COUNT(cr.RegistrationID) as TotalRegistrations
-- FROM dbo.course_registration cr
-- INNER JOIN dbo.student s ON cr.StudentID = s.StudentID
-- INNER JOIN dbo.appdepartment d ON s.DepartmentID = d.DepartmentID
-- GROUP BY d.DepartmentName
-- ORDER BY TotalRegistrations DESC;

-- View sample registrations with details
-- SELECT TOP 20
--     s.MatricNo,
--     s.LastName + ' ' + s.OtherNames as StudentName,
--     c.CourseCode,
--     c.CourseName,
--     c.CourseCategory,
--     ses.SessionName,
--     sem.SemesterName,
--     cr.RegistrationStatus
-- FROM dbo.course_registration cr
-- INNER JOIN dbo.student s ON cr.StudentID = s.StudentID
-- INNER JOIN dbo.course c ON cr.CourseID = c.CourseID
-- INNER JOIN dbo.sessions ses ON cr.SessionID = ses.SessionID
-- INNER JOIN dbo.semesters sem ON cr.SemesterID = sem.SemesterID
-- ORDER BY s.MatricNo, c.CourseCode;



ALTER TABLE dbo.results
DROP CONSTRAINT FK_results_attendance
   


ALTER TABLE dbo.results
DROP COLUMN AttendanceID

INSERT INTO dbo.levels (LevelName) VALUES
('700')


SELECT name FROM sys.databases;

SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

SELECT DB_NAME() AS CurrentDatabase;

-- Check your permissions
SELECT 
    USER_NAME() as CurrentUser,
    HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW ANY DATABASE') as CanViewDatabases;

-- Check database permissions
USE DELSUPortal;
SELECT * FROM fn_my_permissions(NULL, 'DATABASE');



Insert INTO dbo.programmes 


ALTER TABLE dbo.student ADD COLUMN Sex VARCHAR(1) NOT NULL CHECK (Sex IN ('M', 'F')) DEFAULT 'M';