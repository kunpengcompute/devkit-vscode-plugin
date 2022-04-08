export interface HyModalRef {

  close(): void; // 弹出框实例的方法，用来关闭弹出框，主要用在点击"确认(OK)"按钮时关闭弹框
  dismiss(): void; // 弹出框实例的方法，用来关闭弹出框，与close()的区别是：dismiss()主要用在点击"取消(Cancel)"按钮时关闭弹框
  destroy(reason: boolean): void; // 销毁弹窗，外部调用
}
