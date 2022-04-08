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

/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2020-2020. All rights reserved.
 */
var tokensMap,
    i18n = {
        "zh": {
            "searching": "正在搜索...",
            "noKeyword": "搜索关键字不能为空.",
            "noResult": "未找到主题."
        }, "en": {
            "searching": "Searching...",
            "noKeyword": "Search keywords cannot be empty",
            "noResult": "No topics found."
        }
    },
    keyWord,
    titleOrContext,
    fileNameMap,
    searching,
    noKeyWord,
    noResult,
    h1Map,
    searchDataKey,
    indexPath = "data/index.js",
    fileNameMapPath = "data/file_name_map.js",
    h1FilePath = "data/h1.js",
    indexReady = "indexReady",
    naviReady = "naviReady";

function Map() {
    // noinspection JSValidateTypes
    this.keys = [];
    this.data = {};

    this.set = function (key, value) {
        if (this.data[key] == null) {
            if (this.keys.indexOf(key) === -1) {
                this.keys.push(key);
            }
        }
        this.data[key] = value;
    };

    this.get = function (key) {
        return this.data[key];
    };

    this.push = function (map) {
        var self = this;
        map.keys.forEach(function (item) {
            self.set(item, map.get(item));
        })
    };

    this.size = function () {
        return this.keys.length;
    }
}

function initTips() {
    searching = "<span style=\"font-family: 宋体,serif;font-size: 12px;\">" + i18n[language].searching + "</span>";
    noKeyWord = "<span style=\"font-family: 宋体,serif;font-size: 12px;\">" + i18n[language].noKeyword + "</span>";
    noResult = "<span style=\"font-family: 宋体,serif;font-size: 12px;\">" + i18n[language].noResult + "</span>";
}

function Message(type, value) {
    this.type = type;
    this.value = value;
}

function JsInfo(name, baseUrl, ref, callback) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.ref = ref;
    this.callback = callback;
}

function loadIndexFiles(jsInfos) {
    var startPromise = new Promise(function (resolve) {
        resolve();
    });

    for (var i = 0; i < jsInfos.length; i++) {
        (function (jsInfo) {
            startPromise = startPromise.then(function () {
                searchDataKey = null;
                return new Promise(function (resolve) {
                    loadScript(jsInfo.ref ? jsInfo.ref + "/" + jsInfo.baseUrl : jsInfo.baseUrl, function () {
                        var xmlDoc = parseXML(searchDataKey);
                        if (xmlDoc) {
                            jsInfo.callback(xmlDoc, jsInfo);
                        }
                        resolve();
                    });
                });
            })
        })(jsInfos[i]);
    }
    startPromise.then(function () {
        triggerEvent(indexReady);
    });
}

/**
 * Before searching, load the index file, file name and ID mapping file, and H1 file.
 */
function beforeSearch() {
    titleOrContext = $("#titleOrContext option:selected").val();
    if (!tokensMap && !fileNameMap && !h1Map && titleOrContext === "2") {
        loadIndexFiles(needLoadFile());
    } else {
        triggerEvent(indexReady);
    }
}

function needLoadFile() {
    var jsInfos = [];
    jsInfos.push(new JsInfo(null, indexPath, null, handleTokensDom));
    jsInfos.push(new JsInfo(null, fileNameMapPath, null, fileName2Map));
    jsInfos.push(new JsInfo(null, h1FilePath, null, h12Map));

    if (mergedProjects) {
        for (var i = 0; i < mergedProjects.length; i++) {
            jsInfos.push(new JsInfo(mergedProjects[i].name, indexPath, mergedProjects[i].ref, handleTokensDom));
            jsInfos.push(new JsInfo(mergedProjects[i].name, fileNameMapPath, mergedProjects[i].ref, fileName2Map));
            jsInfos.push(new JsInfo(mergedProjects[i].name, h1FilePath, mergedProjects[i].ref, h12Map));
        }
    }
    return jsInfos;
}

