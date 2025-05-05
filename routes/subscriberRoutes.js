import express from 'express';
import { addSubscriber } from '../controllers/subscriberController.js';

const subscriberRouter = express.Router();

subscriberRouter.post('/add_subscriber', addSubscriber);

export default subscriberRouter;