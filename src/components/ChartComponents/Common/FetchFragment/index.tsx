import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useUpdateEffect } from 'ahooks';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useMobxContext } from '@/hooks';
import { CompareFilterUtil } from '@/utils/Assist/FilterData';

export type TFetchFragmentProps = {
  id: string;
  url: string;
  componentFilter: ComponentData.TComponentFilterConfig[];
  componentCondition?: ComponentData.ComponentConditionConfig;
  componentParams?: string[];

  reParams?: (targetParams: ComponentData.TParams, newValue: any) => void;
  reFetchData: () => Promise<any>;
  reGetValue: () => void;
  reCondition?: (
    condition: ComponentData.ComponentCondition,
    initialState: ComponentData.ComponentConditionConfig['initialState'],
  ) => void;
};

export type TFetchFragmentRef = {
  params: ComponentData.TParams[];
  constants: ComponentData.TConstants[];
  filter: ComponentData.TFilterConfig[];
};

const FetchFragment = forwardRef<TFetchFragmentRef, TFetchFragmentProps>(
  (props, ref) => {
    const {
      componentFilter,
      componentParams = [],
      componentCondition: componentConditionConfig = {
        value: [],
        initialState: 'visible',
      },
      url,
      reParams = noop,
      reFetchData,
      reGetValue,
      reCondition = noop,
      id,
    } = props;
    const {
      global: {
        screenData: {
          config: {
            attr: { params, constants, filter },
          },
        },
        screenType,
      },
    } = useMobxContext();

    const { value: componentCondition = [], initialState } =
      componentConditionConfig;

    // 检查数据过滤的方法
    const filterUtil = useRef<CompareFilterUtil>(
      new CompareFilterUtil(
        {
          url,
          id,
          componentFilter,
          componentCondition,
          componentConstants: constants,
          componentParams,
          onParams: reParams,
          onFetch: async () => {
            return reFetchData();
          },
          onFilter: async () => {
            return reGetValue();
          },
          onCondition: (condition) => {
            return reCondition(condition, initialState);
          },
          onHashChange: () => {
            // * 可能存在hash值手动更改的情况
            filterUtil.current?.compare(params);
          },
        },
        filter,
        params,
      ),
    );

    // 数据发生改变的时候比较数据
    useUpdateEffect(() => {
      filterUtil.current?.compare(params);
    }, [params]);

    useEffect(() => {
      componentCondition.forEach((condition) => {
        reCondition(condition, initialState);
      });
    }, [componentCondition, reCondition, initialState]);

    useImperativeHandle(
      ref,
      () => {
        return {
          params,
          constants,
          filter,
        };
      },
      [params, constants, filter],
    );

    useEffect(() => {
      reFetchData().then(reGetValue);
    }, []);

    return <></>;
  },
);

export default observer(FetchFragment, {
  forwardRef: true,
});
