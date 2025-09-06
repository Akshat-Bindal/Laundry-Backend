import express from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController.js';

const r = express.Router();

r.post('/register', register);
r.post('/verify-email', verifyEmail);
r.post('/login', login);
r.post('/forgot-password', forgotPassword);
r.post('/reset-password/:token', resetPassword);

export default r;
