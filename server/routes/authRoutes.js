const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticatetoken');
const authenticateWorkerToken = require('../middleware/authenticateWorkerToken');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/getuser', authController.getUser);
router.post('/logout', authController.logOut);
router.post('/register-worker', authenticateToken, authController.registerWorker);
router.post('/get-workers', authenticateToken, authController.getWorkers);
router.post('/worker-login', authController.workerLogin);
router.post('/worker-logout', authController.workerLogout);
router.post('/worker-sunbeds', authenticateWorkerToken, authController.workerSunbeds);
router.post('/get-worker',authenticateToken, authController.getWorker);


router.put(
  "/update-worker/:id",
  authenticateToken,
  authController.updateWorker
);
router.delete(
  "/delete-worker/:id",
  authenticateToken,
  authController.deleteWorker
);


module.exports = router;
