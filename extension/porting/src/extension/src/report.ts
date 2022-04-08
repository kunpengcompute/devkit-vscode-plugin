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

import { I18nService } from './i18nservice';

export class Report {
    // 国际化实例
    protected i18n = I18nService.I18n();

    protected portingResult: any;
    protected cmakeNeedTrans = 0;
    protected asNeedTrans = 0;
    protected asmFileLines = 0;
    protected asmlines = 0;
    protected makefileNeedTrans = 0;
    protected automakeNeedTrans = 0;
    protected makefileLines = 0;
    protected soFilesNeed = 0;  // 待验证替换
    protected cLines = 0;
    protected scanItems = ['soFile', 'cFile', 'lines'];
    protected soFilesTotal = 0;
    protected totalLine = 0;
    protected binDetailSrcData: Array<any> = [];
    protected extensionPath = '';

    protected scanItemsObj: any = {
        soFile: {
            label: '',
            icon: './src/extension/assets/report/file.png',
            content: ``,
            files: [],
            hasDetail: false,
            isOpen: false
        },
        cFile: {
            label: '',
            icon: './src/extension/assets/report/source.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: false
        },
        lines: {
            label: '',
            icon: './src/extension/assets/report/trans.png',
            content: '',
            hasDetail: false,
            isOpen: false
        }
    };

    /**
     *  获取每个级别的建议
     * @param level 扫描结果的七个级别
     * @param flag 是否需要国际化标识
     */
    protected formatSoFileSuggestion(item: any) {
        let suggestion = '';
        const level = item.level;
        const url = item.url;
        switch (level) {
            case '0':
                suggestion = this.i18n.plugins_dep_message_level0Desc;
                suggestion = url ? suggestion : this.i18n.plugins_dep_message_reportLevel01NotUrlDesc;
                break;
            case '1':
                suggestion = this.i18n.plugins_dep_message_level1Desc;
                suggestion = url ? suggestion : this.i18n.plugins_dep_message_reportLevel01NotUrlDesc;
                break;
            case '2':
                suggestion = this.i18n.plugins_dep_message_level2Desc;
                break;
            case '3':
                suggestion = this.i18n.plugins_dep_message_level3Desc;
                suggestion = url ? suggestion : this.i18n.plugins_dep_message_reportLevel34NotUrlDesc;
                break;
            case '4':
                suggestion = this.i18n.plugins_dep_message_level4Desc;
                suggestion = url ? suggestion : this.i18n.plugins_dep_message_reportLevel34NotUrlDesc;
                break;
            case '5':
                suggestion = this.i18n.plugins_dep_message_level5Desc;
                break;
            case '6':
                suggestion = this.i18n.plugins_dep_message_level6Desc;
                suggestion = url ? suggestion : this.i18n.plugins_dep_message_reportLevel6NotUrlDesc;
                break;
            default:
                break;
        }
        return suggestion;
    }
    protected formatSoSuggestion(level: string, flag: boolean): string {
        let suggestion = '';
        switch (level) {
            case '0':
                const level0En =
                    'so libraries have been verified on the Kunpeng platform, the Kunpeng community has an arm64 version, \
                    the URL is the download address (binary package).';
                suggestion = flag ? this.i18n.common_term_report_level0_desc : level0En;
                break;
            case '1':
                const level1En =
                    'so libraries have been verified on the Kunpeng platform, the Kunpeng community has an arm64 version, \
                    the URL is the source address, user need to compile on the platform.';
                suggestion = flag ? this.i18n.common_term_report_level1_desc : level1En;
                break;
            case '2':
                const level2En = 'so libraries cannot be supported on the Kunpeng platform, and the Kunpeng community has no alternative.';
                suggestion = flag ? this.i18n.common_term_report_level2_desc : level2En;
                break;
            case '3':
                const level3En = 'so libraries are not recognized on the Kunpeng platform.';
                suggestion = flag ? this.i18n.common_term_report_level3_desc : level3En;
                break;
                case '4':
                const LEVEL4_EN =
                    'software are compatible with Kunpeng platform, and the URL is the source address. ' +
                    'You need to complie on the platform.';
                suggestion = flag ? this.i18n.plugins_port_report_level4_desc : LEVEL4_EN;
                break;
            case '5':
                const LEVEL5_EN = 'components are not compatible with Kunpeng platform.';
                suggestion = flag ? this.i18n.plugins_port_report_level5_desc : LEVEL5_EN;
                break;
            case '6':
                const LEVEL6_EN =
                    ' JAR package already has a compatible version on the Kunpeng platform. ' +
                    'The URL is the download address of the JAR package.';
                suggestion = flag ? this.i18n.plugins_port_report_level6_desc : LEVEL6_EN;
                break;
            default:
                break;
        }
        return suggestion;
    }

    /**
     * 映射依赖库文件类型
     * @param fielType 依赖库文件类型
     */
    protected formatSoFileType(fielType: any) {
        let typeName = '--';
        switch (fielType) {
            case 'DYNAMIC_LIBRARY':
                typeName = this.i18n.plugins_dep_option_soFileType_dynamic_library;
                break;
            case 'STATIC_LIBRARY':
                typeName = this.i18n.plugins_dep_option_soFileType_static_library;
                break;
            case 'EXEC':
                typeName = this.i18n.plugins_dep_option_soFileType_executable_file;
                break;
            case 'SOFTWARE':
                typeName = this.i18n.plugins_dep_option_soFileType_software_package;
                break;
            case 'JAR':
                typeName = this.i18n.plugins_dep_option_soFileType_jar_packagey;
                break;
            default:
                break;
        }
        return typeName;
    }

    /**
     * 对分析结果进行处理
     * @param level 类型
     */
    formatSoResult(level: any) {
        let result = '';
        switch (level) {
            case '0':
                result = this.i18n.plugins_port_report_level0_result; // 动态库也需要维护一个format
                break;
            case '1':
                result = this.i18n.plugins_port_report_level1_result;
                break;
            case '2':
                result = this.i18n.plugins_port_report_level2_result;
                break;
            case '3':
                result = this.i18n.plugins_port_report_level3_result;
                break;
            case '4':
                result = this.i18n.plugins_port_report_level4_result;
                break;
            case '5':
                result = this.i18n.plugins_port_report_level5_result;
                break;
            case '6':
                result = this.i18n.plugins_port_report_level6_result;
                break;
            default:
                break;
        }
        return result;
    }
}
