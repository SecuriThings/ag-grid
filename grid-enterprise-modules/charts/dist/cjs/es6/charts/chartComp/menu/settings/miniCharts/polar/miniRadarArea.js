"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniRadarArea = void 0;
const miniChartWithPolarAxes_1 = require("../miniChartWithPolarAxes");
const miniChartHelpers_1 = require("../miniChartHelpers");
class MiniRadarArea extends miniChartWithPolarAxes_1.MiniChartWithPolarAxes {
    constructor(container, fills, strokes) {
        super(container, 'radarAreaTooltip');
        this.data = [
            [8, 10, 5, 7, 4, 1, 5, 8],
            [1, 1, 2, 7, 7, 8, 10, 1],
            [4, 5, 9, 9, 4, 2, 3, 4]
        ];
        this.showRadiusAxisLine = false;
        const radius = (this.size - this.padding * 2) / 2;
        const innerRadius = radius - this.size * 0.3;
        this.areas = (0, miniChartHelpers_1.createPolarPaths)(this.root, this.data, this.size, radius, innerRadius).paths;
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.areas.forEach((area, i) => {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    }
}
exports.MiniRadarArea = MiniRadarArea;
MiniRadarArea.chartType = 'radarArea';
