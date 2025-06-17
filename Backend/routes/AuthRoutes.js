const { Signup, Login } = require("../controllers/AuthControllers");
const router = require("express").Router(); // Create a new router object from Express
const { userVerification } = require("../middlewares/AuthMiddleWare");

router.post("/", userVerification);
router.post("/signup", Signup);
router.post("/login", Login);

module.exports = router;
