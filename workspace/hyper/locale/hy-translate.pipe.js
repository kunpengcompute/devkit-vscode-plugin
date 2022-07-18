"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyTranslatePipe = void 0;
const core_1 = require("@angular/core");
const hy_locale_1 = require("./hy-locale");
/**
 * @ignore
 */
let HyTranslatePipe = class HyTranslatePipe {
    transform(keyValue, params) {
        return hy_locale_1.HyLocale.translate(keyValue, params);
    }
};
HyTranslatePipe = __decorate([
    (0, core_1.Pipe)({
        name: 'hyTranslate'
    })
], HyTranslatePipe);
exports.HyTranslatePipe = HyTranslatePipe;
//# sourceMappingURL=hy-translate.pipe.js.map