export type TScatterBasicConfig = {
  legend: Omit<ComponentData.ComponentLegend, 'type'>;
  tooltip: ComponentData.ComponentTooltip;
  xAxis: ComponentData.ComponentXAxis;
  yAxis: ComponentData.ComponentYAxis;
  series: {
    symbol: ComponentData.ComponentSymbol;
    symbolSize: number;
    itemStyle: {
      color: ComponentData.TColorConfig;
      borderColor: ComponentData.TColorConfig;
      borderType: ComponentData.ComponentLineStyle;
      borderWidth: number;
    }[];
  };
  animation: ComponentData.ComponentChartAnimationConfig;
};
