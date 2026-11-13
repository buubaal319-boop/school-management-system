// Lets us write `async` route handlers without try/catch in each one.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
