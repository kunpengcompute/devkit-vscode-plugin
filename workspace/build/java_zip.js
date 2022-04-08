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

var {rm, mkdir} = require('shelljs');
var zipFolder = require('zip-folder');

var srcPath = 'dist/java';
var tagPath = 'out/';
var tagFile = `Hyper-Tuner-Java-ui.zip`;

rm('-rf', tagPath + tagFile);
mkdir(tagPath);

zipFolder(srcPath, tagPath + tagFile, function(err) {
  if (err) {
    console.error('Error:', `${srcPath} packaging failed`, err);
  } else {
    console.log('Success:', `zip: ${srcPath} -> ${tagPath + tagFile}\n`);
  }
});
