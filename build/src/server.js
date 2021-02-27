"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./utils/database"));
const routes_1 = __importDefault(require("./routes"));
database_1.default.init();
const app = express_1.default();
app.use(express_1.default.json());
app.use(routes_1.default);
app.listen(3333, () => console.log('Server Started'));
