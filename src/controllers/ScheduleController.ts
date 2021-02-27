import { Request, Response } from "express";
import database from "../utils/database";
import {
    checkConflict,
    stringToDate,
    validateHour,
    validateInterval,
    validateRule,
    stringDateToDayOfWeek,
    ISchedule,
    IInterval,
    IRule
} from '../utils/utils'
import { v4 as uuid } from 'uuid'
import { eachDayOfInterval, format } from 'date-fns'

class ScheduleController {
    index(req: Request, res: Response) {
        const schedules = database.get().schedules

        const { start, end } = req.query

        if (!start || !end) {
            return res.status(200).json(schedules)
        }

        const startDate = stringToDate(start.toString())
        const endDate = stringToDate(end.toString())
        const dates = eachDayOfInterval({ start: startDate, end: endDate })

        const result = Array()

        for (const date of dates) {
            const dayOfWeek = date.getDay()
            const day = format(date, 'dd-MM-yyyy')

            const intervals = schedules.filter((schedule: ISchedule) => {
                if (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object') {
                    return schedule.rule.value.includes(dayOfWeek)
                }

                if (schedule.rule.type == 'day') {
                    return schedule.rule.value.toString() == day
                }

                if (schedule.rule.type == 'daily') {
                    return schedule.intervals
                }
            }).flatMap((schedule: ISchedule) => schedule.intervals)

            result.push({ day, intervals })
        }

        return res.status(200).json(result)
    }

    indexRule(req: Request, res: Response) {
        const schedules = database.get().schedules

        const { type, date } = req.query

        if (!['daily', 'day', 'weekly'].includes(type.toString())) {
            return res.status(400).json({
                error: true,
                message: 'Invalid rule'
            })
        }

        if (type == 'day' && !date) {
            return res.status(400).json({
                error: true,
                message: 'Date must exist when type is equal day'
            })
        }

        if (type == 'day') {
            const dayOfWeek = stringDateToDayOfWeek(date.toString())
            const rulesIntervals = schedules.filter((schedule: ISchedule) => {
                return (schedule.rule.type == 'day' && schedule.rule.value.toString() == date) ||
                    (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object' && schedule.rule.value.includes(dayOfWeek)) ||
                    schedule.rule.type == 'daily'
            }).flatMap((schedule: ISchedule) => schedule.intervals)

            return res.status(200).json({
                rule: {
                    type,
                    value: date
                },
                intervals: rulesIntervals
            })
        }

        if (type == 'daily') {
            const rulesIntervals = schedules.filter((schedule: ISchedule) => {
                return schedule.rule.type == 'daily'
            }).flatMap((schedule: ISchedule) => schedule.intervals)

            return res.status(200).json({
                rule: {
                    type
                },
                intervals: rulesIntervals
            })
        }

        if (type == 'weekly') {
            const result = Array()
            const newSchedules = schedules.filter((schedule: ISchedule) => {
                return schedule.rule.type == 'weekly'
            })

            const weekDays = newSchedules.flatMap((schedule: ISchedule) => schedule.rule.value)
            const uniqueWeekDays = [...new Set(weekDays)]
            const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

            for (const uniqueWeekDay of uniqueWeekDays) {
                const addSchedule = newSchedules.filter((schedule: ISchedule) => {
                    return typeof schedule.rule.value == 'object' && schedule.rule.value.includes(Number(uniqueWeekDay))
                }).flatMap((schedule: ISchedule) => schedule.intervals)

                result.push({
                    rule: {
                        type,
                        value: week[Number(uniqueWeekDay)]
                    },
                    intervals: addSchedule
                })
            }


            return res.status(200).json(result)
        }
    }

    create(req: Request, res: Response) {
        const schedules = database.get().schedules

        const { rule, intervals } = req.body

        if (!validateRule(rule)) {
            return res.status(400).json({
                error: true,
                message: 'Invalid rule'
            })
        }

        if (intervals.length < 1) {
            return res.status(400).json({
                error: true,
                message: 'Intervals must be values'
            })
        }

        for (let interval of intervals) {
            if (!validateHour(interval.start) || !validateHour(interval.end)) {
                return res.status(400).json({
                    error: true,
                    message: 'Has invalid hour passed'
                })
            }

            if (!validateInterval(interval.start, interval.end)) {
                return res.status(400).json({
                    error: true,
                    message: 'Has invalid hour interval'
                })
            }
        }

        if (!checkConflict(rule, intervals, schedules)) {
            return res.status(400).json({
                error: true,
                message: 'Has date conflicts'
            })
        }

        const newSchedule = {
            id: uuid(),
            rule,
            intervals
        }

        schedules.push(newSchedule)

        if (!database.update(schedules)) {
            return res.status(500).json({
                error: true,
                message: 'Internal server error'
            })
        }

        return res.status(200).json(newSchedule)
    }

    destroy(req: Request, res: Response) {
        const { id } = req.params

        const schedules = database.get().schedules
        const existSchedule = schedules.find((schedule: ISchedule) => schedule.id == id)

        if (!existSchedule) {
            return res.status(404).json({ message: "Schedule not found" })
        }

        const saveSchedule = schedules.filter((schedule: ISchedule) => schedule.id != id)

        if (!database.update(saveSchedule)) {
            return res.status(500).json({
                error: true,
                message: 'Internal server error'
            })
        }

        return res.status(200).json({ success: true })
    }
}

export default new ScheduleController()