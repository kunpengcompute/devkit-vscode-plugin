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

import * as vscode from 'vscode';
import { Utils } from '../utils';
import * as constant from '../constant';
import { I18nService } from '../i18nservice';
import { CodeActionProviders } from './code-action-provider';
import { LOG_LEVEL, LogManager } from '../log-manager';
const fs = require('fs');
const i18n = I18nService.I18n();

// 装饰器样式定义
export const diagnosticCollection = vscode.languages.createDiagnosticCollection('basic-test-problem');
const infoBackground = new vscode.ThemeColor('errorLens.infoBackground');
const infoBackgroundLight = new vscode.ThemeColor('errorLens.infoBackgroundLight');
const infoForeground = new vscode.ThemeColor('errorLens.infoForeground');
const infoForegroundLight = new vscode.ThemeColor('errorLens.infoForegroundLight');
const infoMessageBackground = new vscode.ThemeColor('errorLens.infoMessageBackground');
const autoRepairBackground = new vscode.ThemeColor('errorLens.autoRepairBackground');
const afterProps = {
    fontStyle: 'italic',
    fontWeight: '400',
    textDecoration: `;font-family:huawei sans;font-size:12px;padding:5px;margin-left:15px;border-radius:5px;`,
};
const decorationRenderOptionsInfo = {
    backgroundColor: infoBackground,
    gutterIconSize: '100%',
    after: {
        ...afterProps,
        color: infoForeground,
        backgroundColor: infoMessageBackground,
    },
    isWholeLine: true,
};

const autoRepairDecorationRenderOptionsInfo = {
    backgroundColor: autoRepairBackground,
    isWholeLine: true,
};
const decorationTypeInfo = vscode.window.createTextEditorDecorationType(decorationRenderOptionsInfo);
const autoRepairDecorationTypeInfo =
  vscode.window.createTextEditorDecorationType(autoRepairDecorationRenderOptionsInfo);

// 事件监听器
const onDidListeners: any = [];
let onDidChangeTextDocumentSubscription: any;
let onDidCloseTextDocumentSubscription: any;
let onDidChangeActiveTextEditorSubscription: any;
let onDidOpenTextDocumentSubscription: any;
let onDidSaveTextDocumentSubscription: any;

/**
 * 文本行级内容变化方式
 */
const enum DOCUMENT_LINE_CHANGE_TYPE {
    DELETE_LINE = 1,
    ADD_LINE = 2,
    ADD_LINE_BEFORE_ZERO = 3,
    DELETE_LINE_BEFORE_ZERO = 4
}

// 文本类型过滤
export const fileSelector: any = [];
for (const language of ['plaintext', 'cpp', 'c', 'makefile']) {
    fileSelector.push({ language, scheme: 'file' });
    fileSelector.push({ language, scheme: 'untitled' });
}


export class CodeSuggestViewHandler {
    static context: any;

    // 建议信息
    static suggestions: any = {};
    // 建议信息下标
    static sugsIndex: any = {};
    // 当前存在问题的建议信息下标
    static problematicSugsIndex: any = {};
    // 建议信息队列，用于批量替换时的撤销保存
    static suggestionsQueue: any = {};
    // 行信息信息变化队列，用于批量替换时的撤销保存,存储修改文件且引起行变化时的changeCount
    static rowQueue: any = {};
    // 文本内容改变一次，changeCount递增，撤销则递减
    static changeCount = 0;
    // 撤销信号量，用于与文本内容变动事件同步
    static changeCountFlag = false;
    // 已经进行批量替换确认的文件
    static hasReplaceAllFile: any[] = [];
    // 建议信息
    static originalStartLineTxt: any = {};
    // 文档总行数信息
    static docLineCount: any = {};

    // 已打开的文本信号量
    static activateDocuments: any = {};

    // 全局url配置文件
    static pluginUrlConfig: any = {};

