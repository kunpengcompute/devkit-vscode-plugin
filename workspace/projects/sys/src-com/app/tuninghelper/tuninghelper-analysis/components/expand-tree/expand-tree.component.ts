import {
    Component, ContentChild, ElementRef, EventEmitter,
    Input, IterableChanges, IterableDiffer, IterableDiffers,
    Output, Renderer2, TemplateRef, OnInit, DoCheck
} from '@angular/core';
import { TiTreeUtil, Util, TiTreeNode, TiBaseComponent } from '@cloud/tiny3';

@Component({
    selector: 'app-expand-tree',
    templateUrl: './expand-tree.component.html',
    styleUrls: ['./expand-tree.component.scss']
})

export class ExpandTreeComponent extends TiBaseComponent implements OnInit, DoCheck {
    /**
     * Tree组件使用的数据
     */
    @Input() data: Array<TiTreeNode>;
    /**
     * 设置多选树时，父节点是否可被点击选中，默认父节点子节点都显示复选框，都可被选中，设置false时，只有子节点前边显示复选框。
     */
    @Input() parentCheckable = true;
    /**
     * 设置是否为多选。
     */
    @Input() multiple = false;
    /**
     * 当为多选时该接口才生效。
     *
     * 默认为 false, 当设置为 true 时：
     *
     * 1.点击文本，复选框状态不会改变，只会触发select事件；
     *
     * 2.点击复选框只会触发change事件；
     *
     * 3.复选框disabled时，点击文本会触发select事件。
     *
     * Tiny3.1.1-alpha新增。
     */
    @Input() changedByCheckbox = false;
    /**
     * 树节点展开前的事件回调，一般用于异步数据获取
     */
    @Output() readonly beforeExpand: EventEmitter<ExpandTreeComponent> = new EventEmitter<ExpandTreeComponent>();
    /**
     * 当用户点击某一节点时触发的事件
     */
    @Output() readonly selectTree: EventEmitter<TiTreeNode> = new EventEmitter<TiTreeNode>();
    /**
     * 当前选中项发生变化时，触发change事件
     */
    @Output() readonly changeTree: EventEmitter<TiTreeNode> = new EventEmitter<TiTreeNode>();

    /**
     * 用于异步场景：当前点击需要展开的父节点
     */
    private beforeExpandNode: TiTreeNode;
    /**
     * 监听data改变
     */
    private dataDiffer: IterableDiffer<any>;

    /**
     * @ignore
     * 获取到用户自定义的模板
     */
    @ContentChild(TemplateRef, { static: true }) itemTemplate: TemplateRef<any>;
    /**
     * @ignore
     * 模板中使用，高亮的选中项
     */
    public actived: TiTreeNode;
    constructor(
        protected elementRef: ElementRef,
        protected renderer2: Renderer2,
        protected iterableDiffers: IterableDiffers
    ) {
        super(elementRef, renderer2);
    }

    /**
     * 初始化
     */
    ngOnInit() {
        super.ngOnInit();
        this.dataDiffer = this.iterableDiffers.find(this.data).create();
        // 内部使用的数据，用于记录用户的操作改变
        // 仅在初始化时挡非法数据，是不够的。建议去除。但因为要兼容已发出的版本，所以不去除。
        this.data = !Util.isArray(this.data) ? [] : this.data;
        // 初始化默认选中项高亮
        this.actived = this.initActived(this.data);
    }
    ngDoCheck(): void {
        super.ngDoCheck();
        const dataChanges: IterableChanges<TiTreeNode> = this.dataDiffer.diff(this.data);
        if (dataChanges) {
            // 重新初始化默认选中项高亮
            this.actived = this.initActived(this.data);
        }
    }
    /**
     * @ignore
     * @description 判断是否显示复选框
     * @param node 节点数据
     */
    public showCheckboxFn(node: TiTreeNode): boolean {
        if (this.multiple !== true) {
            return false;
        }

        if (this.parentCheckable === true) {
            return true;
        }

        return TiTreeUtil.isLeaf(node);
    }

    /**
     * @ignore
     * @description 点击父节点图标执行的逻辑
     * @param  node 当前节点数据
     */
    public onClickPnodeIcon(node: TiTreeNode, event: MouseEvent): void {
        // 阻止事件冒泡：点击父节点图标无高亮样式
        event.stopPropagation();
        this.beforeExpandNode = node;
        // 1.当前节点是展开状态
        if (node.expanded) {
            node.expanded = false;
        } else if (this.beforeExpand.observers.length === 0) {  // 2.如果未定义beforeExpand事件(非异步)，点击时让节点展开
            node.expanded = true;
        } else { // 3.异步获取数据：将组件实例通知出去
            this.beforeExpand.emit(this);
        }
    }

