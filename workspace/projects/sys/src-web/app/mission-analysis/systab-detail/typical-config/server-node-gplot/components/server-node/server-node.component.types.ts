/**
 * 节点的状态：'NORMAL' | 'HOVER' | 'CLICK'
 */
export type NodeStatus = 'NORMAL' | 'HOVER' | 'CLICK';

/**
 * 节点所处的事件类型： 'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup'
 */
export type EventType = 'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup';

/**
 * 节点的颜色的枚举，可以用通过"节点的状态（NodeStatus）"直接索引出其对应的 颜色
 */
export enum NodeColorEnum {
    NORMAL = '#979797',
    HOVER = '#267DFF',
    CLICK = '#0057D9'
}
