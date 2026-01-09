
import { defineStore } from 'pinia';
import type { RouteLocationNormalized } from 'vue-router';

export const useTagsViewStore = defineStore('tagsView', {
    state: () => ({
        visitedViews: [] as RouteLocationNormalized[]
    }),
    actions: {
        // 添加视图
        addView(view: RouteLocationNormalized) {
            if (this.visitedViews.some(v => v.path === view.path)) return;
            if (!view.meta?.title) return;
            this.visitedViews.push(Object.assign({}, view));
        },
        // 删除视图
        delView(path: string) {
            this.visitedViews = this.visitedViews.filter(v => v.path !== path);
        },
        // 关闭其他
        delOthersViews(path: string) {
            this.visitedViews = this.visitedViews.filter(v => v.path === path || v.meta?.affix);
        }
    }
});