import { useEffect, useRef } from 'react';
import { uniqueId, merge } from 'lodash';
import classnames from 'classnames';
import { useDeepUpdateEffect } from '@/hooks';
import {
  useComponent,
  useChartComponentResize,
  useChartValueMapField,
  useComponentResize,
  useAnimationChange,
  useCondition,
  useChartComponentTooltip,
  useChartPerConfig,
} from '@/components/ChartComponents/Common/Component/hook';
import ColorSelect from '@/components/ColorSelect';
import FetchFragment, {
  TFetchFragmentRef,
} from '@/components/ChartComponents/Common/FetchFragment';
import { DEFAULT_BORDER_RADIUS } from '@/utils/constants/defaultComponentConfig';
import { init } from '@/utils/Assist/EchartsLoader';
import { TNegativeBarConfig } from '../type';
import { CHART_ID } from '../id';

const { getRgbaString } = ColorSelect;

const NegativeBar = (
  props: ComponentData.CommonComponentProps<TNegativeBarConfig>,
) => {
  const { className, style, value, global, children, wrapper: Wrapper } = props;
  const { screenTheme, screenType } = global;

  const {
    id,
    config: {
      options,
      style: { border },
    },
  } = value;

  const { legend, series, xAxis, yAxis, tooltip, animation, condition, grid } =
    useChartPerConfig<TNegativeBarConfig>(options);

  const chartId = useRef<string>(uniqueId(CHART_ID));
  const chartInstance = useRef<echarts.ECharts>();
  const requestRef = useRef<TFetchFragmentRef>(null);

  useComponentResize(value, () => {
    chartInstance?.current?.resize();
  });

  const {
    request,
    syncInteractiveAction,
    linkageMethod,
    getValue,
    requestUrl,
    componentFilter,
    value: processedValue = [],
    componentFilterMap,
    onCondition,
  } = useComponent<TNegativeBarConfig>(
    {
      component: value,
      global,
    },
    requestRef,
  );

  const {
    onCondition: propsOnCondition,
    style: conditionStyle,
    className: conditionClassName,
  } = useCondition(onCondition, screenType);

  const { seriesKeys, xAxisKeys, yAxisValues } = useChartValueMapField(
    processedValue,
    {
      map: componentFilterMap,
      fields: {
        seriesKey: 's',
        xAxisKeyKey: 'x',
        yAxisValue: 'y',
      },
    },
  );

  const onClick = (params: any) => {
    const { seriesName, name, value } = params;
    const target = {
      x: name,
      y: value,
      s: seriesName,
    };
    syncInteractiveAction('click', target);
    linkageMethod('click-item', target);
  };

  const initChart = () => {
    const chart = init(
      document.querySelector(`#${chartId.current!}`)!,
      screenTheme,
      {
        renderer: 'canvas',
      },
    );
    chartInstance.current = chart;
    setOption();
  };

  const getSeries = () => {
    const { itemStyle, label, ...nextSeries } = series;
    const { animation: show, animationDuration, animationEasing } = animation;

    const commonSeries = {
      ...nextSeries,
      legendHoverLink: false,
      type: 'bar',
      emphasis: {
        focus: 'none',
      },
      animation: show,
      animationEasing,
      animationEasingUpdate: animationEasing,
      animationDuration,
      animationDurationUpdate: animationDuration,
    };

    const baseSeries = [
      {
        ...commonSeries,
        itemStyle: {
          ...itemStyle,
          color: getRgbaString(itemStyle.color[0]),
          borderRadius: [DEFAULT_BORDER_RADIUS, 0, 0, DEFAULT_BORDER_RADIUS],
        },
        label: {
          ...label[0],
          color: getRgbaString(label[0].color),
          formatter: label[0].formatter,
        },
        data: yAxisValues._defaultValue_?.map((item: any) => item?.[0] || 0),
        stack: '__default_stack__',
      },
      {
        ...commonSeries,
        itemStyle: {
          ...itemStyle,
          color: getRgbaString(itemStyle.color[1]),
          borderRadius: [0, DEFAULT_BORDER_RADIUS, DEFAULT_BORDER_RADIUS, 0],
        },
        label: {
          ...label[1],
          color: getRgbaString(label[1].color),
          formatter: label[1].formatter,
        },
        data: yAxisValues._defaultValue_?.map((item: any) => item?.[1] || 0),
        stack: '__default_stack__',
      },
    ];

    const realSeries = seriesKeys.length
      ? seriesKeys.reduce((acc: any, item: any, index: number) => {
          acc.push(
            {
              ...baseSeries[0],
              itemStyle: {
                ...itemStyle,
                color: getRgbaString(itemStyle.color[index * 2]),
                borderRadius: [
                  DEFAULT_BORDER_RADIUS,
                  0,
                  0,
                  DEFAULT_BORDER_RADIUS,
                ],
              },
              data: (yAxisValues[item] || []).map((item: any) => item?.[0]),
              name: item,
              stack: item,
            },
            {
              ...baseSeries[1],
              itemStyle: {
                ...itemStyle,
                color: getRgbaString(itemStyle.color[index * 2 + 1]),
                borderRadius: [
                  0,
                  DEFAULT_BORDER_RADIUS,
                  DEFAULT_BORDER_RADIUS,
                  0,
                ],
              },
              data: (yAxisValues[item] || []).map((item: any) => item?.[1]),
              name: item,
              stack: item,
            },
          );
        }, [])
      : baseSeries;

    return realSeries;
  };

  const setOption = () => {
    const { animation, ...nextTooltip } = tooltip;

    const realSeries = getSeries();

    chartInstance.current?.setOption({
      grid: {
        ...grid,
      },
      legend: {
        ...legend,
        data: seriesKeys,
      },
      series: realSeries,
      xAxis: [
        {
          ...xAxis,
          type: 'value',
          axisLine: {
            show: true,
          },
          axisTick: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          ...yAxis,
          type: 'category',
          data: xAxisKeys,
          axisTick: {
            show: false,
          },
        },
      ],
      tooltip: {
        ...nextTooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
    });

    screenType !== 'edit' &&
      animation.show &&
      useChartComponentTooltip(chartInstance.current!, realSeries, {
        interval: animation.speed,
      });
  };

  useChartComponentResize(chartInstance.current!);

  useEffect(() => {
    initChart();
    return () => {
      chartInstance.current?.dispose();
    };
  }, [screenTheme]);

  useEffect(() => {
    chartInstance.current?.off('click');
    chartInstance.current?.on('click', onClick);
  }, [syncInteractiveAction]);

  // 数据发生变化时
  useDeepUpdateEffect(() => {
    setOption();
  }, [processedValue, seriesKeys, xAxisKeys, yAxisValues]);

  // 配置发生变化时
  useDeepUpdateEffect(() => {
    setOption();
    chartInstance.current?.resize();
  }, [options]);

  useAnimationChange(chartInstance.current!, animation, setOption);

  return (
    <>
      <div
        className={classnames(className, conditionClassName)}
        style={merge(
          {
            width: '100%',
            height: '100%',
          },
          style,
          conditionStyle,
        )}
      >
        <Wrapper border={border}>
          <div id={chartId.current} className="w-100 h-100"></div>
          {children}
        </Wrapper>
      </div>
      <FetchFragment
        id={id}
        url={requestUrl}
        ref={requestRef}
        reFetchData={request}
        reGetValue={getValue}
        reCondition={propsOnCondition}
        componentFilter={componentFilter}
        componentCondition={condition}
      />
    </>
  );
};

const WrapperNegativeBar: typeof NegativeBar & {
  id: ComponentData.TComponentSelfType;
} = NegativeBar as any;

WrapperNegativeBar.id = CHART_ID;

export default WrapperNegativeBar;