    // 获取异步点击的节点
    public getBeforeExpandNode(): TiTreeNode {
        return this.beforeExpandNode;
    }

    /**
     * @ignore
     * @description 根据item的isExpanded属性获取展开收起图标
     * @param  node 当前节点数据
     */
    public getIcon(node: TiTreeNode): string {
        if (TiTreeUtil.isLeaf(node)) {
            return '';
        }

        return (node.expanded) ? 'ti3-icon-right-1 active' : 'ti3-icon-plus-square';
    }

    /**
     * @ignore
     * @description 根据item的isExpanded属性获取item图标
     * @param node 当前节点数据
     */
    public getItemIcon(node: TiTreeNode): string {
        if (TiTreeUtil.isLeaf(node)) {
            return `${node.expandIcon} ti3-tree-node-icon`;
        }

        return `${(node.expanded) ? node.expandIcon : node.collapseIcon} ti3-tree-node-icon`;
    }

    /**
     * @ignore
     * @description 点击复选框触发select、change事件
     * 需要注意：click事件中拿到的是操作前的选中状态，而change事件中拿到的是操作后的选中状态
     * @param node 当前节点数据
     */
    public onInputChange(node: TiTreeNode, event: Event): void {
        this.setSeletedState(node, this.data, node.checked);
        if (!this.changedByCheckbox) {
            this.selectTree.emit(node);
        }
        this.changeTree.emit(node);
    }

    /**
     * @ignore
     * 点击文本区域
     * @param node 当前节点数据
     * @param event 鼠标事件
     * @returns void
     */
    public onItemWrapperClick(node: TiTreeNode, event: MouseEvent): void {

        if (node.disabled === true) {
            return;
        }

        // 1.处理多选情况
        if (this.multiple === true) {
            if (this.changedByCheckbox) {
                this.selectTree.emit(node);

                return;
            }

            // 1.1 处理父节点不支持多选
            if (!this.showCheckboxFn(node)) {
                return;
            }

            // 1.2 处理父节点支持多选
            node.checked = !node.checked;
            // 处理当前节点选中状态变化后，对父子节点的影响
            this.setSeletedState(node, this.data, node.checked);
            this.selectTree.emit(node);
            this.changeTree.emit(node);

            return;
        }

        // 2.处理单选场景
        // 2.1(单选且已选中)或者(单选且非叶子节点)的情况下，点击只会触发select事件,因为当前选中项不会发生变化
        if (node.checked === true || !TiTreeUtil.isLeaf(node)) {
            // 触发select事件
            this.selectTree.emit(node);

            return;
        }

        // 2.2单选叶子节点未选中
        this.deSelectAllNode(this.data);
        node.checked = true;
        TiTreeUtil.selectParents(node, this.data, 'indeterminate'); // 设置祖先节点的选中状态

        // 触发select和change事件
        this.selectTree.emit(node);

        this.changeTree.emit(node);
    }

    /**
     * @ignore
     * @description 点击当前项高亮
     * @param node 当前点击节点
     */
    public onContentClick(node: TiTreeNode): void {
        if (node.disabled === true) {
            return;
        }
        this.actived = node;
    }

    // 处理当前节点选中状态变化后，对父子节点的影响
    private setSeletedState = (node: TiTreeNode, allData: Array<TiTreeNode>, checked: boolean | string): void => {
        if (checked === true) {
            TiTreeUtil.selectAllChildren(node);
            TiTreeUtil.selectParents(node, allData, true);
        } else {
            TiTreeUtil.deSelectAllChildren(node);
            TiTreeUtil.deSelectParents(node, allData);
        }
    }

    /**
     * 单选时，取消所有节点的选中状态
     * @param  allData 所有节点数据
     */
    private deSelectAllNode = (allData: Array<TiTreeNode>): void => {
        allData.forEach((node: TiTreeNode) => {
            TiTreeUtil.deSelectAllChildren(node);
        });
    }

    /**
     * @ignore
     */
    public trackByFn(index: number, node: any): any {
        return index;
    }
    /**
     * @ignore
     * 判断是否为叶子节点
     */
    public isLeaf(node: TiTreeNode): boolean {
        if (Util.isArray(node.children) && node.children.length > 0) {
            return false;
        } else {
            return true;
        }

    }

    // 初始化选中项高亮
    private initActived = (data: Array<TiTreeNode>): any => {
        let result: TiTreeNode;
        for (const node of data) {
            if (node.checked === true) {
                return node;
            }

            if (!TiTreeUtil.isLeaf(node)) {
                result = this.initActived(node.children);
            }

            if (!Util.isUndefined(result)) {
                return result;
            }
        }

        return result;
    }
}
