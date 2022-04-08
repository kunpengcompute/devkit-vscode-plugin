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

function parseXML (data) {
    var xmlDoc = null;
    if (data) {
        var trimXmlStr = $.trim(data);
        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(trimXmlStr, "text/xml");
        } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            var index = trimXmlStr.indexOf("<?xml");
            if (index !== -1) {
                index = trimXmlStr.indexOf("?>", index);
                if (index !== -1) {
                    var strXML = trimXmlStr.substr(index + 2);
                    xmlDoc.loadXML(strXML);
                }
            } else {
                xmlDoc.loadXML(trimXmlStr);
            }
        }
    }
    return xmlDoc;
}

function loadScript (relativePath, scriptLoadedCallback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';

    // IE 9/10
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState === 'loaded' ||
                script.readyState === 'complete') {
                script.onreadystatechange = null;
                scriptLoadedCallback();
            }
        };
        script.onerror = scriptLoadedCallback;
    }
    //Firefox file protocol compatibility
    else if (window.navigator.product === 'Gecko' &&
    window.navigator.userAgent.indexOf('KHTML') === -1 &&
    window.navigator.userAgent.indexOf('Trident') === -1 &&
        window.location.protocol === 'file:') {
        var req = new XMLHttpRequest();
        var sCurrentPath = getPath(decodeURI(document.location.href));
        var scriptURL = getFullPath(sCurrentPath, relativePath);
        req.open('GET', encodeURI(scriptURL), true);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 0 || req.status === 200) {
                    // Script exists. For local files:
                    // Firefox < 35 returns 0 on every AJAX call.
                    // Firefox >= 35 returns 200 on success.
                    // We don't want to trigger the callback on success as it's
                    // triggered automatically by the onload handler.
                } else {
                    scriptLoadedCallback();
                }
            }
        };
        try {
            req.send(null);
        } catch (e) {
            scriptLoadedCallback();
            return;
        }
        script.onload = scriptLoadedCallback;
    } else {
        script.onload = scriptLoadedCallback;
        script.onerror = scriptLoadedCallback;
    }

    script.src = relativePath;
    head.appendChild(script);
}

function getPath(strURL) {
    // remove the search and hash string
    var n = 0;
    var n1 = strURL.indexOf('#');
    var n2 = strURL.indexOf('?');
    if (n1 >= 0) {
        if (n2 >= 0)
            n = (n1 > n2) ? n2 : n1;
        else n = n1;
    } else {
        if (n2 >= 0)
            n = n2;
        else n = strURL.length;
    }
    strURL = strURL.substring(0, n);

    var pathPos = strURL.lastIndexOf("/");
    if (pathPos > 0)
        return strURL.substring(0, pathPos + 1);
    else
        return "";
}

function isAbsPathToHost(path) {
    return (path.indexOf("/") === 0);
}

function getHost(path) {
    var pos = path.indexOf("//");
    if (pos > 0) {
        var posx = path.indexOf("/", pos + 2);
        if (posx > 0)
            return path.substring(0, posx);
        else
            return path;
    }
    return path;
}

function getFullPath(sPath, relPath) {
    if (isAbsPath(relPath))
        return relPath;
    else if (isAbsPathToHost(relPath))
        return getHost(sPath) + relPath;
    else {
        var fullPath = sPath;
        var pathPos = 0;
        while (pathPos !== -1) {
            pathPos = relPath.indexOf("../");
            if (pathPos !== -1) {
                relPath = relPath.substring(pathPos + 3);
                fullPath = fullPath.substring(0, fullPath.length - 1);
                var pos2 = fullPath.lastIndexOf("/");
                if (pos2 !== -1)
                    fullPath = fullPath.substring(0, pos2 + 1);
                else {
                    break;
                }
            }
        }
        fullPath += relPath;
        return fullPath;
    }
}

function isAbsPath(strPath) {
    var strUpper = strPath.toUpperCase();
    return (strUpper.indexOf(":") !== -1 || strUpper.indexOf("\\\\") === 0);
}
