import ScheduleController from './controllers/ScheduleController'
import { Router } from 'express'

const router = Router()

router.get('/schedule', ScheduleController.index)
router.get('/schedule/rule', ScheduleController.indexRule)
router.post('/schedule/create', ScheduleController.create)
router.delete('/schedule/:id', ScheduleController.destroy)

export default router