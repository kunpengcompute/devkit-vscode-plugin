"use strict";
/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyGlobalLocale = exports.HyLocaleModule = exports.HyTranslatePipe = exports.en_US = exports.zh_CN = exports.HyLocaleLangs = exports.HyLocale = void 0;
var hy_locale_1 = require("./hy-locale");
Object.defineProperty(exports, "HyLocale", { enumerable: true, get: function () { return hy_locale_1.HyLocale; } });
var hy_locale_langs_enum_1 = require("./hy-locale-langs.enum");
Object.defineProperty(exports, "HyLocaleLangs", { enumerable: true, get: function () { return hy_locale_langs_enum_1.HyLocaleLangs; } });
var zh_CN_1 = require("./i18n/zh_CN");
Object.defineProperty(exports, "zh_CN", { enumerable: true, get: function () { return zh_CN_1.zh_CN; } });
var en_US_1 = require("./i18n/en_US");
Object.defineProperty(exports, "en_US", { enumerable: true, get: function () { return en_US_1.en_US; } });
var hy_translate_pipe_1 = require("./hy-translate.pipe");
Object.defineProperty(exports, "HyTranslatePipe", { enumerable: true, get: function () { return hy_translate_pipe_1.HyTranslatePipe; } });
var hy_locale_module_1 = require("./hy-locale.module");
Object.defineProperty(exports, "HyLocaleModule", { enumerable: true, get: function () { return hy_locale_module_1.HyLocaleModule; } });
var hy_global_locale_1 = require("./hy-global-locale");
Object.defineProperty(exports, "HyGlobalLocale", { enumerable: true, get: function () { return hy_global_locale_1.HyGlobalLocale; } });
//# sourceMappingURL=index.js.map