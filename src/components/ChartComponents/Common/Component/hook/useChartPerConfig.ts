import { useMemo } from 'react';
import { pick } from 'lodash';
import ColorSelect from '@/components/ColorSelect';

const { getRgbaString } = ColorSelect;

const CHART_CONFIG_MAP = {
  grid: (value: ComponentData.ComponentGrid & { [key: string]: any }) => {
    const { ...nextGrid } = value;
    return {
      borderWidth: 0,
      ...nextGrid,
      backgroundColor: 'transparent',
    };
  },
  tooltip: (value: ComponentData.ComponentTooltip & { [key: string]: any }) => {
    const {
      backgroundColor,
      textStyle: tooltipTextStyle,
      ...nextTooltip
    } = value;
    return {
      ...nextTooltip,
      backgroundColor: getRgbaString(backgroundColor),
      textStyle: {
        ...tooltipTextStyle,
        color: getRgbaString(tooltipTextStyle.color),
      },
    };
  },
  legend: (value: ComponentData.ComponentLegend & { [key: string]: any }) => {
    const { textStyle: legendTextStyle, itemStyle, ...nextLegend } = value;
    const { sizeIgnore, itemWidth, itemHeight, icon } = itemStyle || {};
    return {
      ...nextLegend,
      icon,
      ...(sizeIgnore && icon !== 'none'
        ? {}
        : {
            itemWidth,
            itemHeight,
          }),
      textStyle: {
        ...legendTextStyle,
        color: getRgbaString(legendTextStyle.color),
      },
    };
  },
  xAxis: (value: ComponentData.ComponentXAxis & { [key: string]: any }) => {
    const { axisLabel: xAxisLabel, splitLine, ...nextXAxis } = value;
    const base: any = {
      ...nextXAxis,
      splitLine: {
        show: false,
      },
      axisLabel: {
        ...xAxisLabel,
        color: getRgbaString(xAxisLabel.color),
      },
      nameTextStyle: {
        ...pick(xAxisLabel, ['fontSize', 'fontWeight', 'fontFamily']),
        color: getRgbaString(xAxisLabel.color),
      },
    };
    if (splitLine && splitLine.show) {
      base.splitLine = {
        ...splitLine,
        lineStyle: {
          ...splitLine.lineStyle,
          color: getRgbaString(splitLine.lineStyle.color),
        },
      };
    }

    return base;
  },
  yAxis: (value: ComponentData.ComponentYAxis & { [key: string]: any }) => {
    const { axisLabel: yAxisLabel, splitLine, ...nextYAxis } = value;

    const base = {
      ...nextYAxis,
      splitLine: {
        show: false,
      },
      axisLabel: {
        ...yAxisLabel,
        color: getRgbaString(yAxisLabel.color),
      },
      nameTextStyle: {
        ...pick(yAxisLabel, ['fontSize', 'fontWeight', 'fontFamily']),
        color: getRgbaString(yAxisLabel.color),
      },
    };

    if (splitLine && splitLine.show) {
      base.splitLine = {
        ...splitLine,
        lineStyle: {
          ...splitLine.lineStyle,
          color: getRgbaString(splitLine.lineStyle.color),
        },
      };
    }

    return base;
  },
  yAxis2: (value: ComponentData.ComponentYAxis & { [key: string]: any }) => {
    const { axisLabel: yAxisLabel, splitLine, ...nextYAxis } = value;

    const base = {
      ...nextYAxis,
      splitLine: {
        show: false,
      },
      axisLabel: {
        ...yAxisLabel,
        color: getRgbaString(yAxisLabel.color),
      },
      nameTextStyle: {
        ...pick(yAxisLabel, ['fontSize', 'fontWeight', 'fontFamily']),
        color: getRgbaString(yAxisLabel.color),
      },
    };

    if (splitLine && splitLine.show) {
      base.splitLine = {
        ...splitLine,
        lineStyle: {
          ...splitLine.lineStyle,
          color: getRgbaString(splitLine.lineStyle.color),
        },
      };
    }

    return base;
  },
};

export function useChartPerConfig<T = object>(
  config: T,
  ignore: string[] = [],
): T {
  const configData: T = useMemo(() => {
    const stringList = Object.keys(config);
    const perConfig: any = config;
    return stringList.reduce((acc, cur) => {
      const targetMethod = (CHART_CONFIG_MAP as any)[cur];
      if (targetMethod && !ignore.includes(cur)) {
        acc[cur] = targetMethod(perConfig[cur]);
      } else {
        acc[cur] = perConfig[cur];
      }
      return acc;
    }, {} as any) as T;
  }, [config]);

  return configData;
}
