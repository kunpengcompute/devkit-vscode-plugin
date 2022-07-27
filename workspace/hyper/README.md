# Hyper

## hyper 构建

基于 [Angular CLI](https://github.com/angular/angular-cli) version 10.1.6. 

### 脚手架

运行 `ng generate component component-name --skip-import` , 可以生成一个新的组件。 同样的： `ng generate directive|pipe|service|class|guard|interface|enum|module (--skip-import)`.

> Note: 使用 `--skip-import` ，是因为库中没有 root ModuleInjector

> Note: 当使用 ng generate module 时，不要使用 --skip-import. 

### 打包

通过 `ng build` 来打包库. 打包的出路为 `../../dist/hyper`.
> Note: 打包的出路不能随意更改


## 如何使用
在 hyper 中，一切都是模块，hyper 的构建方式是参考 tiny3 的，所以其使用方式和Tiny3 一样：
1. 当我们需要使用一个组件（管道，服务）时，需要引入其对应的 module
2. 当第一次引入时，需要设置主题和语言环境

## 如何编辑

### 目录结构
| 目录      | 描述                                           |
| :-------- | :--------------------------------------------- |
| component | 所有组件的目录                                 |
| directive | 所有指令的目录                                 |
| domain    | 库中所用到的数据结构: interface, enum, type... |
| pipe      | 所有管道的目录                                 |
| service   | 所有服务的目录                                 |
| util      | 静态工具类                                     |

### 如何创建一个组件
1. 使用 `ng generate component component-name --skip-import` 在 component 目录中新建一个组件
2. 使用 `ng generate module module-name` 在同目录下创建一个同名的模块
3. 更名：将被导出的类的命名前加上 Hy 前缀
4. 使用 index.ts 文件统一导出 模块 和 组件, 并在最外层的 index.ts 中导出

### 如何创建一个服务
1. 使用 `ng generate service service-name/service-name` 在 service 目录中新建一个服务
2. 使用 `ng generate module module-name` 在同目录下创建一个同名的模块
3. 更名：将被导出的类的命名前加上 Hy 前缀
4. 更改服务的注入器, 使用同目录下的模块作为其注入器（Injector）
5. 使用 index.ts 文件统一导出 模块 和 组件, 并在最外层的 index.ts 中导出

### 如何新建一个类型
1. 在 domain 目录下，新建文件，使用 hy-xxx.(type, interface, enum...).ts 命名
2. 在 domain 目录下的 index.ts 导出，如何需要向外暴露的话，在最外层的 index.ts 中导出
  
## 风格与规范

### 目录和文件命名风格
- 统一使用 kebab-case
- 类名和文件一致（但是风格为 camelCase）
  
#### domain 的命名风格
格式为：`hy-xxx.(type, interface, enum...).ts`
- 所有的文件名都以 `hy-` 开头
- 以 `.(type, interface, enum...).ts` 为结尾，指明类型

#### util 的命名风格
- 不需要文件名以 `hy-` 开头
- 以 `.util.ts` 为结尾，指明其为工具类

### 导出类的命名风格
除工具类之外，所有导出类都以 Hy 开头

### 注释风格

#### 组件注释风格
| 修饰        | 描述        |
| :---------- | :---------- |
| @Input      | Input 参数  |
| @Output     | Output 事件 |
| @example    | 使用示例    |
| @usageNotes | 注意事项    |

**示例：**
```javascript
/**
 * 动态图标组件
 *
 * @Input name: 图标的名称
 * @Input freeze: icon 的冻结状态
 *
 * @example
 * <hy-icon-react [name]="'iconName'"></hy-icon-react>
 * <hy-icon-react
 *    [name]="'iconName'"
 *    [freeze]="'normal' | 'active' | 'normal' | 'disabled'">
 * </hy-icon-react>
 *
 * @usageNotes 此组件会监听 document 的 mouseup 事件，可能会引发性能问题
 */
 ```

 #### 方法（函数）注释风格
 | 修饰     | 描述   |
 | :------- | :----- |
 | @param   | 参数   |
 | @returns | 返回值 |

**示例：**
```javascript
/**
 * 通过向头部补充字符，使得字符串达到预期长度
 *
 * @param value 需要补齐的字符串
 * @param targetLen 希望的补齐的后的长度
 * @param padStr 用于补齐的字符或字符串
 * @returns 目标字符串
 *
 */
export function padStart(
    value: number | string, targetLen: number, padStr: string
): string {}
```

### 组件封装规范

#### OnPush 策略
所有组件（指令）的变更检测策略必须为 OnPush

#### contructor 的怎么使用
contructor 的任务是构建 component 类，所以它应该用于初始化属性，不要用于处理逻辑

#### 什么时候使用 ngOnInit
ngOnInit 调用时，表明 component 的 model 已初始完成，但是 view 还没有渲染，所以这里适合用于处理无关渲染的逻辑和。无能用于：获取视图元素、数据请求等操作

#### 什么时候使用 ngAfterViewInit
ngAfterViewInit 调用时，表明 view 已渲染完成，所以可以在这里执行获取视图元素相关的操作。同时数据请求也适合在这里执行
> ngAfterViewInit 中不能给视图绑定的属性赋值

#### 什么时候使用 ngOnChange
在 Input 参数不多的情况下，直接使用 setter/getter 来监视变化。如果 Input 参数过多，使用 ngOnChange 同监视变化会比较好

#### runOutsideAngular 的使用
监听的事件被频繁的触发时，必须使用 runOutsideAngular 来处理

#### 属性的命名规范
- camelCase
- 以名词开头，最好不要超过 16 个字符

#### 方法的命名规范
- camelCase
- 以名词开头，最好不要超过 16 个字符
- 事件处理方法以 on 开头，以事件名结尾，如： `onXxxChange`, `onXxxClick`, `onXxxMousedown`

#### 组件的最大代码行数
最好不要超过 300 行

#### 什么样的逻辑应该由服务在负责
组件中只包含与视图相关的逻辑。所有其它逻辑都应该放到服务中

### 关于代码风格
代码风格遵循 **JavaScript语言安全编程规范-V2_0**
