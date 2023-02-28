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
  useChartPerConfig,
} from '@/components/ChartComponents/Common/Component/hook';
import ColorSelect from '@/components/ColorSelect';
import ThemeUtil from '@/utils/Assist/Theme';
import FetchFragment, {
  TFetchFragmentRef,
} from '@/components/ChartComponents/Common/FetchFragment';
import { init } from '@/utils/Assist/EchartsLoader';
import { DEFAULT_OPACITY } from '@/utils/constants/defaultComponentConfig';
import { TPolarBarConfig } from '../type';
import { CHART_ID } from '../id';

const { getRgbaString } = ColorSelect;

const PolarBar = (
  props: ComponentData.CommonComponentProps<TPolarBarConfig>,
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

  const { legend, series, polar, angleAxis, tooltip, animation, condition } =
    useChartPerConfig<TPolarBarConfig>(options);

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
  } = useComponent<TPolarBarConfig>(
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

  const { xAxisKeys, yAxisValues } = useChartValueMapField(processedValue, {
    map: componentFilterMap,
    fields: {
      seriesKey: 's',
      xAxisKeyKey: 'name',
      yAxisValue: 'value',
    },
  });

  const onClick = (params: any) => {
    const { name, data } = params;
    const target = {
      name,
      value: data,
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
    const baseSeries = {
      ...nextSeries,
      label: {
        ...label,
        color: getRgbaString(label.color),
      },
      coordinateSystem: 'polar',
      type: 'bar',
      roundCap: true,
      itemStyle: {
        ...itemStyle,
        color: getRgbaString(itemStyle.color[0]),
      },
      data: [yAxisValues._defaultValue_[0]],
      animation: show,
      animationEasing,
      animationEasingUpdate: animationEasing,
      animationDuration,
      animationDurationUpdate: animationDuration,
    };

    const realSeries = xAxisKeys.length
      ? xAxisKeys.map((item: any, index: number) => {
          return {
            ...baseSeries,
            itemStyle: {
              ...itemStyle,
              color: getRgbaString(itemStyle.color[index]),
            },
            data: [yAxisValues._defaultValue_[index] || 0],
            name: item,
          };
        })
      : [baseSeries];

    return realSeries;
  };

  const setOption = () => {
    const { ...nextTooltip } = tooltip;
    const { axisLabel, ...nextAngleAxis } = angleAxis;

    const realSeries = getSeries();

    chartInstance.current?.setOption(
      {
        grid: {
          show: false,
        },
        legend: {
          ...legend,
          data: xAxisKeys,
        },
        radiusAxis: {
          type: 'category',
          show: false,
        },
        polar: {
          ...polar,
          radius: polar.radius.map((item) => `${item}%`),
        },
        angleAxis: {
          show: true,
          ...nextAngleAxis,
          axisLabel: {
            ...axisLabel,
            color: getRgbaString(axisLabel.color),
          },
          splitLine: {
            lineStyle: {
              color: getRgbaString({
                ...ThemeUtil.generateNextColor4CurrentTheme(0),
                a: DEFAULT_OPACITY,
              }),
            },
          },
        },
        series: realSeries,
        tooltip: {
          ...nextTooltip,
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
      },
      true,
    );
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
  }, [processedValue, xAxisKeys, yAxisValues]);

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

const WrapperPolarBar: typeof PolarBar & {
  id: ComponentData.TComponentSelfType;
} = PolarBar as any;

WrapperPolarBar.id = CHART_ID;

export default WrapperPolarBar;
