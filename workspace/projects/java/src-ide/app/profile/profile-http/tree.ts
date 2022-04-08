/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface RequestRecording {
    method: string;
    url: string;
    startTime: number;
    duration: number;
}

interface TreeView {
    children?: TreeView[];
    tree_label: string;
    label?: string;
    expanded?: boolean;
    count: number;
    totalDuration: number;
    fast?: number;
    slow?: number;
}

export class TreeNode {
    static LIMIT = 50;
    static ASTERISK = '{:id}';

    children: {
        [pathName: string]: TreeNode
    };
    diffChildren: number;
    path: string;
    count: number;
    totalDuration: number;

    constructor(path: string, count: number, duration: number) {
        this.path = path;
        this.children = {};
        this.diffChildren = 0;
        this.count = count;
        this.totalDuration = duration;
    }
    /**
     * merge
     */
    public merge(node: TreeNode) {
        this.count += node.count;
        this.totalDuration += node.totalDuration;
        for (const name in node.children) {
            if (!this.children.hasOwnProperty(name)) {
                continue;
            }
            if (this.children[name]) {
                this.children[name].merge(node.children[name]);
            } else {
                this.children[name] = node.children[name];
                this.diffChildren += 1;
            }
        }
        if (this.diffChildren >= TreeNode.LIMIT) {
            this.aggregateChildren();
        }
    }
    /**
     * newRequest
     */
    public newRequest(request: RequestRecording, paths: string[], offset: number) {
        this.count++;
        this.totalDuration += request.duration;
        if (offset >= paths.length) {
            return;
        }

        const pathName = `/${paths[offset]}`;
        if (this.diffChildren >= TreeNode.LIMIT) {
            this.children[TreeNode.ASTERISK].newRequest(request, paths, offset + 1);
            return;
        }

        if (!this.children[pathName]) {
            this.diffChildren++;
            if (this.diffChildren >= TreeNode.LIMIT) {
                this.aggregateChildren();
            }
            this.children[pathName] = new TreeNode(pathName, 0, 0);
        }
        this.children[pathName].newRequest(request, paths, offset + 1);
    }

    private aggregateChildren() {
        const asterisk = new TreeNode(TreeNode.ASTERISK, 0, 0);
        for (const name in this.children) {
            if (!this.children.hasOwnProperty(name)) {
                continue;
            }
            asterisk.merge(this.children[name]);
        }
        this.children = {
            [TreeNode.ASTERISK]: asterisk
        };
    }
}

export class TreeGraph {
    root: TreeNode;

    constructor(root: TreeNode) {
        if (!root) {
            this.root = new TreeNode('', 0, 0);
        } else {
            this.root = root;
        }
    }
    /**
     * newRequest
     */
    public newRequest(request: RequestRecording) {
        this.root.count++;
        this.root.totalDuration += request.duration;
        const rootOfMethod = this.getRootOfMethod(request.method);
        const paths = request.url.split('/');
        rootOfMethod.newRequest(request, paths, 1);
    }
    /**
     * treeView
     */
    public treeView(): TreeView {
        return this.convert(this.root, '');
    }

    private convert(node: TreeNode, absolutePath: string): TreeView {
        const names = Object.keys(node.children);
        if (names.length === 0) {

            const newNodeLocal: TreeView = {
                tree_label: absolutePath,
                count: node.count,
                totalDuration: node.totalDuration,
                expanded: true
            };
            newNodeLocal.label = `${newNodeLocal.tree_label}
            - ${newNodeLocal.count} Count - Average:${(newNodeLocal.totalDuration / newNodeLocal.count).toFixed(2)}ms`;
            return newNodeLocal;

        }
        if (names.length === 1) {
            const child = node.children[names[0]];
            if (node.count === child.count) {
                const newPathLocal = `${absolutePath}${child.path}`;
                return this.convert(child, newPathLocal);
            }
        }
        const newNode: TreeView = {
            tree_label: `${absolutePath}/*`,
            count: node.count,
            totalDuration: node.totalDuration,
            expanded: true,
            children: []
        };
        newNode.label = `${newNode.tree_label} -
         ${newNode.count} Count - Average:${(newNode.totalDuration / newNode.count).toFixed(2)}ms`;
        const newPath = `${absolutePath}`;

        const children = Object.values(node.children).map(
            (aNode) => this.convert(aNode, `${newPath + aNode.path}`)
        );

        let totalCountOfChildren = 0;
        let totalDurationOfChildren = 0;
        children.forEach((child) => {
            totalCountOfChildren += child.count;
            totalDurationOfChildren += child.totalDuration;
        });
        const current: any = {
            tree_label: newPath,
            count: node.count - totalCountOfChildren,
            totalDuration: node.totalDuration - totalDurationOfChildren
        };
        current.label = `${newPath} -
         ${current.count} Count - Average: ${(current.totalDuration / current.count).toFixed(2)}ms`;

        if (current.count !== 0) { newNode.children.push(current); }
        newNode.children.push(...children);

        return newNode;
    }

    private getRootOfMethod(methodName: string): TreeNode {
        const method = methodName.toUpperCase() + ' ';
        if (!this.root.children[method]) {
            this.root.children[method] = new TreeNode(method, 0, 0);
        }
        return this.root.children[method];
    }
}