function fileName2Map(dom, jsInfo) {
    var ref = jsInfo.ref;
    var lastDom = dom.lastChild.childNodes;
    if (!fileNameMap) {
        fileNameMap = new Map();
    }
    var item, url, id;
    for (var i = 0; i < lastDom.length; i++) {
        item = lastDom[i];
        if (item.nodeType === 1) {
            id = item.getAttribute("i");
            url = item.getAttribute("f");
            if (ref) {
                fileNameMap.set(ref + "-" + id, ref + "/" + url);
            } else {
                fileNameMap.set(id, url);
            }
        }
    }
}

function triggerEvent(type) {
    var event;
    if(typeof(Event) === 'function') {
        event = new Event(type);
    }else{
        event = document.createEvent('Event');
        event.initEvent(type, true, true);
    }
    window.dispatchEvent(event);
}

function handleTokensDom(data, jsInfo) {
    var ref = jsInfo.ref;
    var allTokens = data.lastChild.childNodes;
    if (!tokensMap) {
        tokensMap = new Map();
    }
    var tokenWithoutText = [];
    var token;
    for (var i = 0; i < allTokens.length; i++) {
        token = allTokens[i];

        // Obtains all keywords in the index token.
        if (token.nodeType === 1) {
            tokenWithoutText.push(token);
        }
    }
    tokensMap.set(ref, tokenWithoutText);
}

function search() {
    keyWord = $("#keyWord").val().trim();
    if (!keyWord || keyWord === "") {
        tips(noKeyWord);
        return;
    }
    buttonDisabled("searchResult");
    tips(searching);
    beforeSearch();
}

/**
 * Displaying a message during search
 * @param tip
 */
function tips(tip) {
    $("#result-div").html(tip);
}

/**
 * Search keyword main logic
 */
function searchKeyword() {
    var treeObj = $.fn.zTree.getZTreeObj("zTree");
    var nodes = [];
    if (keyWord && keyWord !== "") {
        // Search Title
        if (titleOrContext === "1") {
            nodes = treeObj.getNodesByParamFuzzy("name", keyWord);
            // Searching for Content
        } else if (titleOrContext === "2") {
            var result = getWordRec(keyWord);
            var positions = weightSort(result);
            if (positions && positions.size() > 0) {
                positions.keys.forEach(function (item) {
                    nodes.push(treeObj.getNodeByParam("local", item));
                });
            }
        }
        if (keyWord && nodes.length > 0) {
            $("#result-div").html("<ul id=\"searchResult\" style=\"font-family: 宋体,serif;font-size: 12px;\"></ul>");
            for (var i = 0; i < nodes.length; i++) {
                var liNode = document.createElement("li");
                liNode.setAttribute("class", "sLi");
                liNode.setAttribute("value", nodes[i].tId)
                liNode.onclick = function () {
                    var isLight = parseInt(titleOrContext);
                    clickLiFunc(this, isLight);
                };

                liNode.appendChild(document.createTextNode(nodes[i].name));

                document.getElementById("searchResult").appendChild(liNode);

            }
        } else {
            tips(noResult);
        }
    }

    if (browser !== "Chrome") {
        changeLiStyle();
    }

    buttonEnabled("searchResult")
}

// Sort search results
function weightSort(record) {
    if (typeof record === "undefined" || record.size() === 0) {
        return null;
    }
    var scoreMap = new Map();

    // The rule for sorting search results is as follows:
// 1. Search keywords in the h1 tag have the highest score. After appearing in h1, sort articles by number of occurrences.
// 2. The more times you appear in an article, the higher the score.
    scoreMap.push(grepH1(record));
    scoreMap.push(hits(record, scoreMap));

    return scoreMap;
}

/**
 * Search for articles with keywords appearing in the H1 tag and sort them in descending order of occurrences
* @param record Search result
* @returns {Map} Sorting result
 */
function grepH1(record) {
    var h1Html;
    var match;
    var h1Match = record.keys.filter(function (id) {
        h1Html = h1Map.get(id);
        match = h1Regexp(h1Html);
        return typeof match !== "undefined" && match !== null;
    });
    return hitsSort(record, h1Match);
}

