// Type definitions for @ag-grid-community/core v28.0.2
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class ResizeObserverService extends BeanStub {
    private polyfillFunctions;
    private polyfillScheduled;
    observeResize(element: HTMLElement, callback: () => void): () => void;
    private doNextPolyfillTurn;
    private schedulePolyfill;
}
