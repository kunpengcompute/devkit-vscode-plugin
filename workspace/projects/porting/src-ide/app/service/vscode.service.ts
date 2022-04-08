import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TiLocale } from '@cloud/tiny3';
import { HyLocale } from 'hyper';
import { MessageService } from '../service/message.service';

let that: any;
declare function acquireVsCodeApi(): any;
const vscode = acquireVsCodeApi();

@Injectable({
    providedIn: 'root'
})
export class VscodeService {

    private callbacks: any = {};

    private msgHandlers: Map<string, any[]> = new Map<string, any[]>();

    constructor(public router: Router, private msgService: MessageService) {
        that = this;
    }

    /**
     * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
     *
     */
    messageHandler: { [key: string]: any } = {

        /**
         * 此方法响应vscode 消息事件，页面进行跳转
         * @param message vscode 发送的事件参数
         */
        navigate(message: any) {
            if (message.data.webSession) {
                const webSession = message.data.webSession;
                ((self as any).webviewSession || {}).setItem('role', webSession.role);
                ((self as any).webviewSession || {}).setItem('username', webSession.username);
                ((self as any).webviewSession || {}).setItem('loginId', webSession.loginId);
                ((self as any).webviewSession || {}).setItem('isFirst', webSession.isFirst);
                ((self as any).webviewSession || {}).setItem('language', webSession.language);
                if (webSession.language === 'zh-cn') {
                    TiLocale.setLocale(TiLocale.ZH_CN);
                    HyLocale.setLocale(HyLocale.ZH_CN);
                } else {
                    TiLocale.setLocale(TiLocale.EN_US);
                    HyLocale.setLocale(HyLocale.EN_US);
                }
                ((self as any).webviewSession || {}).setItem('workspace', webSession.workspace);
                ((self as any).webviewSession || {}).setItem('migrationTip', webSession.migrationTip);
                ((self as any).webviewSession || {}).setItem('showCheckEnvTips', webSession.showCheckEnvTips);
            }
            that.router.navigate([message.data.page], message.data.pageParams);
        },
        /**
         * 文件下载
         *
         * @param data 发送的事件参数
         */
        downloadFile(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 判断是否登录绑定回调函数
         *
         * @param data 发送的事件参数
         */
        isLogin(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 保存ip 端口设置绑定回调函数
         *
         * @param data 发送的事件参数
         */
        saveConfig(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        getpwd(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },
        /**
         * 修改完密码，重置加密文件中的密码
         *
         * @param data 发送的事件参数
         */
        setPwd(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },
        /**
         * 删除加密文件中保存的密码
         *
         * @param data 发送的事件参数
         */
        deletePwd(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },
        /**
         * 绑定回调
         *
         * @param data vscode发送的消息数据
         */
        checkConn(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 读取ip 端口设置绑定回调函数
         *
         * @param data 发送的事件参数
         */
        readConfig(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 读取ip 端口设置绑定回调函数
         *
         * @param data 发送的事件参数
         */
        readUrlConfig(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 查询文件夹绑定回调函数
         *
         * @param data 发送的事件参数
         */
        checkDir(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 调用部署流程绑定回调函数
         *
         * @param data 发送的事件参数
         */
        install(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                if (data.data.search(/Error/) !== -1) {
                    delete that.callbacks[data.cbid];
                } else if (data.data.search(/failed/) !== -1) {
                    delete that.callbacks[data.cbid];
                }
            }
        },

        /**
         * 调用卸载流程绑定回调函数
         *
         * @param data vscode发送的消息数据
         */
        uninstall(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                if (data.data.search(/Error/) !== -1) {
                    delete that.callbacks[data.cbid];
                } else if (data.data.search(/failed/) !== -1) {
                    delete that.callbacks[data.cbid];
                }
            }
        },

        /**
         * 调用升级流程绑定回调函数
         *
         * @param data vscode发送的消息数据
         */
        upgrade(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                if (data.data.search(/Error/) !== -1) {
                    delete that.callbacks[data.cbid];
                } else if (data.data.search(/failed/) !== -1) {
                    delete that.callbacks[data.cbid];
                }
            }
        },

        /**
         * 清理配置文件绑定回调函数
         *
         * @param data 发送的事件参数
         */
        cleanConfig(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 调用privateKeyCheck绑定回调函数
         *
         * @param data vscode发送的消息数据
         */
        privateKeyCheck(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 设置全局变量绑定回调函数
         *
         * @param data 发送的事件参数
         */
        setGlobleState(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },
        /**
         * 获取全局变量绑定回调函数
         *
         * @param data 发送的事件参数
         */
        getGlobleState(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },
        /**
         * 此方法响应vscode 消息事件，返回接口数据
         * @param data 发送的事件参数
         */
        getData(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },
        /**
         * 此方法响应vscode 消息事件，返回readVersionConfig接口数据
         * @param data 发送的事件参数
         */
        readVersionConfig(data: any) {
            if (that.callbacks[data.cbid]) {
                that.callbacks[data.cbid](data.data);
                delete that.callbacks[data.cbid];
            }
        },

        /**
         * 此方法响应vscode 消息事件，更新webviewsession中的language
         * @param data 发送的事件参数
         */
        getLocale(data: any) {
            ((self as any).webviewSession || {}).setItem('language', data.data);
        },

        /**
         * 此方法单独发送消息至组件接受，消息订阅模式
         * @param message 发送的事件参数
         */
        sendMessage(message: any) {
            that.msgService.sendMessage(message.data);
        },

        /**
         * 此方法响应vscode 回调处理
         * @param message 事件参数
         */
        callbackProcess(message: any) {
            if (that.callbacks[message.cbid]) {
                that.callbacks[message.cbid](message.data);
                delete that.callbacks[message.cbid];
            }
        },

        /**
         * 此方法响应vscode 回调处理
         * @param message 事件参数
         */
        processVscodeMsg(message: any) {
            if (that.callbacks[message.cbid]) {
                that.callbacks[message.cbid](message.data);
                if (message.data.enable) {
                    delete that.callbacks[message.cbid];
                }
            }
        },

        /**
         * 此方法响应vscode消息处理
         * @param message 事件参数
         */
        handleVscodeMsg(message: any) {
            const handlers = that.msgHandlers.get(message.type);
            if (!handlers) {
                return;
            }
            for (const handler of handlers) {
                handler(message.data);
            }
        },

        /**
         * 此方法响应vscode消息处理
         * @param message 事件参数
         */
        uploadMigrateFile(message: any) {
            if (that.callbacks[message.cbid]) {
                that.callbacks[message.cbid](message.data);
                delete that.callbacks[message.cbid];
            }
        },

        /**
         * 此方法响应vscode消息处理
         * @param message 事件参数
         */
        uploadPortingFile(message: any) {
            if (that.callbacks[message.cbid]) {
                that.callbacks[message.cbid](message.data);
                delete that.callbacks[message.cbid];
            }
        }
    };

    /**
     * 注册vscode消息处理接口
     *
     * @param type 消息类型
     * @param handler VSCode消息处理方法
     */
    public regVscodeMsgHandler(type: string, handler: any) {
        if (handler) {
            let handlers = this.msgHandlers.get(type);
            if (!handlers) {
                handlers = [];
                this.msgHandlers.set(type, handlers);
            }
            handlers.push(handler);
        }
    }

    /**
     * webview向vscode发送消息公共接口
     *
     * @param message 消息体
     * @param callback 回调方法
     */
    public postMessage(message: any, callback: any) {
        const callbackId = new Date().getTime() * 100000 + window.crypto.getRandomValues(new Uint32Array(1))[0];
        const messageReq = {
            cbid: callbackId,
            cmd: message.cmd ? message.cmd : 'getData',
            module: 'porting',
            data: message.data
        };

        // 如果有回调函数，则添加回调函数
        if (callback) {
            this.callbacks[callbackId] = callback;
        }

        vscode.postMessage(messageReq);
    }

    /**
     * webview 通过 vscode调用接口
     * @param url 访问地址
     * @param params 参数
     * @param callback 回调方法
     */
    public get(options: any, callback: any) {
        options.method = 'GET';
        const message = {
            cmd: 'getData',
            data: options
        };

        // 发送消息给vscode
        this.postMessage(message, callback);
    }

    /**
     * webview 通过 vscode调用接口
     * @param url 访问地址
     * @param params 参数
     * @param callback 回调方法
     */
    public put(options: any, callback: any) {
        options.method = 'PUT';
        const message = {
            cmd: 'getData',
            data: options
        };

        // 发送消息给vscode
        this.postMessage(message, callback);
    }

    /**
     * webview 通过 vscode调用接口
     * @param url 访问地址
     * @param params 参数
     * @param callback 回调方法
     */
    public post(options: any, callback: any) {
        options.method = 'POST';
        const message = {
            cmd: 'getData',
            data: options
        };

        // 如果有回调函数，则添加回调函数
        this.postMessage(message, callback);
    }

    /**
     * webview 通过 vscode调用接口
     * @param url 访问地址
     * @param params 参数
     * @param callback 回调方法
     */
    public delete(options: any, callback: any) {
        options.method = 'DELETE';
        const message = {
            cmd: 'getData',
            data: options
        };

        // 如果有回调函数，则添加回调函数
        this.postMessage(message, callback);
    }

    /**
     * 此方法响应vscode 消息事件，将事件分发给对应的函数处理
     * @param message vscode 发送的事件参数
     */
    public handleEvent(message: any) {
        // 直接调用对应的函数 message = { cmd: 'navigate', data: {page:'/home',pageParam:'',token:''}};
        if (message.data && message.data.status && !message.data.realStatus) {   // 真实状态码不存在，则获取真实状态码
            message.data.realStatus = message.data.status;
            message.data.status = Number(String(message.data.status).substr(-2, 1));  // 返回倒数第二位状态码
        }
        this.messageHandler[message.cmd](message);
    }
}

// 颜色主题
export const enum COLOR_THEME {
    Dark = 1,
    Light = 2
}

// 端口号
export const enum DEFAULT_PORT {
    DEP_DEFAULT_PORT = '8082',
    PORTING_DEFAULT_PORT = '8084'
}
