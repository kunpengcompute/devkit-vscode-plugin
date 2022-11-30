import { encrypt } from "./crypto";
import { writeFileData } from "./util";

/**
 * 加密 password
 * @param pwd 用户输入的 password 明文
 * @param workingData Working_key 明文
 * @param userPath
 */
function cryptoPwd(pwd: string, workingData: string, userPath:string){
    // 得到并保存 password_key 密文
    encrypt(pwd, workingData, userPath, (result:string)=>{
        writeFileData({Password_key: result}, userPath);
    });
}

export {
    cryptoPwd
};