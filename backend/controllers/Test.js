// export const attempTest = async (req, res) => {
//     try {
//         let { id, user_id } = req.params;

//         // Populate the 'questions' field (which should be an array of ObjectIds)
//         let test = await Test.findById(id).populate("questions");

//         res.render("question.ejs", { test, user_id });
//     } catch (err) {
//         console.error("Error fetching test:", err);
//         res.status(500).send("Internal Server Error");
//     }
// }

// export const showTestForm = (req, res) => {
//     res.render("testForm.ejs");
// }

// export const createTest = async (req, res) => {
//     let { testName, date, time, duration, numberOfQues, branch } = req.body;

//     // Combine into ISO string
//     const isoString = `${date}T${time}:00`;

//     // Convert to Date object (for MongoDB)
//     const startTime = new Date(isoString);
//     const endTime = new Date(isoString);
//     endTime.setMinutes(endTime.getMinutes() + Number(duration));

//     let questions = null;
//     switch (branch) {
//         case 'lr':
//             questions = await Question.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'ai':
//             questions = await AiDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'che':
//             questions = await ChemicalDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'chm':
//             questions = await ChemistryDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'ce':
//             questions = await CivilDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'cse':
//             questions = await ComputerScienceDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'ee':
//             questions = await ElectricalDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'ece':
//             questions = await ElectronicsCommunicationDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'hss':
//             questions = await HumanitiesSocialSciencesDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'ms':
//             questions = await ManagementStudiesDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'math':
//             questions = await MathematicsDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'me':
//             questions = await MechanicalDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         case 'phy':
//             questions = await PhysicsDepartment.aggregate([
//                 { $sample: { size: Number(numberOfQues) } },
//             ]);
//             break;

//         default:
//             questions = [];
//             break;
//     }

//     // console.log(questions);
//     if (questions.length === 0) {
//         req.flash('error', 'Test could not be created!');
//         return res.redirect("/dashboard");
//     }
//     let randomIds = questions.map((q) => q._id.toString());

//     randomIds.sort((a, b) => a.localeCompare(b));

//     let totalMarks = 0;
//     for (const question of questions) {
//         if (question._type === 'SCQ')
//             totalMarks += 3;
//         else if (question._type === 'MCQ')
//             totalMarks += 4;
//     }
//     // console.log('totalmarks', totalMarks);
//     const branchToModel = {
//         lr: 'Question', // assuming LogicalReasoning uses Question model
//         ai: 'AiDepartment',
//         che: 'ChemicalDepartment',
//         chm: 'ChemistryDepartment',
//         ce: 'CivilDepartment',
//         cse: 'ComputerScienceDepartment',
//         ee: 'ElectricalDepartment',
//         ece: 'ElectronicsCommunicationDepartment',
//         hss: 'HumanitiesSocialSciencesDepartment',
//         ms: 'ManagementStudiesDepartment',
//         math: 'MathematicsDepartment',
//         me: 'MechanicalDepartment',
//         phy: 'PhysicsDepartment'
//     };
//     const newTest = new Test({
//         testName, startTime, endTime, duration, numberOfQues, questions: randomIds, branch, branchModel: branchToModel[branch]
//     });

//     newTest.totalMarks = totalMarks;


//     await newTest.save()
//         .then((response) => {
//             // const id = response._id;
//             req.flash('success', 'Test generated successfully!');
//             res.redirect("/dashboard");
//         })
//         .catch((err) => console.log(err));
// }

// export const deleteTest = async (req, res) => {
//     let { id } = req.params;
//     const now = new Date(
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//     ); 
//     const test = await Test.findById(id);
//     if(test.startTime > now)
//         await Test.findByIdAndDelete(id);
//     res.redirect("/dashboard");
// }

// export const testEditForm = async (req, res, next) => {
//     let { id } = req.params;
//     let test = await Test.findById(id).populate("questions");
//     // console.log(test);
//     res.render("testEditForm.ejs", { id, test });
// }

// export const updateTest = async (req, res) => {
//     let { id } = req.params;
//     let { date, time, duration, testName, questions: changedQuestions, branch } = req.body;
//     // console.log(req.body);

//     // Combine into ISO string
//     const isoString = `${date}T${time}:00`;

//     // Convert to Date object (for MongoDB)
//     const startTime = new Date(isoString);
//     const endTime = new Date(isoString);
//     endTime.setMinutes(endTime.getMinutes() + Number(duration));

//     // const updatedPromises = changedQuestions.map(q => {
//     //     const { _id, ...rest } = q;
//     //     return Question.findByIdAndUpdate(_id, rest, { new: true });
//     // })

//     const updatedPromises = changedQuestions.map(q => {
//         const { _id, ...rest } = q;

//         switch (branch) {
//             case 'lr':
//                 return Question.findByIdAndUpdate(_id, rest, { new: true });
//             case 'ai':
//                 return AiDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'che':
//                 return ChemicalDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'chm':
//                 return ChemistryDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'ce':
//                 return CivilDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'cse':
//                 return ComputerScienceDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'ee':
//                 return ElectricalDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'ece':
//                 return ElectronicsCommunicationDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'hss':
//                 return HumanitiesSocialSciencesDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'ms':
//                 return ManagementStudiesDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'math':
//                 return MathematicsDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'me':
//                 return MechanicalDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             case 'phy':
//                 return PhysicsDepartment.findByIdAndUpdate(_id, rest, { new: true });
//             default:
//                 throw new Error("Invalid branch");
//         }
//     });
//     await Promise.all(updatedPromises);

//     const test = await Test.findByIdAndUpdate(id, { testName, duration, startTime, endTime }, { new: true }).populate("questions").exec();
//     // console.log(test.questions);
//     const questions = test.questions;
//     let totalMarks = 0;
//     for (const question of questions) {
//         if (question._type === 'SCQ')
//             totalMarks += 3;
//         else if (question._type === 'MCQ')
//             totalMarks += 4;
//     }
//     test.totalMarks = totalMarks;
//     await test.save();

//     const users = await User.find();
//     for (const user of users) {
//         const submission = user.submissions.find(s => s.test_id.equals(id));
//         if (submission) {
//             let score = 0;
//             const answers = submission.submittedAns;
//             for (let i = 0; i < questions.length; i++) {
//                 answers[i].score = 0;
//                 if (questions[i]._type === "SCQ") {
//                     if (questions[i].answer === answers[i].answer) {
//                         score += 3;
//                         answers[i].score = 3;
//                     }
//                 }
//                 else if (questions[i]._type === "MCQ" && answers[i].answer.length > 0) {
//                     const correctAns = questions[i].answer;
//                     const givenAns = answers[i].answer;
//                     let count = 0;
//                     let falseAns = false;
//                     for (const a of givenAns) {
//                         if (correctAns.indexOf(a) === -1) {
//                             // score -= 2;
//                             answers[i].score = 0; // -2
//                             falseAns = true;
//                             break;
//                         }
//                         else count++;
//                     }
//                     if (!falseAns && count === correctAns.length) {
//                         score += 4;
//                         answers[i].score = 4;
//                     }
//                     else if (!falseAns) {
//                         score += count;
//                         answers[i].score = count;
//                     }
//                 }
//             }
//             submission.score = score;
//             user.markModified('submissions');
//             await user.save();
//         }
//     }
//     res.redirect("/dashboard");
// }