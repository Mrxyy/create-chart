import { useMemo, useRef, useCallback, useState } from 'react';
import { uniqueId, merge } from 'lodash';
import { Image } from 'antd';
import classnames from 'classnames';
import {
  useComponent,
  useCondition,
} from '@/components/ChartComponents/Common/Component/hook';
import { useClipPath } from '@/hooks';
import FetchFragment, {
  TFetchFragmentRef,
} from '@/components/ChartComponents/Common/FetchFragment';
import FilterDataUtil from '@/utils/Assist/FilterData';
import { DEFAULT_BORDER_RADIUS } from '@/utils/constants/defaultComponentConfig';
import { TImageConfig } from '../type';
import { CHART_ID } from '../id';
import styles from './index.less';

const ImageBasic = (
  props: ComponentData.CommonComponentProps<TImageConfig>,
) => {
  const { className, style, value, global, children, wrapper: Wrapper } = props;
  const { screenType } = global;

  const [visible, setVisible] = useState<boolean>(false);

  const {
    id,
    config: {
      options,
      style: { border },
    },
  } = value;
  const {
    type,
    content,
    repeat,
    condition,
    preview,
    clipPath = 'circle',
  } = options;

  const clipPathStyle = useClipPath(clipPath);

  const chartId = useRef<string>(uniqueId(CHART_ID));
  const requestRef = useRef<TFetchFragmentRef>(null);

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
  } = useComponent<TImageConfig>(
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

  const finalValue = useMemo(() => {
    return FilterDataUtil.getFieldMapValue(processedValue, {
      map: componentFilterMap,
    });
  }, [processedValue, componentFilterMap]);

  const onClick = useCallback(() => {
    if (preview.show && finalValue.value) {
      setVisible(true);
    }
    syncInteractiveAction('click', {
      value: finalValue.value,
    });
    linkageMethod('click', {
      value: finalValue.value,
    });
  }, [syncInteractiveAction, finalValue, preview]);

  const componentStyle = useMemo(() => {
    const { x, y } = repeat;
    if (type === 'image')
      return {
        backgroundImage: `url(${finalValue.value || ''})`,
        backgroundRepeatX: x ? 'repeat' : 'no-repeat',
        backgroundRepeatY: y ? 'repeat' : 'no-repeat',
        backgroundSize: !x && !y ? '100% 100%' : '',
      };
    return {
      backgroundColor: finalValue.value,
    };
  }, [type, content, finalValue, repeat]);

  const componentClassName = useMemo(() => {
    return classnames(
      className,
      styles['component-media-image'],
      conditionClassName,
    );
  }, [className, conditionClassName]);

  return (
    <>
      <div
        className={componentClassName}
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
          <div
            id={chartId.current}
            onClick={onClick}
            className="w-100 h-100"
            style={merge(componentStyle, clipPathStyle, {
              borderRadius: DEFAULT_BORDER_RADIUS,
            })}
          ></div>
          {children}
        </Wrapper>
      </div>
      <Image
        preview={{
          visible: visible,
          onVisibleChange: (value) => {
            setVisible(value);
          },
          src: finalValue.value || '',
        }}
      />
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

const WrapperImageBasic: typeof ImageBasic & {
  id: ComponentData.TComponentSelfType;
} = ImageBasic as any;

WrapperImageBasic.id = CHART_ID;

export default WrapperImageBasic;
