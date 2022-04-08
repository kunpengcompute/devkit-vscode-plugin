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
import { I18nService } from '../i18nservice';
import * as constant from '../constant';
import { LOG_LEVEL, LogManager } from '../log-manager';
import { sugReplaceHandler, offsetSearchHandler, moveToNotNullLine } from './code-suggest-hanlder';
import { CodeSuggestViewHandler, fileSelector, diagnosticCollection } from './code-view-hanlder';
const i18n = I18nService.I18n();

/**
 * Quick fix 按照建议快速修复
 */
export class CodeActionProviders implements vscode.CodeActionProvider {
    static fix: any = new vscode.CodeAction(i18n.plugins_porting_suggest_replace, vscode.CodeActionKind.QuickFix);
    static fixAll: any =
      new vscode.CodeAction(i18n.plugins_porting_suggest_all_replace, vscode.CodeActionKind.QuickFix);
    static quickFixRange: any = {};
    // 是否初始化源码迁移命令
    static isregisterCodeSugCommands = false;

    static suggestionType: any;

    /**
     * 按照建议替换源码
     * @param textEditor 编辑区文本
     * @param range 变动的范围
     */
    static replaceCodeBySuggestion(
      context: vscode.ExtensionContext, textEditor: vscode.TextEditor, range: vscode.Range) {
        if (!textEditor?.document || !range) {
            return false;
        }

        const suggestion: any = CodeSuggestViewHandler.suggestions[textEditor.document.fileName];
        suggestion.forEach((sug: any) => {
            if (sug.locbegin === (range.start.line + 1) && sug.locend === (range.end.line + 1) &&
                CodeActionProviders.verifyRangeInDocument(textEditor.document, range)) {
                const handlerName = 'suggestionType' + sug.suggestiontype;
                const isAdded = CodeActionProviders.judgeSugIsAddedHandler(
                    textEditor, new vscode.Range(sug.locbegin, 0, sug.locend, 10), sug
                );
                let originalStartLine = Utils.strAStartWithStrB(textEditor.document.lineAt(sug.locbegin - 1).text,
                    sug.originalStartLine.text);
                originalStartLine =
                  originalStartLine && Utils.strAStartWithStrB(textEditor.document.lineAt(sug.locend - 1).text,
                    sug.originalEndLine.text);
                if (sugReplaceHandler[handlerName] && !isAdded && originalStartLine) {
                    sugReplaceHandler[handlerName](textEditor, range, sug, true);
                } else {
                    LogManager.log(context, 'replaceCodeBySuggestion, the method is not found: ' + handlerName,
                        constant.TOOL_NAME_PORTING, LOG_LEVEL.ERROR);
                }

            }
        });

        return true;
    }

