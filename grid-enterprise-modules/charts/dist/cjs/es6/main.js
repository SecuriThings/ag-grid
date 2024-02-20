"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agCharts = exports.GridChartsModule = void 0;
var gridChartsModule_1 = require("./gridChartsModule");
Object.defineProperty(exports, "GridChartsModule", { enumerable: true, get: function () { return gridChartsModule_1.GridChartsModule; } });
__exportStar(require("./agGridCoreExtension"), exports);
const ag_charts_community_1 = require("ag-charts-community");
__exportStar(require("ag-charts-community"), exports);
exports.agCharts = {
    time: ag_charts_community_1.time,
    AgChart: ag_charts_community_1.AgChart
};
