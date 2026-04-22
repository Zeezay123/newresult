

    CREATE TABLE dbo.results (
        ResultID INT IDENTITY(1,1) NOT NULL,
        StudentID INT NOT NULL,
        CourseID INT NOT NULL,
        SessionID INT NOT NULL,
        LevelID INT NOT NULL,
        CurriculumID INT NULL,
        CA_Score DECIMAL(5,2) NULL,
        Exam_Score DECIMAL(5,2) NULL,
        SubmittedBy VARCHAR(20) NULL,
        SubmittedDate DATETIME NULL CONSTRAINT DF_results_SubmittedDate DEFAULT (GETDATE()),
        ApprovedBy INT NULL,
        ApprovedDate DATETIME NULL,
        SemesterID INT NULL,
        MatricNo VARCHAR(50) NULL,
        Cgpa DECIMAL(3,2) NULL,
        TotalScore AS (
            CASE
                WHEN CA_Score IS NULL AND Exam_Score IS NULL THEN NULL
                ELSE ISNULL(CA_Score, 0) + ISNULL(Exam_Score, 0)
            END
        ),
        Grade AS (
            CASE
                WHEN CurriculumID IS NULL OR CA_Score IS NULL OR Exam_Score IS NULL THEN NULL

            
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 70 THEN 'A'
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 60 THEN 'B'
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 50 THEN 'C'
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 45 THEN 'D'
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 40 THEN 'E'
                WHEN CurriculumID = 1 THEN 'F'

            
                

                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 80 THEN 'A'
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 70 THEN 'B'
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 60 THEN 'C'
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 50 THEN 'D'
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 45 THEN 'E'
                WHEN CurriculumID = 2 THEN 'F'
            

                ELSE NULL
            END
        ),
        GradePoint AS (
            CASE
                WHEN CurriculumID IS NULL OR CA_Score IS NULL OR Exam_Score IS NULL THEN NULL

                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 70 THEN 5.0
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 60 THEN 4.0
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 50 THEN 3.0
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 45 THEN 2.0
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 40 THEN 1.0
                WHEN CurriculumID = 1 THEN 0.0

                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 80 THEN 5.0
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 70 THEN 4.0
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 60 THEN 3.0
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 50 THEN 2.0
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 45 THEN 1.0
                WHEN CurriculumID = 2 THEN 0.0

                ELSE NULL
            END
        ),
        CreditUnits INT NOT NULL,
        TotalGradePoints AS (
            CASE
                WHEN CurriculumID IS NULL OR CA_Score IS NULL OR Exam_Score IS NULL THEN NULL

                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 70 THEN 5.0 * CreditUnits
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 60 THEN 4.0 * CreditUnits
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 50 THEN 3.0 * CreditUnits
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 45 THEN 2.0 * CreditUnits
                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 40 THEN 1.0 * CreditUnits
                WHEN CurriculumID = 1 THEN 0.0

                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 80 THEN 5.0 * CreditUnits
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 70 THEN 4.0 * CreditUnits
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 60 THEN 3.0 * CreditUnits
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 50 THEN 2.0 * CreditUnits
                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 45 THEN 1.0 * CreditUnits
                WHEN CurriculumID = 2 THEN 0.0

                ELSE NULL
            END
        ),
        Remarks AS (
            CASE
                WHEN CurriculumID IS NULL OR CA_Score IS NULL OR Exam_Score IS NULL THEN NULL

                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) >= 40 THEN 'Pass'
                WHEN CurriculumID = 1 THEN 'Fail'

                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) >= 45 THEN 'Pass'
                WHEN CurriculumID = 2 THEN 'Fail'

                ELSE NULL
            END
        ),
        DeficitPoint AS (
            CASE
                WHEN CurriculumID IS NULL OR CA_Score IS NULL OR Exam_Score IS NULL THEN NULL

                WHEN CurriculumID = 1 AND (CA_Score + Exam_Score) < 40 THEN CAST(CreditUnits AS NUMERIC(12,1))
                WHEN CurriculumID = 1 THEN 0.0

                WHEN CurriculumID = 2 AND (CA_Score + Exam_Score) < 45 THEN CAST(CreditUnits AS NUMERIC(12,1))
                WHEN CurriculumID = 2 THEN 0.0

                ELSE NULL
            END
        ),
        ResultType NVARCHAR(100) NULL,
        ResultStatus NVARCHAR(40) NOT NULL CONSTRAINT DF_results_ResultStatus DEFAULT ('Pending'),
        Advisor VARCHAR(50) NULL CONSTRAINT DF_results_Advisor DEFAULT ('Pending'),
        Hod_Approval VARCHAR(50) NULL CONSTRAINT DF_results_HodApproval DEFAULT ('Pending'),
        Bsc_Approval VARCHAR(50) NULL CONSTRAINT DF_results_BscApproval DEFAULT ('Pending'),
        Vc_Approval VARCHAR(50) NULL CONSTRAINT DF_results_VcApproval DEFAULT ('Pending'),
        DeanApproval VARCHAR(50) NULL CONSTRAINT DF_results_DeanApproval DEFAULT ('Pending'),
        DeanApprovedDate DATETIME NULL,
        AdvisorApprovedDate DATETIME NULL,
        AdvisorApprovedBy VARCHAR(50) NULL,
        AdvisorRejectionReason VARCHAR(255) NULL,
        AdvisorRejectedDate DATETIME NULL,
        AdvisorRejectedBy VARCHAR(50) NULL,
        CONSTRAINT PK_results PRIMARY KEY (ResultID),
        CONSTRAINT FK_results_level FOREIGN KEY (LevelID) REFERENCES dbo.Levels(LevelID),
        CONSTRAINT FK_results_curriculum FOREIGN KEY (CurriculumID) REFERENCES dbo.curriculum(curriculum_id)
    );
