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

import {
  ConfirmFingerprintComponent,
  DataValidFailComponent,
  ExcelParseComponent,
  TemplateUpLoadComponent,
  BackValidFailComponent,
} from '../component';
import {
  DataValidService,
  BackValidService,
  AddNodesService,
} from '../service';
import { BatchOptState } from '../domain';
import { OptStateInfo } from '../model';

export const importStateMap = new Map<BatchOptState, OptStateInfo>([
  [
    BatchOptState.TemplateUpDown,
    {
      token: TemplateUpLoadComponent,
      type: 'component',
    },
  ],
  [
    BatchOptState.ExcelParse,
    {
      token: ExcelParseComponent,
      type: 'component',
    },
  ],
  [
    BatchOptState.DataValid,
    {
      token: DataValidService,
      type: 'service',
    },
  ],
  [
    BatchOptState.DataValidFail,
    {
      token: DataValidFailComponent,
      type: 'component',
    },
  ],
  [
    BatchOptState.BackValid,
    {
      token: BackValidService,
      type: 'service',
    },
  ],
  [
    BatchOptState.BackValidFail,
    {
      token: BackValidFailComponent,
      type: 'component',
    },
  ],
  [
    BatchOptState.Fingerprint,
    {
      token: ConfirmFingerprintComponent,
      type: 'component',
    },
  ],
  [
    BatchOptState.AddNodes,
    {
      token: AddNodesService,
      type: 'service',
    },
  ],
]);
