/**
 * 对Window类型的扩展声明
 * 插件中使用self访问webviewSession
 */
interface Window {
    webviewSession: {
        setItem: (key: string, value: any) => void;
        getItem: (key: string) => any;
        removeItem: (key: string) => void;
    }
}
