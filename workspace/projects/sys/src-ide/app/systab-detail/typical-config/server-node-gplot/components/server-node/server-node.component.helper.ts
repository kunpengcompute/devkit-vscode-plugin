/**
 * 节点的状态：'NORMAL' | 'HOVER' | 'CLICK'
 */
export type NodeStatus = 'NORMAL' | 'HOVER' | 'CLICK';

/**
 * 节点所处的事件类型： 'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup'
 */
export type EventType = 'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup';

/**
 * 节点的颜色的枚举，可以用通过"节点的状态（NodeStatus）"直接索引出其对应的 颜色 （深色dark主题）
 */
export enum NodeColorEnum {
    NORMAL = '#979797',
    HOVER = '#e8e8e8',
    CLICK = '#e8e8e8',
    FILL_NORMAL = '#242424',
    FILL_HOVER = '#3F3F3F',
}
/**
 * 节点的颜色的枚举，可以用通过"节点的状态（NodeStatus）"直接索引出其对应的 颜色 （浅色light主题）
 */
export enum LightNodeColorEnum {
    NORMAL = '#979797',
    HOVER = '#267DFF',
    CLICK = '#0057D9',
    FILL_NORMAL = '#ffffff',
    FILL_HOVER = '#e8e8e8',
}
