import express from "express";
import pool from "../config/db.js";
// // import xlsx from "xlsx";
// // import schedule from "node-schedule";
// // import { io } from "../app.js";
import { isAuthenticated } from "../middlewares.js";
const router = express.Router();

router.get("/history", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", userId);
        // console.log(req.user);
        
        // 1️ Get all results for this user
        const q1 = `
            SELECT r.id AS resultId, r.testid, r.score, t.testName, t.numberOfQues*t.eachQuesMarks as totalMarks, t.startTime
            FROM result r
            JOIN test t ON r.testid = t.id
            WHERE r.userid = ?
            ORDER BY r.id DESC
        `;
        const [results] = await pool.execute(q1, [userId]);

        const history = [];

        for (const r of results) {
            // 2️ Get all questions for this test, LEFT JOIN with submissions
            const q2 = `
                SELECT 
                    q.id AS questionId, 
                    q.question, 
                    s.selected, 
                    s.status
                FROM test_has_ques thq
                JOIN question q ON thq.questionid = q.id
                LEFT JOIN submission s 
                    ON s.questionid = q.id AND s.resultid = ?
                WHERE thq.testid = ?
                ORDER BY q.id
            `;
            const [subs] = await pool.execute(q2, [r.resultId, r.testid]);

            history.push({
                resultId: r.resultId,
                testId: r.testid,
                testName: r.testName,
                totalMarks: r.totalMarks,
                score: r.score,
                startTime: r.startTime,
                submissions: subs
            });
        }

        res.status(200).json({ history });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



// router.get('/branchTests', isAdmin, async (req, res) => {
//     const { branch_name } = req.query;
//     const allTests = await Test.find({ branch: branch_name });
//     res.send(allTests);
// })

// router.get("/core", isAuthenticated, async (req, res) => {
//     let branch = req.user.branch;
//     let allTests = await Test.find({ branch: branch });
//     allTests.reverse();
//     allTests.forEach((test) => {
//         if (!scheduledJobs.has(test._id.toString())) {
//             const runAt = new Date(test.startTime);
//             schedule.scheduleJob(runAt, () => {
//                 io.emit("task-complete", {
//                     message: `You can start "${test.testName}"`,
//                     id: test._id
//                 });
//             });
//             scheduledJobs.add(test._id.toString()); // mark as scheduled
//         }
//     });
//     // console.log(req.user);
//     res.render("user/core.ejs", { allTests, user: req.user, page: "home" });
// });

// //Show test 

// // router.post("/upload", isAdmin, upload.single("file"), async (req, res) => {
// //     try {
// //         if (!req.file) {
// //             return res.status(400).json({ error: "No file uploaded" });
// //         }

// //         const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
// //         const sheetName = workbook.SheetNames[0];
// //         const sheet = workbook.Sheets[sheetName];

// //         const branch = req.body.branch;

// //         const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
// //         rows.shift(); // remove header row

// //         const questions = [];
// //         const errors = [];
// //         let existingQuestions = [];

// //         // const existingQuestions = await Question.find();
// //         switch (branch) {
// //             case 'lr':
// //                 existingQuestions = await Question.find();
// //                 break;

// //             case 'ai':
// //                 existingQuestions = await AiDepartment.find();
// //                 break;

// //             case 'che':
// //                 existingQuestions = await ChemicalDepartment.find();
// //                 break;

// //             case 'chm':
// //                 existingQuestions = await ChemistryDepartment.find();
// //                 break;

// //             case 'ce':
// //                 existingQuestions = await CivilDepartment.find();
// //                 break;

// //             case 'cse':
// //                 existingQuestions = await ComputerScienceDepartment.find();
// //                 break;

// //             case 'ee':
// //                 existingQuestions = await ElectricalDepartment.find();
// //                 break;

// //             case 'ece':
// //                 existingQuestions = await ElectronicsCommunicationDepartment.find();
// //                 break;

// //             case 'hss':
// //                 existingQuestions = await HumanitiesSocialSciencesDepartment.find();
// //                 break;

// //             case 'ms':
// //                 existingQuestions = await ManagementStudiesDepartment.find();
// //                 break;

// //             case 'math':
// //                 existingQuestions = await MathematicsDepartment.find();
// //                 break;

// //             case 'me':
// //                 existingQuestions = await MechanicalDepartment.find();
// //                 break;

// //             case 'phy':
// //                 existingQuestions = await PhysicsDepartment.find();
// //                 break;

// //             default:
// //                 existingQuestions = [];
// //                 break;
// //         }

// //         rows.forEach((row, index) => {
// //             // Skip completely empty rows
// //             if (!row || row.length === 0) return;

// //             // Must have 7 columns
// //             if (row.length < 7) {
// //                 errors.push(`Row ${index + 2} has missing columns`);
// //                 return;
// //             }

// //             const [_type, question, option1, option2, option3, option4, answer] = row;
// //             const normalizedType = _type.trim().toUpperCase();
// //             // Validate _type
// //             if (!_type || !["SCQ", "MCQ"].includes(normalizedType)) {
// //                 errors.push(`Row ${index + 2}: Invalid _type '${_type}'`);
// //                 return;
// //             }

// //             // Validate required fields
// //             if (!question || !answer) {
// //                 errors.push(`Row ${index + 2}: Missing question or answer`);
// //                 return;
// //             }

// //             // Push valid question
// //             const isExisting = existingQuestions.find(e => e.question === question);
// //             if (!isExisting) {
// //                 questions.push({
// //                     _type: normalizedType,
// //                     question,
// //                     option1: option1 || "",
// //                     option2: option2 || "",
// //                     option3: option3 || "",
// //                     option4: option4 || "",
// //                     answer,
// //                 });
// //             }
// //         });

// //         // Insert only valid questions
// //         if (questions.length > 0) {
// //             switch (branch) {
// //                 case 'lr':
// //                     await Question.insertMany(questions);
// //                     break;

// //                 case 'ai':
// //                     await AiDepartment.insertMany(questions);
// //                     break;

// //                 case 'che':
// //                     await ChemicalDepartment.insertMany(questions);
// //                     break;

// //                 case 'chm':
// //                     await ChemistryDepartment.insertMany(questions);
// //                     break;

// //                 case 'ce':
// //                     await CivilDepartment.insertMany(questions);
// //                     break;

// //                 case 'cse':
// //                     await ComputerScienceDepartment.insertMany(questions);
// //                     break;

// //                 case 'ee':
// //                     await ElectricalDepartment.insertMany(questions);
// //                     break;

// //                 case 'ece':
// //                     await ElectronicsCommunicationDepartment.insertMany(questions);
// //                     break;

// //                 case 'hss':
// //                     await HumanitiesSocialSciencesDepartment.insertMany(questions);
// //                     break;

// //                 case 'ms':
// //                     await ManagementStudiesDepartment.insertMany(questions);
// //                     break;

// //                 case 'math':
// //                     await MathematicsDepartment.insertMany(questions);
// //                     break;

// //                 case 'me':
// //                     await MechanicalDepartment.insertMany(questions);
// //                     break;

// //                 case 'phy':
// //                     await PhysicsDepartment.insertMany(questions);
// //                     break;

// //                 default:
// //                     throw new Error("Invalid branch");
// //             }
// //         }

// //         res.render("uploadResult", {
// //             inserted: questions.length,
// //             errors
// //         });

// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ error: "Failed to process file" });
// //     }
// // });

// // router.post("/download", isAdmin, async (req, res) => {
// //     const { test_id, branch_name } = req.body;
// //     if (!test_id) return res.status(400).send("Test ID is required");
// //     const query = {
// //         'submissions.test_id': test_id
// //     }
// //     if (branch_name !== 'lr')
// //         query.branch = branch_name;
// //     const users = await User.find(query).lean();
// //     const test = await Test.findById(test_id).lean();
// //     const testName = test ? `Test Name: ${test.testName}` : "Test Name: Test";

// //     // Prepare data array for xlsx
// //     const data = [
// //         [testName], // Test Name at top
// //         [], // blank row
// //         ['Username', 'Name', 'Branch', 'Year', 'Score'] // headers
// //     ];

// //     // Add each user's data
// //     users.forEach(user => {
// //         const submission = user.submissions.find(sub => sub.test_id.toString() === test_id);
// //         data.push([
// //             user.username,
// //             user.name,
// //             user.branch,
// //             user.year,
// //             submission ? submission.score : 0
// //         ]);
// //     });

// //     // Create worksheet and workbook
// //     const ws = xlsx.utils.aoa_to_sheet(data);
// //     const wb = xlsx.utils.book_new();
// //     xlsx.utils.book_append_sheet(wb, ws, 'Results');

// //     // Write workbook to buffer
// //     const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

// //     // Send as downloadable file
// //     res.setHeader(
// //         'Content-Disposition',
// //         `attachment; filename=${testName}_results.xlsx`
// //     );
// //     res.setHeader(
// //         'Content-Type',
// //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
// //     );
// //     res.send(buf);
// // })

// //Delete Test

// //Show Announcement Form


// router.get("/dashboard", isAdmin, async (req, res) => {
//     let allAnnouncements = await Announcement.find({});
//     allAnnouncements.reverse();
//     let allTests = await Test.find({});
//     allTests.reverse();
//     res.render("dashboard.ejs", { allAnnouncements, allTests });
// });

export default router;