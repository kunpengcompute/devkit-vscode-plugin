export interface FuncProps {
    /** 是否自身有发生泄露 */
    isSelf?: boolean;
    /** 模块名，选择异常类型为异常释放次数时存在此属性 */
    moduleName?: string;
    /** 函数名 */
    funcName: string;
    /** 内存泄露类型，选择异常类型为异常释放次数时存在此属性 */
    leakType?: Array<number>;
    /** 子程序内存泄露次数 */
    childLeakCount?: number;
    /** 自身内存泄露次数 */
    selfLeakCount?: number;
    /** 子程序内存泄露大小 */
    childLeakSize?: string;
    /** 自身内存泄露大小 */
    selfLeakSize?: string;
    /** 子程序异常释放次数 */
    childAbnormalReleaseCount?: number;
    /** 自身异常释放次数 */
    selfAbnormalReleaseCount?: number;
    /** 内存异常访问 */
    exceptionDteail?: {
        /** 进程id */
        pid?: number;
        /** 异常类型 */
        type?: number;
        /** 访问类型 */
        access_type?: string;
        /** 异常访问点 */
        stack?: string;
        /** 辅助信息 */
        help?: string;
        /** 查看更多信息 */
        detail?: string;
    }[];
    /** 左侧下拉选择内存泄漏类型 */
    memLeakType?: number;
}
