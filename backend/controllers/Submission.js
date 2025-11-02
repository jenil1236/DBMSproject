import pool from "../config/db.js";

// export const getSubmission = async (req, res) => {

//     const {id: testId} = req.params;
    
//     const userId = req.user.id;
//     const q = 'SELECT selected, question, answer,status, option1, option2, option3, option4 FROM submission JOIN result ON result.id = submission.resultid JOIN question ON question.id = submission.questionid WHERE result.testid = ? AND result.userid = ?';
//     const values = [testId, userId];
//     const [rows] = await pool.execute(q, values);
//     const q1 = 'SELECT * FROM test WHERE id = ?';
//     const [testRow] = await pool.execute(q1, [testId]);
//     // if (rows.length === 0) {
//     //     return res.status(404).json({ message: 'No submissions found' });
//     // }
//     // if (testRow.length === 0) {
//     //     return res.status(404).json({ message: 'Test not found' });
//     // }
//     res.status(200).json({ submissions: rows, test: testRow[0] });
// }

export const getSubmission = async (req, res) => {
  const { id: testId } = req.params;
  const userId = req.user.id;

  const q = `
    SELECT 
      q.id AS questionId,
      q.question,
      q.option1, q.option2, q.option3, q.option4,
      q.answer,
      s.selected,
      s.status
    FROM test_has_ques thq
    JOIN question q ON q.id = thq.questionid
    LEFT JOIN result r ON r.testid = thq.testid AND r.userid = ?
    LEFT JOIN submission s ON s.resultid = r.id AND s.questionid = q.id
    WHERE thq.testid = ?;
  `;
  const [rows] = await pool.execute(q, [userId, testId]);

  const [testRow] = await pool.execute("SELECT * FROM test WHERE id = ?", [testId]);
  
  res.status(200).json({ submissions: rows, test: testRow[0] });
};


export const postSubmission = async (req, res) => {
    try {
        const { submissions } = req.body;
        const testId = req.params.id;
        const userId = req.user.id;
        
        // Call the cursor-based stored procedure
        const [result] = await pool.execute(
            "CALL ProcessTestSubmissions(?, ?, ?, @result_id)",
            [userId, testId, JSON.stringify(submissions)]
        );
        
        // Get the result ID
        const [outputs] = await pool.execute("SELECT @result_id as result_id");
        const resultId = outputs[0].result_id;
        
        res.json({ 
            message: 'Submission Successful',
            resultId: resultId
        });
    } catch (err) {
        console.error('Error processing submission:', err);
        res.status(500).json({ error: 'Error processing submission' });
    }
}
