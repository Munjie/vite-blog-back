// 对应后端 BoxPlotData DTO
export interface BoxPlotData {
    className: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
}

export interface BoxPlotDataVO {
    className: string;      // 班级名称
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];     // 异常值列表，可能为空
}