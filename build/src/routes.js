"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduleController_1 = __importDefault(require("./controllers/ScheduleController"));
const express_1 = require("express");
const router = express_1.Router();
router.get('/schedule', ScheduleController_1.default.index);
router.get('/schedule/rule', ScheduleController_1.default.indexRule);
router.post('/schedule/create', ScheduleController_1.default.create);
router.delete('/schedule/:id', ScheduleController_1.default.destroy);
exports.default = router;
