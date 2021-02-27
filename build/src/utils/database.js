"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class database {
    constructor() {
        this.rootDir = path_1.default.resolve('.');
        this.pathDatabase = `${this.rootDir}/database.json`;
    }
    init() {
        try {
            const existDatabase = fs_1.default.existsSync(this.pathDatabase);
            if (!existDatabase) {
                fs_1.default.writeFileSync(this.pathDatabase, '{"schedules": []}');
            }
            return true;
        }
        catch {
            return false;
        }
    }
    get() {
        try {
            const existDatabase = fs_1.default.existsSync(this.pathDatabase);
            if (!existDatabase) {
                fs_1.default.writeFileSync(this.pathDatabase, '{"schedules": []}');
            }
            const fileBuffer = fs_1.default.readFileSync(this.pathDatabase, 'utf-8');
            return JSON.parse(fileBuffer);
        }
        catch {
            return false;
        }
    }
    update(data) {
        try {
            const existDatabase = fs_1.default.existsSync(this.pathDatabase);
            if (!existDatabase) {
                fs_1.default.writeFileSync(this.pathDatabase, '{"schedules": []}');
            }
            const schedules = `{"schedules": ${JSON.stringify(data)}}`;
            fs_1.default.writeFileSync(this.pathDatabase, schedules);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.default = new database();