function h12Map(dom, jsInfo) {
    var ref = jsInfo.ref;
    var h1s = dom.lastChild.childNodes;
    if (!h1Map) {
        h1Map = new Map();
    }
    var item, id;
    for (var i = 0; i < h1s.length; i++) {
        item = h1s[i];
        if (item.nodeType === 1) {
            id = item.getAttribute("i");
            h1Map.set(ref ? ref + "-" + id : id, item.getAttribute("t"));
        }
    }
}

/**
 * Sort by occurrences
 * @param record
 * @param arr
 * @returns {Map}
 */
function hitsSort(record, arr) {
    var hitsNumMap = new Map();
    arr.forEach(function (id) {
        var path = fileNameMap.get(id);
        hitsNumMap.set(record.get(id).length + path, path);
    });
    var sortKeys = hitsNumMap.keys.sort(function (a, b) {
        return b.substring(0, b.lastIndexOf(hitsNumMap.get(b))) - a.substring(0, a.lastIndexOf(hitsNumMap.get(a)));
    });
    var sortedMap = new Map();
    var key;
    sortKeys.forEach(function (item) {
        key = hitsNumMap.get(item);
        sortedMap.set(key, record.get(key));
    });
    return sortedMap;
}

function hits(record, scoreMap) {
    var other = record.keys.filter(function (id) {
        return scoreMap.keys.indexOf(fileNameMap.get(id)) === -1;
    });
    if (other === null || typeof other === "undefined" || other.length === 0) {
        return new Map();
    }

    return hitsSort(record, other);
}

// Check whether keywords exist in the h1 header.
function h1Regexp(innerHtml) {
    var htmlTagPattern = "(<(\"[^\"]*\"|'[^']*'|[^'\">])*>)*";
    var keyWordArr = keyWord.split("");

    escapeCharacter(keyWordArr);
    var regex = keyWordArr.join(htmlTagPattern);
    var pattern = new RegExp(regex, "g");
    return innerHtml.match(pattern);
}

// Obtains all word sets related to keywords.
function getWordRec(keyword) {
    var token,
        tokens,
        matchTokens,
        keys = tokensMap.keys,
        matchTokensMap = new Map();
    for (var i = 0; i < keys.length; i++) {
        matchTokens = [];
        tokens = tokensMap.get(keys[i]);
        for (var j = 0; j < tokens.length; j++) {
            token = tokens[j];
            // Obtains all keywords in the index token.
            if (keyword.indexOf(token.getAttribute("n")) !== -1) {
                matchTokens.push(token);
            }
        }
        matchTokensMap.set(keys[i], matchTokens);
    }
    return analysis(keyword, matchTokensMap);
}

// Obtain word segmentation based on the search content and determine whether the word is matched based on the offset.
function analysis(keyword, matchTokensMap) {
    var keywordArr = keyword.split("");
    var char;
    var token;
    var positions = new Map();
    // 1: letters or digits; 2: others (Chinese characters, punctuation marks)
// The two types are letters and digits. The two types of participles form a word, while the Chinese character or punctuation is a word.
    var type = 0;
    // A string consisting of letters and arrays.
    var slice;
    // Indicates whether the character is the first matched character.
    var isBegin = true;
    var beforeLength = 1;
    for (var i = 0, length = keywordArr.length; i < length; i++) {
        char = keywordArr[i];
        if (isDigitalOrChar(char)) {
            // If the preceding character is not a letter or a number, the preceding character numeric fragment is cleared
            if (type !== 1) {
                slice = "";
                type = 1;
            }
            slice += char;

            // If the next character is at the end or is not a character or number, the index search is performed.
            if ((i + 1 >= keywordArr.length) || !isDigitalOrChar(keywordArr[i + 1])) {
                token = binarySearch(slice, matchTokensMap);
                if (token.size() === 0) {
                    return undefined;
                } else {
                    positions = combineQueue(positions, token, beforeLength, isBegin);
                    beforeLength = slice.length;
                    isBegin = false;
                    // If the linked list is empty after being merged, the search fails.
                    if (positions.size === 0) {
                        return undefined;
                    }
                }
            }
        } else {
            type = 2;
            token = binarySearch(char, matchTokensMap);
            if (token.size() === 0) {
                return undefined;
            } else {
                positions = combineQueue(positions, token, beforeLength, isBegin);
                beforeLength = 1;
                isBegin = false;
                // If the linked list is empty after being merged, the search fails.
                if (positions.size === 0) {
                    return undefined;
                }
            }
        }
    }

    return positions;
}

