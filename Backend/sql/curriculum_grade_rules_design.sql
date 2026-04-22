/*
  Future-proof grading design.

  Why this is better:
  - You do not edit dbo.results schema every time grading policy changes.
  - You update rows in a grading rules table instead.
  - Different curricula can have different thresholds and grade points.

  Important SQL Server limitation:
  - Computed columns in dbo.results are not a good fit for table-driven grading rules.
  - If you want grading rules to come from another table, Grade/GradePoint/Remarks
    should be stored columns populated by SQL logic, not computed CASE columns.
*/


/* ============================================================
   1. RULES TABLE
   ============================================================ */

CREATE TABLE dbo.curriculum_grade_rules (
    RuleID INT IDENTITY(1,1) NOT NULL,
    CurriculumID INT NOT NULL,
    MinScore DECIMAL(5,2) NOT NULL,
    MaxScore DECIMAL(5,2) NULL,
    Grade VARCHAR(2) NOT NULL,
    GradePoint DECIMAL(3,1) NOT NULL,
    Remarks VARCHAR(10) NOT NULL,
    DeficitApplies BIT NOT NULL CONSTRAINT DF_curriculum_grade_rules_Deficit DEFAULT (0),
    IsActive BIT NOT NULL CONSTRAINT DF_curriculum_grade_rules_IsActive DEFAULT (1),
    CreatedAt DATETIME NOT NULL CONSTRAINT DF_curriculum_grade_rules_CreatedAt DEFAULT (GETDATE()),
    UpdatedAt DATETIME NOT NULL CONSTRAINT DF_curriculum_grade_rules_UpdatedAt DEFAULT (GETDATE()),
    CONSTRAINT PK_curriculum_grade_rules PRIMARY KEY (RuleID),
    CONSTRAINT FK_curriculum_grade_rules_curriculum FOREIGN KEY (CurriculumID)
        REFERENCES dbo.curriculum(curriculum_id),
    CONSTRAINT CK_curriculum_grade_rules_score_range CHECK (MaxScore IS NULL OR MaxScore >= MinScore)
);


/* Optional uniqueness guard for one active band per curriculum/grade start */
CREATE UNIQUE INDEX UX_curriculum_grade_rules_active_band
ON dbo.curriculum_grade_rules (CurriculumID, MinScore, Grade)
WHERE IsActive = 1;


/* ============================================================
   2. SAMPLE RULES
   ============================================================ */

/* Curriculum 1 */
INSERT INTO dbo.curriculum_grade_rules (CurriculumID, MinScore, MaxScore, Grade, GradePoint, Remarks, DeficitApplies)
VALUES
    (1, 70, 100, 'A', 5.0, 'Pass', 0),
    (1, 60, 69.99, 'B', 4.0, 'Pass', 0),
    (1, 50, 59.99, 'C', 3.0, 'Pass', 0),
    (1, 45, 49.99, 'D', 2.0, 'Pass', 0),
    (1, 40, 44.99, 'E', 1.0, 'Pass', 0),
    (1, 0, 39.99, 'F', 0.0, 'Fail', 1);

/* Curriculum 2 */
INSERT INTO dbo.curriculum_grade_rules (CurriculumID, MinScore, MaxScore, Grade, GradePoint, Remarks, DeficitApplies)
VALUES
    (2, 75, 100, 'A', 5.0, 'Pass', 0),
    (2, 65, 74.99, 'B', 4.0, 'Pass', 0),
    (2, 55, 64.99, 'C', 3.0, 'Pass', 0),
    (2, 45, 54.99, 'D', 2.0, 'Pass', 0),
    (2, 30, 44.99, 'E', 1.0, 'Pass', 0),
    (2, 0, 29.99, 'F', 0.0, 'Fail', 1);


/* ============================================================
   3. HOW TO CHANGE GRADE CONDITIONS IN FUTURE
   ============================================================ */

/*
  Example: if Curriculum 2 changes from A >= 75 to A >= 70,
  you update data, not schema.

  UPDATE dbo.curriculum_grade_rules
  SET MaxScore = 69.99,
      UpdatedAt = GETDATE()
  WHERE CurriculumID = 2 AND Grade = 'B' AND IsActive = 1;

  UPDATE dbo.curriculum_grade_rules
  SET MinScore = 70,
      UpdatedAt = GETDATE()
  WHERE CurriculumID = 2 AND Grade = 'A' AND IsActive = 1;
*/


/* ============================================================
   4. RECOMMENDED dbo.results SHAPE
   ============================================================ */

/*
  For this model, keep these as STORED columns, not computed columns:
  - TotalScore
  - Grade
  - GradePoint
  - Remarks
  - TotalGradePoints
  - DeficitPoint

  Reason:
  - table-driven grading rules cannot be maintained cleanly through repeated
    computed CASE expressions.
*/


