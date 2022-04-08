/**
 * 有限队列
 */
export class Queue<T> {
  private arr: T[] = [];
  private size: number;

  constructor(size: number) {
    this.size = size;
  }

  get() {
    return this.arr;
  }

  enqueue(val: T) {
    this.arr.unshift(val);
    this.keepSize();
    return val;
  }

  dequeue() {
    return this.arr.pop();
  }

  clear() {
    this.arr = [];
  }

  private keepSize() {
    this.arr = this.arr.splice(0, this.size);
  }

  toPush(val: T) {
    this.arr.push(val);
    this.keepSize();
    return val;
  }

  set(index: number, val: T) {
    this.arr[index] = val;
  }
}
