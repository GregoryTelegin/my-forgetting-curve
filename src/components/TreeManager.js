import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Tree, ConfigProvider } from 'antd';
import { DatePicker } from 'antd';
import en from 'antd/es/date-picker/locale/en_US';
import dayjs from 'dayjs';
import { getCSSVariable } from '../utils/themeUtils';
import '../../styles.css';
const buddhistLocale = {
    ...en,
    lang: {
        ...en.lang,
        fieldDateFormat: 'YYYY-MM-DD',
        fieldDateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
        yearFormat: 'YYYY',
        cellYearFormat: 'YYYY',
    },
};
const TreeManager = ({ data, onDataUpdate }) => {
    const [treeData, setTreeData] = useState(data);
    const theme = {
        colorPrimary: getCSSVariable('--interactive-accent'),
        colorText: getCSSVariable('--text-normal'),
        colorBgContainer: getCSSVariable('--interactive-accent'),
        borderRadius: 8,
    };
    useEffect(() => {
        setTreeData(data);
    }, [data]);
    return (_jsx(ConfigProvider, { theme: { token: theme }, children: _jsx(EditableTreeView, { treeData: treeData, onTreeUpdate: onDataUpdate }) }));
};
const EditableTreeView = ({ treeData: initialTreeData, onTreeUpdate }) => {
    const [treeData, setTreeData] = useState(initialTreeData);
    const [editingNode, setEditingNode] = useState(null);
    useEffect(() => {
        setTreeData(initialTreeData);
    }, [initialTreeData]);
    const updateTreeNode = (key, newValue) => {
        const recursivelyUpdate = (nodes) => nodes.map((node) => {
            if (node.key === key)
                return { ...node, title: newValue };
            if (node.children)
                return { ...node, children: recursivelyUpdate(node.children) };
            return node;
        });
        return recursivelyUpdate(treeData);
    };
    const updateTreeNodeNextReviewDate = (key, formattedDate) => {
        const recursivelyUpdate = (nodes) => nodes.map((node) => {
            if (node.key === key)
                return { ...node, nextReviewDate: formattedDate };
            if (node.children)
                return { ...node, children: recursivelyUpdate(node.children) };
            return node;
        });
        return recursivelyUpdate(treeData);
    };
    const beginEditing = (key, value) => {
        setEditingNode({ key, value });
    };
    const finishEditing = () => {
        if (!editingNode)
            return;
        const updatedTreeData = updateTreeNode(editingNode.key, editingNode.value);
        setTreeData(updatedTreeData);
        setEditingNode(null);
        onTreeUpdate(updatedTreeData);
    };
    const handleNodeDrop = (info) => {
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        const data = [...treeData];
        let dragNode = null;
        const traverseTree = (nodes, key, callback) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].key === key) {
                    callback(nodes[i], i, nodes);
                    return;
                }
                if (nodes[i].children)
                    traverseTree(nodes[i].children, key, callback);
            }
        };
        traverseTree(data, dragKey, (node, index, arr) => {
            arr.splice(index, 1);
            dragNode = node;
        });
        if (!info.dropToGap) {
            traverseTree(data, dropKey, (node) => {
                node.children = node.children || [];
                node.children.unshift(dragNode);
            });
        }
        else {
            let targetArray = [];
            let targetIndex = 0;
            traverseTree(data, dropKey, (_node, index, arr) => {
                targetArray = arr;
                targetIndex = index;
            });
            if (dropPosition === -1) {
                targetArray.splice(targetIndex, 0, dragNode);
            }
            else {
                targetArray.splice(targetIndex + 1, 0, dragNode);
            }
        }
        setTreeData(data);
        onTreeUpdate(data);
    };
    const renderTreeNode = (treeDataNode) => {
        const node = treeDataNode;
        const themeDatePicker = {
            colorTextPlaceholder: getCSSVariable('--text-normal', '#fff'),
            colorText: getCSSVariable('--text-normal', '#fff'),
            colorIcon: getCSSVariable('--text-normal', '#fff'),
            colorIconHover: getCSSVariable('--interactive-accent'),
        };
        const openObsidianLink = (link) => {
            const app = window.app;
            if (app && app.workspace) {
                app.workspace.openLinkText(link, '', false);
            }
        };
        const updateNextReviewDate = (node, formattedDate) => {
            const updatedTreeData = updateTreeNodeNextReviewDate(node.key, formattedDate);
            setTreeData(updatedTreeData);
            onTreeUpdate(updatedTreeData);
        };
        const defaultValue = dayjs('2025-01-01T00:00:00');
        const onClickOpenHandler = () => {
            // TODO: потом релизовать ссылку на конспект
            return openObsidianLink('Поля данных и формат');
        };
        return (_jsxs("span", { className: "content-editable", children: [_jsx("span", { className: "editable-element", onDoubleClick: () => beginEditing(node.key, node.title), children: node.title }), _jsxs("span", { className: "time-link-group", children: [_jsx(ConfigProvider, { theme: {
                                token: themeDatePicker,
                            }, children: _jsx(DatePicker, { defaultValue: defaultValue, showTime: true, locale: buddhistLocale, onChange: value => {
                                    const formattedTime = value?.format('YYYY-MM-DDTHH:mm:ss') || '';
                                    updateNextReviewDate(node, formattedTime);
                                } }) }), _jsx("button", { onClick: onClickOpenHandler, className: "obsidian-link", children: "Open" })] })] }));
    };
    const processTreeNodes = (nodes) => nodes.map((node) => ({
        ...node,
        title: renderTreeNode(node),
        children: node.children ? processTreeNodes(node.children) : [],
    }));
    return (_jsx(Tree, { treeData: processTreeNodes(treeData), draggable: true, blockNode: true, onDrop: handleNodeDrop, defaultExpandAll: true }));
};
export default TreeManager;
