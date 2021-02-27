"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../utils/database"));
const utils_1 = require("../utils/utils");
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
class ScheduleController {
    index(req, res) {
        const schedules = database_1.default.get().schedules;
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({
                error: true,
                message: 'Date interval not found'
            });
        }
        const startDate = utils_1.stringToDate(start.toString());
        const endDate = utils_1.stringToDate(end.toString());
        const dates = date_fns_1.eachDayOfInterval({ start: startDate, end: endDate });
        const result = Array();
        for (const date of dates) {
            const dayOfWeek = date.getDay();
            const day = date_fns_1.format(date, 'dd-MM-yyyy');
            const intervals = schedules.filter((schedule) => {
                if (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object') {
                    return schedule.rule.value.includes(dayOfWeek);
                }
                if (schedule.rule.type == 'day') {
                    return schedule.rule.value.toString() == day;
                }
                if (schedule.rule.type == 'daily') {
                    return schedule.intervals;
                }
            }).flatMap((schedule) => schedule.intervals);
            result.push({ day, intervals });
        }
        return res.status(200).json(result);
    }
    indexRule(req, res) {
        const schedules = database_1.default.get().schedules;
        const { type, date } = req.query;
        if (!['daily', 'day', 'weekly'].includes(type.toString())) {
            return res.status(400).json({
                error: true,
                message: 'Invalid rule'
            });
        }
        if (type == 'day' && !date) {
            return res.status(400).json({
                error: true,
                message: 'Date must exist when type is equal day'
            });
        }
        if (type == 'day') {
            const dayOfWeek = utils_1.stringDateToDayOfWeek(date.toString());
            const rulesIntervals = schedules.filter((schedule) => {
                return (schedule.rule.type == 'day' && schedule.rule.value.toString() == date) ||
                    (schedule.rule.type == 'weekly' && typeof schedule.rule.value == 'object' && schedule.rule.value.includes(dayOfWeek)) ||
                    schedule.rule.type == 'daily';
            }).flatMap((schedule) => schedule.intervals);
            return res.status(200).json({
                rule: {
                    type,
                    value: date
                },
                intervals: rulesIntervals
            });
        }
        if (type == 'daily') {
            const rulesIntervals = schedules.filter((schedule) => {
                return schedule.rule.type == 'daily';
            }).flatMap((schedule) => schedule.intervals);
            return res.status(200).json({
                rule: {
                    type
                },
                intervals: rulesIntervals
            });
        }
        if (type == 'weekly') {
            const result = Array();
            const newSchedules = schedules.filter((schedule) => {
                return schedule.rule.type == 'weekly';
            });
            const weekDays = newSchedules.flatMap((schedule) => schedule.rule.value);
            const uniqueWeekDays = [...new Set(weekDays)];
            const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            for (const uniqueWeekDay of uniqueWeekDays) {
                const addSchedule = newSchedules.filter((schedule) => {
                    return typeof schedule.rule.value == 'object' && schedule.rule.value.includes(Number(uniqueWeekDay));
                }).flatMap((schedule) => schedule.intervals);
                result.push({
                    rule: {
                        type,
                        value: week[Number(uniqueWeekDay)]
                    },
                    intervals: addSchedule
                });
            }
            return res.status(200).json(result);
        }
    }
    create(req, res) {
        const schedules = database_1.default.get().schedules;
        const { rule, intervals } = req.body;
        if (!utils_1.validateRule(rule)) {
            return res.status(400).json({
                error: true,
                message: 'Invalid rule'
            });
        }
        if (intervals.length < 1) {
            return res.status(400).json({
                error: true,
                message: 'Intervals must be values'
            });
        }
        for (let interval of intervals) {
            if (!utils_1.validateHour(interval.start) || !utils_1.validateHour(interval.end)) {
                return res.status(400).json({
                    error: true,
                    message: 'Has invalid hour passed'
                });
            }
            if (!utils_1.validateInterval(interval.start, interval.end)) {
                return res.status(400).json({
                    error: true,
                    message: 'Has invalid hour interval'
                });
            }
        }
        if (!utils_1.checkConflict(rule, intervals, schedules)) {
            return res.status(400).json({
                error: true,
                message: 'Has date conflicts'
            });
        }
        const newSchedule = {
            id: uuid_1.v4(),
            rule,
            intervals
        };
        schedules.push(newSchedule);
        if (!database_1.default.update(schedules)) {
            return res.status(500).json({
                error: true,
                message: 'Internal server error'
            });
        }
        return res.status(200).json(newSchedule);
    }
    destroy(req, res) {
        const { id } = req.params;
        const schedules = database_1.default.get().schedules;
        const existSchedule = schedules.find((schedule) => schedule.id == id);
        if (!existSchedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        const saveSchedule = schedules.filter((schedule) => schedule.id != id);
        if (!database_1.default.update(saveSchedule)) {
            return res.status(500).json({
                error: true,
                message: 'Internal server error'
            });
        }
        return res.status(200).json({ success: true });
    }
}
exports.default = new ScheduleController();
