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

    const totalMarks = numberOfQues * eachQuesMarks;

    // Insert test
    const [result] = await connection.query(
      `INSERT INTO test (testName, startTime, duration, numberOfQues, eachQuesMarks, totalMarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [testName, startTime, duration, numberOfQues, eachQuesMarks, totalMarks]
    );

    const testId = result.insertId;

    // Get random questions
    const [randomQuestions] = await connection.query(
      'SELECT id FROM question ORDER BY RAND() LIMIT ?',
      [numQuestions]
    );

    // Insert test-question associations
    for (const question of randomQuestions) {
      await connection.query(
        'INSERT INTO test_has_ques (testid, questionid) VALUES (?, ?)',
        [testId, question.id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Test created successfully with random questions',
      data: { id: testId, testName, startTime, duration, numberOfQues, eachQuesMarks, totalMarks }
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
    const totalMarks = numberOfQues * eachQuesMarks;

    // Update test details
    const [result] = await connection.query(
      `UPDATE test SET testName=?, startTime=?, duration=?, eachQuesMarks=?, totalMarks=? WHERE id=?`,
      [testName, startTime, duration, eachQuesMarks, totalMarks, id]
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


// export const getAllTests = async (req, res) => {
//   try {
//     console.log("getAllTests")
//     const [rows] = await pool.query(
//       `SELECT 
//         id,
//         testName,
//         startTime,
//         duration,
//         numberOfQues,
//         eachQuesMarks,
//         totalMarks,
//         TIMESTAMPDIFF(MINUTE, NOW(), startTime) as minutesUntilStart,
//         CASE 
//           WHEN NOW() < startTime THEN 'upcoming'
//           WHEN NOW() BETWEEN startTime AND DATE_ADD(startTime, INTERVAL duration MINUTE) THEN 'active'
//           ELSE 'completed'
//         END as status
//       FROM test 
//       ORDER BY startTime DESC`
//     );
//     console.log("getallTests",rows)
//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows
//     });
//   } catch (err) {
//     console.error('Error fetching tests:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error while fetching tests'
//     });
//   }
// };

// // POST /api/tests/give
// export const startTest = async (req, res) => {
//   try {
//     const { userId, testId } = req.body;
    
//     // Check if test exists and is accessible
//     const [testRows] = await pool.query(
//       'SELECT * FROM test WHERE id = ?',
//       [testId]
//     );

//     if (testRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Test not found'
//       });
//     }

//     const test = testRows[0];
//     const now = new Date();
//     const startTime = new Date(test.startTime);
    
//     // Check if test has started
//     if (now < startTime) {
//       return res.status(400).json({
//         success: false,
//         message: 'Test has not started yet'
//       });
//     }

//     // Check if test is still active
//     const endTime = new Date(startTime.getTime() + test.duration * 60000);
//     if (now > endTime) {
//       return res.status(400).json({
//         success: false,
//         message: 'Test has ended'
//       });
//     }

//     // Check if user has already attempted the test
//     const [attemptRows] = await pool.query(
//       'SELECT * FROM test_attempts WHERE user_id = ? AND test_id = ?',
//       [userId, testId]
//     );

//     if (attemptRows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already attempted this test'
//       });
//     }

//     // Return success with test details
//     res.status(200).json({
//       success: true,
//       message: 'Test can be started',
//       data: {
//         testId: test.id,
//         testName: test.testName,
//         duration: test.duration,
//         totalQuestions: test.numberOfQues,
//         totalMarks: test.totalMarks
//       }
//     });

//   } catch (err) {
//     console.error('Error starting test:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error while starting test'
//     });
//   }
// };