    /**
     * 创建诊断信息集
     * @param fileName 指定的文件
     */
    static async createDiagnosticsAndDecorations(textEditor: vscode.TextEditor,
                                                 document: vscode.TextDocument,
                                                 suggestion: any[]) {
        return new Promise(async (resolve, reject) => {
            if (!document?.fileName || textEditor?.document.fileName !== document?.fileName) {
                reject(false);
                return;
            }

            // 诊断器内容
            const diagnostics: any = [];
            // 问题背景样式内容
            const decorationOptionsInfo: any = [];
            // 按建议修改后的行背景样式内容
            const autoRepairDecorationOptionsInfo: any = [];
            const suggestionDef: any[] = CodeSuggestViewHandler.suggestions[document.fileName];

            // 清空下标信息
            CodeSuggestViewHandler.sugsIndex = {};
            CodeSuggestViewHandler.problematicSugsIndex = {};
            try {
                suggestionDef.forEach((sug, index) => {
                    // 存储下标对应信息
                    CodeSuggestViewHandler.sugsIndex[sug.locbegin] = index;

                    if (sug.suggestiontype === constant.suggestionType.suggestionType2500) {
                        if (sug.strategy.indexOf('in line') !== -1) {
                            sug.strategy =
                                sug.strategy.substring(
                                    0,
                                    sug.strategy.indexOf('in line') + 7
                                ) +
                                ' ' +
                                sug.locend;
                        }
                    }

                    // 检查是否按建议方式进行修改
                    const isAdded = CodeActionProviders.judgeSugIsAddedHandler(
                        textEditor, new vscode.Range(sug.locbegin, 0, sug.locend, 10), sug
                    );

                    // 检查原始问题行是否存在
                    if (sug.suggestiontype === constant.replaceAllSuggestionType.suggestionType1100) {
                        sug.locbegin = 1;
                        sug.locend = 1;

                    }
                    let originalStartLine = Utils.strAStartWithStrB(textEditor.document.lineAt(sug.locbegin - 1).text,
                        sug.originalStartLine.text);
                    originalStartLine =
                      originalStartLine
                      && Utils
                        .strAStartWithStrB(textEditor.document.lineAt(sug.locend - 1).text, sug.originalEndLine.text);
                    // 属于合法类型，且原问题行内容存在，且未按建议方式进行修改
                    if (constant.suggestionType['suggestionType' + sug.suggestiontype]
                      && !isAdded && originalStartLine) {
                        sug.changeRange = null;

                        // 设置诊断信息
                        CodeSuggestViewHandler.setDiagnostics(textEditor, diagnostics, sug);

                        // 设置问题提示背景信息
                        CodeSuggestViewHandler.setDecorations(textEditor, decorationOptionsInfo, sug);

                        // 更新存在问题的建议信息下标
                        CodeSuggestViewHandler.problematicSugsIndex[sug.locbegin] = index;
                    }

                    // 设置按建议修改后的行背景样式
                    if ((isAdded || !originalStartLine) && sug.changeRange) {
                        try {
                            CodeSuggestViewHandler
                              .setAddedRangeDecorations(textEditor, autoRepairDecorationOptionsInfo, sug);
                        } catch (error) {
                        }
                    }
                });

                diagnosticCollection.set(document.uri, diagnostics);
                vscode.window.activeTextEditor?.setDecorations(decorationTypeInfo, decorationOptionsInfo);
                vscode.window.activeTextEditor
                  ?.setDecorations(autoRepairDecorationTypeInfo, autoRepairDecorationOptionsInfo);
            } catch (error) {
            }

            resolve(diagnostics);
        });
    }

    /**
     * 设置单个诊断信息
     * @param diagnostics 单个诊断信息
     * @param sug 单个建议
     */
    private static setDiagnostics(textEditor: vscode.TextEditor, diagnostics: any, sug: any) {
        diagnostics.push({
            message: (sug.suggestiontype === constant.suggestionType.suggestionType1996
                ? ''
                : ('Description: ' + sug.description + '\n')) + 'Suggestion: ' + sug.strategy,
            range: CodeSuggestViewHandler.positKeyProblemLocation(textEditor, sug),
            severity: vscode.DiagnosticSeverity.Warning,
            source: '',
            tags: vscode.DiagnosticTag.Deprecated,
            suggestiontype: sug.suggestiontype,
            quickfix: sug.quickfix
        });
    }

    /**
     * 设置单行问题提示背景信息
     * @param decorationOptionsInfo 问题背景样式内容
     * @param sug 单个建议
     */
    private static setDecorations(textEditor: vscode.TextEditor, decorationOptionsInfo: any, sug: any) {
        const decInstanceRenderOptions = CodeSuggestViewHandler.getDecInstanceRenderOptions();
        decInstanceRenderOptions.after.contentText = sug.description;
        const diagnosticDecorationOptions: any = {
            range: CodeSuggestViewHandler.positKeyProblemLocation(textEditor, sug),
            renderOptions: decInstanceRenderOptions,
        };
        decorationOptionsInfo.push(diagnosticDecorationOptions);

    }

    /**
     * 设置按建议修改后的行背景样式
     * @param autoRepairDecorationOptionsInfo 按建议修改后的行背景样式内容
     * @param sug 建议
     */
    private static setAddedRangeDecorations(textEditor: vscode.TextEditor,
                                            autoRepairDecorationOptionsInfo: any, sug: any) {
        const decInstanceRenderOptions = CodeSuggestViewHandler.getDecInstanceRenderOptions();
        const handlerName = 'suggestionType' + sug.suggestiontype;
        const changeRange: any = sug.changeRange;
        if (handlerName === 'suggestionType500' || handlerName === 'suggestionType600'
            || handlerName === 'suggestionType900' || handlerName === 'suggestionType1000') {
            CodeSuggestViewHandler.delAlreadyReplaceCodeBlockSourceCodeLine(
                textEditor, autoRepairDecorationOptionsInfo, decInstanceRenderOptions, sug);
        } else {
            const diagnosticDecorationOptions: any = {
                range: new vscode.Range(changeRange.start.line - 1, 0, changeRange.end.line - 1, 0),
                renderOptions: decInstanceRenderOptions,
            };
            autoRepairDecorationOptionsInfo.push(diagnosticDecorationOptions);
        }
    }

