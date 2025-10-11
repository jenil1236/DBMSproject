import pool from "../config/db.js";

export const getSubmission = async (req, res) => {
    // console.log('called get');
    const testId = req.params.id;
    const test = await Test.findById(testId).populate('questions');
    const user = await User.findById(req.user._id);
    const submission = user.submissions.find(s => s.test_id.equals(testId));
    // console.log(submission);
    res.render("submission", { test, submission, page: "submission" });
}

export const postSubmission = async (req, res) => {
    // const { submissions, questions } = req.body; // Array from frontend
    const { submissions } = req.body; // Array from frontend
    // console.log(submissions);

    const testId = req.params.id;
    // console.log(testId);

    const id = req.user._id;
    // 1. Transform submissions into the correct schema format
    const formattedSubmissions = submissions.map(sub => ({
        answer: sub.answer || "",
        question: sub.question,
        isMarked: sub.isMarked || false
    }));

    formattedSubmissions.sort((a, b) => a.question.toString().localeCompare(b.question.toString()));

    // 2. Find the user first (to avoid overwriting existing submissions)
    const user = await User.findById(id);

    if (!user) {
        return res.status(404).send("User not found");
    }
    user.submissions.push({
        test_id: testId,
        submittedAns: formattedSubmissions
    });        // 3. Check if the user already submitted this test

    // 4. Save the updated user
    await user.save();

    const submission = user.submissions.find(s => s.test_id.equals(testId));
    if (!submission)
        return res.status(404).send("Submission not found");
    const test = await Test.findOne({ _id: testId }).populate("questions");
    const answers = submission.submittedAns;
    const questions = test.questions;
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (questions[i]._type === "SCQ") {
            if (questions[i].answer === answers[i].answer) {
                score += 3;
                answers[i].score = 3;
            }
        }
        else if (questions[i]._type === "MCQ" && answers[i].answer.length > 0) {
            const correctAns = questions[i].answer;
            const givenAns = answers[i].answer;
            let count = 0;
            let falseAns = false;
            for (const a of givenAns) {
                if (correctAns.indexOf(a) === -1) {
                    // score -= 2;
                    answers[i].score = 0;
                    falseAns = true;
                    break;
                }
                else count++;
            }
            if (!falseAns && count === correctAns.length) {
                score += 4;
                answers[i].score = 4;
            }
            else if (!falseAns) {
                score += count;
                answers[i].score = count;
            }
        }
    }
    submission.score = score;
    submission.questions = questions;
    await user.save();
    res.redirect(`/submission/${testId}`);
}

