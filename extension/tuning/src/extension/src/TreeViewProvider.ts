import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, Uri, window, CancellationToken, Event, ProviderResult } from 'vscode';
import { join } from 'path';

export class TreeItemNode extends TreeItem{
}

export class TreeViewProvider implements TreeDataProvider<TreeItemNode>{
    onDidChangeTreeData?: Event<void | TreeItemNode | null | undefined> | undefined;
    getTreeItem(element: TreeItemNode): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: TreeItemNode | undefined): ProviderResult<TreeItemNode[]> {
        if (element){
            var childs = [];
            for (let index = 0;index < 1;index++){
                let str = index.toString();
                var item = new TreeItemNode(str, TreeItemCollapsibleState.None);
                item.command = {
                    command: "perfadvisorTools.openChild",
                    title: "标题",
                    arguments: [str]
                };
                childs[index] = item;
            }
            return childs;
        }
        else{
            return [new TreeItemNode("root", TreeItemCollapsibleState.Collapsed)]
        }
    }
    getParent?(element: TreeItemNode): ProviderResult<TreeItemNode> {
        throw new Error('Method not implemented.');
    }
    resolveTreeItem?(item: TreeItem, element: TreeItemNode, token: CancellationToken): ProviderResult<TreeItem> {
        throw new Error('Method not implemented.');
    }
    
}