    /**
     * 清除已替换代码内存在源代码的行
     * @param textEditor 文本编辑区
     * @param autoRepairDecorationOptionsInfo 按建议修改后的行背景样式内容
     * @param decInstanceRenderOptions 按建议修改后的行背景描述内容
     * @param sug 建议源
     * @param srcStr 源代码内容
     */
    private static delAlreadyReplaceCodeBlockSourceCodeLine(
        textEditor: vscode.TextEditor,
        autoRepairDecorationOptionsInfo: any,
        decInstanceRenderOptions: any,
        sug: any
    ) {
        let changeStart = sug.changeRange?.start?.line;
        let changeEnd = sug.changeRange?.end?.line;
        changeStart = (changeStart !== 0 && !changeStart) ? sug.changeRange.start.line : changeStart;
        changeEnd = (changeEnd !== 0 && !changeEnd) ? sug.changeRange.end.line : changeEnd;
        let isExist = false;
        let i = changeStart;
        let srcStr = sug.originalStartLine.text;

        // 原始数据一共占的行数
        let sourceAllLine = sug.locend - sug.locbegin;

        // 1000 需要特例处理
        const handlerName = 'suggestionType' + sug.suggestiontype;
        if (handlerName === 'suggestionType1000') {
            srcStr = sug.originalEndLine.text;
            sourceAllLine = 0;
        }
        for (i; i <= changeEnd; i++) {
            // 获取当前遍历行的文本内容
            const text = textEditor.document.lineAt(i - 1).text;

            // 如果当前行的文本内容等于替换之前的文本，本行不进行标记
            if (text.trim() === srcStr.trim()) {
                if (i - 2 >= changeStart - 1) {
                    isExist = true;
                    const diagnosticDecorationOptionsBefore: any = {
                        range: new vscode.Range(changeStart - 1, 0, i - 2, 0),
                        renderOptions: decInstanceRenderOptions,
                    };
                    autoRepairDecorationOptionsInfo.push(diagnosticDecorationOptionsBefore);
                }

                if (changeEnd - 1 > i + sourceAllLine) {
                    isExist = true;
                    const diagnosticDecorationOptionsAfter: any = {
                        range: new vscode.Range(i + sourceAllLine, 0, changeEnd - 1, 0),
                        renderOptions: decInstanceRenderOptions,
                    };
                    autoRepairDecorationOptionsInfo.push(diagnosticDecorationOptionsAfter);
                }
                break;
            }
        }
        if (!isExist) {
            const diagnosticDecorationOptions: any = {
                range: new vscode.Range(changeStart - 1, 0, changeEnd - 1, 0),
                renderOptions: decInstanceRenderOptions,
            };
            autoRepairDecorationOptionsInfo.push(diagnosticDecorationOptions);
        }
    }