/**
 *
 * @param positions Accumulated search results before
* @param nextPositions Search result of the current character
* @param beforeLength Length of the previous result, for example, "Description of abc". When "A" is found, the length of the previous result abc is 3. (When word segmentation is performed, a single Chinese character segmentation is counted as a single word, and a combination of letters and digits is counted as a whole.)
* @param isBegin Indicates whether to search for the first word of a sentence, for example, "Description". When "say" isBegin" is true.
 * @returns {*}
 */
function combineQueue(positions, nextPositions, beforeLength, isBegin) {
    var result = new Map();
    var positionsKeys = positions.keys;
    var nextPositionsKeys = nextPositions.keys;
    var resultKeys = [];
    // Indicates whether the matching is performed for the first time, that is, the first character or a string of digits and letters except for other characters.
    if (isBegin) {
        return nextPositions;
    } else {
        // Check whether the file names overlap.
        resultKeys = positionsKeys.filter(function (value) {
            return nextPositionsKeys.indexOf(value) > -1;
        });

        //If no intersection exists, an empty map is returned and the search ends.
        if (resultKeys.length === 0) {
            return result;
        } else { 
            // If there is an intersection, check whether the character offset is consecutive. If the character offset is not consecutive, the search result is not displayed.
            var positionsValue;
            var nextPositionsValue;
            var resultValue;
            for (var i = 0; i < resultKeys.length; i++) {
                positionsValue = positions.get(resultKeys[i]);
                nextPositionsValue = nextPositions.get(resultKeys[i]);
                // Obtain the intersection set,if The offsets of two search keywords in the same file are consecutive. 
                resultValue = nextPositionsValue.filter(function (value) {
                    return positionsValue.indexOf(String(value - beforeLength)) > -1;
                });
                // If the offsets of two search keywords in the same file are consecutive, the search result is returned.
                if (resultValue.length > 0) {
                    result.set(resultKeys[i], resultValue);
                }
            }
        }
    }
    return result;
}

// Letters or digits
var digitalOrChar = new RegExp("[A-Za-z]|[0-9]");

function isDigitalOrChar(char) {
    return digitalOrChar.test(char);
}

// Searches for the matched token in the index.
function binarySearch(slice, matchTokensMap) {
    var result = new Map();
    var ref,
        token,
        tokens,
        tokenStr,
        tokensBegin,
        tokensEnd,
        mid,
        fileName;
    for (var i = 0, keys = matchTokensMap.keys; i < keys.length; i++) {
        ref = keys[i];
        tokens = matchTokensMap.get(keys[i]);
        tokensBegin = 0;
        tokensEnd = tokens.length - 1;
        while (tokensBegin <= tokensEnd) {
            mid = Math.floor((tokensBegin + tokensEnd) / 2);
            tokenStr = tokens[mid].getAttribute("n");
            if (slice < tokenStr) {
                tokensEnd = mid - 1;
            } else if (slice > tokenStr) {
                tokensBegin = mid + 1;
            } else {
                token = tokens[mid];
                var positions = token.childNodes;
                for (var j = 0; j < positions.length; j++) {
                    if (positions[j].nodeType === 1) {
                        fileName = positions[j].getAttribute("f");
                        result.set(ref ? ref + "-" + fileName : fileName, positions[j].getAttribute("o").split(","));
                    }
                }
                break;
            }
        }
    }
    return result;
}

function buttonEnabled(sid) {
    $("#" + sid).attr("disabled", false);
}

function buttonDisabled(sid) {
    $("#" + sid).attr("disabled", true);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchButton')
        .addEventListener('click', search);
});
