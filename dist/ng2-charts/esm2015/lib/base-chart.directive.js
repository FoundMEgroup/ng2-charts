/**
 * @fileoverview added by tsickle
 * Generated from: lib/base-chart.directive.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, ElementRef, EventEmitter, Input, Output, } from '@angular/core';
import { getColors } from './get-colors';
import { ThemeService } from './theme.service';
import { cloneDeep } from 'lodash-es';
import { Chart, pluginService } from 'chart.js';
/**
 * @record
 */
function OldState() { }
if (false) {
    /** @type {?} */
    OldState.prototype.dataExists;
    /** @type {?} */
    OldState.prototype.dataLength;
    /** @type {?} */
    OldState.prototype.datasetsExists;
    /** @type {?} */
    OldState.prototype.datasetsLength;
    /** @type {?} */
    OldState.prototype.datasetsDataObjects;
    /** @type {?} */
    OldState.prototype.datasetsDataLengths;
    /** @type {?} */
    OldState.prototype.colorsExists;
    /** @type {?} */
    OldState.prototype.colors;
    /** @type {?} */
    OldState.prototype.labelsExist;
    /** @type {?} */
    OldState.prototype.labels;
    /** @type {?} */
    OldState.prototype.legendExists;
    /** @type {?} */
    OldState.prototype.legend;
}
/** @enum {number} */
const UpdateType = {
    Default: 0,
    Update: 1,
    Refresh: 2,
};
UpdateType[UpdateType.Default] = 'Default';
UpdateType[UpdateType.Update] = 'Update';
UpdateType[UpdateType.Refresh] = 'Refresh';
// Extend the line chart with a vertical indicator line chart thingy
Chart.controllers.line.extend({
    name: "lineWithLine",
    initialize: (/**
     * @return {?}
     */
    function () {
        Chart.controllers.line.prototype.initialize.apply(this, arguments);
        /** @type {?} */
        var originalShowTooltip = this.showTooltip;
        this.showTooltip = (/**
         * @param {?} activePoints
         * @return {?}
         */
        function (activePoints) {
            if (activePoints.length) {
                /** @type {?} */
                var ctx = this.chart.ctx;
                /** @type {?} */
                var scale = this.scale;
                ctx.save();
                ctx.strokeStyle = '#aaa';
                ctx.beginPath();
                ctx.moveTo(activePoints[0].x, scale.startPoint);
                ctx.lineTo(activePoints[0].x, scale.endPoint);
                ctx.stroke();
                ctx.restore();
            }
            return originalShowTooltip.apply(this, arguments);
        });
    })
});
export class BaseChartDirective {
    /**
     * @param {?} element
     * @param {?} themeService
     */
    constructor(element, themeService) {
        this.element = element;
        this.themeService = themeService;
        this.options = {};
        this.chartClick = new EventEmitter();
        this.chartHover = new EventEmitter();
        this.old = {
            dataExists: false,
            dataLength: 0,
            datasetsExists: false,
            datasetsLength: 0,
            datasetsDataObjects: [],
            datasetsDataLengths: [],
            colorsExists: false,
            colors: [],
            labelsExist: false,
            labels: [],
            legendExists: false,
            legend: {},
        };
        this.subs = [];
    }
    /**
     * Register a plugin.
     * @param {?} plugin
     * @return {?}
     */
    static registerPlugin(plugin) {
        pluginService.register(plugin);
    }
    /**
     * @param {?} plugin
     * @return {?}
     */
    static unregisterPlugin(plugin) {
        pluginService.unregister(plugin);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.ctx = this.element.nativeElement.getContext('2d');
        this.refresh();
        this.subs.push(this.themeService.colorschemesOptions.subscribe((/**
         * @param {?} r
         * @return {?}
         */
        r => this.themeChanged(r))));
    }
    /**
     * @private
     * @param {?} options
     * @return {?}
     */
    themeChanged(options) {
        this.refresh();
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (!this.chart) {
            return;
        }
        /** @type {?} */
        let updateRequired = UpdateType.Default;
        /** @type {?} */
        const wantUpdate = (/**
         * @param {?} x
         * @return {?}
         */
        (x) => {
            updateRequired = x > updateRequired ? x : updateRequired;
        });
        if (!!this.data !== this.old.dataExists) {
            this.propagateDataToDatasets(this.data);
            this.old.dataExists = !!this.data;
            wantUpdate(UpdateType.Update);
        }
        if (this.data && this.data.length !== this.old.dataLength) {
            this.old.dataLength = this.data && this.data.length || 0;
            wantUpdate(UpdateType.Update);
        }
        if (!!this.datasets !== this.old.datasetsExists) {
            this.old.datasetsExists = !!this.datasets;
            wantUpdate(UpdateType.Update);
        }
        if (this.datasets && this.datasets.length !== this.old.datasetsLength) {
            this.old.datasetsLength = this.datasets && this.datasets.length || 0;
            wantUpdate(UpdateType.Update);
        }
        if (this.datasets && this.datasets.filter((/**
         * @param {?} x
         * @param {?} i
         * @return {?}
         */
        (x, i) => x.data !== this.old.datasetsDataObjects[i])).length) {
            this.old.datasetsDataObjects = this.datasets.map((/**
             * @param {?} x
             * @return {?}
             */
            x => x.data));
            wantUpdate(UpdateType.Update);
        }
        if (this.datasets && this.datasets.filter((/**
         * @param {?} x
         * @param {?} i
         * @return {?}
         */
        (x, i) => x.data.length !== this.old.datasetsDataLengths[i])).length) {
            this.old.datasetsDataLengths = this.datasets.map((/**
             * @param {?} x
             * @return {?}
             */
            x => x.data.length));
            wantUpdate(UpdateType.Update);
        }
        if (!!this.colors !== this.old.colorsExists) {
            this.old.colorsExists = !!this.colors;
            this.updateColors();
            wantUpdate(UpdateType.Update);
        }
        // This smells of inefficiency, might need to revisit this
        if (this.colors && this.colors.filter((/**
         * @param {?} x
         * @param {?} i
         * @return {?}
         */
        (x, i) => !this.colorsEqual(x, this.old.colors[i]))).length) {
            this.old.colors = this.colors.map((/**
             * @param {?} x
             * @return {?}
             */
            x => this.copyColor(x)));
            this.updateColors();
            wantUpdate(UpdateType.Update);
        }
        if (!!this.labels !== this.old.labelsExist) {
            this.old.labelsExist = !!this.labels;
            wantUpdate(UpdateType.Update);
        }
        if (this.labels && this.labels.filter((/**
         * @param {?} x
         * @param {?} i
         * @return {?}
         */
        (x, i) => !this.labelsEqual(x, this.old.labels[i]))).length) {
            this.old.labels = this.labels.map((/**
             * @param {?} x
             * @return {?}
             */
            x => this.copyLabel(x)));
            wantUpdate(UpdateType.Update);
        }
        if (!!this.options.legend !== this.old.legendExists) {
            this.old.legendExists = !!this.options.legend;
            wantUpdate(UpdateType.Refresh);
        }
        if (this.options.legend && this.options.legend.position !== this.old.legend.position) {
            this.old.legend.position = this.options.legend.position;
            wantUpdate(UpdateType.Refresh);
        }
        switch ((/** @type {?} */ (updateRequired))) {
            case UpdateType.Default:
                break;
            case UpdateType.Update:
                this.update();
                break;
            case UpdateType.Refresh:
                this.refresh();
                break;
        }
    }
    /**
     * @param {?} a
     * @return {?}
     */
    copyLabel(a) {
        if (Array.isArray(a)) {
            return [...a];
        }
        return a;
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    labelsEqual(a, b) {
        return Array.isArray(a) === Array.isArray(b)
            && (Array.isArray(a) || a === b)
            && (!Array.isArray(a) || a.length === b.length)
            && (!Array.isArray(a) || a.filter((/**
             * @param {?} x
             * @param {?} i
             * @return {?}
             */
            (x, i) => x !== b[i])).length === 0);
    }
    /**
     * @param {?} a
     * @return {?}
     */
    copyColor(a) {
        return {
            backgroundColor: a.backgroundColor,
            borderWidth: a.borderWidth,
            borderColor: a.borderColor,
            borderCapStyle: a.borderCapStyle,
            borderDash: a.borderDash,
            borderDashOffset: a.borderDashOffset,
            borderJoinStyle: a.borderJoinStyle,
            pointBorderColor: a.pointBorderColor,
            pointBackgroundColor: a.pointBackgroundColor,
            pointBorderWidth: a.pointBorderWidth,
            pointRadius: a.pointRadius,
            pointHoverRadius: a.pointHoverRadius,
            pointHitRadius: a.pointHitRadius,
            pointHoverBackgroundColor: a.pointHoverBackgroundColor,
            pointHoverBorderColor: a.pointHoverBorderColor,
            pointHoverBorderWidth: a.pointHoverBorderWidth,
            pointStyle: a.pointStyle,
            hoverBackgroundColor: a.hoverBackgroundColor,
            hoverBorderColor: a.hoverBorderColor,
            hoverBorderWidth: a.hoverBorderWidth,
        };
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    colorsEqual(a, b) {
        if (!a !== !b) {
            return false;
        }
        return !a ||
            (a.backgroundColor === b.backgroundColor)
                && (a.borderWidth === b.borderWidth)
                && (a.borderColor === b.borderColor)
                && (a.borderCapStyle === b.borderCapStyle)
                && (a.borderDash === b.borderDash)
                && (a.borderDashOffset === b.borderDashOffset)
                && (a.borderJoinStyle === b.borderJoinStyle)
                && (a.pointBorderColor === b.pointBorderColor)
                && (a.pointBackgroundColor === b.pointBackgroundColor)
                && (a.pointBorderWidth === b.pointBorderWidth)
                && (a.pointRadius === b.pointRadius)
                && (a.pointHoverRadius === b.pointHoverRadius)
                && (a.pointHitRadius === b.pointHitRadius)
                && (a.pointHoverBackgroundColor === b.pointHoverBackgroundColor)
                && (a.pointHoverBorderColor === b.pointHoverBorderColor)
                && (a.pointHoverBorderWidth === b.pointHoverBorderWidth)
                && (a.pointStyle === b.pointStyle)
                && (a.hoverBackgroundColor === b.hoverBackgroundColor)
                && (a.hoverBorderColor === b.hoverBorderColor)
                && (a.hoverBorderWidth === b.hoverBorderWidth);
    }
    /**
     * @return {?}
     */
    updateColors() {
        this.datasets.forEach((/**
         * @param {?} elm
         * @param {?} index
         * @return {?}
         */
        (elm, index) => {
            if (this.colors && this.colors[index]) {
                Object.assign(elm, this.colors[index]);
            }
            else {
                Object.assign(elm, getColors(this.chartType, index, elm.data.length), Object.assign({}, elm));
            }
        }));
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        /** @type {?} */
        let updateRequired = UpdateType.Default;
        /** @type {?} */
        const wantUpdate = (/**
         * @param {?} x
         * @return {?}
         */
        (x) => {
            updateRequired = x > updateRequired ? x : updateRequired;
        });
        // Check if the changes are in the data or datasets or labels or legend
        if (changes.hasOwnProperty('data') && changes.data.currentValue) {
            this.propagateDataToDatasets(changes.data.currentValue);
            wantUpdate(UpdateType.Update);
        }
        if (changes.hasOwnProperty('datasets') && changes.datasets.currentValue) {
            this.propagateDatasetsToData(changes.datasets.currentValue);
            wantUpdate(UpdateType.Update);
        }
        if (changes.hasOwnProperty('labels')) {
            if (this.chart) {
                this.chart.data.labels = changes.labels.currentValue;
            }
            wantUpdate(UpdateType.Update);
        }
        if (changes.hasOwnProperty('legend')) {
            if (this.chart) {
                this.chart.config.options.legend.display = changes.legend.currentValue;
                this.chart.generateLegend();
            }
            wantUpdate(UpdateType.Update);
        }
        if (changes.hasOwnProperty('options')) {
            wantUpdate(UpdateType.Refresh);
        }
        switch ((/** @type {?} */ (updateRequired))) {
            case UpdateType.Update:
                this.update();
                break;
            case UpdateType.Refresh:
            case UpdateType.Default:
                this.refresh();
                break;
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = void 0;
        }
        this.subs.forEach((/**
         * @param {?} x
         * @return {?}
         */
        x => x.unsubscribe()));
    }
    /**
     * @param {?=} duration
     * @return {?}
     */
    update(duration) {
        if (this.chart) {
            return this.chart.update(duration);
        }
    }
    /**
     * @param {?} index
     * @param {?} hidden
     * @return {?}
     */
    hideDataset(index, hidden) {
        this.chart.getDatasetMeta(index).hidden = hidden;
        this.chart.update();
    }
    /**
     * @param {?} index
     * @return {?}
     */
    isDatasetHidden(index) {
        return this.chart.getDatasetMeta(index).hidden;
    }
    /**
     * @return {?}
     */
    toBase64Image() {
        return this.chart.toBase64Image();
    }
    /**
     * @return {?}
     */
    getChartConfiguration() {
        /** @type {?} */
        const datasets = this.getDatasets();
        /** @type {?} */
        const options = Object.assign({}, this.options);
        if (this.legend === false) {
            options.legend = { display: false };
        }
        // hook for onHover and onClick events
        options.hover = options.hover || {};
        if (!options.hover.onHover) {
            options.hover.onHover = (/**
             * @param {?} event
             * @param {?} active
             * @return {?}
             */
            (event, active) => {
                if (active && !active.length) {
                    return;
                }
                this.chartHover.emit({ event, active });
            });
        }
        if (!options.onClick) {
            options.onClick = (/**
             * @param {?=} event
             * @param {?=} active
             * @return {?}
             */
            (event, active) => {
                this.chartClick.emit({ event, active });
            });
        }
        /** @type {?} */
        const mergedOptions = this.smartMerge(options, this.themeService.getColorschemesOptions());
        return {
            type: this.chartType,
            data: {
                labels: this.labels || [],
                datasets
            },
            plugins: this.plugins,
            options: mergedOptions,
        };
    }
    /**
     * @param {?} ctx
     * @return {?}
     */
    getChartBuilder(ctx /*, data:any[], options:any*/) {
        /** @type {?} */
        const chartConfig = this.getChartConfiguration();
        return new Chart(ctx, chartConfig);
    }
    /**
     * @param {?} options
     * @param {?} overrides
     * @param {?=} level
     * @return {?}
     */
    smartMerge(options, overrides, level = 0) {
        if (level === 0) {
            options = cloneDeep(options);
        }
        /** @type {?} */
        const keysToUpdate = Object.keys(overrides);
        keysToUpdate.forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => {
            if (Array.isArray(overrides[key])) {
                /** @type {?} */
                const arrayElements = options[key];
                if (arrayElements) {
                    arrayElements.forEach((/**
                     * @param {?} r
                     * @return {?}
                     */
                    r => {
                        this.smartMerge(r, overrides[key][0], level + 1);
                    }));
                }
            }
            else if (typeof (overrides[key]) === 'object') {
                if (!(key in options)) {
                    options[key] = {};
                }
                this.smartMerge(options[key], overrides[key], level + 1);
            }
            else {
                options[key] = overrides[key];
            }
        }));
        if (level === 0) {
            return options;
        }
    }
    /**
     * @private
     * @param {?} label
     * @return {?}
     */
    isMultiLineLabel(label) {
        return Array.isArray(label);
    }
    /**
     * @private
     * @param {?} label
     * @return {?}
     */
    joinLabel(label) {
        if (!label) {
            return null;
        }
        if (this.isMultiLineLabel(label)) {
            return label.join(' ');
        }
        else {
            return label;
        }
    }
    /**
     * @private
     * @param {?} datasets
     * @return {?}
     */
    propagateDatasetsToData(datasets) {
        this.data = this.datasets.map((/**
         * @param {?} r
         * @return {?}
         */
        r => r.data));
        if (this.chart) {
            this.chart.data.datasets = datasets;
        }
        this.updateColors();
    }
    /**
     * @private
     * @param {?} newDataValues
     * @return {?}
     */
    propagateDataToDatasets(newDataValues) {
        if (this.isMultiDataSet(newDataValues)) {
            if (this.datasets && newDataValues.length === this.datasets.length) {
                this.datasets.forEach((/**
                 * @param {?} dataset
                 * @param {?} i
                 * @return {?}
                 */
                (dataset, i) => {
                    dataset.data = newDataValues[i];
                }));
            }
            else {
                this.datasets = newDataValues.map((/**
                 * @param {?} data
                 * @param {?} index
                 * @return {?}
                 */
                (data, index) => {
                    return { data, label: this.joinLabel(this.labels[index]) || `Label ${index}` };
                }));
                if (this.chart) {
                    this.chart.data.datasets = this.datasets;
                }
            }
        }
        else {
            if (!this.datasets) {
                this.datasets = [{ data: newDataValues }];
                if (this.chart) {
                    this.chart.data.datasets = this.datasets;
                }
            }
            else {
                if (!this.datasets[0]) {
                    this.datasets[0] = {};
                }
                this.datasets[0].data = newDataValues;
                this.datasets.splice(1); // Remove all elements but the first
            }
        }
        this.updateColors();
    }
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    isMultiDataSet(data) {
        return Array.isArray(data[0]);
    }
    /**
     * @private
     * @return {?}
     */
    getDatasets() {
        if (!this.datasets && !this.data) {
            throw new Error(`ng-charts configuration error, data or datasets field are required to render chart ${this.chartType}`);
        }
        // If `datasets` is defined, use it over the `data` property.
        if (this.datasets) {
            this.propagateDatasetsToData(this.datasets);
            return this.datasets;
        }
        if (this.data) {
            this.propagateDataToDatasets(this.data);
            return this.datasets;
        }
    }
    /**
     * @private
     * @return {?}
     */
    refresh() {
        // if (this.options && this.options.responsive) {
        //   setTimeout(() => this.refresh(), 50);
        // }
        // todo: remove this line, it is producing flickering
        if (this.chart) {
            this.chart.destroy();
            this.chart = void 0;
        }
        if (this.ctx) {
            this.chart = this.getChartBuilder(this.ctx /*, data, this.options*/);
        }
    }
}
BaseChartDirective.decorators = [
    { type: Directive, args: [{
                // tslint:disable-next-line:directive-selector
                selector: 'canvas[baseChart]',
                exportAs: 'base-chart'
            },] }
];
/** @nocollapse */
BaseChartDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: ThemeService }
];
BaseChartDirective.propDecorators = {
    data: [{ type: Input }],
    datasets: [{ type: Input }],
    labels: [{ type: Input }],
    options: [{ type: Input }],
    chartType: [{ type: Input }],
    colors: [{ type: Input }],
    legend: [{ type: Input }],
    plugins: [{ type: Input }],
    chartClick: [{ type: Output }],
    chartHover: [{ type: Output }]
};
if (false) {
    /** @type {?} */
    BaseChartDirective.prototype.data;
    /** @type {?} */
    BaseChartDirective.prototype.datasets;
    /** @type {?} */
    BaseChartDirective.prototype.labels;
    /** @type {?} */
    BaseChartDirective.prototype.options;
    /** @type {?} */
    BaseChartDirective.prototype.chartType;
    /** @type {?} */
    BaseChartDirective.prototype.colors;
    /** @type {?} */
    BaseChartDirective.prototype.legend;
    /** @type {?} */
    BaseChartDirective.prototype.plugins;
    /** @type {?} */
    BaseChartDirective.prototype.chartClick;
    /** @type {?} */
    BaseChartDirective.prototype.chartHover;
    /** @type {?} */
    BaseChartDirective.prototype.ctx;
    /** @type {?} */
    BaseChartDirective.prototype.chart;
    /**
     * @type {?}
     * @private
     */
    BaseChartDirective.prototype.old;
    /**
     * @type {?}
     * @private
     */
    BaseChartDirective.prototype.subs;
    /**
     * @type {?}
     * @private
     */
    BaseChartDirective.prototype.element;
    /**
     * @type {?}
     * @private
     */
    BaseChartDirective.prototype.themeService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1jaGFydC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmcyLWNoYXJ0cy9zcmMvIiwic291cmNlcyI6WyJsaWIvYmFzZS1jaGFydC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBRUwsU0FBUyxFQUVULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUlMLE1BQU0sR0FFUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3RDLE9BQU8sRUFDTCxLQUFLLEVBT0wsYUFBYSxFQUNkLE1BQU0sVUFBVSxDQUFDOzs7O0FBYWxCLHVCQWVDOzs7SUFkQyw4QkFBb0I7O0lBQ3BCLDhCQUFtQjs7SUFDbkIsa0NBQXdCOztJQUN4QixrQ0FBdUI7O0lBQ3ZCLHVDQUEyQjs7SUFDM0IsdUNBQThCOztJQUM5QixnQ0FBc0I7O0lBQ3RCLDBCQUFnQjs7SUFDaEIsK0JBQXFCOztJQUNyQiwwQkFBZ0I7O0lBQ2hCLGdDQUFzQjs7SUFDdEIsMEJBRUU7OztBQUdKLE1BQUssVUFBVTtJQUNiLE9BQU8sR0FBQTtJQUNQLE1BQU0sR0FBQTtJQUNOLE9BQU8sR0FBQTtFQUNSOzs7OztBQUdELEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixJQUFJLEVBQUUsY0FBYztJQUNwQixVQUFVOzs7SUFBRTtRQUNWLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzs7WUFFL0QsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFdBQVc7UUFDMUMsSUFBSSxDQUFD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ckUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07Ozs7O1FBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDdEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUc7Ozs7WUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQztZQUU5RCxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9CO1FBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTTs7Ozs7UUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDN0csSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUc7Ozs7WUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7WUFFckUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7WUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFFdEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBCLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0I7UUFFRCwwREFBMEQ7UUFDMUQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTs7Ozs7UUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sRUFBRTtZQUNoRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUc7Ozs7WUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFcEIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7WUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFFckMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07Ozs7O1FBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDaEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdB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LG1DQUFvQjs7Ozs7SUFFcEIsaUNBYUU7Ozs7O0lBRUYsa0NBQWtDOzs7OztJQWNoQyxxQ0FBMkI7Ozs7O0lBQzNCLDBDQUFrQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGdldENvbG9ycyB9IGZyb20gJy4vZ2V0LWNvbG9ycyc7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4vY29sb3InO1xuaW1wb3J0IHsgVGhlbWVTZXJ2aWNlIH0gZnJvbSAnLi90aGVtZS5zZXJ2aWNlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2xvbmVEZWVwIH0gZnJvbSAnbG9kYXNoLWVzJztcbmltcG9ydCB7XG4gIENoYXJ0LFxuICBDaGFydENvbmZpZ3VyYXRpb24sXG4gIENoYXJ0RGF0YVNldHMsXG4gIENoYXJ0T3B0aW9ucyxcbiAgQ2hhcnRQb2ludCwgQ2hhcnRUeXBlLFxuICBQbHVnaW5TZXJ2aWNlR2xvYmFsUmVnaXN0cmF0aW9uLFxuICBQbHVnaW5TZXJ2aWNlUmVnaXN0cmF0aW9uT3B0aW9ucyxcbiAgcGx1Z2luU2VydmljZVxufSBmcm9tICdjaGFydC5qcyc7XG5cbmV4cG9ydCB0eXBlIFNpbmdsZURhdGFTZXQgPSBBcnJheTxudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkIHwgbnVtYmVyW10+IHwgQ2hhcnRQb2ludFtdO1xuZXhwb3J0IHR5cGUgTXVsdGlEYXRhU2V0ID0gU2luZ2xlRGF0YVNldFtdO1xuZXhwb3J0IHR5cGUgU2luZ2xlT3JNdWx0aURhdGFTZXQgPSBTaW5nbGVEYXRhU2V0IHwgTXVsdGlEYXRhU2V0O1xuXG5leHBvcnQgdHlwZSBQbHVnaW5TZXJ2aWNlR2xvYmFsUmVnaXN0cmF0aW9uQW5kT3B0aW9ucyA9XG4gIFBsdWdpblNlcnZpY2VHbG9iYWxSZWdpc3RyYXRpb25cbiAgJiBQbHVnaW5TZXJ2aWNlUmVnaXN0cmF0aW9uT3B0aW9ucztcbmV4cG9ydCB0eXBlIFNpbmdsZUxpbmVMYWJlbCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIE11bHRpTGluZUxhYmVsID0gc3RyaW5nW107XG5leHBvcnQgdHlwZSBMYWJlbCA9IFNpbmdsZUxpbmVMYWJlbCB8IE11bHRpTGluZUxhYmVsO1xuXG5pbnRlcmZhY2UgT2xkU3RhdGUge1xuICBkYXRhRXhpc3RzOiBib29sZWFuO1xuICBkYXRhTGVuZ3RoOiBudW1iZXI7XG4gIGRhdGFzZXRzRXhpc3RzOiBib29sZWFuO1xuICBkYXRhc2V0c0xlbmd0aDogbnVtYmVyO1xuICBkYXRhc2V0c0RhdGFPYmplY3RzOiBhbnlbXTtcbiAgZGF0YXNldHNEYXRhTGVuZ3RoczogbnVtYmVyW107XG4gIGNvbG9yc0V4aXN0czogYm9vbGVhbjtcbiAgY29sb3JzOiBDb2xvcltdO1xuICBsYWJlbHNFeGlzdDogYm9vbGVhbjtcbiAgbGFiZWxzOiBMYWJlbFtdO1xuICBsZWdlbmRFeGlzdHM6IGJvb2xlYW47XG4gIGxlZ2VuZDoge1xuICAgIHBvc2l0aW9uPzogc3RyaW5nO1xuICB9O1xufVxuXG5lbnVtIFVwZGF0ZVR5cGUge1xuICBEZWZhdWx0LFxuICBVcGRhdGUsXG4gIFJlZnJlc2hcbn1cblxuLy8gRXh0ZW5kIHRoZSBsaW5lIGNoYXJ0IHdpdGggYSB2ZXJ0aWNhbCBpbmRpY2F0b3IgbGluZSBjaGFydCB0aGluZ3lcbkNoYXJ0LmNvbnRyb2xsZXJzLmxpbmUuZXh0ZW5kKHtcbiAgbmFtZTogXCJsaW5lV2l0aExpbmVcIixcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgQ2hhcnQuY29udHJvbGxlcnMubGluZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIG9yaWdpbmFsU2hvd1Rvb2x0aXAgPSB0aGlzLnNob3dUb29sdGlwO1xuICAgIHRoaXMuc2hvd1Rvb2x0aXAgPSBmdW5jdGlvbihhY3RpdmVQb2ludHMpIHtcblxuICAgICAgaWYgKGFjdGl2ZVBvaW50cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuY2hhcnQuY3R4O1xuICAgICAgICB2YXIgc2NhbGUgPSB0aGlzLnNjYWxlO1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2FhYSc7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyhhY3RpdmVQb2ludHNbMF0ueCwgc2NhbGUuc3RhcnRQb2ludCk7XG4gICAgICAgIGN0eC5saW5lVG8oYWN0aXZlUG9pbnRzWzBdLngsIHNjYWxlLmVuZFBvaW50KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxTaG93VG9vbHRpcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxufSk7XG5cbkBEaXJlY3RpdmUoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6ZGlyZWN0aXZlLXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnY2FudmFzW2Jhc2VDaGFydF0nLFxuICBleHBvcnRBczogJ2Jhc2UtY2hhcnQnXG59KVxuZXhwb3J0IGNsYXNzIEJhc2VDaGFydERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0LCBPbkRlc3Ryb3ksIERvQ2hlY2sge1xuICBASW5wdXQoKSBwdWJsaWMgZGF0YTogU2luZ2xlT3JNdWx0aURhdGFTZXQ7XG4gIEBJbnB1dCgpIHB1YmxpYyBkYXRhc2V0czogQ2hhcnREYXRhU2V0c1tdO1xuICBASW5wdXQoKSBwdWJsaWMgbGFiZWxzOiBMYWJlbFtdO1xuICBASW5wdXQoKSBwdWJsaWMgb3B0aW9uczogQ2hhcnRPcHRpb25zID0ge307XG4gIEBJbnB1dCgpIHB1YmxpYyBjaGFydFR5cGU6IENoYXJ0VHlwZTtcbiAgQElucHV0KCkgcHVibGljIGNvbG9yczogQ29sb3JbXTtcbiAgQElucHV0KCkgcHVibGljIGxlZ2VuZDogYm9vbGVhbjtcbiAgQElucHV0KCkgcHVibGljIHBsdWdpbnM6IFBsdWdpblNlcnZpY2VHbG9iYWxSZWdpc3RyYXRpb25BbmRPcHRpb25zW107XG5cbiAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENsaWNrOiBFdmVudEVtaXR0ZXI8eyBldmVudD86IE1vdXNlRXZlbnQsIGFjdGl2ZT86IHt9W10gfT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRIb3ZlcjogRXZlbnRFbWl0dGVyPHsgZXZlbnQ6IE1vdXNlRXZlbnQsIGFjdGl2ZToge31bXSB9PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBwdWJsaWMgY3R4OiBzdHJpbmc7XG4gIHB1YmxpYyBjaGFydDogQ2hhcnQ7XG5cbiAgcHJpdmF0ZSBvbGQ6IE9sZFN0YXRlID0ge1xuICAgIGRhdGFFeGlzdHM6IGZhbHNlLFxuICAgIGRhdGFMZW5ndGg6IDAsXG4gICAgZGF0YXNldHNFeGlzdHM6IGZhbHNlLFxuICAgIGRhdGFzZXRzTGVuZ3RoOiAwLFxuICAgIGRhdGFzZXRzRGF0YU9iamVjdHM6IFtdLFxuICAgIGRhdGFzZXRzRGF0YUxlbmd0aHM6IFtdLFxuICAgIGNvbG9yc0V4aXN0czogZmFsc2UsXG4gICAgY29sb3JzOiBbXSxcbiAgICBsYWJlbHNFeGlzdDogZmFsc2UsXG4gICAgbGFiZWxzOiBbXSxcbiAgICBsZWdlbmRFeGlzdHM6IGZhbHNlLFxuICAgIGxlZ2VuZDoge30sXG4gIH07XG5cbiAgcHJpdmF0ZSBzdWJzOiBTdWJzY3JpcHRpb25bXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHBsdWdpbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4ocGx1Z2luOiBQbHVnaW5TZXJ2aWNlR2xvYmFsUmVnaXN0cmF0aW9uQW5kT3B0aW9ucyk6IHZvaWQge1xuICAgIHBsdWdpblNlcnZpY2UucmVnaXN0ZXIocGx1Z2luKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgdW5yZWdpc3RlclBsdWdpbihwbHVnaW46IFBsdWdpblNlcnZpY2VHbG9iYWxSZWdpc3RyYXRpb25BbmRPcHRpb25zKTogdm9pZCB7XG4gICAgcGx1Z2luU2VydmljZS51bnJlZ2lzdGVyKHBsdWdpbik7XG4gIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgdGhlbWVTZXJ2aWNlOiBUaGVtZVNlcnZpY2UsXG4gICkgeyB9XG5cbiAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB0aGlzLnN1YnMucHVzaCh0aGlzLnRoZW1lU2VydmljZS5jb2xvcnNjaGVtZXNPcHRpb25zLnN1YnNjcmliZShyID0+IHRoaXMudGhlbWVDaGFuZ2VkKHIpKSk7XG4gIH1cblxuICBwcml2YXRlIHRoZW1lQ2hhbmdlZChvcHRpb25zOiB7fSk6IHZvaWQge1xuICAgIHRoaXMucmVmcmVzaCgpO1xuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5jaGFydCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgdXBkYXRlUmVxdWlyZWQgPSBVcGRhdGVUeXBlLkRlZmF1bHQ7XG4gICAgY29uc3Qgd2FudFVwZGF0ZSA9ICh4OiBVcGRhdGVUeXBlKSA9PiB7XG4gICAgICB1cGRhdGVSZXF1aXJlZCA9IHggPiB1cGRhdGVSZXF1aXJlZCA/IHggOiB1cGRhdGVSZXF1aXJlZDtcbiAgICB9O1xuXG4gICAgaWYgKCEhdGhpcy5kYXRhICE9PSB0aGlzLm9sZC5kYXRhRXhpc3RzKSB7XG4gICAgICB0aGlzLnByb3BhZ2F0ZURhdGFUb0RhdGFzZXRzKHRoaXMuZGF0YSk7XG5cbiAgICAgIHRoaXMub2xkLmRhdGFFeGlzdHMgPSAhIXRoaXMuZGF0YTtcblxuICAgICAgd2FudFVwZGF0ZShVcGRhdGVUeXBlLlVwZGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEubGVuZ3RoICE9PSB0aGlzLm9sZC5kYXRhTGVuZ3RoKSB7XG4gICAgICB0aGlzLm9sZC5kYXRhTGVuZ3RoID0gdGhpcy5kYXRhICYmIHRoaXMuZGF0YS5sZW5ndGggfHwgMDtcblxuICAgICAgd2FudFVwZGF0ZShVcGRhdGVUeXBlLlVwZGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKCEhdGhpcy5kYXRhc2V0cyAhPT0gdGhpcy5vbGQuZGF0YXNldHNFeGlzdHMpIHtcbiAgICAgIHRoaXMub2xkLmRhdGFzZXRzRXhpc3RzID0gISF0aGlzLmRhdGFzZXRzO1xuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kYXRhc2V0cyAmJiB0aGlzLmRhdGFzZXRzLmxlbmd0aCAhPT0gdGhpcy5vbGQuZGF0YXNldHNMZW5ndGgpIHtcbiAgICAgIHRoaXMub2xkLmRhdGFzZXRzTGVuZ3RoID0gdGhpcy5kYXRhc2V0cyAmJiB0aGlzLmRhdGFzZXRzLmxlbmd0aCB8fCAwO1xuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kYXRhc2V0cyAmJiB0aGlzLmRhdGFzZXRzLmZpbHRlcigoeCwgaSkgPT4geC5kYXRhICE9PSB0aGlzLm9sZC5kYXRhc2V0c0RhdGFPYmplY3RzW2ldKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMub2xkLmRhdGFzZXRzRGF0YU9iamVjdHMgPSB0aGlzLmRhdGFzZXRzLm1hcCh4ID0+IHguZGF0YSk7XG5cbiAgICAgIHdhbnRVcGRhdGUoVXBkYXRlVHlwZS5VcGRhdGUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRhdGFzZXRzICYmIHRoaXMuZGF0YXNldHMuZmlsdGVyKCh4LCBpKSA9PiB4LmRhdGEubGVuZ3RoICE9PSB0aGlzLm9sZC5kYXRhc2V0c0RhdGFMZW5ndGhzW2ldKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMub2xkLmRhdGFzZXRzRGF0YUxlbmd0aHMgPSB0aGlzLmRhdGFzZXRzLm1hcCh4ID0+IHguZGF0YS5sZW5ndGgpO1xuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAoISF0aGlzLmNvbG9ycyAhPT0gdGhpcy5vbGQuY29sb3JzRXhpc3RzKSB7XG4gICAgICB0aGlzLm9sZC5jb2xvcnNFeGlzdHMgPSAhIXRoaXMuY29sb3JzO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbG9ycygpO1xuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIHNtZWxscyBvZiBpbmVmZmljaWVuY3ksIG1pZ2h0IG5lZWQgdG8gcmV2aXNpdCB0aGlzXG4gICAgaWYgKHRoaXMuY29sb3JzICYmIHRoaXMuY29sb3JzLmZpbHRlcigoeCwgaSkgPT4gIXRoaXMuY29sb3JzRXF1YWwoeCwgdGhpcy5vbGQuY29sb3JzW2ldKSkubGVuZ3RoKSB7XG4gICAgICB0aGlzLm9sZC5jb2xvcnMgPSB0aGlzLmNvbG9ycy5tYXAoeCA9PiB0aGlzLmNvcHlDb2xvcih4KSk7XG5cbiAgICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG5cbiAgICAgIHdhbnRVcGRhdGUoVXBkYXRlVHlwZS5VcGRhdGUpO1xuICAgIH1cblxuICAgIGlmICghIXRoaXMubGFiZWxzICE9PSB0aGlzLm9sZC5sYWJlbHNFeGlzdCkge1xuICAgICAgdGhpcy5vbGQubGFiZWxzRXhpc3QgPSAhIXRoaXMubGFiZWxzO1xuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYWJlbHMgJiYgdGhpcy5sYWJlbHMuZmlsdGVyKCh4LCBpKSA9PiAhdGhpcy5sYWJlbHNFcXVhbCh4LCB0aGlzLm9sZC5sYWJlbHNbaV0pKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMub2xkLmxhYmVscyA9IHRoaXMubGFiZWxzLm1hcCh4ID0+IHRoaXMuY29weUxhYmVsKHgpKTtcblxuICAgICAgd2FudFVwZGF0ZShVcGRhdGVUeXBlLlVwZGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKCEhdGhpcy5vcHRpb25zLmxlZ2VuZCAhPT0gdGhpcy5vbGQubGVnZW5kRXhpc3RzKSB7XG4gICAgICB0aGlzLm9sZC5sZWdlbmRFeGlzdHMgPSAhIXRoaXMub3B0aW9ucy5sZWdlbmQ7XG5cbiAgICAgIHdhbnRVcGRhdGUoVXBkYXRlVHlwZS5SZWZyZXNoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmxlZ2VuZCAmJiB0aGlzLm9wdGlvbnMubGVnZW5kLnBvc2l0aW9uICE9PSB0aGlzLm9sZC5sZWdlbmQucG9zaXRpb24pIHtcbiAgICAgIHRoaXMub2xkLmxlZ2VuZC5wb3NpdGlvbiA9IHRoaXMub3B0aW9ucy5sZWdlbmQucG9zaXRpb247XG5cbiAgICAgIHdhbnRVcGRhdGUoVXBkYXRlVHlwZS5SZWZyZXNoKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHVwZGF0ZVJlcXVpcmVkIGFzIFVwZGF0ZVR5cGUpIHtcbiAgICAgIGNhc2UgVXBkYXRlVHlwZS5EZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVXBkYXRlVHlwZS5VcGRhdGU6XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBVcGRhdGVUeXBlLlJlZnJlc2g6XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBjb3B5TGFiZWwoYTogTGFiZWwpOiBMYWJlbCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkpIHtcbiAgICAgIHJldHVybiBbLi4uYV07XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9XG5cbiAgbGFiZWxzRXF1YWwoYTogTGFiZWwsIGI6IExhYmVsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgPT09IEFycmF5LmlzQXJyYXkoYilcbiAgICAgICYmIChBcnJheS5pc0FycmF5KGEpIHx8IGEgPT09IGIpXG4gICAgICAmJiAoIUFycmF5LmlzQXJyYXkoYSkgfHwgYS5sZW5ndGggPT09IGIubGVuZ3RoKVxuICAgICAgJiYgKCFBcnJheS5pc0FycmF5KGEpIHx8IGEuZmlsdGVyKCh4LCBpKSA9PiB4ICE9PSBiW2ldKS5sZW5ndGggPT09IDApXG4gICAgICA7XG4gIH1cblxuICBjb3B5Q29sb3IoYTogQ29sb3IpOiBDb2xvciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogYS5iYWNrZ3JvdW5kQ29sb3IsXG4gICAgICBib3JkZXJXaWR0aDogYS5ib3JkZXJXaWR0aCxcbiAgICAgIGJvcmRlckNvbG9yOiBhLmJvcmRlckNvbG9yLFxuICAgICAgYm9yZGVyQ2FwU3R5bGU6IGEuYm9yZGVyQ2FwU3R5bGUsXG4gICAgICBib3JkZXJEYXNoOiBhLmJvcmRlckRhc2gsXG4gICAgICBib3JkZXJEYXNoT2Zmc2V0OiBhLmJvcmRlckRhc2hPZmZzZXQsXG4gICAgICBib3JkZXJKb2luU3R5bGU6IGEuYm9yZGVySm9pblN0eWxlLFxuICAgICAgcG9pbnRCb3JkZXJDb2xvcjogYS5wb2ludEJvcmRlckNvbG9yLFxuICAgICAgcG9pbnRCYWNrZ3JvdW5kQ29sb3I6IGEucG9pbnRCYWNrZ3JvdW5kQ29sb3IsXG4gICAgICBwb2ludEJvcmRlcldpZHRoOiBhLnBvaW50Qm9yZGVyV2lkdGgsXG4gICAgICBwb2ludFJhZGl1czogYS5wb2ludFJhZGl1cyxcbiAgICAgIHBvaW50SG92ZXJSYWRpdXM6IGEucG9pbnRIb3ZlclJhZGl1cyxcbiAgICAgIHBvaW50SGl0UmFkaXVzOiBhLnBvaW50SGl0UmFkaXVzLFxuICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogYS5wb2ludEhvdmVyQmFja2dyb3VuZENvbG9yLFxuICAgICAgcG9pbnRIb3ZlckJvcmRlckNvbG9yOiBhLnBvaW50SG92ZXJCb3JkZXJDb2xvcixcbiAgICAgIHBvaW50SG92ZXJCb3JkZXJXaWR0aDogYS5wb2ludEhvdmVyQm9yZGVyV2lkdGgsXG4gICAgICBwb2ludFN0eWxlOiBhLnBvaW50U3R5bGUsXG4gICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogYS5ob3ZlckJhY2tncm91bmRDb2xvcixcbiAgICAgIGhvdmVyQm9yZGVyQ29sb3I6IGEuaG92ZXJCb3JkZXJDb2xvcixcbiAgICAgIGhvdmVyQm9yZGVyV2lkdGg6IGEuaG92ZXJCb3JkZXJXaWR0aCxcbiAgICB9O1xuICB9XG5cbiAgY29sb3JzRXF1YWwoYTogQ29sb3IsIGI6IENvbG9yKTogYm9vbGVhbiB7XG4gICAgaWYgKCFhICE9PSAhYikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gIWEgfHxcbiAgICAgIChhLmJhY2tncm91bmRDb2xvciA9PT0gYi5iYWNrZ3JvdW5kQ29sb3IpXG4gICAgICAmJiAoYS5ib3JkZXJXaWR0aCA9PT0gYi5ib3JkZXJXaWR0aClcbiAgICAgICYmIChhLmJvcmRlckNvbG9yID09PSBiLmJvcmRlckNvbG9yKVxuICAgICAgJiYgKGEuYm9yZGVyQ2FwU3R5bGUgPT09IGIuYm9yZGVyQ2FwU3R5bGUpXG4gICAgICAmJiAoYS5ib3JkZXJEYXNoID09PSBiLmJvcmRlckRhc2gpXG4gICAgICAmJiAoYS5ib3JkZXJEYXNoT2Zmc2V0ID09PSBiLmJvcmRlckRhc2hPZmZzZXQpXG4gICAgICAmJiAoYS5ib3JkZXJKb2luU3R5bGUgPT09IGIuYm9yZGVySm9pblN0eWxlKVxuICAgICAgJiYgKGEucG9pbnRCb3JkZXJDb2xvciA9PT0gYi5wb2ludEJvcmRlckNvbG9yKVxuICAgICAgJiYgKGEucG9pbnRCYWNrZ3JvdW5kQ29sb3IgPT09IGIucG9pbnRCYWNrZ3JvdW5kQ29sb3IpXG4gICAgICAmJiAoYS5wb2ludEJvcmRlcldpZHRoID09PSBiLnBvaW50Qm9yZGVyV2lkdGgpXG4gICAgICAmJiAoYS5wb2ludFJhZGl1cyA9PT0gYi5wb2ludFJhZGl1cylcbiAgICAgICYmIChhLnBvaW50SG92ZXJSYWRpdXMgPT09IGIucG9pbnRIb3ZlclJhZGl1cylcbiAgICAgICYmIChhLnBvaW50SGl0UmFkaXVzID09PSBiLnBvaW50SGl0UmFkaXVzKVxuICAgICAgJiYgKGEucG9pbnRIb3ZlckJhY2tncm91bmRDb2xvciA9PT0gYi5wb2ludEhvdmVyQmFja2dyb3VuZENvbG9yKVxuICAgICAgJiYgKGEucG9pbnRIb3ZlckJvcmRlckNvbG9yID09PSBiLnBvaW50SG92ZXJCb3JkZXJDb2xvcilcbiAgICAgICYmIChhLnBvaW50SG92ZXJCb3JkZXJXaWR0aCA9PT0gYi5wb2ludEhvdmVyQm9yZGVyV2lkdGgpXG4gICAgICAmJiAoYS5wb2ludFN0eWxlID09PSBiLnBvaW50U3R5bGUpXG4gICAgICAmJiAoYS5ob3ZlckJhY2tncm91bmRDb2xvciA9PT0gYi5ob3ZlckJhY2tncm91bmRDb2xvcilcbiAgICAgICYmIChhLmhvdmVyQm9yZGVyQ29sb3IgPT09IGIuaG92ZXJCb3JkZXJDb2xvcilcbiAgICAgICYmIChhLmhvdmVyQm9yZGVyV2lkdGggPT09IGIuaG92ZXJCb3JkZXJXaWR0aCk7XG4gIH1cblxuICB1cGRhdGVDb2xvcnMoKTogdm9pZCB7XG4gICAgdGhpcy5kYXRhc2V0cy5mb3JFYWNoKChlbG0sIGluZGV4KSA9PiB7XG4gICAgICBpZiAodGhpcy5jb2xvcnMgJiYgdGhpcy5jb2xvcnNbaW5kZXhdKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZWxtLCB0aGlzLmNvbG9yc1tpbmRleF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlbG0sIGdldENvbG9ycyh0aGlzLmNoYXJ0VHlwZSwgaW5kZXgsIGVsbS5kYXRhLmxlbmd0aCksIHsgLi4uZWxtIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBsZXQgdXBkYXRlUmVxdWlyZWQgPSBVcGRhdGVUeXBlLkRlZmF1bHQ7XG4gICAgY29uc3Qgd2FudFVwZGF0ZSA9ICh4OiBVcGRhdGVUeXBlKSA9PiB7XG4gICAgICB1cGRhdGVSZXF1aXJlZCA9IHggPiB1cGRhdGVSZXF1aXJlZCA/IHggOiB1cGRhdGVSZXF1aXJlZDtcbiAgICB9O1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGNoYW5nZXMgYXJlIGluIHRoZSBkYXRhIG9yIGRhdGFzZXRzIG9yIGxhYmVscyBvciBsZWdlbmRcblxuICAgIGlmIChjaGFuZ2VzLmhhc093blByb3BlcnR5KCdkYXRhJykgJiYgY2hhbmdlcy5kYXRhLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgdGhpcy5wcm9wYWdhdGVEYXRhVG9EYXRhc2V0cyhjaGFuZ2VzLmRhdGEuY3VycmVudFZhbHVlKTtcblxuICAgICAgd2FudFVwZGF0ZShVcGRhdGVUeXBlLlVwZGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXMuaGFzT3duUHJvcGVydHkoJ2RhdGFzZXRzJykgJiYgY2hhbmdlcy5kYXRhc2V0cy5jdXJyZW50VmFsdWUpIHtcbiAgICAgIHRoaXMucHJvcGFnYXRlRGF0YXNldHNUb0RhdGEoY2hhbmdlcy5kYXRhc2V0cy5jdXJyZW50VmFsdWUpO1xuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnbGFiZWxzJykpIHtcbiAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XG4gICAgICAgIHRoaXMuY2hhcnQuZGF0YS5sYWJlbHMgPSBjaGFuZ2VzLmxhYmVscy5jdXJyZW50VmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHdhbnRVcGRhdGUoVXBkYXRlVHlwZS5VcGRhdGUpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzLmhhc093blByb3BlcnR5KCdsZWdlbmQnKSkge1xuICAgICAgaWYgKHRoaXMuY2hhcnQpIHtcbiAgICAgICAgdGhpcy5jaGFydC5jb25maWcub3B0aW9ucy5sZWdlbmQuZGlzcGxheSA9IGNoYW5nZXMubGVnZW5kLmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgdGhpcy5jaGFydC5nZW5lcmF0ZUxlZ2VuZCgpO1xuICAgICAgfVxuXG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuVXBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpKSB7XG4gICAgICB3YW50VXBkYXRlKFVwZGF0ZVR5cGUuUmVmcmVzaCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh1cGRhdGVSZXF1aXJlZCBhcyBVcGRhdGVUeXBlKSB7XG4gICAgICBjYXNlIFVwZGF0ZVR5cGUuVXBkYXRlOlxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVXBkYXRlVHlwZS5SZWZyZXNoOlxuICAgICAgY2FzZSBVcGRhdGVUeXBlLkRlZmF1bHQ6XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2hhcnQpIHtcbiAgICAgIHRoaXMuY2hhcnQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5jaGFydCA9IHZvaWQgMDtcbiAgICB9XG4gICAgdGhpcy5zdWJzLmZvckVhY2goeCA9PiB4LnVuc3Vic2NyaWJlKCkpO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZShkdXJhdGlvbj86IGFueSk6IHt9IHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcnQudXBkYXRlKGR1cmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaGlkZURhdGFzZXQoaW5kZXg6IG51bWJlciwgaGlkZGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5jaGFydC5nZXREYXRhc2V0TWV0YShpbmRleCkuaGlkZGVuID0gaGlkZGVuO1xuICAgIHRoaXMuY2hhcnQudXBkYXRlKCk7XG4gIH1cblxuICBwdWJsaWMgaXNEYXRhc2V0SGlkZGVuKGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGFydC5nZXREYXRhc2V0TWV0YShpbmRleCkuaGlkZGVuO1xuICB9XG5cbiAgcHVibGljIHRvQmFzZTY0SW1hZ2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jaGFydC50b0Jhc2U2NEltYWdlKCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhcnRDb25maWd1cmF0aW9uKCk6IENoYXJ0Q29uZmlndXJhdGlvbiB7XG4gICAgY29uc3QgZGF0YXNldHMgPSB0aGlzLmdldERhdGFzZXRzKCk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zKTtcbiAgICBpZiAodGhpcy5sZWdlbmQgPT09IGZhbHNlKSB7XG4gICAgICBvcHRpb25zLmxlZ2VuZCA9IHsgZGlzcGxheTogZmFsc2UgfTtcbiAgICB9XG4gICAgLy8gaG9vayBmb3Igb25Ib3ZlciBhbmQgb25DbGljayBldmVudHNcbiAgICBvcHRpb25zLmhvdmVyID0gb3B0aW9ucy5ob3ZlciB8fCB7fTtcbiAgICBpZiAoIW9wdGlvbnMuaG92ZXIub25Ib3Zlcikge1xuICAgICAgb3B0aW9ucy5ob3Zlci5vbkhvdmVyID0gKGV2ZW50OiBNb3VzZUV2ZW50LCBhY3RpdmU6IHt9W10pID0+IHtcbiAgICAgICAgaWYgKGFjdGl2ZSAmJiAhYWN0aXZlLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoYXJ0SG92ZXIuZW1pdCh7IGV2ZW50LCBhY3RpdmUgfSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5vbkNsaWNrKSB7XG4gICAgICBvcHRpb25zLm9uQ2xpY2sgPSAoZXZlbnQ/OiBNb3VzZUV2ZW50LCBhY3RpdmU/OiB7fVtdKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcnRDbGljay5lbWl0KHsgZXZlbnQsIGFjdGl2ZSB9KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VkT3B0aW9ucyA9IHRoaXMuc21hcnRNZXJnZShvcHRpb25zLCB0aGlzLnRoZW1lU2VydmljZS5nZXRDb2xvcnNjaGVtZXNPcHRpb25zKCkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMuY2hhcnRUeXBlLFxuICAgICAgZGF0YToge1xuICAgICAgICBsYWJlbHM6IHRoaXMubGFiZWxzIHx8IFtdLFxuICAgICAgICBkYXRhc2V0c1xuICAgICAgfSxcbiAgICAgIHBsdWdpbnM6IHRoaXMucGx1Z2lucyxcbiAgICAgIG9wdGlvbnM6IG1lcmdlZE9wdGlvbnMsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFydEJ1aWxkZXIoY3R4OiBzdHJpbmcvKiwgZGF0YTphbnlbXSwgb3B0aW9uczphbnkqLyk6IENoYXJ0IHtcbiAgICBjb25zdCBjaGFydENvbmZpZyA9IHRoaXMuZ2V0Q2hhcnRDb25maWd1cmF0aW9uKCk7XG4gICAgcmV0dXJuIG5ldyBDaGFydChjdHgsIGNoYXJ0Q29uZmlnKTtcbiAgfVxuXG4gIHNtYXJ0TWVyZ2Uob3B0aW9uczogYW55LCBvdmVycmlkZXM6IGFueSwgbGV2ZWw6IG51bWJlciA9IDApOiBhbnkge1xuICAgIGlmIChsZXZlbCA9PT0gMCkge1xuICAgICAgb3B0aW9ucyA9IGNsb25lRGVlcChvcHRpb25zKTtcbiAgICB9XG4gICAgY29uc3Qga2V5c1RvVXBkYXRlID0gT2JqZWN0LmtleXMob3ZlcnJpZGVzKTtcbiAgICBrZXlzVG9VcGRhdGUuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3ZlcnJpZGVzW2tleV0pKSB7XG4gICAgICAgIGNvbnN0IGFycmF5RWxlbWVudHMgPSBvcHRpb25zW2tleV07XG4gICAgICAgIGlmIChhcnJheUVsZW1lbnRzKSB7XG4gICAgICAgICAgYXJyYXlFbGVtZW50cy5mb3JFYWNoKHIgPT4ge1xuICAgICAgICAgICAgdGhpcy5zbWFydE1lcmdlKHIsIG92ZXJyaWRlc1trZXldWzBdLCBsZXZlbCArIDEpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiAob3ZlcnJpZGVzW2tleV0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoIShrZXkgaW4gb3B0aW9ucykpIHtcbiAgICAgICAgICBvcHRpb25zW2tleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNtYXJ0TWVyZ2Uob3B0aW9uc1trZXldLCBvdmVycmlkZXNba2V5XSwgbGV2ZWwgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdGlvbnNba2V5XSA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChsZXZlbCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpc011bHRpTGluZUxhYmVsKGxhYmVsOiBMYWJlbCk6IGxhYmVsIGlzIE11bHRpTGluZUxhYmVsIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShsYWJlbCk7XG4gIH1cblxuICBwcml2YXRlIGpvaW5MYWJlbChsYWJlbDogTGFiZWwpOiBzdHJpbmcge1xuICAgIGlmICghbGFiZWwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc011bHRpTGluZUxhYmVsKGxhYmVsKSkge1xuICAgICAgcmV0dXJuIGxhYmVsLmpvaW4oJyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcHJvcGFnYXRlRGF0YXNldHNUb0RhdGEoZGF0YXNldHM6IENoYXJ0RGF0YVNldHNbXSk6IHZvaWQge1xuICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YXNldHMubWFwKHIgPT4gci5kYXRhKTtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdGhpcy5jaGFydC5kYXRhLmRhdGFzZXRzID0gZGF0YXNldHM7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICBwcml2YXRlIHByb3BhZ2F0ZURhdGFUb0RhdGFzZXRzKG5ld0RhdGFWYWx1ZXM6IFNpbmdsZU9yTXVsdGlEYXRhU2V0KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNNdWx0aURhdGFTZXQobmV3RGF0YVZhbHVlcykpIHtcbiAgICAgIGlmICh0aGlzLmRhdGFzZXRzICYmIG5ld0RhdGFWYWx1ZXMubGVuZ3RoID09PSB0aGlzLmRhdGFzZXRzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmRhdGFzZXRzLmZvckVhY2goKGRhdGFzZXQsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgIGRhdGFzZXQuZGF0YSA9IG5ld0RhdGFWYWx1ZXNbaV07XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kYXRhc2V0cyA9IG5ld0RhdGFWYWx1ZXMubWFwKChkYXRhOiBudW1iZXJbXSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgIHJldHVybiB7IGRhdGEsIGxhYmVsOiB0aGlzLmpvaW5MYWJlbCh0aGlzLmxhYmVsc1tpbmRleF0pIHx8IGBMYWJlbCAke2luZGV4fWAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XG4gICAgICAgICAgdGhpcy5jaGFydC5kYXRhLmRhdGFzZXRzID0gdGhpcy5kYXRhc2V0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuZGF0YXNldHMpIHtcbiAgICAgICAgdGhpcy5kYXRhc2V0cyA9IFt7IGRhdGE6IG5ld0RhdGFWYWx1ZXMgfV07XG4gICAgICAgIGlmICh0aGlzLmNoYXJ0KSB7XG4gICAgICAgICAgdGhpcy5jaGFydC5kYXRhLmRhdGFzZXRzID0gdGhpcy5kYXRhc2V0cztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXRzWzBdKSB7XG4gICAgICAgICAgdGhpcy5kYXRhc2V0c1swXSA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kYXRhc2V0c1swXS5kYXRhID0gbmV3RGF0YVZhbHVlcztcbiAgICAgICAgdGhpcy5kYXRhc2V0cy5zcGxpY2UoMSk7IC8vIFJlbW92ZSBhbGwgZWxlbWVudHMgYnV0IHRoZSBmaXJzdFxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbG9ycygpO1xuICB9XG5cbiAgcHJpdmF0ZSBpc011bHRpRGF0YVNldChkYXRhOiBTaW5nbGVPck11bHRpRGF0YVNldCk6IGRhdGEgaXMgTXVsdGlEYXRhU2V0IHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShkYXRhWzBdKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGF0YXNldHMoKTogQ2hhcnQuQ2hhcnREYXRhU2V0c1tdIHtcbiAgICBpZiAoIXRoaXMuZGF0YXNldHMgJiYgIXRoaXMuZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBuZy1jaGFydHMgY29uZmlndXJhdGlvbiBlcnJvciwgZGF0YSBvciBkYXRhc2V0cyBmaWVsZCBhcmUgcmVxdWlyZWQgdG8gcmVuZGVyIGNoYXJ0ICR7IHRoaXMuY2hhcnRUeXBlIH1gKTtcbiAgICB9XG5cbiAgICAvLyBJZiBgZGF0YXNldHNgIGlzIGRlZmluZWQsIHVzZSBpdCBvdmVyIHRoZSBgZGF0YWAgcHJvcGVydHkuXG4gICAgaWYgKHRoaXMuZGF0YXNldHMpIHtcbiAgICAgIHRoaXMucHJvcGFnYXRlRGF0YXNldHNUb0RhdGEodGhpcy5kYXRhc2V0cyk7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhc2V0cztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICB0aGlzLnByb3BhZ2F0ZURhdGFUb0RhdGFzZXRzKHRoaXMuZGF0YSk7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhc2V0cztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZnJlc2goKTogdm9pZCB7XG4gICAgLy8gaWYgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZSkge1xuICAgIC8vICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlZnJlc2goKSwgNTApO1xuICAgIC8vIH1cblxuICAgIC8vIHRvZG86IHJlbW92ZSB0aGlzIGxpbmUsIGl0IGlzIHByb2R1Y2luZyBmbGlja2VyaW5nXG4gICAgaWYgKHRoaXMuY2hhcnQpIHtcbiAgICAgIHRoaXMuY2hhcnQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5jaGFydCA9IHZvaWQgMDtcbiAgICB9XG4gICAgaWYgKHRoaXMuY3R4KSB7XG4gICAgICB0aGlzLmNoYXJ0ID0gdGhpcy5nZXRDaGFydEJ1aWxkZXIodGhpcy5jdHgvKiwgZGF0YSwgdGhpcy5vcHRpb25zKi8pO1xuICAgIH1cbiAgfVxufVxuIl19