/* Example alteration direction for existing dbo.results */
/*
ALTER TABLE dbo.results DROP COLUMN TotalGradePoints;
ALTER TABLE dbo.results DROP COLUMN DeficitPoint;
ALTER TABLE dbo.results DROP COLUMN Remarks;
ALTER TABLE dbo.results DROP COLUMN GradePoint;
ALTER TABLE dbo.results DROP COLUMN Grade;
ALTER TABLE dbo.results DROP COLUMN TotalScore;

ALTER TABLE dbo.results ADD TotalScore DECIMAL(6,2) NULL;
ALTER TABLE dbo.results ADD Grade VARCHAR(2) NULL;
ALTER TABLE dbo.results ADD GradePoint DECIMAL(3,1) NULL;
ALTER TABLE dbo.results ADD Remarks VARCHAR(10) NULL;
ALTER TABLE dbo.results ADD TotalGradePoints DECIMAL(13,1) NULL;
ALTER TABLE dbo.results ADD DeficitPoint DECIMAL(12,1) NULL;
*/


/* ============================================================
   5. APPLY RULES TO RESULTS
   ============================================================ */

/*
  This pattern updates dbo.results from the rule table.
  You can run it:
  - after inserting/updating CA_Score or Exam_Score
  - inside a stored procedure
  - inside a trigger if you want automatic sync
*/

UPDATE r
SET
    r.TotalScore = CASE
        WHEN r.CA_Score IS NULL AND r.Exam_Score IS NULL THEN NULL
        ELSE ISNULL(r.CA_Score, 0) + ISNULL(r.Exam_Score, 0)
    END,
    r.Grade = gr.Grade,
    r.GradePoint = gr.GradePoint,
    r.Remarks = gr.Remarks,
    r.TotalGradePoints = CASE
        WHEN gr.GradePoint IS NULL THEN NULL
        ELSE gr.GradePoint * r.CreditUnits
    END,
    r.DeficitPoint = CASE
        WHEN gr.DeficitApplies = 1 THEN CAST(r.CreditUnits AS DECIMAL(12,1))
        WHEN gr.DeficitApplies = 0 THEN 0
        ELSE NULL
    END
FROM dbo.results r
OUTER APPLY (
    SELECT TOP 1
        cgr.Grade,
        cgr.GradePoint,
        cgr.Remarks,
        cgr.DeficitApplies
    FROM dbo.curriculum_grade_rules cgr
    WHERE cgr.CurriculumID = r.CurriculumID
      AND cgr.IsActive = 1
      AND (ISNULL(r.CA_Score, 0) + ISNULL(r.Exam_Score, 0)) >= cgr.MinScore
      AND (cgr.MaxScore IS NULL OR (ISNULL(r.CA_Score, 0) + ISNULL(r.Exam_Score, 0)) <= cgr.MaxScore)
    ORDER BY cgr.MinScore DESC
) gr
WHERE r.CurriculumID IS NOT NULL;


/* ============================================================
   6. OPTIONAL STORED PROCEDURE
   ============================================================ */

GO
CREATE OR ALTER PROCEDURE dbo.sp_RecalculateResultGrades
    @ResultID INT = NULL,
    @CurriculumID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE r
    SET
        r.TotalScore = CASE
            WHEN r.CA_Score IS NULL AND r.Exam_Score IS NULL THEN NULL
            ELSE ISNULL(r.CA_Score, 0) + ISNULL(r.Exam_Score, 0)
        END,
        r.Grade = gr.Grade,
        r.GradePoint = gr.GradePoint,
        r.Remarks = gr.Remarks,
        r.TotalGradePoints = CASE
            WHEN gr.GradePoint IS NULL THEN NULL
            ELSE gr.GradePoint * r.CreditUnits
        END,
        r.DeficitPoint = CASE
            WHEN gr.DeficitApplies = 1 THEN CAST(r.CreditUnits AS DECIMAL(12,1))
            WHEN gr.DeficitApplies = 0 THEN 0
            ELSE NULL
        END
    FROM dbo.results r
    OUTER APPLY (
        SELECT TOP 1
            cgr.Grade,
            cgr.GradePoint,
            cgr.Remarks,
            cgr.DeficitApplies
        FROM dbo.curriculum_grade_rules cgr
        WHERE cgr.CurriculumID = r.CurriculumID
          AND cgr.IsActive = 1
          AND (ISNULL(r.CA_Score, 0) + ISNULL(r.Exam_Score, 0)) >= cgr.MinScore
          AND (cgr.MaxScore IS NULL OR (ISNULL(r.CA_Score, 0) + ISNULL(r.Exam_Score, 0)) <= cgr.MaxScore)
        ORDER BY cgr.MinScore DESC
    ) gr
    WHERE (@ResultID IS NULL OR r.ResultID = @ResultID)
      AND (@CurriculumID IS NULL OR r.CurriculumID = @CurriculumID);
END;
GO


/* ============================================================
   7. ANSWER TO THE ORIGINAL QUESTION
   ============================================================ */

/*
  If you want to change grade conditions in future:

  Old design:
  - edit multiple CASE expressions in dbo.results schema
  - risky and repetitive

  New design:
  - update rows in dbo.curriculum_grade_rules
  - rerun dbo.sp_RecalculateResultGrades

  That is the maintainable way to change grading policy later.
*/