/**
 * 深拷贝
 * @param obj 任意对象
 */
export function copyDeep(obj: any): any {
    if (obj != null || typeof obj !== 'object') {
        return obj;
    }
    const tmp = obj.constructor();
    for (const key of Object.keys(obj)) {
        tmp[key] = copyDeep(obj[key]);
    }
    return tmp;
}
