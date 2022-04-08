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

import { Injectable } from '@angular/core';
import { AxiosService } from '../../service';
import { UpdatePwd, CreateUser, ResetPwd, DelUser } from './Interface/user.interface';

@Injectable({
  providedIn: 'root'
})

export class UserApi {
  constructor(private axiosServe: AxiosService) {}

  // 创建用户接口
  public createUser(data: CreateUser) {
    return this.axiosServe.axios({
      url: '/users/',
      method: 'post',
      data
    });
  }

  // 查询用户列表接口
  public seacrhUserList() {
    return this.axiosServe.axios({
      url: '/users/',
      method: 'get'
    });
  }

  // 获取用户自定义路径接口
  public searchCustomize() {
    return this.axiosServe.axios({
      url: '/customize/',
      method: 'get'
    });
  }

  // 修改密码接口
  public updatePwd(loginUserId: number, data: UpdatePwd) {
    return this.axiosServe.axios({
      url: `/users/${loginUserId}/resetpassword/`,
      method: 'post',
      data
    });
  }

  // 重置密码接口
  public resetPwd(userId: number, data: ResetPwd) {
    return this.axiosServe.axios({
      url: `/users/${userId}/`,
      method: 'post',
      data
    });
  }

  // 删除用户接口
  public delUser(userId: number, data: DelUser ) {
    return this.axiosServe.axios({
      url: `/users/${userId}/`,
      method: 'delete',
      data
    });
  }
}
