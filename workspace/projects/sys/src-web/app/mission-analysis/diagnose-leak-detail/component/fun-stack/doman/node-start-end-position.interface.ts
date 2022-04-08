export interface NodeStartEndPosition {
    /** 函数名称 */
    funcName: string;
    startDotPosition: {
        width: number,
        height: number,
        left: number,
        top: number,
        right: number,
        bottom: number,
        x: number,
    };
    endArrowPosition: {
        width: number,
        height: number,
        left: number,
        top: number,
        right: number,
        bottom: number,
        x: number,
    };
    nextNodeFuncNames: Array<string>;
}
