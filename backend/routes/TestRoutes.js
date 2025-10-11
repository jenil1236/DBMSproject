// import express from "express";
// const router = express.Router();

// import { checkValidity, checkSubmit, isAdmin,isAuthenticated } from "../middlewares.js";
// import { showTestForm, createTest, deleteTest, testEditForm, updateTest } from "../controllers/Test.js";

// router.get("/:id/:user_id", isAuthenticated, checkValidity, checkSubmit, attempTest);

// //Show submission page

// //Show Test Form 
// router.get("/new", isAdmin, showTestForm);

// // Create Test Route
// router.post("/questions/new", isAdmin, createTest);

// //Create Ques Route
// // app.post("/test/questions/:id", isAdmin, async (req, res) => {
// //     const { id } = req.params;
// //     const questions = req.body.questions;
// //     const test = await Test.findById(id);
// //     test.questions = questions;
// //     let totalMarks = 0;
// //     for (const question of questions) {
// //         if (question._type === 'SCQ')
// //             totalMarks += 3;
// //         else if (question._type === 'MCQ')
// //             totalMarks += 4;
// //     }
// //     test.totalMarks = totalMarks;
// //     await test.save();
// //     res.redirect("/dashboard");
// // })

// router.delete("/:id", isAdmin, deleteTest);

// //Show Test Edit Form
// router.get("/:id", isAdmin, testEditForm);

// //Update Test
// router.put("/:id", isAdmin, updateTest);// _____________________________________________________________________

// export default router;