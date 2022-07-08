// Type definitions for @ag-grid-community/core v28.0.2
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from '../entities/column';
import { Component } from '../widgets/component';
import { RowNode } from '../entities/rowNode';
export declare class CheckboxSelectionComponent extends Component {
    private eCheckbox;
    private rowNode;
    private column;
    constructor();
    private postConstruct;
    getCheckboxId(): string;
    private onDataChanged;
    private onSelectableChanged;
    private onSelectionChanged;
    private onCheckedClicked;
    private onUncheckedClicked;
    init(params: {
        rowNode: RowNode;
        column?: Column;
    }): void;
    private showOrHideSelect;
    private checkboxCallbackExists;
}
