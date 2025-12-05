import type  { BoxPlotData } from '../types/BoxPlotData';

/**
 * 将后端返回的 BoxPlotData 转换为 ECharts 箱线图所需格式。
 */
export function transformDataForECharts(rawData: BoxPlotData[]) {
    const categories: string[] = []; // X轴数据: 班级名称
    const boxplotData: number[][] = []; // 箱线图数据: [[min, Q1, Q2, Q3, max], ...]
    const outlierData: number[][] = []; // 异常值散点图数据: [[index, score], ...]

    rawData.forEach((item, index) => {
        categories.push(item.className);

        // ECharts Boxplot Series Data 格式: [min, Q1, median, Q3, max]
        // 注意：ECharts 5.x 推荐使用 prepareBoxplotData 函数处理五数概括
        // 但如果直接传入五数，它也会接受
        boxplotData.push([item.min, item.q1, item.median, item.q3, item.max]);

        // 异常值处理：需要 (x轴索引, 异常值) 格式
        item.outliers.forEach(outlierScore => {
            // index 是当前班级在 categories 数组中的索引位置 (对应 x 轴)
            outlierData.push([index, outlierScore]);
        });
    });

    return { categories, boxplotData, outlierData };
}