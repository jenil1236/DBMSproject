DROP DATABASE IF EXISTS DBMSproject;
CREATE DATABASE DBMSproject;
USE DBMSproject;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  google_id VARCHAR(255)
);

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    body TEXT NOT NULL,
    issued_by VARCHAR(100) NOT NULL
);

CREATE TABLE question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    answer ENUM('A','B','C','D') NOT NULL
);

CREATE TABLE test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    testName VARCHAR(100) NOT NULL,
    startTime DATETIME NOT NULL,
    duration INT UNSIGNED NOT NULL,
    numberOfQues INT UNSIGNED NOT NULL,
    eachQuesMarks INT UNSIGNED NOT NULL,
);

CREATE TABLE test_has_ques (
    testid INT NOT NULL,
    questionid INT NOT NULL,
    PRIMARY KEY (testid, questionid),
    FOREIGN KEY (testid) REFERENCES test(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (questionid) REFERENCES question(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE result(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    testid INT NOT NULL,
    score INT UNSIGNED DEFAULT 0,
    FOREIGN KEY (testid) REFERENCES test(id),
    FOREIGN KEY (userid) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(userid,testid)
);

CREATE TABLE submission (
    resultid INT NOT NULL,
    questionid INT NOT NULL,
    selected ENUM('A', 'B', 'C', 'D'),
    status BOOLEAN NOT NULL,
    PRIMARY KEY (resultid, questionid),
    FOREIGN KEY (resultid) REFERENCES result(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (questionid) REFERENCES question(id)
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adminUserName VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- CREATING TRIGGERS
DELIMITER $$
CREATE TRIGGER update_score_after_submission
AFTER INSERT ON submission
FOR EACH ROW
BEGIN
  -- Only update if the submitted answer is correct
  IF NEW.status = 1 THEN
    UPDATE result r
    JOIN test t ON r.testid = t.id
    SET r.score = IFNULL(r.score, 0) + IFNULL(t.eachQuesMarks, 0)
    WHERE r.id = NEW.resultid;
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validate_test_starttime_before_update
BEFORE UPDATE ON test
FOR EACH ROW
BEGIN
  -- Check if startTime is being updated and ensure it's greater than current time
  IF NEW.startTime != OLD.startTime AND NEW.startTime <= NOW() THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Test start time must be greater than current time';
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validate_test_numberOfQues_before_update
BEFORE UPDATE ON test
FOR EACH ROW
BEGIN
  -- Prevent changing numberOfQues after test creation
  IF NEW.numberOfQues != OLD.numberOfQues THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Number of questions cannot be changed after test creation';
  END IF;
END$$
DELIMITER ;

-- DELIMITER $$
-- CREATE TRIGGER calculate_totalmarks_before_insert
-- BEFORE INSERT ON test
-- FOR EACH ROW
-- BEGIN
--     SET NEW.totalMarks = NEW.numberOfQues * NEW.eachQuesMarks;
-- END$$

-- DELIMITER ;



-- STORED PROCEDURES
DELIMITER $

CREATE PROCEDURE RegisterUser(
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    OUT p_user_id INT,
    OUT p_error_code INT,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_error_code = MYSQL_ERRNO,
            p_error_message = MESSAGE_TEXT;
        ROLLBACK;
    END;
    
    -- Initialize output parameters
    SET p_user_id = NULL;
    SET p_error_code = 0;
    SET p_error_message = NULL;
    
    START TRANSACTION;
    
    -- Insert new user
    INSERT INTO user (username, email, password) 
    VALUES (p_username, p_email, p_password);
    
    -- Get the inserted user ID
    SET p_user_id = LAST_INSERT_ID();
    
    COMMIT;
END$

DELIMITER ;
DELIMITER $

CREATE PROCEDURE CreateAnnouncement(
    IN p_title VARCHAR(255),
    IN p_body TEXT,
    IN p_issued_by VARCHAR(100),
    OUT p_announcement_id INT,
    OUT p_error_code INT,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_error_code = MYSQL_ERRNO,
            p_error_message = MESSAGE_TEXT;
        ROLLBACK;
    END;
    
    -- Initialize output parameters
    SET p_announcement_id = NULL;
    SET p_error_code = 0;
    SET p_error_message = NULL;
    
    START TRANSACTION;
    
    -- Insert new announcement
    INSERT INTO announcements (title, body, issued_by, date) 
    VALUES (p_title, p_body, p_issued_by, NOW());
    
    -- Get the inserted announcement ID
    SET p_announcement_id = LAST_INSERT_ID();
    
    COMMIT;
END$

DELIMITER ;
DELIMITER $

CREATE PROCEDURE CreateTest(
    IN p_testName VARCHAR(100),
    IN p_startTime DATETIME,
    IN p_duration INT,
    IN p_numberOfQues INT,
    IN p_eachQuesMarks INT,
    OUT p_test_id INT,
    OUT p_error_code INT,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_error_code = MYSQL_ERRNO,
            p_error_message = MESSAGE_TEXT;
        ROLLBACK;
    END;
    
    -- Initialize output parameters
    SET p_test_id = NULL;
    SET p_error_code = 0;
    SET p_error_message = NULL;
    
    START TRANSACTION;
    
    -- Insert test
    INSERT INTO test (testName, startTime, duration, numberOfQues, eachQuesMarks) 
    VALUES (p_testName, p_startTime, p_duration, p_numberOfQues, p_eachQuesMarks);
    
    -- Get the inserted test ID
    SET p_test_id = LAST_INSERT_ID();
    
    COMMIT;
END$

DELIMITER ;
DELIMITER $


CREATE FUNCTION UpdateAnnouncement(
    p_title VARCHAR(255),
    p_body TEXT,
    p_issued_by VARCHAR(100),
    p_id INT
) RETURNS INT
READS SQL DATA
MODIFIES SQL DATA
BEGIN
    UPDATE announcements SET title=p_title, body=p_body, issued_by=p_issued_by WHERE id=p_id;
    RETURN ROW_COUNT();
END$

DELIMITER ;
DELIMITER $

CREATE FUNCTION UpdateTest(
    p_testName VARCHAR(100),
    p_startTime DATETIME,
    p_duration INT,
    p_eachQuesMarks INT,
    p_id INT
) RETURNS INT
READS SQL DATA
MODIFIES SQL DATA
BEGIN
    UPDATE test SET testName=p_testName, startTime=p_startTime, duration=p_duration, eachQuesMarks=p_eachQuesMarks WHERE id=p_id;
    RETURN ROW_COUNT();
END$

DELIMITER ;
DELIMITER $

CREATE FUNCTION DeleteAnnouncement(
    p_id INT
) RETURNS INT
READS SQL DATA
MODIFIES SQL DATA
BEGIN
    DELETE FROM announcements WHERE id=p_id;
    RETURN ROW_COUNT();
END$

DELIMITER ;
DELIMITER $

CREATE PROCEDURE ProcessTestSubmissions(
    IN p_user_id INT,
    IN p_test_id INT,
    IN p_submissions JSON,
    OUT p_result_id INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_question_id INT;
    DECLARE v_correct_answer ENUM('A','B','C','D');
    DECLARE v_question_index INT DEFAULT 0;
    DECLARE v_user_answer VARCHAR(1);
    DECLARE v_is_correct BOOLEAN;
    
    -- Cursor to iterate through test questions
    DECLARE question_cursor CURSOR FOR 
        SELECT thq.questionid, q.answer 
        FROM test_has_ques thq 
        JOIN question q ON thq.questionid = q.id 
        WHERE thq.testid = p_test_id 
        ORDER BY thq.questionid;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Create result record
    INSERT INTO result(userid, testid, score) VALUES (p_user_id, p_test_id, 0);
    SET p_result_id = LAST_INSERT_ID();
    
    -- Open cursor and process each question
    OPEN question_cursor;
    
    question_loop: LOOP
        FETCH question_cursor INTO v_question_id, v_correct_answer;
        
        IF done THEN
            LEAVE question_loop;
        END IF;
        
        -- Get user's answer from JSON array
        SET v_user_answer = JSON_UNQUOTE(JSON_EXTRACT(p_submissions, CONCAT('$[', v_question_index, ']')));
        
        -- Only process if user provided an answer
        IF v_user_answer IS NOT NULL AND v_user_answer != '' THEN
            SET v_is_correct = (v_correct_answer = v_user_answer);
            
            -- Insert submission
            INSERT INTO submission(resultid, questionid, selected, status) 
            VALUES (p_result_id, v_question_id, v_user_answer, v_is_correct);
        END IF;
        
        SET v_question_index = v_question_index + 1;
    END LOOP;
    
    CLOSE question_cursor;
END$

DELIMITER ;

DELIMITER $

CREATE PROCEDURE AssignRandomQuestions(
    IN p_test_id INT,
    IN p_number_of_questions INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_question_id INT;
    DECLARE v_count INT DEFAULT 0;
    
    -- Cursor to get random questions
    DECLARE question_cursor CURSOR FOR 
        SELECT id FROM question ORDER BY RAND() LIMIT p_number_of_questions;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN question_cursor;
    
    assign_loop: LOOP
        FETCH question_cursor INTO v_question_id;
        
        IF done THEN
            LEAVE assign_loop;
        END IF;
        
        -- Insert test-question association
        INSERT INTO test_has_ques (testid, questionid) VALUES (p_test_id, v_question_id);
        
        SET v_count = v_count + 1;
    END LOOP;
    
    CLOSE question_cursor;
    
    SELECT CONCAT('Assigned ', v_count, ' questions to test ', p_test_id) as result;
END$

DELIMITER ;
-- DELIMITER $

-- CREATE PROCEDURE GenerateTestReport(
--     IN p_test_id INT
-- )
-- BEGIN
--     DECLARE done INT DEFAULT FALSE;
--     DECLARE v_user_id INT;
--     DECLARE v_username VARCHAR(255);
--     DECLARE v_score INT;
--     DECLARE v_total_marks INT;
--     DECLARE v_percentage DECIMAL(5,2);
    
--     -- Cursor to iterate through all test results
--     DECLARE result_cursor CURSOR FOR 
--         SELECT r.userid, u.username, r.score, (t.numberOfQues * t.eachQuesMarks) as total_marks
--         FROM result r 
--         JOIN user u ON r.userid = u.id 
--         JOIN test t ON r.testid = t.id 
--         WHERE r.testid = p_test_id
--         ORDER BY r.score DESC;
    
--     DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
--     -- Create temporary table for report
--     DROP TEMPORARY TABLE IF EXISTS temp_test_report;
--     CREATE TEMPORARY TABLE temp_test_report (
--         user_id INT,
--         username VARCHAR(255),
--         score INT,
--         total_marks INT,
--         percentage DECIMAL(5,2),
--         grade VARCHAR(10)
--     );
    
--     OPEN result_cursor;
    
--     report_loop: LOOP
--         FETCH result_cursor INTO v_user_id, v_username, v_score, v_total_marks;
        
--         IF done THEN
--             LEAVE report_loop;
--         END IF;
        
--         SET v_percentage = (v_score / v_total_marks) * 100;
        
--         INSERT INTO temp_test_report VALUES (
--             v_user_id, 
--             v_username, 
--             v_score, 
--             v_total_marks, 
--             v_percentage,
--             CASE 
--                 WHEN v_percentage >= 90 THEN 'A+'
--                 WHEN v_percentage >= 80 THEN 'A'
--                 WHEN v_percentage >= 70 THEN 'B'
--                 WHEN v_percentage >= 60 THEN 'C'
--                 ELSE 'F'
--             END
--         );
--     END LOOP;
    
--     CLOSE result_cursor;
    
--     -- Return the report
--     SELECT * FROM temp_test_report;
-- END$

-- DELIMITER ;