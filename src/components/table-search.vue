<template>
	<div class="search-container">
		<el-form ref="searchRef" :model="query" :inline="true">
			<el-form-item :label="item.label" :prop="item.prop" v-for="item in options">
				<!-- 文本框、下拉框、日期框 -->
				<el-input v-if="item.type === 'input'" v-model="query[item.prop]" :disabled="item.disabled"
									:placeholder="item.placeholder" clearable></el-input>
				<el-select v-else-if="item.type === 'select'"
									 v-model="query[item.prop]"
									 :disabled="item.disabled"
									 :placeholder="item.placeholder"
									 @change="handleSelectChange"
									  clearable style="width: 150px">
					<el-option
							v-for="opt in item.opts"
							:key="opt.value"
							:label="opt.label"
							:value="opt.value"
					/>
				</el-select>
				<el-date-picker v-else-if="item.type === 'date'" type="date" v-model="query[item.prop]"
												:value-format="item.format"></el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :icon="Search" @click="search">搜索</el-button>
				<el-button :icon="Refresh" @click="resetForm(searchRef)">重置</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import {ref} from 'vue';
import type { PropType } from 'vue';
import type { FormOptionList } from '../types/form-option.ts';

const props = defineProps({
	query: {
		type: Object,
		required: true
	},
	options: {
		type: Array as PropType<Array<FormOptionList>>,
		required: true
	},
	search: {
		// 明确指定参数和返回值
		type: Function as PropType<(evt?: MouseEvent) => void>,
		default: () => {}
	}
});



const searchRef = ref<FormInstance>();
const resetForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return
	formEl.resetFields()
	props.search?.();
}

// 方法
const handleSelectChange = () => {
	// 只要下拉框变化，立刻触发搜索
	props.search?.();
}
</script>

<style scoped>
.search-container {
	padding: 20px 30px 0;
	background-color: #fff;
	margin-bottom: 10px;
	border: 1px solid #ddd;
	border-radius: 5px
}
/* 在全局样式或组件样式里加上 */
.fixed-select .el-select__selected-item,
.force-render .el-select__input {
	color: #606266 !important;
}
</style>
