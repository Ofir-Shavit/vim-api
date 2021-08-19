import {Router} from 'express';
import controllers from './controllers';

const router = Router();

router.get('/appointments', controllers.getAppointments);
router.post('/appointments', controllers.setAppointment);

export default router;
