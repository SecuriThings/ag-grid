// ag-grid-react v28.0.2
import { VanillaFrameworkOverrides } from "ag-grid-community";
export declare class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    private frameworkComponents;
    frameworkComponent(name: string): any;
    isFrameworkComponent(comp: any): boolean;
}