    /**
     * 创建文本事件监听器
     */
    static async createOnDidEventListener() {
        return new Promise((resolve, reject) => {
            // 打开文本监听事件
            if (!onDidOpenTextDocumentSubscription) {
                onDidOpenTextDocumentSubscription = vscode.workspace.onDidOpenTextDocument(e => {

                });
                onDidListeners.push(onDidOpenTextDocumentSubscription);
            }

            // 活动文本切换事件
            if (!onDidChangeActiveTextEditorSubscription) {
                onDidChangeActiveTextEditorSubscription = vscode.window.onDidChangeActiveTextEditor(async editor => {
                    CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, editor?.document);
                });
                onDidListeners.push(onDidChangeActiveTextEditorSubscription);
            }

            // 活动文本内容改变监听器
            if (!onDidChangeTextDocumentSubscription) {
                onDidChangeTextDocumentSubscription =
                    vscode.workspace.onDidChangeTextDocument(e => {
                        if (!CodeSuggestViewHandler.changeCountFlag) {
                            CodeSuggestViewHandler.changeCount++;
                        }
                        // 文件内容已发生变化
                        if (e.contentChanges.length > 0) {
                            CodeSuggestViewHandler.activateDocuments[e.document.fileName].isAltered = true;
                        }
                        // 更新文本行数
                        const changeLineNums =
                          e.document.lineCount - CodeSuggestViewHandler.docLineCount[e.document.fileName];
                        CodeSuggestViewHandler.docLineCount[e.document.fileName] = e.document.lineCount;
                        // 行数发生变化（删除）
                        if (changeLineNums < 0) {
                            if (e.contentChanges[0].range.start.line === 0 && e.contentChanges[0].rangeOffset === 0) {
                                CodeSuggestViewHandler.refreshDiagAndDecor(
                                  DOCUMENT_LINE_CHANGE_TYPE.DELETE_LINE_BEFORE_ZERO,
                                  e.contentChanges[0].range.start.line + 1,
                                  Math.abs(changeLineNums), e.document);
                            } else {
                                const changeLine = e.contentChanges[0].range.start.line + 1;
                                CodeSuggestViewHandler.refreshDiagAndDecor(DOCUMENT_LINE_CHANGE_TYPE.DELETE_LINE,
                                    changeLine, Math.abs(changeLineNums), e.document);
                            }
                        } else if (changeLineNums > 0) {
                            // 行数发生变化（增加）
                            if (e.contentChanges[0].range.start.line === 0 && e.contentChanges[0].rangeOffset === 0) {
                                let changeLine = e.contentChanges[0].range.start.line + 1;
                                if (e.contentChanges[0].rangeOffset
                                  > e.document.lineAt(changeLine).range.end.character) {
                                    changeLine = changeLine - 1;
                                }
                                CodeSuggestViewHandler.refreshDiagAndDecor(
                                  DOCUMENT_LINE_CHANGE_TYPE.ADD_LINE_BEFORE_ZERO,
                                  changeLine, Math.abs(changeLineNums),
                                  e.document);
                            } else {
                                const changeLine = e.contentChanges[0].range.start.line + 1;
                                CodeSuggestViewHandler.refreshDiagAndDecor(DOCUMENT_LINE_CHANGE_TYPE.ADD_LINE,
                                    changeLine, Math.abs(changeLineNums), e.document);
                            }

                        } else {
                            CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, e.document);
                        }
                    });
                onDidListeners.push(onDidChangeTextDocumentSubscription);
            }

            // 文本关闭监听器
            if (!onDidCloseTextDocumentSubscription) {
                onDidCloseTextDocumentSubscription =
                    vscode.workspace.onDidCloseTextDocument(async doc => {
                        // 关闭文件
                        CodeSuggestViewHandler.closeFile(doc);
                    });
                onDidListeners.push(onDidCloseTextDocumentSubscription);
            }

            // 文本保存监听器
            if (!onDidSaveTextDocumentSubscription) {
                onDidSaveTextDocumentSubscription = vscode.workspace.onDidSaveTextDocument(async e => {
                    if (CodeSuggestViewHandler?.activateDocuments[e.fileName]?.isAltered === true) {
                        const textEditor: any = vscode.window.activeTextEditor;
                        await CodeSuggestViewHandler
                          .saveFileToRemote(CodeSuggestViewHandler.context, textEditor, e, undefined);
                        CodeSuggestViewHandler.activateDocuments[e.fileName].isAltered = false;
                    }
                });
                onDidListeners.push(onDidSaveTextDocumentSubscription);
            }

            resolve(onDidListeners);
        });
    }

    /**
     * 保存文件到服务器
     */
    static async saveFileToRemote(
        context: vscode.ExtensionContext, textEditor: vscode.TextEditor, document?: vscode.TextDocument,
        suggestion?: any[]) {
        return new Promise(async (resolve, reject) => {
            // 未传document时，以当前激活文档更新
            document = (document) ? document : textEditor.document;
            suggestion = (suggestion) ? suggestion : CodeSuggestViewHandler.suggestions[document.fileName];

            const remoteFilePathDef = CodeSuggestViewHandler.activateDocuments[document.fileName]?.remoteFilePath;

            // 同步还存在的问题建议到服务端
            const portingItems: any = [];
            // 用于64位迁移预检
            const locs: any = [];
            const migrationitems: any = []; suggestion?.forEach(sug => {
                if (remoteFilePathDef.search(/precheck/) !== -1) {
                    migrationitems.push(sug.locbegin + ':0');
                } else {
                    // 缓存行检查修改后内容
                    migrationitems.push([sug.locbegin, sug.locend]);
                }
                const isAdded = CodeActionProviders.judgeSugIsAddedHandler(
                    textEditor, new vscode.Range(sug.locbegin, 0, sug.locend, 10), sug
                );

                // 检查原始问题行是否存在
                let originalStartLine = Utils.strAStartWithStrB(textEditor.document.lineAt(sug.locbegin - 1).text,
                    sug.originalStartLine.text);
                originalStartLine =
                  originalStartLine && Utils.strAStartWithStrB(textEditor.document.lineAt(sug.locend - 1).text,
                    sug.originalEndLine.text);

                // 属于合法类型，且原问题行内容存在，且未按建议方式进行修改，或者属于64位迁移预检类型
                if ((constant.suggestionType['suggestionType' + sug.suggestiontype] && !isAdded && originalStartLine)) {
                    portingItems.push(sug);
                    locs.push({
                        line: sug.locbegin,
                        col: sug.col
                    });
                }
            });

            if (!remoteFilePathDef || !document) {
                return reject(false);
            }

            const option: any = {
                url: '/portadv/tasks/'
                  .concat(encodeURIComponent(CodeSuggestViewHandler.activateDocuments[document.fileName].reportId))
                  .concat('/originfile/'),
                params: {
                    filepath: remoteFilePathDef,
                    origincontent: document.getText(),
                    suggestioncontent: '',
                }
            };
            // 组装请求报文
            if (remoteFilePathDef.search(/precheck/) !== -1) {
                option.params.migrationitems = migrationitems;
            } else if (remoteFilePathDef.search(/weakconsistency/) !== -1) {
                option.url = '/portadv/weakconsistency/tasks/'
                  + CodeSuggestViewHandler.activateDocuments[document.fileName].reportId
                  + '/originfile/';
                option.params.locs = locs;
            } else if (remoteFilePathDef.search(/cachecheck/) !== -1) {
                option.params.migrationitems = migrationitems;
            } else {
                option.params.portingitems = portingItems;
            }
            // 保存到服务器
            const resp: any = await Utils.requestData(context, option, constant.TOOL_NAME_PORTING);
            Utils.showInfoByStatusType(resp.data);
            if (resp.data.status !== 0) {
                Utils.showError(i18n.plugins_porting_code_save_failed);
                return reject(false);
            }

            resolve(true);
        });

    }

    /**
     * 关闭文件处理
     * @param document 关闭的文本文件
     */
    static async closeFile(document: vscode.TextDocument) {
        const localFilePath = CodeSuggestViewHandler?.activateDocuments[document.fileName]?.localFilePath;
        const isRight = CodeSuggestViewHandler?.activateDocuments[document.fileName]?.isRight;
        // 如果是右键源码建议，那么不能删除本地文件
        if (localFilePath && !isRight) {
            Utils.deleteWorkFile(localFilePath);
            CodeSuggestViewHandler.refreshDiagAndDecorALL(null);
        }
    }

    /**
     * 刷新诊断信息和装饰器
     * @param rowChangedType 行数变化类型
     * @param line 变化的行
     * @param lineNums 变化的行数
     * @param document 需要刷新的文本
     */
    static async refreshDiagAndDecor(rowChangedType: number,
                                     line: number,
                                     lineNums: number,
                                     document: vscode.TextDocument | undefined) {
        return new Promise(async (resolve, reject) => {
            let sugsDef: any = [];
            if (!document || !CodeSuggestViewHandler.suggestions[document.fileName]) {
                return reject(false);
            }

            // 未产生行数变化，使用原始建议行信息
            if (lineNums === 0) {
                sugsDef = CodeSuggestViewHandler.suggestions[document.fileName];
            }
            // 根据行数变化的方式更新建议行信息
            switch (rowChangedType) {
                case DOCUMENT_LINE_CHANGE_TYPE.DELETE_LINE_BEFORE_ZERO:
                    CodeSuggestViewHandler.suggestions[document.fileName].forEach((sug: any) => {
                        sug.locbegin = (sug.locbegin - lineNums) > 0 ? (sug.locbegin - lineNums) : sug.locbegin;
                        sug.locend = (sug.locend - lineNums) > 0 ? (sug.locend - lineNums) : sug.locend;
                        if (sug.insertno !== undefined && sug.insertno) {
                            sug.insertno = (sug.insertno - lineNums) > 0 ? (sug.insertno - lineNums) : sug.insertno;
                        }
                        if (sug.changeRange) {
                            let changeStart = sug.changeRange?.start?.line;
                            let changeEnd = sug.changeRange?.end?.line;
                            changeStart =
                              (changeStart !== 0 && !changeStart) ? sug.changeRange.start.line : changeStart;
                            changeEnd = (changeEnd !== 0 && !changeEnd) ? sug.changeRange.end.line : changeEnd;
                            const changeRangeStartLine = (changeStart - lineNums) > 0
                                ? (changeStart - lineNums) : changeStart;
                            const changeRangeEndLine = (changeEnd - lineNums) > 0
                                ? (changeEnd - lineNums) : changeEnd;
                            sug.changeRange = {
                                start: {
                                    line: changeRangeStartLine
                                },
                                end: {
                                    line: changeRangeEndLine
                                }
                            };
                        }
                        sugsDef.push(sug);
                    });
                    break;
                case DOCUMENT_LINE_CHANGE_TYPE.DELETE_LINE:
                    CodeSuggestViewHandler.suggestions[document.fileName].forEach((sug: any) => {
                        if (sug.locbegin >= line) {
                            if (sug.locbegin === line
                              && sug.suggestiontype === constant.suggestionType.suggestionType1400) {
                                sug.locbegin = sug.locbegin;
                            } else {
                                sug.locbegin = (sug.locbegin - lineNums) > 0 ? (sug.locbegin - lineNums) : sug.locbegin;
                            }
                            sug.locend = (sug.locend - lineNums) > 0 ? (sug.locend - lineNums) : sug.locend;
                            if (sug.insertno !== undefined && sug.insertno) {
                                sug.insertno = (sug.insertno - lineNums) > 0 ? (sug.insertno - lineNums) : sug.insertno;
                            }
                        } else {
                            if (sug.locend >= line) {
                                sug.locend = (sug.locend - lineNums) > 0 ? (sug.locend - lineNums) : sug.locend;
                            }
                            if (sug.insertno !== undefined && sug.insertno && sug.insertno >= line) {
                                sug.insertno = (sug.insertno - lineNums) > 0 ? (sug.insertno - lineNums) : sug.insertno;
                            }
                        }
                        if (sug.changeRange) {
                            let changeStart = sug.changeRange?.start?.line;
                            let changeEnd = sug.changeRange?.end?.line;
                            changeStart =
                              (changeStart !== 0 && !changeStart) ? sug.changeRange.start.line : changeStart;
                            changeEnd = (changeEnd !== 0 && !changeEnd) ? sug.changeRange.end.line : changeEnd;
                            let changeRangeStartLine = changeStart;
                            let changeRangeEndLine = changeEnd;
                            if (changeStart >= line) {
                                changeRangeStartLine = (changeStart - lineNums) > 0
                                    ? (changeStart - lineNums) : changeRangeStartLine;
                                changeRangeEndLine = (changeEnd - lineNums) > 0
                                    ? (changeEnd - lineNums) : changeRangeEndLine;
                            } else if (line >= changeStart && line <= changeEnd) {
                                changeRangeEndLine = (changeEnd - lineNums) > 0
                                    ? (changeEnd - lineNums) : changeEnd;
                            } else {
                                if (changeEnd > line) {
                                    changeRangeEndLine = (changeEnd - lineNums) > 0
                                        ? (changeEnd - lineNums) : changeRangeEndLine;
                                }
                            }
                            sug.changeRange = {
                                start: {
                                    line: changeRangeStartLine
                                },
                                end: {
                                    line: changeRangeEndLine
                                }
                            };
                        }
                        sugsDef.push(sug);
                    });
                    break;
                case DOCUMENT_LINE_CHANGE_TYPE.ADD_LINE_BEFORE_ZERO:
                    CodeSuggestViewHandler.suggestions[document.fileName].forEach((sug: any) => {
                        if (sug.locbegin === line
                          && sug.suggestiontype === constant.suggestionType.suggestionType1400) {
                            sug.locbegin = sug.locbegin;
                        } else {
                            sug.locbegin =
                              (sug.locbegin + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                ? (sug.locbegin + lineNums)
                                : sug.locbegin;
                        }
                        sug.locend = (sug.locend + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                            ? (sug.locend + lineNums) : sug.locend;
                        if (sug.insertno !== undefined && sug.insertno) {
                            sug.insertno =
                              (sug.insertno + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                ? (sug.insertno + lineNums)
                                : sug.insertno;
                        }
                        if (sug.changeRange) {
                            let changeStart = sug.changeRange?.start?.line;
                            let changeEnd = sug.changeRange?.end?.line;
                            changeStart =
                              (changeStart !== 0 && !changeStart) ? sug.changeRange.start.line : changeStart;
                            changeEnd = (changeEnd !== 0 && !changeEnd) ? sug.changeRange.end.line : changeEnd;
                            const docLineCount = CodeSuggestViewHandler.docLineCount[document.fileName];
                            const changeRangeStartLine = (changeStart + lineNums) <= docLineCount
                                ? (changeStart + lineNums) : changeStart;
                            const changeRangeEndLine = (changeEnd + lineNums) <= docLineCount
                                ? (changeEnd + lineNums) : changeEnd;
                            sug.changeRange = {
                                start: {
                                    line: changeRangeStartLine
                                },
                                end: {
                                    line: changeRangeEndLine
                                }
                            };
                        }
                        sugsDef.push(sug);
                    });
                    break;
                case DOCUMENT_LINE_CHANGE_TYPE.ADD_LINE:
                    CodeSuggestViewHandler.suggestions[document.fileName].forEach((sug: any) => {
                        if (sug.locbegin >= line) {
                            if (sug.locbegin === line
                              && sug.suggestiontype === constant.suggestionType.suggestionType1400) {
                                sug.locbegin = sug.locbegin;
                            } else {
                                sug.locbegin =
                                  (sug.locbegin + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                    ? (sug.locbegin + lineNums)
                                    : sug.locbegin;
                            }
                            sug.locend =
                              (sug.locend + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                ? (sug.locend + lineNums)
                                : sug.locend;
                            if (sug.insertno !== undefined && sug.insertno) {
                                sug.insertno =
                                  (sug.insertno + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                    ? (sug.insertno + lineNums)
                                    : sug.insertno;
                            }
                        } else {
                            if (sug.locend >= line) {
                                sug.locend =
                                  (sug.locend + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                    ? (sug.locend + lineNums)
                                    : sug.locend;
                            }
                            if (sug.insertno !== undefined && sug.insertno && sug.insertno >= line) {
                                sug.insertno =
                                  (sug.insertno + lineNums) <= CodeSuggestViewHandler.docLineCount[document.fileName]
                                    ? (sug.insertno + lineNums)
                                    : sug.insertno;
                            }
                        }
                        if (sug.changeRange) {
                            let changeStart = sug.changeRange?.start?.line;
                            let changeEnd = sug.changeRange?.end?.line;
                            changeStart =
                              (changeStart !== 0 && !changeStart)
                                ? sug.changeRange.start.line
                                : changeStart;
                            changeEnd = (changeEnd !== 0 && !changeEnd) ? sug.changeRange.end.line : changeEnd;
                            const docLineCount = CodeSuggestViewHandler.docLineCount[document.fileName];
                            if (changeStart >= line) {
                                const changeRangeStartLine = (changeStart + lineNums) <= docLineCount
                                    ? (changeStart + lineNums) : changeStart;
                                const changeRangeEndLine = (changeEnd + lineNums) <= docLineCount
                                    ? (changeEnd + lineNums) : changeEnd;
                                sug.changeRange = {
                                    start: {
                                        line: changeRangeStartLine
                                    },
                                    end: {
                                        line: changeRangeEndLine
                                    }
                                };
                            } else if (line >= changeStart && line <= changeEnd) {
                                const changeRangeEndLine = (changeEnd + lineNums) <= docLineCount
                                    ? (changeEnd + lineNums) : changeEnd;
                                sug.changeRange = {
                                    start: {
                                        line: changeStart
                                    },
                                    end: {
                                        line: changeRangeEndLine
                                    }
                                };
                            } else {
                                if (changeEnd >= line) {
                                    const changeRangeEndLine = (changeEnd + lineNums) <= docLineCount
                                        ? (changeEnd + lineNums) : changeEnd;
                                    sug.changeRange = {
                                        start: {
                                            line: changeStart
                                        },
                                        end: {
                                            line: changeRangeEndLine
                                        }
                                    };
                                }
                            }
                        }
                        sugsDef.push(sug);
                    });
                    break;
                default:
                    break;
            }
            // 更新样式和诊断器信息
            const activeTextEditor: any = vscode.window.activeTextEditor;
            await CodeSuggestViewHandler.createDiagnosticsAndDecorations(activeTextEditor, document, sugsDef);
            resolve(true);
        });

    }

    /**
     * 刷新全部诊断信息和装饰器
     * @param activateDocuments 为null时使用当前已打开的工作空间文件刷新
     */
    static async refreshDiagAndDecorALL(activateDocuments: any) {
        return new Promise(async (resolve, reject) => {

            if (!CodeSuggestViewHandler.suggestions) {
                return reject(false);
            }

            // 使用传进的activateDocuments更新
            if (activateDocuments) {
                for (const key of Object.keys(activateDocuments)) {
                    await CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, activateDocuments[key].document);
                }
            } else {
                // 使用工作空间文件更新
                const activateDocumentsDef = {};
                diagnosticCollection.clear();
                vscode.workspace.textDocuments.forEach(async doc => {
                    activateDocumentsDef[doc.fileName] = CodeSuggestViewHandler.activateDocuments[doc.fileName];
                    await CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, doc);
                });
                CodeSuggestViewHandler.activateDocuments = activateDocumentsDef;
            }

            resolve(true);
        });

    }

    /**vscode.window.activeTextEditor;
     * 清除handler下保存的所有源码及相关修改建议信息
     */
    public static clearAll() {
        CodeSuggestViewHandler.suggestions = {};
        CodeSuggestViewHandler.originalStartLineTxt = {};
        CodeSuggestViewHandler.docLineCount = {};
        CodeSuggestViewHandler.activateDocuments = {};
        CodeSuggestViewHandler.sugsIndex = {};
        CodeSuggestViewHandler.problematicSugsIndex = {};
        CodeSuggestViewHandler.suggestionsQueue = {};
        CodeSuggestViewHandler.rowQueue = {};
        CodeSuggestViewHandler.changeCount = 0;
        CodeSuggestViewHandler.changeCountFlag = false;
        CodeSuggestViewHandler.hasReplaceAllFile = [];
        CodeSuggestViewHandler.refreshDiagAndDecorALL(null);
    }

    /**
     * 获取样式器
     */
    private static getDecInstanceRenderOptions() {
        const decorationRenderOptions: any = {};

        return {
            ...decorationRenderOptions,
            after: {
                ...decorationRenderOptions.after || {},
                contentText: '',
            },
        };
    }

    /**
     * 标记定位单个建议在问题行中的位置
     * @param sug 单个建议
     */
    private static positKeyProblemLocation(textEditor: vscode.TextEditor, sug: any): vscode.Range {
        if (sug.suggestiontype === constant.suggestionType.suggestionType1996) {
            return textEditor.document.lineAt(sug.locbegin - 1).range;
        } else {
            let startCharIndex =
              textEditor.document.lineAt(sug.locbegin - 1).text.toLowerCase().indexOf(sug.keyword.toLowerCase());
            const containsIndex = startCharIndex;
            let endCharIndex = startCharIndex + sug.keyword.length;
            startCharIndex = (containsIndex === -1) ?
                sug.originalStartLine.text.length - sug.originalStartLine.text.trimStart().length : startCharIndex;
            startCharIndex = 0;
            endCharIndex = (containsIndex === -1) ?
                (startCharIndex + sug.originalEndLine.text.trim().length) : endCharIndex;
            return new vscode.Range(sug.locbegin - 1, 0, sug.locend - 1, sug.originalEndLine.text.length);
        }
    }

}

/**
 * 初始化加载源码文本
 * @param context vscode上下文
 * @param documentContent 源码文档信息
 * @param remoteFilePath 服务端全路径名
 * @param reportId 报告ID
 */
export async function initReportEditor(context: vscode.ExtensionContext,
                                       documentContent: any,
                                       remoteFilePath: string,
                                       reportId: any) {
    // 保存到本地临时工作目录下
    let doc: vscode.TextDocument;
    let localFilePath;
    // 是否是右键源码建议迁移
    let isRight = false;
    if (documentContent.localFilePath && documentContent.localFilePath !== remoteFilePath) {
        const config = Utils.getConfigJson(context);
        if (!config.showPortingAlert) {
            vscode.window
              .showWarningMessage(i18n.plugins_porting_modified_warning, i18n.plugins_common_nomore_alert)
              .then((select) => {
                if (select === i18n.plugins_common_nomore_alert) {
                    config.showPortingAlert = true;
                    const resourcePath =
                      Utils.getExtensionFileAbsolutePath(context, 'src/extension/assets/config.json');
                    const data = fs.writeFileSync(resourcePath, JSON.stringify(config));
                }
            });
        }
        doc = await vscode.workspace.openTextDocument(documentContent.localFilePath);
        localFilePath = documentContent.localFilePath;
        isRight = true;
    } else {
        localFilePath = Utils.writeWorkFile(context, reportId, remoteFilePath, documentContent.content);
        doc = await vscode.workspace.openTextDocument(localFilePath);
    }
    const textEditor = await vscode.window.showTextDocument(doc, { preview: true, viewColumn: 1 });
    const sug: any = documentContent.suggestion;
    doc = textEditor.document;

    CodeSuggestViewHandler.suggestionsQueue[doc.fileName] = [];
    CodeSuggestViewHandler.rowQueue[doc.fileName] = [];

    // 替换操作产生时的文本内容
    sug.beforeAddContext = '';

    // 加载文件信息
    initReportEditorSecond(context, sug, documentContent, doc);

    // 保存打开的文件信号量
    if (!CodeSuggestViewHandler.activateDocuments[doc.fileName]) {
        CodeSuggestViewHandler.activateDocuments[doc.fileName] = {
            reportId,
            localFilePath,
            remoteFilePath,
            document: doc,
            isAltered: false,
            isRight
        };
    }
}

/**
 * 加载文件信息
 * @param context 上下文
 * @param sug 文件建议信息
 * @param documentContent 文本内容
 * @param textEditor 需要打开的文本编辑器
 */
export async function initReportEditorSecond(context: any, sug: any, documentContent: any, doc: vscode.TextDocument) {
    CodeSuggestViewHandler.suggestions[doc.fileName] = sug;
    // 保存原始文本中问题行和原始建议信息
    saveOriginalSug(context, sug, documentContent, doc);

    // 初始化加载诊断和样式信息
    const activeTextEditor: any = vscode.window.activeTextEditor;
    await CodeSuggestViewHandler.createDiagnosticsAndDecorations(activeTextEditor, doc, sug);

    // 更新文本行数信息
    CodeSuggestViewHandler.docLineCount[doc.fileName] = vscode.window.activeTextEditor?.document.lineCount;

    CodeSuggestViewHandler.pluginUrlConfig[doc.fileName] = Utils.getUrlConfigJson(context);

}

function saveOriginalSug(context: vscode.ExtensionContext, sug: any, documentContent: any, doc: vscode.TextDocument) {
    sug.originalContent = documentContent.content;
    const fileType = documentContent.fileType;
    const fileNameDef = doc.fileName.split('\\');
    LogManager.log(context, 'fileName: ' + fileNameDef[fileNameDef.length - 1],
        constant.TOOL_NAME_PORTING, LOG_LEVEL.INFO);
    sug.forEach((element: any) => {
        LogManager.log(context,
          'begin: ' + element.locbegin + ';end: ' + element.locend + ';suggestiontype: ' + element.suggestiontype,
            constant.TOOL_NAME_PORTING, LOG_LEVEL.INFO);
        const startLineAt = vscode.window.activeTextEditor?.document.lineAt(element.locbegin - 1);
        element.originalStartLine = {
            text: startLineAt?.text,
            line: startLineAt?.lineNumber
        };
        const endtLineAt = vscode.window.activeTextEditor?.document.lineAt(element.locend - 1);
        element.originalEndLine = {
            text: endtLineAt?.text,
            line: endtLineAt?.lineNumber
        };
        element.originalSug = JSON.parse(JSON.stringify(element));
        element.isAdded = false;
        element.fileType = fileType;
    });
}
