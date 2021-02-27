"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
describe("Validate Hour", () => {
    it("Validation hour. Accept hour in format HH:MM (24hrs)", () => {
        expect(utils_1.validateHour('18:00')).toBe(true);
        expect(utils_1.validateHour('1:00')).toBe(true);
        expect(utils_1.validateHour('26:00')).toBe(false);
    });
    it("Validation interval of hour. Accept hour in format HH:MM (24hrs)", () => {
        expect(utils_1.validateInterval('08:00', '09:00')).toBe(true);
        expect(utils_1.validateInterval('17:00', '13:00')).toBe(false);
    });
});
describe("Capture Day of Week", () => {
    it("Convert string to date and return day of week (Sunday = 0, Monday = 1...)", () => {
        expect(utils_1.stringDateToDayOfWeek('01-01-2021')).toEqual(5);
        expect(utils_1.stringDateToDayOfWeek('15-03-2021')).toEqual(1);
    });
});
describe("Capture String to Date", () => {
    it("Convert string to date. Accept format (DD-MM-YYYY). Return date of type Date", () => {
        expect(utils_1.stringToDate('01-01-2021')).toBeInstanceOf(Date);
    });
});
