"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringDateToDayOfWeek = exports.stringToDate = exports.checkConflict = exports.validateRule = exports.validateInterval = exports.validateHour = void 0;
const date_fns_1 = require("date-fns");
const validateHour = (hour) => {
    const regex = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
    return regex.test(hour);
};
exports.validateHour = validateHour;
const validateInterval = (start, end) => {
    let now = new Date();
    let startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(start.split(':')[0]), parseInt(start.split(':')[1]));
    let endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(end.split(':')[0]), parseInt(end.split(':')[1]));
    return date_fns_1.differenceInMilliseconds(startDateTime, endDateTime) <= 0;
};
exports.validateInterval = validateInterval;
const validateRule = (rule) => {
    if (!['day', 'daily', 'weekly'].includes(rule.type)) {
        return false;
    }
    if (rule.type == 'day' && typeof rule.value == 'string') {
        if (!date_fns_1.isMatch(rule.value.toString(), 'dd-MM-yyyy')) {
            return false;
        }
        return true;
    }
    if (rule.type == 'daily' && rule.value == null) {
        return true;
    }
    if (rule.type == 'weekly' && typeof rule.value === 'object') {
        if (rule.value.length < 1) {
            return false;
        }
        const invalidWeekDay = rule.value.filter(day => Number(day) > 6);
        if (invalidWeekDay.length > 0) {
            return false;
        }
        return true;
    }
    return false;
};
exports.validateRule = validateRule;
const checkConflict = (rule, intervals, schedules) => {
    if (schedules.length < 1) {
        return true;
    }
    for (const [i, interval] of intervals.entries()) {
        let otherIntervals = intervals.filter((_, index) => {
            return index !== i;
        });
        for (const other of otherIntervals) {
            if (validateTwoInterval(interval, other)) {
                return false;
            }
        }
    }
    const allSchedulesIntervals = schedules.flatMap((schedule) => {
        return schedule.intervals;
    });
    if (rule.type == 'daily') {
        if (!checkSchedulesIntervals(intervals, allSchedulesIntervals)) {
            return false;
        }
    }
    if (rule.type == 'day' && typeof rule.value == 'string') {
        const dayOfWeek = stringDateToDayOfWeek(rule.value.toString());
        const daySchedulesIntervals = schedules.filter((schedule) => {
            return schedule.rule.type == 'day' ||
                schedule.rule.type == 'daily' ||
                (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object' && schedule.rule.value.includes(dayOfWeek));
        }).flatMap(schedule => {
            return schedule.intervals;
        });
        if (!checkSchedulesIntervals(intervals, daySchedulesIntervals)) {
            return false;
        }
    }
    if (rule.type == 'weekly' && typeof rule.value == 'object') {
        const daySchedules = schedules.filter((schedule) => {
            return schedule.rule.type == 'day';
        });
        for (const daySchedule of daySchedules) {
            const dayOfWeek = stringDateToDayOfWeek(daySchedule.rule.value.toString());
            if (rule.value.includes(dayOfWeek) && !checkSchedulesIntervals(intervals, daySchedule.intervals)) {
                return false;
            }
        }
        const dailySchedules = schedules.filter(schedule => {
            return schedule.rule.type == 'daily';
        });
        for (const dailySchedule of dailySchedules) {
            if (!checkSchedulesIntervals(intervals, dailySchedule.intervals)) {
                return false;
            }
        }
        const weeklySchedules = schedules.filter((schedule) => {
            if (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object') {
                const hasWeekday = schedule.rule.value.filter((item) => {
                    return rule.value.includes(item);
                });
                if (hasWeekday.length > 0) {
                    return schedule;
                }
            }
        });
        for (const weeklySchedule of weeklySchedules) {
            if (!checkSchedulesIntervals(intervals, weeklySchedule.intervals)) {
                return false;
            }
        }
    }
    return true;
};
exports.checkConflict = checkConflict;
const stringDateToDayOfWeek = (date) => {
    const arrayDate = date.split('-');
    return new Date(parseInt(arrayDate[2]), parseInt(arrayDate[1]) - 1, parseInt(arrayDate[0])).getDay();
};
exports.stringDateToDayOfWeek = stringDateToDayOfWeek;
const stringToDate = (date) => {
    const arrayDate = date.split('-');
    return new Date(parseInt(arrayDate[2]), parseInt(arrayDate[1]) - 1, parseInt(arrayDate[0]));
};
exports.stringToDate = stringToDate;
const validateTwoInterval = (first, last) => {
    return first.start >= last.start && first.start <= last.end || first.end >= last.start && first.end <= last.end;
};
const checkSchedulesIntervals = (intervals, schedulesIntervals) => {
    for (const interval of intervals) {
        for (const intervalConflict of schedulesIntervals) {
            if (validateTwoInterval(interval, intervalConflict)) {
                return false;
            }
        }
    }
    return true;
};
