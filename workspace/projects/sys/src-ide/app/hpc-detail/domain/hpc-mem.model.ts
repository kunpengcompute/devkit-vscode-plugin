

export interface IHpcMemInstruct {
    title?: string;
    content: Array<IHpcInstruct>;
}

export interface IHpcInstruct {
    title: string;
    key: string;
    src?: string;
    content?: Array<IHpcInstruct>;
}
