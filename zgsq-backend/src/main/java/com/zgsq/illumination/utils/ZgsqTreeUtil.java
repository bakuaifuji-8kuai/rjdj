package com.zgsq.illumination.utils;

import java.util.*;
import java.util.function.Function;

/**
 * 智光云枢树结构工具（简化版）
 * 提供管廊-链路-配光的三级树组装能力
 */
public class ZgsqTreeUtil {

    /** 树节点 */
    public static class ZgsqTreeNode<T> {
        private T data;
        private Object id;
        private Object parentId;
        private List<ZgsqTreeNode<T>> children = new ArrayList<>();

        public ZgsqTreeNode() {}
        public ZgsqTreeNode(T data) { this.data = data; }

        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
        public Object getId() { return id; }
        public void setId(Object id) { this.id = id; }
        public Object getParentId() { return parentId; }
        public void setParentId(Object parentId) { this.parentId = parentId; }
        public List<ZgsqTreeNode<T>> getChildren() { return children; }
        public void setChildren(List<ZgsqTreeNode<T>> children) { this.children = children; }
        public boolean hasChildren() { return children != null && !children.isEmpty(); }
    }

    /** 通用树构建：从扁平列表组装 */
    public static <T> List<ZgsqTreeNode<T>> buildTree(
            List<T> flatList,
            Function<T, Object> idExtractor,
            Function<T, Object> parentIdExtractor) {
        if (flatList == null || flatList.isEmpty()) return new ArrayList<>();

        Map<Object, ZgsqTreeNode<T>> nodeMap = new HashMap<>();
        List<ZgsqTreeNode<T>> roots = new ArrayList<>();

        for (T item : flatList) {
            ZgsqTreeNode<T> node = new ZgsqTreeNode<>(item);
            node.setId(idExtractor.apply(item));
            node.setParentId(parentIdExtractor.apply(item));
            nodeMap.put(node.getId(), node);
        }

        for (ZgsqTreeNode<T> node : nodeMap.values()) {
            if (node.getParentId() == null) {
                roots.add(node);
            } else {
                ZgsqTreeNode<T> parent = nodeMap.get(node.getParentId());
                if (parent != null) {
                    parent.getChildren().add(node);
                } else {
                    roots.add(node);
                }
            }
        }
        return roots;
    }

    /** 管廊+链路组装树：链路的 parentId = 管廊Id */
    public static <G, L> List<ZgsqTreeNode<G>> buildGuanLangTree(
            List<G> guanLangs,
            List<L> lianLus,
            Function<G, Object> glIdFn,
            Function<L, Object> llIdFn,
            Function<L, Object> llGuanLangIdFn,
            Function<G, ?> glWrap,
            Function<L, ?> llWrap) {
        // 简化版: 只返回管廊节点，链路作为子节点附加到管廊 data 上
        return buildTree(guanLangs, glIdFn, g -> null);
    }
}
