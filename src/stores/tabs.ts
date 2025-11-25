import { defineStore } from 'pinia';
import type { RouteLocationNormalized, Router } from 'vue-router';

export interface ListItem {
	name: string;
	path: string;
	title: string;
}

export const useTabsStore = defineStore('tabs', {
	state: (): { list: ListItem[] } => {
		return {
			list: []
		};
	},
	getters: {
		show: (state): boolean => {
			return state.list.length > 0;
		},
		nameList: (state): string[] => {
			return state.list.map(item => item.name);
		}
	},
	actions: {
		delTabsItem(index: number): void {
			this.list.splice(index, 1);
		},
		setTabsItem(data: ListItem): void {
			this.list.push(data);
		},
		clearTabs(): void {
			this.list = [];
		},
		closeTabsOther(data: ListItem[]): void {
			this.list = data;
		},
		closeCurrentTag(data: { $route: RouteLocationNormalized; $router: Router }): void {
			// 优化：先找到匹配索引，避免循环中 splice 后的索引偏移
			const currentPath = data.$route.fullPath;
			const index = this.list.findIndex(item => item.path === currentPath);

			if (index === -1) return; // 未找到，直接返回

			// 确定下一个跳转路径（安全边界检查）
			let nextPath = '/'; // 默认首页
			if (index < this.list.length - 1) {
				const nextItem = this.list[index + 1];
				nextPath = nextItem?.path || '/'; // 可选链，fallback 首页
			} else if (index > 0) {
				const prevItem = this.list[index - 1];
				nextPath = prevItem?.path || '/'; // 可选链，fallback
			}

			// 执行跳转
			data.$router.push(nextPath);

			// 删除当前项
			this.list.splice(index, 1);
		}
	}
});