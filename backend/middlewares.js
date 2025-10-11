// middleware.js
export default function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    console.log(req.user);
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

// export const isAdmin = (req, res, next) => {
//     if (req.isAdmin)
//         return next();
//     req.flash('error', 'You are not authorized');
//     res.redirect('/');
// }