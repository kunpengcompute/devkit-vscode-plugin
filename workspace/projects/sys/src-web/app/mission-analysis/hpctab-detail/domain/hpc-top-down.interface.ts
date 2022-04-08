export interface IHpcTopDwon {
    expand?: boolean;
    name: string;
    levelIndex?: number;
    max?: boolean;
    proportion?: number;
    value: string;
    children?: Array<IHpcTopDwon>;
}
