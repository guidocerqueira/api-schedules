import { validateHour, validateInterval, stringDateToDayOfWeek, stringToDate } from '../utils/utils'

describe("Validate Hour", () => {
    it("Validation hour. Accept hour in format HH:MM (24hrs)", () => {
        expect(validateHour('18:00')).toBe(true)
        expect(validateHour('1:00')).toBe(true)
        expect(validateHour('26:00')).toBe(false)
    })

    it("Validation interval of hour. Accept hour in format HH:MM (24hrs)", () => {
        expect(validateInterval('08:00', '09:00')).toBe(true)
        expect(validateInterval('17:00', '13:00')).toBe(false)
    })
})

describe("Capture Day of Week", () => {
    it("Convert string to date and return day of week (Sunday = 0, Monday = 1...)", () => {
        expect(stringDateToDayOfWeek('01-01-2021')).toEqual(5)
        expect(stringDateToDayOfWeek('15-03-2021')).toEqual(1)
    })
})

describe("Capture String to Date", () => {
    it("Convert string to date. Accept format (DD-MM-YYYY). Return date of type Date", () => {
        expect(stringToDate('01-01-2021')).toBeInstanceOf(Date)
    })
})