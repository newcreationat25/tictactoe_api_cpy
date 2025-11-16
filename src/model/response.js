"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.reponse = void 0;
class reponse {
    constructor() {
        this.timestamp = new Date(new Date().toISOString());
    }
}
exports.reponse = reponse;
class error {
}
exports.error = error;
