import pool from '../config/db.js';

// 📘 Get all tests
export const getAllTests = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM test ORDER BY startTime DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ success: false, message: 'Error fetching tests' });
  }
};

// 📘 Get test details with questions
export const getTestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get test details
    const [testRows] = await pool.query('SELECT * FROM test WHERE id = ?', [id]);

    if (testRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Get associated questions
    const [questionRows] = await pool.query(`
      SELECT q.id, q.question, q.option1, q.option2, q.option3, q.option4, q.answer
      FROM question q
      INNER JOIN test_has_ques thq ON q.id = thq.questionid
      WHERE thq.testid = ?
      ORDER BY q.id
    `, [id]);

    res.status(200).json({
      success: true,
      data: {
        test: testRows[0],
        questions: questionRows
      }
    });
  } catch (err) {
    console.error('Error fetching test details:', err);
    res.status(500).json({ success: false, message: 'Error fetching test details' });
  }
};

// 📗 Create new test
export const createTest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { testName, startTime, duration, numberOfQues, eachQuesMarks } = req.body;
    const numQuestions = parseInt(numberOfQues);

    if (!testName || !startTime || !duration || !numberOfQues || !eachQuesMarks) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if we have enough questions in the database
    const [questionCount] = await connection.query('SELECT COUNT(*) as count FROM question');

    if (questionCount[0].count < numberOfQues) {
      return res.status(400).json({
        success: false,
        message: `Not enough questions available. Required: ${numberOfQues}, Available: ${questionCount[0].count}`
      });
    }

    await connection.beginTransaction();

    // Insert test using stored procedure
    const [result] = await connection.execute(
      "CALL CreateTest(?, ?, ?, ?, ?, @test_id, @error_code, @error_message)",
      [testName, startTime, duration, numberOfQues, eachQuesMarks]
    );

    // Get the output parameters
    const [outputs] = await connection.execute(
      "SELECT @test_id as test_id, @error_code as error_code, @error_message as error_message"
    );

    const { test_id, error_code, error_message } = outputs[0];

    // Check if there was an error
    if (error_code !== 0) {
      console.error(`Database error: ${error_code} - ${error_message}`);
      throw new Error(`Database error: ${error_message}`);
    }

    const testId = test_id;

    // Assign random questions using cursor-based stored procedure
    const [assignResult] = await connection.execute(
      "CALL AssignRandomQuestions(?, ?)",
      [testId, numQuestions]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Test created successfully with random questions',
      data: { id: testId, testName, startTime, duration, numberOfQues, eachQuesMarks, totalMarks: numberOfQues * eachQuesMarks }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating test:', err);
    res.status(500).json({ success: false, message: 'Server error while creating test' });
  } finally {
    connection.release();
  }
};

// ✏️ Update test
export const updateTest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { testName, startTime, duration, eachQuesMarks, questions } = req.body;

    // Check if test exists and get current startTime
    const [testRows] = await connection.query('SELECT startTime FROM test WHERE id = ?', [id]);

    if (testRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const currentStartTime = new Date(testRows[0].startTime);
    const now = new Date();

    // Check if test has already started
    if (now >= currentStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update test after it has started'
      });
    }

    await connection.beginTransaction();

    // Get current numberOfQues to maintain consistency
    const [currentTest] = await connection.query('SELECT numberOfQues FROM test WHERE id = ?', [id]);
    const numberOfQues = currentTest[0].numberOfQues;

    // Update test details
    const [result] = await connection.query(
      `SELECT UpdateTest(?, ?, ?, ?, ?) as affectedRows`,
      [testName, startTime, duration, eachQuesMarks, id]
    );

    // Update question answers if provided
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        if (question.id && question.answer) {
          await connection.query(
            'UPDATE question SET answer = ? WHERE id = ?',
            [question.answer, question.id]
          );
        }
      }
    }

    await connection.commit();

    res.json({ success: true, message: 'Test updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating test:', err);
    res.status(500).json({ success: false, message: 'Error updating test' });
  } finally {
    connection.release();
  }
};

// ❌ Delete test
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test exists and get startTime
    const [testRows] = await pool.query('SELECT startTime FROM test WHERE id = ?', [id]);

    if (testRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const startTime = new Date(testRows[0].startTime);
    const now = new Date();

    // Check if test has already started
    if (now >= startTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete test after it has started'
      });
    }

    // Delete test (CASCADE will handle test_has_ques entries)
    const [result] = await pool.query('DELETE FROM test WHERE id=?', [id]);

    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (err) {
    console.error('Error deleting test:', err);
    res.status(500).json({ success: false, message: 'Error deleting test' });
  }
};


// 📘 Validate test timing and start test
export const validateTestStart = async (req, res) => {
  try {
    const { testId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get test details
    const [testRows] = await pool.query('SELECT * FROM test WHERE id = ?', [testId]);

    if (testRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    const test = testRows[0];
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(startTime.getTime() + test.duration * 60000);

    // Check if test is within valid time window
    if (now < startTime) {
      return res.status(400).json({
        success: false,
        message: 'Test has not started yet'
      });
    }

    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: 'Test has ended'
      });
    }

    // Check if user has already submitted for this test
    const [submissionRows] = await pool.query(
      'SELECT * FROM result WHERE userid = ? AND testid = ?',
      [userId, testId]
    );

    if (submissionRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this test'
      });
    }

    res.status(200).json({
      success: true,
      message: 'ok'
    });

  } catch (err) {
    console.error('Error validating test start:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while validating test'
    });
  }
};
