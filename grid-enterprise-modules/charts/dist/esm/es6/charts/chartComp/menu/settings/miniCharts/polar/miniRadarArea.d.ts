import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { ChartType } from '@ag-grid-community/core';
export declare class MiniRadarArea extends MiniChartWithPolarAxes {
    static chartType: ChartType;
    private readonly areas;
    private data;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
