/* launch-application模式下。应用运行用户信息 */
export interface LaunchRunUser {
    [key: string]: {
        runUser: boolean,
        user_name: string;
        password: string;
    };
}

