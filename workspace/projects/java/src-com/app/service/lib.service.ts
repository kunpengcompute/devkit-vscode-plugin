import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LibService {
  public hoverIcon: any = '';
  /**
   * 图标hover状态处理
   */
  public onHoverIcon(label?: any) {
    this.hoverIcon = label;
  }
  /**
   * 获取len长度的随机数
   * @param len 随机数长度
   */
 public generateConversationId(len: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
      ''
    );
    const uuid = [];
    let i: number;
    const radix = chars.length;
    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[Math.floor(Math.random() * radix)];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      let r: number;
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = Math.floor(Math.random() * 16);
          uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
        }
      }
    }
    return uuid.join('');
  }
}

export class KeyFunction {
    private nodesIndex: any = null;
    private stackTreeNodes: string;
    private stackTreeAll: string;
    private stackTreeContainer: string;
    constructor(treeClass?: any) {
        this.stackTreeNodes = treeClass ?
        `${treeClass} .ti3-tree-content-box:visible` : '.ti3-tree-content-box:visible';
        this.stackTreeAll = treeClass ? `${treeClass} .ti3-tree-content-box` : '.ti3-tree-content-box';
        this.stackTreeContainer = treeClass ? `${treeClass} .ti3-tree-container` : '.ti3-tree-container';
    }
    /**
     * 监听键盘事件，上下左右
     */
    public keybordFun() {
        this.getCurrentNodeIndex();
        document.onkeydown = (key: any) => {
            switch (key.keyCode) {
                case 38:
                    this.keyUp();
                    break;
                case 40:
                    this.keyDown();
                    break;
                case 37:
                    this.keyLeft();
                    break;
                case 39:
                    this.keyRight();
                    break;
                default:
                    break;
            }
            return false;
        };
    }
    /**
     * 键盘上键事件
     */
    private keyUp() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || this.nodesIndex === 0 || !hasActiveClass) { return; }
        stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
        this.nodesIndex--;
        stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
        this.stackTreeScroll();
    }
    /**
     * 键盘下键事件
     */
    private keyDown() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || this.nodesIndex === stackTreeNodes.length - 1 || !hasActiveClass) { return; }
        stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
        this.nodesIndex++;
        stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
        this.stackTreeScroll();
    }
    /**
     * 键盘右键事件，获取子节点，focus到子级第一个节点
     */
    private keyRight() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const currentNodeChildren = stackTreeNodes.eq(this.nodesIndex).children();
        const childIClassName = currentNodeChildren.eq(1).attr('class');
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || !hasActiveClass) { return; }
        if (childIClassName.indexOf('ti3-icon-plus-square') > 0) {
            currentNodeChildren.eq(1).trigger('click');
        } else if (childIClassName.indexOf('ti3-icon-minus-square') > 0) {
            this.keyDown();
        } else {
            return;
        }
    }
    /**
     * 键盘左键事件，折叠子节点，focus到父级节点
     */
    private keyLeft() {
        const stackTreeNodes = $(this.stackTreeNodes);
        const currentNodeChildren = stackTreeNodes.eq(this.nodesIndex).children();
        const childIClassName = currentNodeChildren.eq(1).attr('class');
        const hasActiveClass = this.hasActiveClass(stackTreeNodes);
        if (this.nodesIndex === null || !hasActiveClass) { return; }
        if (childIClassName.indexOf('ti3-icon-minus-square') > 0) {
            currentNodeChildren.eq(1).trigger('click');
        } else {
            const rootNode = stackTreeNodes.eq(this.nodesIndex).parent().parent();
            const rootName = rootNode.attr('class');
            if (rootName.indexOf('ti3-tree-container') > 0) { return; }
            this.getParentNodeIndex(rootNode.siblings()[0]);
        }
    }
    /**
     * focus到父级节点
     * @param node 父级节点
     */
    private getParentNodeIndex(node: any) {
        let parentIndex = null;
        const stackTreeNodes = $(this.stackTreeNodes);
        stackTreeNodes.each((index, el) => {
            if (el.isEqualNode(node)) {
                parentIndex = index;
                return;
            }
        });
        if (parentIndex === null) { return; }
        stackTreeNodes.eq(this.nodesIndex).removeClass('ti3-tree-item-active');
        this.nodesIndex = parentIndex;
        stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
    }
    /**
     * 获取鼠标点击了某个节点
     */
    private getCurrentNodeIndex() {
        const that = this;
        const oldIndex = this.nodesIndex;
        const stackTreeNodes = $(this.stackTreeNodes);
        const stackTreeAll = $(this.stackTreeAll);
        stackTreeNodes.each((index, el) => {
            if (el.className.indexOf('ti3-tree-item-active') >= 0 && index !== oldIndex) {
                that.nodesIndex = index;
                return;
            }
        });
        if (oldIndex !== null && this.nodesIndex !== null && oldIndex !== this.nodesIndex) {
            stackTreeAll.eq(oldIndex).removeClass('ti3-tree-item-active');
            stackTreeNodes.eq(this.nodesIndex).addClass('ti3-tree-item-active');
        }
    }
    /**
     * 判断当前节点是否含有选中的节点
     * @param stackTreeNodes 当前节点
     */
    private hasActiveClass(stackTreeNodes: any): boolean {
        return this.nodesIndex !== null ? stackTreeNodes.eq(this.nodesIndex).hasClass('ti3-tree-item-active') : false;
    }
    /**
     * 将键盘选中的节点滚动到可视区域内
     */
    private stackTreeScroll() {
        const nodeHeight = $('.ti3-tree-item-active').height();
        const treeOffsetTop = $(this.stackTreeContainer).children(':first').offset().top;
        const activeOffsetTop = $(this.stackTreeNodes).eq(this.nodesIndex).offset().top;
        const height = activeOffsetTop - treeOffsetTop;
        const visibleHeight = $(this.stackTreeContainer).height();
        const scrollTop = $(this.stackTreeContainer).scrollTop();
        if ((height - scrollTop) > (visibleHeight - nodeHeight)) {
            $(this.stackTreeContainer).animate({
                scrollTop: height - visibleHeight + nodeHeight
            }, 50);
        } else if (scrollTop > height) {
            $(this.stackTreeContainer).animate({
                scrollTop: height
            }, 50);
        }
    }

    /**
     * 移除键盘监听事件
     */
    public movekeybordFun() {
        document.onkeydown = undefined;
    }
}
