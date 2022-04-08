/**
 * 动态图标
 */
export interface HyReactIcon {
    name: string;
    data: {
        normal: string,
        hover: string,
        active?: string,
        disabled?: string,
    };
}
