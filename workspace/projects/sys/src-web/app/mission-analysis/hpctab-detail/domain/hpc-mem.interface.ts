

export interface IHpcMemInstruct {
    title?: string;
    content: Array<IHpcInstruct>;
}

export interface IHpcInstruct {
    title: string;
    key: string;
    src?: string;
    content?: Array<IHpcInstruct>;
    tip?: string;
}

export interface IHpcMemData {
    title: string;
    key: string;
    content?: Array<IHpcMemData>;
    src?: string;
    tip?: string;
}