    /**
     * 按照建议批量替换单种建议源码
     * @param textEditor 编辑区文本
     * @param range 变动的范围
     */
    static replaceAllCodeBySuggestion(textEditor: vscode.TextEditor, sugType: any) {
        if (!textEditor?.document || !sugType) {
            return;
        }
        // 存储当前的问题建议信息
        const suggestion: any[] = CodeSuggestViewHandler.suggestions[textEditor.document.fileName];
        const suggestionOld: any = [];
        const suggestionDoing: any = [];
        suggestion.forEach(sug => {
            suggestionOld.push(Utils.deepCopy(sug));
            suggestionDoing.push(Utils.deepCopy(sug));
        });
        CodeSuggestViewHandler.suggestionsQueue[textEditor.document.fileName].push(suggestionOld);
        const handlerName = 'suggestionType' + CodeActionProviders.suggestionType;
        // 当前待修改问题行首行的下标
        const problematicSugsIndex = CodeSuggestViewHandler.problematicSugsIndex;
        const sugsIndexs = CodeSuggestViewHandler.sugsIndex;
        const suggestionNew: any = [];
        let newContent = '';
        // 遍历的行标
        let rowIndex = 0;
        // 已替换的行标
        let hasReplaceSugEndIndex = 0;

        // 组装新的文本内容
        const lineSeparator = textEditor.document.getText().indexOf('\r\n') > -1 ? '\r\n' : '\n';
        const text = textEditor.document.getText().split(lineSeparator);
        text.forEach((line, index) => {
            if (index >= hasReplaceSugEndIndex) {
                if (rowIndex < index) {
                    rowIndex = index;
                }
                const sugsIndex = sugsIndexs[index + 1];
                const problemSugsIndex = problematicSugsIndex[index + 1];
                const reg = /\r\n/g;
                // 获取修改建议的行总数
                let strategyLine = 1;
                let blrow = [];
                if (problemSugsIndex) {
                    blrow = suggestionDoing[problemSugsIndex].strategy.match(reg) || 0;
                    if (blrow !== 0) {
                        blrow = blrow.length;
                    }
                    strategyLine = blrow + 1;
                }
                if (!problemSugsIndex && problemSugsIndex !== 0 && sugsIndex >= 0 && suggestionDoing?.length > 0) {
                    const changeSpace = rowIndex + 1 - suggestionDoing[sugsIndex].locbegin;
                    const space = suggestionDoing[sugsIndex].locend - suggestionDoing[sugsIndex].locbegin;
                    suggestionDoing[sugsIndex].locbegin = rowIndex + 1;
                    suggestionDoing[sugsIndex].locend = suggestionDoing[sugsIndex].locbegin + space;

                    if (suggestionDoing[sugsIndex].changeRange) {
                        suggestionDoing[sugsIndex].changeRange = {
                            start: {
                                line: suggestionDoing[sugsIndex].changeRange.start.line + changeSpace
                            },
                            end: {
                                line: suggestionDoing[sugsIndex].changeRange.end.line + changeSpace
                            }
                        };
                    }
                    suggestionNew.push(suggestionDoing[sugsIndex]);

                }

                if (problemSugsIndex >= 0 && suggestionDoing?.length > 0) {
                    if (suggestionDoing[problemSugsIndex]?.suggestiontype === CodeActionProviders.suggestionType
                        && !suggestionDoing[problemSugsIndex]?.isAdded) {
                        const sug = suggestionDoing[problemSugsIndex];
                        const sugNext = suggestionDoing[problemSugsIndex + 1];
                        const targetStr = sugReplaceHandler[handlerName](textEditor,
                            new vscode.Range(sug.locbegin - 1, 0, sug.locend - 1, 10), sug, false);
                        const changeStart = rowIndex + 1;
                        hasReplaceSugEndIndex = sug.locend;
                        rowIndex = rowIndex + targetStr.split('\n').length;
                        const changeEnd = rowIndex;
                        let blankContent = '';
                        // 如果待修改行大于修改过的行数总数，则需要拼接行数差的空行补齐
                        if ((sug.locend - sug.locbegin) > strategyLine) {
                            // 需要补齐的空行数组
                            const blankList = Array((sug.locend - sug.locbegin + 1) - strategyLine).fill('\r\n');
                            blankList.forEach(element => {
                                blankContent += element;
                            });
                        }
                        newContent =
                          (constant.doNotAddBlankSuggestionType.indexOf(sug.suggestiontype) !== -1
                            ? newContent.concat(targetStr).concat('\r\n')
                            : newContent.concat(targetStr).concat('\r\n').concat(blankContent));
                        suggestionDoing[problemSugsIndex].changeRange = {
                            start: {
                                line: changeStart
                            },
                            end: {
                                line: changeEnd
                            }
                        };

                        // 1100整个替换
                        if (
                          CodeActionProviders.suggestionType === constant.replaceAllSuggestionType.suggestionType1100) {
                            hasReplaceSugEndIndex = textEditor.document.lineCount + 1;
                        }
                        suggestionNew.push(suggestionDoing[problemSugsIndex]);
                    } else {
                        const sug = suggestionDoing[problemSugsIndex];
                        const sugNext = suggestionDoing[problemSugsIndex + 1];
                        let blankContent = '';
                        // 如果待修改行大于修改过的行数总数，则需要拼接行数差的空行补齐
                        if ((sug.locend - sug.locbegin) > strategyLine && sugNext) {
                            // 需要补齐的空行数组
                            const blankList = Array((sug.locend - sug.locbegin + 1) - strategyLine).fill('\r\n');
                            blankList.forEach(element => {
                                blankContent += element;
                            });
                        }
                        newContent = newContent.concat(line).concat('\r\n');

                        // 更新还存在问题的位置信息
                        const space =
                          suggestionDoing[problemSugsIndex].locend - suggestionDoing[problemSugsIndex].locbegin;
                        suggestionDoing[problemSugsIndex].locbegin = rowIndex + 1;
                        suggestionDoing[problemSugsIndex].locend = suggestionDoing[problemSugsIndex].locbegin + space;
                        suggestionNew.push(suggestionDoing[problemSugsIndex]);
                        rowIndex++;
                    }
                } else {
                    rowIndex++;
                    newContent = newContent.concat(line).concat('\r\n');

                }
            }
        });

        newContent = newContent.substring(0, newContent.length - '\r\n'.length);

        // 替换文本内容
        textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(new vscode.Range(0, 0, textEditor.document.lineCount - 1,
                textEditor.document.lineAt(textEditor.document.lineCount - 1).text.length),
                newContent);
        }).then(() => {
            // 修改前的问题建议信息进栈
            CodeSuggestViewHandler.rowQueue[textEditor.document.fileName].push(CodeSuggestViewHandler.changeCount);
            CodeSuggestViewHandler.suggestions[textEditor.document.fileName].forEach((sugItem: any, index: any) => {
                if (sugItem.suggestiontype === CodeActionProviders.suggestionType) {
                    sugItem.changeRange = suggestionNew[index].changeRange;
                } else {
                    sugItem.locbegin = suggestionNew[index].locbegin;
                    sugItem.locend = suggestionNew[index].locend;
                    sugItem.changeRange = suggestionNew[index].changeRange;
                }
            });
            CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, textEditor.document);
        });
    }

    /**
     * 校验修改范围是否合法，行数是否正常
     * @param document 工作文档
     * @param range 修改范围
     */
    private static verifyRangeInDocument(document: vscode.TextDocument, range: vscode.Range): boolean {
        return (0 <= range.start.line && range.start.line <= range.end.line && range.end.line < document.lineCount);
    }

    /**
     * 带有偏移量的小范围搜索迁移建议是否被添加
     * @param textEditor 文本编辑区
     * @param range 判断范围
     * @param sug 迁移建议
     */
    static judgeSugIsAddedHandler(textEditor: vscode.TextEditor, range: vscode.Range, sug: any) {
        // 撤销后还原状态
        if (sug.isAdded) {
            sug.isAdded = !Utils.strAContainStrB(
                CodeSuggestViewHandler
                  .suggestions[textEditor.document.fileName]?.beforeAddContext, textEditor.document.getText()) ?
                false : sug.isAdded;
        }

        // 判断不同类型
        const handlerName = 'suggestionType' + sug.suggestiontype;
        if (offsetSearchHandler[handlerName] && textEditor?.document &&
            CodeActionProviders.verifyRangeInDocument(textEditor.document, range)) {
            if (handlerName === 'suggestionType100'
              || handlerName === 'suggestionType200'
              || handlerName === 'suggestionType1300') {
                const locBegin = offsetSearchHandler[handlerName](textEditor, range, sug, 0);
                let locBeginAfter = false;
                // 偏移三行查找，原因为100和200均添加在最前面
                if (!locBegin) {
                    locBeginAfter =
                      offsetSearchHandler[handlerName](textEditor, range, sug, 4 + moveToNotNullLine(textEditor, 0));
                }

                return locBegin || locBeginAfter;
            } else {
                // 无偏移
                return offsetSearchHandler[handlerName](textEditor, range, sug, sug.locbegin);
            }
        }

        return false;
    }

    /**
     * 注册码迁移建议命令
     * @param context vscode上下文
     */
    static registerCodeSugCommands(context: vscode.ExtensionContext) {
        // 单个建议替换
        context.subscriptions.push(vscode.commands.registerCommand('extension.quickFix', () => {
            const textEditor: any = vscode.window.activeTextEditor;
            if (CodeActionProviders.suggestionType === 1600) {
                CodeActionProviders.replaceAllCodeBySuggestion(textEditor, CodeActionProviders.suggestionType);
            } else {
                try {
                    CodeActionProviders.replaceCodeBySuggestion(context, textEditor,
                      CodeActionProviders.quickFixRange[textEditor.document.fileName]);
                } catch (error) {
                }
            }

        }));

        // 单种建议批量替换
        context.subscriptions.push(vscode.commands.registerCommand('extension.quickFixAll', () => {
            const textEditor: any = vscode.window.activeTextEditor;
            const fileNameDef = textEditor.document.fileName.split('\\');
            // 已经二次确认过的文件
            if (CodeSuggestViewHandler.hasReplaceAllFile.includes(textEditor.document.fileName)) {
                // 如果是100、200和1300，则走单个替换逻辑即可
                if (CodeActionProviders.suggestionType === 100 || CodeActionProviders.suggestionType === 200 ||
                    CodeActionProviders.suggestionType === 1300) {
                    CodeActionProviders.replaceCodeBySuggestion(context, textEditor,
                        CodeActionProviders.quickFixRange[textEditor.document.fileName]);
                } else {
                    try {
                        CodeActionProviders.replaceAllCodeBySuggestion(textEditor, CodeActionProviders.suggestionType);
                    } catch (error) {
                    }
                }
            } else {
                const suggestion: any[] = CodeSuggestViewHandler.suggestions[textEditor.document.fileName];
                const problematicSugsIndex: any[] = CodeSuggestViewHandler.problematicSugsIndex;
                let problemNums = 0;
                for (const key of Object.keys(problematicSugsIndex)) {
                    if (suggestion[problematicSugsIndex[key]].suggestiontype === CodeActionProviders.suggestionType) {
                        problemNums++;
                    }
                }
                let param0 = fileNameDef[fileNameDef.length - 1];
                let param1 = problemNums;
                const language: any = vscode.env.language;
                if (language && language.indexOf('en') !== -1) {
                    param0 = problemNums;
                    param1 = fileNameDef[fileNameDef.length - 1];
                }
                vscode.window.showWarningMessage(
                    I18nService.I18nReplace(i18n.plugins_porting_code_suggest_all_replace, {
                        0: param0,
                        1: param1
                    }),
                    i18n.confirm_button, i18n.cancel_button)
                    .then(async select => {
                        if (select === i18n.confirm_button) {
                            CodeSuggestViewHandler.hasReplaceAllFile.push(textEditor.document.fileName);
                            // 如果是100、200和1300，则走单个替换逻辑即可
                            try {
                                if (CodeActionProviders.suggestionType === 100
                                  || CodeActionProviders.suggestionType === 200
                                  || CodeActionProviders.suggestionType === 1300) {
                                    CodeActionProviders.replaceCodeBySuggestion(context, textEditor,
                                        CodeActionProviders.quickFixRange[textEditor.document.fileName]);
                                } else {
                                    CodeActionProviders
                                      .replaceAllCodeBySuggestion(textEditor, CodeActionProviders.suggestionType);
                                }
                            } catch (error) {
                            }
                        }
                    });
            }
        }));

        context.subscriptions
          .push(vscode.languages.registerCodeActionsProvider(fileSelector, new CodeActionProviders()));
        CodeActionProviders.isregisterCodeSugCommands = true;
    }

    /**
     * 撤销快捷键重写
     * @param context 上下文
     */
    public static registerUndo(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.kunpeng.undo', () => {
            const textEditor: any = vscode.window.activeTextEditor;
            CodeSuggestViewHandler.changeCountFlag = true;
            vscode.commands.executeCommand('undo').then(() => {
                // 如果当前是批量操作的撤销
                if (CodeSuggestViewHandler
                  ?.rowQueue[textEditor.document.fileName]
                  ?.includes(CodeSuggestViewHandler?.changeCount)) {
                    CodeSuggestViewHandler.suggestions[textEditor.document.fileName] =
                        CodeSuggestViewHandler.suggestionsQueue[textEditor.document.fileName].pop();
                    CodeSuggestViewHandler?.rowQueue[textEditor.document.fileName].pop();
                }
                CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, textEditor.document);
                CodeSuggestViewHandler.changeCount--;
                CodeSuggestViewHandler.changeCountFlag = false;
            });
        }));
    }

    /**
     * 创建单个fixaction
     */
    static createFixSingle(): vscode.CodeAction {
        if (CodeActionProviders.fix) {
            const command: any = { command: 'extension.quickFix' };
            CodeActionProviders.fix.command = command;
            CodeActionProviders.fix.isPreferred = true;
        }
        // 更新工作空间
        CodeActionProviders.fix.edit = new vscode.WorkspaceEdit();

        return CodeActionProviders.fix;
    }

    /**
     * 创建单个一键式全局替换fixaction
     */
    static createFixAll(): vscode.CodeAction {
        if (CodeActionProviders.fixAll) {
            const command: any = { command: 'extension.quickFixAll' };
            CodeActionProviders.fixAll.command = command;
            CodeActionProviders.fixAll.isPreferred = true;
        }
        // 更新工作空间
        CodeActionProviders.fixAll.edit = new vscode.WorkspaceEdit();

        return CodeActionProviders.fixAll;
    }

    /**
     * 源码修改动作
     * @param document 文件内容窗口
     * @param range 范围
     * @param context 插件上下文
     * @param token A cancellation token
     */
    provideCodeActions(
      document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: any) {
        const fixs: any = [];
        // 确定该行是否存在问题
        diagnosticCollection.get(document.uri)?.forEach((diagnostic: any) => {
            if (diagnostic.range.start.line === range.start.line && diagnostic.range.end.line === range.end.line) {
                if (constant.replaceAllSuggestionType['suggestionType' + diagnostic.suggestiontype] ||
                 (diagnostic.suggestiontype === 1996 && diagnostic.quickfix)) {
                    if (constant.replaceAllSuggestionType['suggestionType' + diagnostic.suggestiontype]
                      === constant.replaceAllSuggestionType.suggestionType1600) {
                        fixs.push(CodeActionProviders.createFixAll());
                    } else {
                        fixs.push(CodeActionProviders.createFixSingle());
                        fixs.push(CodeActionProviders.createFixAll());
                    }
                    CodeActionProviders.suggestionType = diagnostic.suggestiontype;
                }
            }
        });
        CodeActionProviders.quickFixRange[document.fileName] = range;

        return fixs;
    }

}
