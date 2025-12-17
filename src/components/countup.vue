<template>
    <span ref="countRef"></span>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { CountUp } from 'countup.js';

const props = defineProps({
    end: {
        type: Number,
        required: true,
    },
    options: {
        type: Object,
        default: () => ({}),
        required: false,
    },
});

const countRef = ref<any>(null);
let countUp: any;
onMounted(() => {
    const endVal = Number(props.end)
    if (isNaN(endVal)) {
        console.warn('[CountUp] 无效的 end 值，已回退到 0', props.end)
    }
    const finalOptions = {
        // 默认设置为显示 2 位小数
        decimalPlaces: 1,
        // 将用户传入的 options 展开，它会覆盖上面的默认值（如果用户传入了 decimals）
        ...props.options,
    };
    countUp = new CountUp(countRef.value, endVal || 0, finalOptions);
    if (countUp.error) {
        console.error(countUp.error);
        return;
    }
    countUp.start();
});

watch(() => props.end, (newVal) => {
    if (countUp) {
        countUp.update(newVal);
    }
});


</script>