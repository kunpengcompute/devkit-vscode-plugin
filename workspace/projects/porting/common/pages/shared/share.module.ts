/**
 * 共享模块
 */
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Tiny 相关
import {
  TiTableModule, TiTipModule, TiOverflowModule
} from '@cloud/tiny3';

const TINY_MODULES = [
  TiTableModule, TiTipModule, TiOverflowModule
];

const COMMON_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule
].concat(TINY_MODULES);

@NgModule({
  declarations: [],
  imports: [
    COMMON_MODULES
  ],
  exports: COMMON_MODULES
})
export class ShareModule { }
