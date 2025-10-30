// middleware.js
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()){ 
    return next();
  }
  res.status(401).send({ error: "Unauthorized" });
}

// export const checkSubmit = async (req, res, next) => {
//     const id = req.user._id;
//     const user = await User.findById(id);
//     const testId = req.params.id;
//     if (user) {
//         const check = user.submissions.find(s => s.test_id.equals(testId));
//         if (check) {
//             req.flash('error', 'Test already submitted!!');
//             return res.redirect('/');
//         }
//     }
//     else
//         return res.redirect('/');
//     next();
// }

export const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.adminUserName) {
        return next();
    }
    res.status(403).json({ error: "Admin access required" });
}

// export const checkValidity = async (req, res, next) => {
//     let { id } = req.params;
//     let test = await Test.findById(id);
//     let currentTime = new Date(
//         new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//     );
//     let { startTime, endTime } = test;
//     if (currentTime < startTime) {
//         // console.log(currentTime, startTime, endTime); 
//         req.flash("error", "The test cannot be started!");
//         return res.redirect("/");
//     }
//     else if (currentTime > endTime) {
//         req.flash("error", "The test is completed!");
//         return res.redirect("/");
//     }
//     else {
//         next();
//     }
// }
