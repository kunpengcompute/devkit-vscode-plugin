/**
 * 将数据分割成指定大小的几份
 * @param arr 被分割的数组
 * @param size 每份的大小
 * @param firstSize 第一份的大小
 * @returns 被分隔的数组的生成器
 */
export function sliceArray(
    arr: any[], size: number, firstSize?: number
): IterableIterator<any[]> {
    const subArrGenerator = function*() {
        if (firstSize != null) {
            yield arr.slice(0, firstSize);
        } else {
            firstSize = 0;
        }

        for (let i = firstSize; i < arr.length; i += size) {
            yield arr.slice(i, i + size);
        }
    };
    return subArrGenerator();
}
