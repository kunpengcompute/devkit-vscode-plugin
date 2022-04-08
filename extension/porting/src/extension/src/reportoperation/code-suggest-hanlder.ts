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

import { suggestionType } from './../constant';
import * as vscode from 'vscode';
import { Utils } from '../utils';
import { CodeActionProviders } from './code-action-provider';
import { CodeSuggestViewHandler } from './code-view-hanlder';


function textEditReplaceTextContent(textEditor: vscode.TextEditor, sug: any, location: vscode.Range, targetStr: any) {
    // 存储替换之前的文本内容
    CodeSuggestViewHandler.suggestions[textEditor.document.fileName].beforeAddContext = textEditor.document.getText();
    // 替换之前的编辑器总行数
    const replaceBeforeLineCount = textEditor.document.lineCount;

    // 按建议替换内容
    textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.replace(location,
            targetStr);
    }).then(() => {
        sug.isAdded = true;

        // 替换之后的编辑器总行数
        const replaceAfterLineCount = textEditor.document.lineCount;
        const handlerName = 'suggestionType' + sug.suggestiontype;
        let changeRange: any;
        if (handlerName === 'suggestionType100'
          || handlerName === 'suggestionType200'
          || handlerName === 'suggestionType1300') {
            changeRange = new vscode.Range(location.start.line + 1, 0,
                location.start.line + (replaceAfterLineCount - replaceBeforeLineCount), 0);
        } else {
            changeRange = new vscode.Range(location.start.line + 1, 0,
                location.end.line + (replaceAfterLineCount - replaceBeforeLineCount) + 1, 0);
        }
        sug.changeRange = {
            start: {
                line: changeRange.start.line
            },
            end: {
                line: changeRange.end.line
            }
        };

        // 刷新样式和诊断信息
        CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, 0, textEditor.document);
    });

}

/**
 * 根据文件类型检测注释文本关键字
 * @param fileType 文件类型
 * @returns 注释文本关键字
 */
function checkFileTypeWithCommentedText(fileType: any) {
    let commentText = '';
    switch (fileType) {
        case 'makefile':
            commentText = '#';
            break;
        case 'C/C++ Source File':
            commentText = '//';
            break;
        case 'ASM File':
            commentText = '//';
            break;
        case 'Fortran':
            commentText = '!';
            break;
    }
    return commentText;
}

/**
 * 从当前行移动到非空行
 * @param textEditor 编辑区激活文本
 * @param line 当前行
 */
export function moveToNotNullLine(textEditor: vscode.TextEditor, line: number): number {
    while (textEditor.document.lineCount > line && line >= 0 && textEditor.document.lineAt(line).text.trim() === '') {
        line = line + 1;
    }

    if (textEditor.document.lineCount <= line + 2) {
        return -1;
    }

    return line;
}

