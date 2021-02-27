import { differenceInMilliseconds, getDay, isMatch, parse } from 'date-fns'

export interface IRule {
    type: string,
    value: string | Array<number> | null
}

export interface IInterval {
    start: string,
    end: string
}

export interface ISchedule {
    id: string,
    rule: IRule,
    intervals: Array<IInterval>
}

const validateHour = (hour: string): boolean => {
    const regex = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$')
    return regex.test(hour)
}

const validateInterval = (start: string, end: string): boolean => {
    let now = new Date()
    let startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(start.split(':')[0]), parseInt(start.split(':')[1]))
    let endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(end.split(':')[0]), parseInt(end.split(':')[1]))

    return differenceInMilliseconds(startDateTime, endDateTime) <= 0
}

const validateRule = (rule: IRule): boolean => {
    if (!['day', 'daily', 'weekly'].includes(rule.type)) {
        return false
    }

    if (rule.type == 'day' && typeof rule.value == 'string') {
        if (!isMatch(rule.value.toString(), 'dd-MM-yyyy')) {
            return false
        }
        return true
    }

    if (rule.type == 'daily' && rule.value == null) {
        return true
    }

    if (rule.type == 'weekly' && typeof rule.value === 'object') {
        if (rule.value.length < 1) {
            return false
        }

        const invalidWeekDay = rule.value.filter(day => Number(day) > 6)

        if (invalidWeekDay.length > 0) {
            return false
        }
        return true
    }

    return false
}

const checkConflict = (rule: IRule, intervals: Array<IInterval>, schedules: Array<ISchedule>): any => {
    if (schedules.length < 1) {
        return true
    }

    for (const [i, interval] of intervals.entries()) {
        let otherIntervals = intervals.filter((_, index) => {
            return index !== i
        })

        for (const other of otherIntervals) {
            if (validateTwoInterval(interval, other)) {
                return false
            }
        }
    }

    const allSchedulesIntervals = schedules.flatMap((schedule: ISchedule) => {
        return schedule.intervals
    })

    if (rule.type == 'daily') {
        if (!checkSchedulesIntervals(intervals, allSchedulesIntervals)) {
            return false
        }
    }

    if (rule.type == 'day' && typeof rule.value == 'string') {
        const dayOfWeek = stringDateToDayOfWeek(rule.value.toString())

        const daySchedulesIntervals = schedules.filter((schedule: ISchedule) => {
            return schedule.rule.type == 'day' ||
                schedule.rule.type == 'daily' ||
                (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object' && schedule.rule.value.includes(dayOfWeek))
        }).flatMap(schedule => {
            return schedule.intervals
        })

        if (!checkSchedulesIntervals(intervals, daySchedulesIntervals)) {
            return false
        }
    }

    if (rule.type == 'weekly' && typeof rule.value == 'object') {
        const daySchedules = schedules.filter((schedule: ISchedule) => {
            return schedule.rule.type == 'day'
        })

        for (const daySchedule of daySchedules) {
            const dayOfWeek = stringDateToDayOfWeek(daySchedule.rule.value.toString())

            if (rule.value.includes(dayOfWeek) && !checkSchedulesIntervals(intervals, daySchedule.intervals)) {
                return false
            }
        }

        const dailySchedules = schedules.filter(schedule => {
            return schedule.rule.type == 'daily'
        })

        for (const dailySchedule of dailySchedules) {
            if (!checkSchedulesIntervals(intervals, dailySchedule.intervals)) {
                return false
            }
        }

        const weeklySchedules = schedules.filter((schedule: ISchedule) => {
            if (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object') {
                const hasWeekday = schedule.rule.value.filter((item: never) => {
                    return rule.value.includes(item)
                })

                if (hasWeekday.length > 0) {
                    return schedule
                }
            }
        })

        for (const weeklySchedule of weeklySchedules) {
            if (!checkSchedulesIntervals(intervals, weeklySchedule.intervals)) {
                return false
            }
        }
    }

    return true
}

const stringDateToDayOfWeek = (date: string): number => {
    const arrayDate = date.split('-')
    return new Date(parseInt(arrayDate[2]), parseInt(arrayDate[1]) - 1, parseInt(arrayDate[0])).getDay()
}

const stringToDate = (date: string): Date => {
    const arrayDate = date.split('-')
    return new Date(parseInt(arrayDate[2]), parseInt(arrayDate[1]) - 1, parseInt(arrayDate[0]))
}

const validateTwoInterval = (first: any, last: any): boolean => {
    return first.start >= last.start && first.start <= last.end || first.end >= last.start && first.end <= last.end
}

const checkSchedulesIntervals = (intervals: Array<IInterval>, schedulesIntervals: Array<IInterval>): boolean => {
    for (const interval of intervals) {
        for (const intervalConflict of schedulesIntervals) {
            if (validateTwoInterval(interval, intervalConflict)) {
                return false
            }
        }
    }
    return true
}

export {
    validateHour,
    validateInterval,
    validateRule,
    checkConflict,
    stringToDate,
    stringDateToDayOfWeek
}