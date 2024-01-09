import {Router} from 'express';
import {
    getAllUsers,
    getUser,
    registerUser,
    updateAddress,
} from '../controllers/user.controller.js';

const router = Router();


// Get all user route
router.route('/').get(getAllUsers);

// Get user route
router.route('/:id').get(getUser);

// Register user route
router.route('/register').post(registerUser);

// Update address route
router.route('/:userId/addresses/:addressId').put(updateAddress);



export default router;