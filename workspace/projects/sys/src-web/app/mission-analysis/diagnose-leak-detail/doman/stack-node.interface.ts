export interface StackNode {
    /** 是否显示此节点 */
    show: boolean;
    /** 模块名，选择异常类型为异常释放次数时存在此属性 */
    moduleName?: string;
    /** 函数名 */
    funcName: string;
    /** 内存泄露类型，选择异常类型为异常释放次数时存在此属性 */
    leakType?: Array<number>;
    /** 子程序内存泄露次数 */
    childLeakCount: number;
    /** 自身内存泄露次数 */
    selfLeakCount: number;
    /** 子程序内存泄露大小 */
    childLeakSize: string;
    /** 自身内存泄露大小 */
    selfLeakSize: string;
    /** 子程序异常释放次数 */
    childAbnormalReleaseCount: number;
    /** 自身异常释放次数 */
    selfAbnormalReleaseCount: number;
    /** 子程序节点funcName数组 */
    nextNodeFuncNames: Array<string>;
    /** 父节点 */
    parents?: Array<StackNode>;
    /** 子节点 */
    children?: Array<StackNode>;
}
