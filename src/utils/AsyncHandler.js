//---------------------------------PROMISE-THEN-----------------------------------

const AsyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));

export default AsyncHandler;

///----------------------------------TRY-CATCH------------------------------------

// const AsyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