// 100到1000类型建议替换处理方法
export const sugReplaceHandler: any = {
    suggestionType100(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let targetStr = '';
        if (!CodeActionProviders.judgeSugIsAddedHandler(textEditor, range, sug)) {
            const commentText = checkFileTypeWithCommentedText(sug.fileType);


            // 判断100类型的strategy文本内容，如果Visit开头需要添加suggestion,否则不需要添加
            const suggestions = CodeSuggestViewHandler.suggestions[textEditor.document.fileName];
            const pluginUrlCfg = CodeSuggestViewHandler.pluginUrlConfig[textEditor.document.fileName];
            let isNeedComment = '';
            for (const tempSug of suggestions) {
                const handlerName = 'suggestionType' + tempSug.suggestiontype;
                if (handlerName === 'suggestionType100' && tempSug.strategy &&
                Utils.strAContainStrB(tempSug.strategy,
                    `Visit '${pluginUrlCfg.avxToNeon}' and obtain the 'avx2neon.h' `.concat(
                        `source code according to the README.md file.`
                    ))) {
                    isNeedComment = `\r\n${commentText} Suggestion: ${tempSug.strategy}`;
                    break;
                }
            }

            // 拼装替换行内容
            targetStr = '#if defined(__aarch64__)'.concat(
                '\r\n\t', '#include "avx2neon.h"',
                isNeedComment,
                '\r\n', '#endif'
            );
            // 连接文件首行
            const zoreLine = textEditor.document.lineAt(0);
            targetStr = targetStr.concat(
                '\r\n', zoreLine.text
            );

            // 替换建议内容,并记录替换的文本行数
            if (replaceNow) {
                textEditReplaceTextContent(textEditor, sug,
                    new vscode.Range(
                      zoreLine.range.start, zoreLine.range.start.translate(0, zoreLine.text.length)), targetStr);
            }
        }

        return targetStr;
    },
    suggestionType200(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let targetStr = '';
        if (!CodeActionProviders.judgeSugIsAddedHandler(textEditor, range, sug)) {
            // 拼装替换行内容
            targetStr = '#if defined(__aarch64__)'.concat(
                '\r\n\t', '#include "sse2neon.h"',
                '\r\n', '#endif'
            );
            const zoreLine = textEditor.document.lineAt(0);
            // 连接文件首行
            targetStr = targetStr.concat(
                '\r\n', zoreLine.text
            );

            // 替换建议内容,并记录替换的文本行数
            if (replaceNow) {
                textEditReplaceTextContent(textEditor, sug,
                    new vscode.Range(
                      zoreLine.range.start, zoreLine.range.start.translate(0, zoreLine.text.length)), targetStr);
            }
        }

        return targetStr;
    },
    suggestionType300(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let targetStr = '';
        if (Utils.strAContainStrB(textEditor.document.lineAt(range.start.line).text, sug.keyword)) {
            const commentText = checkFileTypeWithCommentedText(sug.fileType);
            // 拼装替换行内容
            targetStr = `${commentText} `.concat(
                sug.keyword,
                '\r\n', sug.strategy
            );

            // 替换建议内容,并记录替换的文本行数
            if (replaceNow) {
                textEditReplaceTextContent(textEditor, sug,
                    new vscode.Range(range.start.line, 0, range.start.line, sug.keyword.length), targetStr);
            }
        }

        return targetStr;
    },
    suggestionType400(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let targetStr = '';
        if (Utils.strAContainStrB(textEditor.document.lineAt(range.start.line).text, sug.keyword)) {
            const commentText = checkFileTypeWithCommentedText(sug.fileType);
            // 拼装替换行内容
            targetStr = `${commentText} `.concat(
                sug.keyword,
                '\r\n', `${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n${commentText} `)
            );

            // 替换建议内容,并记录替换的文本行数
            if (replaceNow) {
                textEditReplaceTextContent(textEditor, sug,
                    new vscode.Range(range.start.line, 0, range.start.line, sug.keyword.length), targetStr);
            }
        }

        return targetStr;
    },
    suggestionType500(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = '#if defined(__x86_64__)'.concat(
            '\r\n\t', srcStr,
            '\r\n', '#elif defined(__aarch64__)',
            '\r\n\t', sug.strategy,
            '\r\n#endif'
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType600(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
          new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = '#if defined(__x86_64__)'.concat(
            '\r\n\t', srcStr,
            '\r\n', '#elif defined(__aarch64__)',
            `\r\n\t${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n\t${commentText} `),
            '\r\n#endif'
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType700(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let targetStr = '';
        if (Utils.strAContainStrB(textEditor.document.lineAt(range.start.line).text, sug.keyword)) {
            const srcStr = textEditor.document.getText(
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
            let suggestion = '';
            if (sug.replacement && sug.replacement.length > 0) {
                suggestion = sug.replacement[0];
            }
            targetStr = srcStr.substring(0,
                srcStr.trim().toLowerCase().indexOf(sug.keyword.trim().toLowerCase())).concat(suggestion);

            // 替换建议内容,并记录替换的文本行数
            if (replaceNow) {
                textEditReplaceTextContent(textEditor, sug,
                    new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
            }
        }

        return targetStr;
    },
    suggestionType800(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = `${commentText} `.concat(
            srcStr,
            '\r\n', `${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n${commentText} `)
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType900(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = `${commentText} `.concat(
            srcStr,
            '\r\n', `${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n${commentText} `)
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType1000(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        const srcStr = textEditor.document.lineAt(range.end.line).text;
        const targetStr = '#elif defined(__aarch64__)'.concat(
            '\r\n', `${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n${commentText} `),
            '\r\n', srcStr
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.end.line, 0, range.end.line, srcStr.length), targetStr);
        }

        return targetStr;
    },
    suggestionType1010(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        const contentFront = textEditor.document.getText(
          new vscode.Range(range.start.line, 0, sug.insertno - 2, 0));
        const insertNoContent = textEditor.document.lineAt(sug.insertno - 2).text;
        const contentBack = textEditor.document.getText(
          new vscode.Range(sug.insertno - 1, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = contentFront.concat(
          insertNoContent,
          '\r\n', '#elif defined(__aarch64__)',
          '\r\n', commentText, 'Suggestion:',
          sug.strategy.replace(/\n/g, `\n\t${commentText} `),
          '\r\n', contentBack
        );
        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
              new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }
        return targetStr;
    },
    suggestionType1100(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        // 拼装替换行内容
        const srcStr = textEditor.document.lineAt(0).text;
        const targetStr = sug.strategy;

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug, new vscode.Range(0, 0, textEditor.document.lineCount - 1,
                textEditor.document.lineAt(textEditor.document.lineCount - 1).text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType1200(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        // 拼装替换行内容
        const srcStr = textEditor.document.lineAt(range.start.line).text;
        const targetStr = sug.strategy;

        // 1200 无建议代码，不进行替换处理
        if (!targetStr) {
            // 同步更新问题行诊断信息和样式
            sug.isAdded = true;
            if (replaceNow) {
                CodeSuggestViewHandler.refreshDiagAndDecor(-1, -1, -1, textEditor.document);
            }
        }

        return targetStr;
    },
    suggestionType1996(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = '\t' + sug.quickfixcontent.concat(
            '\r\n', srcStr
        );
        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType1300(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let targetStr = '';
        if (!CodeActionProviders.judgeSugIsAddedHandler(textEditor, range, sug)) {
            // 拼装替换行内容
            targetStr = '#if defined(__aarch64__)'.concat(
                '\r\n\t', '#include "KunpengTrans.h"',
                '\r\n', '#endif'
            );
            // 连接文件首行
            const zoreLine = textEditor.document.lineAt(0);
            targetStr = targetStr.concat(
                '\r\n', zoreLine.text
            );

            // 替换建议内容,并记录替换的文本行数
            if (replaceNow) {
                textEditReplaceTextContent(textEditor, sug,
                    new vscode.Range(
                      zoreLine.range.start, zoreLine.range.start.translate(0, zoreLine.text.length)), targetStr);
            }
        }

        return targetStr;
    },
    suggestionType2200(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = '#if defined(__x86_64__)'.concat(
            '\n\t', srcStr,
            '\r\n', '#elif defined(__aarch64__)',
            `\r\n\t${commentText} Description: `, sug.description.replace(/\n/g, `\n\t${commentText} `),
            `\r\n\t${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n\t${commentText} `),
            '\r\n#endif'
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },
    suggestionType1400(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        // 拼装替换行内容
        const targetStr = sug.strategy;

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }
        return targetStr;
    },
    suggestionType1500(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = '#ifdef __GFORTRAN__'.concat(
            '\r\n\t', srcStr,
            '\r\n', '#else',
            '\r\n\t', sug.strategy,
            '\r\n#endif'
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }
        return targetStr;
    },
    suggestionType1600(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        let content = '';
        const srcStr = textEditor.document.getText(
          new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        for (const line of srcStr.split(/[\r\n]+/)) {
            if (!content) {
                content += line;
            } else {
                content += ('\r\n\t' + line);
            }
        }
        const targetStr = '#if defined(__x86_64__)'.concat(
          '\r\n\t', content,
          '\r\n#endif'
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
              new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }
        return targetStr;
    },
    suggestionType2500(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(
                range.start.line,
                0,
                range.end.line,
                sug.originalEndLine.text.length
            )
        );
        const targetStr = `${commentText} `.concat(
            srcStr,
            '\r\n',
            `${commentText} Suggestion: `,
            sug.strategy.replace(/\n/g, `\n${commentText} `)
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(
                textEditor,
                sug,
                new vscode.Range(
                    range.start.line,
                    0,
                    range.end.line,
                    sug.originalEndLine.text.length
                ),
                targetStr
            );
        }

        return targetStr;
    },

    suggestionType2600(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, replaceNow: boolean) {
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 拼装替换行内容
        const srcStr = textEditor.document.getText(
            new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length));
        const targetStr = `${commentText} `.concat(
            srcStr,
            '\r\n', `${commentText} Suggestion: `, sug.strategy.replace(/\n/g, `\n${commentText} `)
        );

        // 替换建议内容,并记录替换的文本行数
        if (replaceNow) {
            textEditReplaceTextContent(textEditor, sug,
                new vscode.Range(range.start.line, 0, range.end.line, sug.originalEndLine.text.length), targetStr);
        }

        return targetStr;
    },

};

export const offsetSearchHandler: any = {
    suggestionType100(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (textEditor.document.lineCount < 4) {
            return false;
        }
        // 判断是否已按建议内容修改过
        line = moveToNotNullLine(textEditor, line);
        let includeZoreLine = (line >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#if defined(__aarch64__)');

        // 跳三次间断查找
        let index = 0;
        while (index < 3 && !includeZoreLine) {
            line = moveToNotNullLine(textEditor, line);
            if (line !== -1) {
                includeZoreLine =
                  Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#if defined(__aarch64__)');
            }
            index++;
        }

        line = moveToNotNullLine(textEditor, line);
        const includeOneLine = (line >= 0) &&
            Utils.strAContainStrB(
                textEditor.document.lineAt(line++).text, '#include "avx2neon.h"');
        line = moveToNotNullLine(textEditor, line);
        let includeTwoLine = (line >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#endif');
        if (!includeTwoLine) {
            line = moveToNotNullLine(textEditor, line);
            includeTwoLine = (line >= 0) &&
                Utils.strAContainStrB(textEditor.document.lineAt(line).text, '#endif');
        }

        return includeZoreLine && includeOneLine && includeTwoLine;
    },
    suggestionType200(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (textEditor.document.lineCount < 3) {
            return false;
        }

        // 判断是否已按建议内容修改过
        line = moveToNotNullLine(textEditor, line);
        let includeZoreLine = (line >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#if defined(__aarch64__)');

        // 跳三次间断查找
        let index = 0;
        while (index < 3 && !includeZoreLine) {
            line = moveToNotNullLine(textEditor, line);
            includeZoreLine =
              Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#if defined(__aarch64__)');
            index++;
        }

        line = moveToNotNullLine(textEditor, line);
        const includeOneLine = (line >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#include "sse2neon.h"');
        line = moveToNotNullLine(textEditor, line);
        const includeTwoLine = (moveToNotNullLine(textEditor, line) >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line).text, '#endif');

        return includeZoreLine && includeOneLine && includeTwoLine;
    },
    suggestionType300(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (!textEditor?.document || textEditor.document.lineCount < line || line - 1 < 0) {
            return false;
        }

        // 判断是否已按建议内容修改过
        const judgeKeyWords = Utils.strAContainStrB(textEditor.document.lineAt(line - 1).text, sug.keyword);
        const judgeAddedFlag = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, '//');

        return judgeKeyWords && judgeAddedFlag;
    },
    suggestionType400(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 1 < 0) {
            return false;
        }

        // 判断是否已按建议内容修改过
        const judgeKeyWords = Utils.strAContainStrB(textEditor.document.lineAt(line - 1).text, sug.keyword);
        const judgeAddedFlag = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, '//');

        return judgeKeyWords && judgeAddedFlag;
    },
    suggestionType500(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 2 < 0) {
            return false;
        }

        // 定位到原始问题行
        let judgeKeyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.description);
        judgeKeyWords = judgeKeyWords
          || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);
        judgeKeyWords = judgeKeyWords && sug.originalStartLine.text.trim() !== '';

        if (textEditor.document.lineCount < line + 9) {
            return false;
        }

        // 判断是否已按建议内容修改过
        const keyWordsBefore =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '#if defined(__x86_64__)');
        const keyWordsAfterOne =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line).text, '#elif defined(__aarch64__)');
        let keyWordsAfterTwo = Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 1).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 2).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 3).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 4).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 5).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 6).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 7).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB(sug.strategy, textEditor.document.lineAt(line + 8).text);
        keyWordsAfterTwo =
          keyWordsAfterTwo && Utils.strAContainStrB('#endif', textEditor.document.lineAt(line + 9).text);


        return keyWordsBefore && judgeKeyWords && keyWordsAfterOne && keyWordsAfterTwo;
    },
    suggestionType600(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 2 < 0) {
            return false;
        }
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 定位问题行
        let judgeKeyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.keyword)
            || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);
        judgeKeyWords = judgeKeyWords && sug.originalStartLine.text.trim() !== '';

        if (textEditor.document.lineCount <= line + 1) {
            return false;
        }

        // 判断是否已按建议内容修改过
        const judgeKeyWordsBefore =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '#if defined(__x86_64__)');
        const judgeKeyWordsAfterOne =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line).text, '#elif defined(__aarch64__)');
        const judgeKeyWordsAfterTwo =
          Utils.strAContainStrB(textEditor.document.lineAt(line + 1).text, `${commentText} ` + sug.strategy)
          || Utils.strAContainStrB(textEditor.document.lineAt(line + 1).text, `${commentText}` + sug.strategy);

        return judgeKeyWordsBefore && judgeKeyWords && judgeKeyWordsAfterOne && judgeKeyWordsAfterTwo;
    },
    suggestionType700(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 1 < 0) {
            return false;
        }

        let srcStr = sug.originalStartLine.text;
        srcStr =
          srcStr.substring(0, srcStr.trim().toLowerCase().indexOf(sug.keyword.trim().toLowerCase()))
            .concat(sug.strategy);
        const judgeAddedFlag = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, srcStr);

        return judgeAddedFlag;
    },
    suggestionType800(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 1 < 0) {
            return false;
        }

        // 判断是否已按建议内容修改过
        let judgeAddedFlag = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, '#');
        judgeAddedFlag =
          judgeAddedFlag
          && Utils.strAContainStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);

        return judgeAddedFlag;
    },
    suggestionType900(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 3 < 0) {
            return false;
        }

        // 定位到问题行
        const judgeKeyWords =
            Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text)
            && sug.originalStartLine.text.trim() !== '';

        // 判断是否已按建议内容修改过
        let keyWordsBeforeOne = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 3).text, '! Description:');
        keyWordsBeforeOne =
          keyWordsBeforeOne
          || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 3).text, '!Description:');
        let keyWordsBeforeTwo = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '! Suggestion:');
        keyWordsBeforeTwo =
          keyWordsBeforeTwo
          || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '!Suggestion:');
        const keyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);

        return keyWords && keyWordsBeforeOne && keyWordsBeforeTwo;
    },
    suggestionType1000(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (range.end.line - 1 < 0) {
            return false;
        }

        // 判断是否已按建议内容修改过
        let checkLine = range.end.line - 2;
        while (textEditor.document.lineAt(checkLine).text.trim() === '') {
            checkLine = checkLine - 1;
        }
        const keyWordsBeforeTwo = Utils.strAStartWithStrB(textEditor.document.lineAt(checkLine).text, '//');
        checkLine = checkLine - 1;
        while (textEditor.document.lineAt(checkLine).text.trim() === '') {
            checkLine = checkLine - 1;
        }
        const keyWBeforeOne =
          Utils.strAStartWithStrB(textEditor.document.lineAt(checkLine).text, '#elif defined(__aarch64__)');

        return keyWBeforeOne && keyWordsBeforeTwo;
    },
    suggestionType1010(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line < 2) {
            return false;
        }
        // 判断是否已按建议内容修改过
        line = moveToNotNullLine(textEditor, line);
        let judgeKeyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.keyword)
          || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);
        judgeKeyWords = judgeKeyWords && sug.originalStartLine.text.trim() !== '';

        if (textEditor.document.lineCount < line + 1) {
            return false;
        }
        // 判断是否已按建议内容修改过
        const judgeKeyWordsBefore =
          Utils.strAStartWithStrB(textEditor.document.lineAt(sug.insertno).text, '#elif defined(__aarch64__)');
        return judgeKeyWordsBefore && judgeKeyWords;
    },
    suggestionType1100(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (!sug.isAdded) {
            return sug.isAdded;
        } else {
            return !Utils
              .strAContainStrB(CodeSuggestViewHandler.suggestions[textEditor.document.fileName]?.beforeAddContext,
                textEditor.document.getText());
        }
    },
    suggestionType1200(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        return sug.isAdded && true;
    },
    suggestionType1996(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        const checkLine = range.end.line - 2;
        if (Utils.strAContainStrB(textEditor.document.lineAt(checkLine).text.trim(), sug.quickfixcontent)) {
            return true;
        } else {
            return false;
        }
    },
    suggestionType1300(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (textEditor.document.lineCount < 4) {
            return false;
        }
        // 判断是否已按建议内容修改过
        line = moveToNotNullLine(textEditor, line);
        let includeZoreLine = (line >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#if defined(__aarch64__)');

        // 判断100类型的替换内容，再决定是否跳几次间断查找
        const suggestions = CodeSuggestViewHandler.suggestions[textEditor.document.fileName];
        const pluginUrlCfg = CodeSuggestViewHandler.pluginUrlConfig[textEditor.document.fileName];
        let joinIndex = 3;
        for (const tempSug of suggestions) {
            const handlerName = 'suggestionType' + tempSug.suggestiontype;
            if (handlerName === 'suggestionType100' && tempSug.strategy &&
            Utils.strAContainStrB(tempSug.strategy,
                `Visit '${pluginUrlCfg.avxToNeon}' and obtain the 'avx2neon.h' )`.concat(
                    `source code according to the README.md file.`
                ))) {
                joinIndex = 4;
                break;
            }
        }

        // 跳三次间断查找
        let index = 0;
        while (index < joinIndex && !includeZoreLine) {
            line = moveToNotNullLine(textEditor, line);
            if (line !== -1) {
                includeZoreLine =
                  Utils.strAContainStrB(textEditor.document.lineAt(line++).text, '#if defined(__aarch64__)');
            }
            index++;
        }

        line = moveToNotNullLine(textEditor, line);
        const includeOneLine = (line >= 0) &&
            Utils.strAContainStrB(
                textEditor.document.lineAt(line++).text, '#include "KunpengTrans.h"');
        line = moveToNotNullLine(textEditor, line);
        const includeTwoLine = (line >= 0) &&
            Utils.strAContainStrB(textEditor.document.lineAt(line).text, '#endif');

        return includeZoreLine && includeOneLine && includeTwoLine;
    },
    suggestionType2200(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 2 < 0) {
            return false;
        }
        const commentText = checkFileTypeWithCommentedText(sug.fileType);
        // 定位问题行
        let judgeKeyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.keyword)
            || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);
        judgeKeyWords = judgeKeyWords && sug.originalStartLine.text.trim() !== '';

        if (textEditor.document.lineCount < line + 1) {
            return false;
        }

        // 判断是否已按建议内容修改过
        const judgeKeyWordsBefore =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '#if defined(__x86_64__)');
        const judgeKeyWordsAfterOne =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line).text, '#elif defined(__aarch64__)');
        const judgeKeyWordsAfterTwo =
          Utils.strAContainStrB(textEditor.document.lineAt(line + 1).text, `${commentText} ` + sug.description)
          || Utils.strAContainStrB(textEditor.document.lineAt(line + 1).text, `${commentText}` + sug.description);
        if (judgeKeyWordsBefore && judgeKeyWords && judgeKeyWordsAfterOne && judgeKeyWordsAfterTwo) {
            const ss = textEditor.document.lineAt(line).text;
        }
        return judgeKeyWordsBefore && judgeKeyWords && judgeKeyWordsAfterOne && judgeKeyWordsAfterTwo;
    },
    suggestionType1400(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 1 < 0) {
            return false;
        }

        const judgeAddedFlag = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.strategy);

        return judgeAddedFlag;
    },
    suggestionType1500(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 2 < 0) {
            return false;
        }
        // 定位问题行
        let judgeKeyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.keyword)
            || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);
        judgeKeyWords = judgeKeyWords && sug.originalStartLine.text.trim() !== '';

        if (textEditor.document.lineCount < line + 1) {
            return false;
        }

        // 判断是否已按建议内容修改过
        const judgeKeyWordsBefore =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '#ifdef __GFORTRAN__');
        const judgeKeyWordsAfterOne = Utils.strAStartWithStrB(textEditor.document.lineAt(line).text, '#else');
        const judgeKeyWordsAfterTwo = Utils.strAContainStrB(textEditor.document.lineAt(line + 1).text, sug.strategy);

        return judgeKeyWordsBefore && judgeKeyWords && judgeKeyWordsAfterOne && judgeKeyWordsAfterTwo;
    },
    suggestionType1600(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line < 3) {
            return false;
        }
        // 判断是否已按建议内容修改过
        line = moveToNotNullLine(textEditor, line);
        let judgeKeyWords = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.keyword)
          || Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);
        judgeKeyWords = judgeKeyWords && sug.originalStartLine.text.trim() !== '';

        if (textEditor.document.lineCount < line + 1) {
            return false;
        }
        // 判断是否已按建议内容修改过
        const judgeKeyWordsBefore =
          Utils.strAStartWithStrB(textEditor.document.lineAt(line - 2).text, '#if defined(__x86_64__)');
        return judgeKeyWordsBefore && judgeKeyWords;
    },
    suggestionType2500(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 1 < 0) {
            return false;
        }

        // 判断是否已按建议内容修改过
        let judgeAddedFlag = Utils.strAStartWithStrB(
            textEditor.document.lineAt(line - 1).text,
            '#'
        );
        judgeAddedFlag =
            judgeAddedFlag &&
            Utils.strAContainStrB(
                textEditor.document.lineAt(line - 1).text,
                sug.originalStartLine.text
            );

        return judgeAddedFlag;
    },
    suggestionType2600(textEditor: vscode.TextEditor, range: vscode.Range, sug: any, line: number) {
        if (line - 1 < 0) {
            return false;
        }

        // 判断是否已按建议内容修改过
        let judgeAddedFlag = Utils.strAStartWithStrB(textEditor.document.lineAt(line - 1).text, '#');
        judgeAddedFlag =
          judgeAddedFlag
          && Utils.strAContainStrB(textEditor.document.lineAt(line - 1).text, sug.originalStartLine.text);

        return judgeAddedFlag;
    },
};
