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

var expandClassName="dropdownexpand";var collapseClassName="dropdowncollapse";var collapseTableClassName="dropdowncollapsetable";var href="";function ExpandorCollapseNode(a){a=a.parentNode;if(a.className==expandClassName){a.className=collapseClassName}else{a.className=expandClassName}}function ExpandorCollapseTableNode(a){a=a.parentNode;if(a.className==expandClassName){a.className=collapseTableClassName}else{a.className=expandClassName}}function ExpandorCollapseAllNodes(g,h,c){var a=g.getAttribute("title");var b=g.parentNode;if(a=="collapse"){g.setAttribute("title","expand");g.className="dropdownAllButtonexpand";g.innerHTML=h}else{g.setAttribute("title","collapse");g.className="dropdownAllButtoncollapse";g.innerHTML=c}var f=b.getElementsByTagName("*");for(var d=0;d<f.length;d++){var e=f[d];if(e.className.indexOf(expandClassName)!=-1||e.className.indexOf(collapseClassName)!=-1||e.className.indexOf(collapseTableClassName)!=-1){if(a=="collapse"){if(e.tagName.toLowerCase()=="table"){e.className=collapseTableClassName}else{e.className=collapseClassName}}else{e.className=expandClassName}}}}function ExpandForHref(f){if(null==f||"#"==f||"###"==f){return}var a=null;try{a=document.getElementById(f)}catch(d){}if(null==a||a.length==0){return}try{var b=a.parentNode;while(b!=null&&b.tagName!="body"){if(b.className==collapseClassName){b.className=expandClassName}b=b.parentNode}}catch(c){}}window.onload=function(){var b=document.getElementsByTagName("div");for(var c=0;c<b.length;c++){var j=b[c];if(j.className.indexOf(expandClassName)!=-1){j.className=collapseClassName}}var d=document.getElementsByTagName("a");try{for(var c=0;c<d.length;c++){var f=d[c];var h=f.getAttribute("href");if(h!=""&&h!=null){href=h;f.addEventListener("click",showHasConref,false)}}}catch(g){}};function showHasConref(){try{if(href!=null&&href!="#"&&href.lastIndexOf("#")>-1){ExpandForHref(href.substring(href.lastIndexOf("#")+1))}}catch(a){}};