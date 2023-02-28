import { set, get, merge, cloneDeep } from 'lodash';
import arrayMove from 'array-move';
import {
  DEFAULT_SCREEN_DATA,
  DEFAULT_FILTER_LIST,
} from '@/utils/constants/screenData';
import { ThemeMap } from '@/utils/constants/theme';
import { mergeWithoutArray } from '@/utils/tool';
import { HistoryUtil } from '@/utils/Assist/History';
import ComponentUtil from '@/utils/Assist/Component';
import { ScreenDataRequest } from '@/utils/Assist/RequestPool';
import { DragData } from './connect';

console.log(ThemeMap, DEFAULT_SCREEN_DATA, DEFAULT_FILTER_LIST, 222222);

export default {
  namespace: 'global',

  state: {
    // 当前大屏的类型
    screenType: 'edit',
    // 大屏
    screenData: DEFAULT_SCREEN_DATA,
    components: DEFAULT_SCREEN_DATA.components,
    guideLine: {
      show: true,
      value: [],
    },
    select: [],
    history: {
      value: new HistoryUtil(),
      isUndoDisabled: true,
      isRedoDisabled: true,
    },
    componentSelect: null,
    theme: ThemeMap.dark,
    clipboard: {
      timestamps: 0,
      value: [],
    },
    drag: {
      value: null,
    },
    scale: 100,
    version: '',
  },

  effects: {
    *setScreenType(
      { value }: { value: ComponentData.ScreenType },
      { put }: any,
    ) {
      yield put({
        type: 'setScreenTypeData',
        payload: value,
      });
    },

    *setScreen(
      {
        value,
        init,
      }: { value: ComponentMethod.GlobalUpdateScreenDataParams; init: boolean },
      { put }: any,
    ) {
      yield put({
        type: 'setData',
        payload: value,
        init,
      });
    },

    *setVersion({ value }: { value: string }, { put }: any) {
      yield put({
        type: 'setVersionData',
        payload: value,
      });
    },

    *setGuideLine(
      { value, init }: { value: string; init: boolean },
      { put }: any,
    ) {
      yield put({
        type: 'setGuideLineData',
        payload: value,
        init,
      });
    },

    *setDragInfo({ value }: { value: Partial<DragData> }, { put }: any) {
      yield put({
        type: 'setDragData',
        payload: value,
      });
    },

    *setCallbackData(
      { value }: { value: ComponentData.TFilterConfig[] },
      { put }: any,
    ) {
      yield put({
        type: 'setCallback',
        payload: value,
      });
    },

    *setSelect({ value }: { value: string[] }, { put }: any) {
      yield put({
        type: 'setSelectData',
        payload: value,
      });
    },

    *setComponent(
      value: {
        value:
          | Partial<ComponentData.TComponentData>
          | Partial<ComponentData.TComponentData>[];
        enqueue: boolean;
      },
      { put }: any,
    ) {
      yield put({
        type: 'setComponentData',
        payload: value,
      });
    },

    *setComponentAll(
      value: {
        value: ComponentData.TComponentData[];
        enqueue: boolean;
      },
      { put }: any,
    ) {
      yield put({
        type: 'setComponentDataAll',
        payload: value,
      });
    },

    *setScale({ value }: { value: string[] }, { put }: any) {
      yield put({
        type: 'setScaleData',
        payload: value,
      });
    },

    *setClipboard(
      { value }: { value: ComponentClipboard.LocalClipboardType },
      { put }: any,
    ) {
      yield put({
        type: 'setClipboardData',
        payload: value,
      });
    },

    *undo(_: any, { put }: any) {
      yield put({
        type: 'setUndoData',
      });
    },

    *redo(_: any, { put }: any) {
      yield put({
        type: 'setRedoData',
      });
    },

    *setParams({ value }: { value: ComponentData.TParams[] }, { put }: any) {
      yield put({
        type: 'setData',
        payload: {
          config: {
            attr: {
              params: value,
            },
          },
        },
      });
    },
  },

  reducers: {
    setVersionData(state: any, action: any) {
      set(state, 'version', action.payload);
      return state;
    },

    setScreenTypeData(state: any, action: any) {
      set(state, 'screenType', action.payload);
      return state;
    },

    setClipboardData(state: any, action: any) {
      set(state, 'clipboard', action.payload);
      return state;
    },

    setData(state: any, action: any) {
      const screenData = get(state, 'screenData');
      set(
        state,
        'screenData',
        mergeWithoutArray({}, screenData, action.payload),
      );
      !action.init &&
        ScreenDataRequest(state, {
          type: 'screen',
          action: action.payload,
        });
      return state;
    },

    setUndoData(state: any, action: any) {
      const history = get(state, 'history.value');
      const newState = history.undo(state);
      ScreenDataRequest(newState, {
        type: 'undo',
      });
      return newState;
    },

    setRedoData(state: any, action: any) {
      const history = get(state, 'history.value');
      const newState = history.redo(state);
      ScreenDataRequest(newState, {
        type: 'redo',
      });
      return newState;
    },

    setGuideLineData(state: any, action: any) {
      set(
        state,
        'guideLine',
        mergeWithoutArray({}, state.guideLine, action.payload),
      );
      !action.init &&
        ScreenDataRequest(state, {
          type: 'guideLine',
          action: action.payload,
        });
      return state;
    },

    setDragData(state: any, action: any) {
      set(state, 'drag', merge({}, get(state, 'drag'), action.payload));
      return state;
    },

    setCallback(state: any, action: any) {
      set(state, 'screenData.config.attr.filter', action.payload);
      ScreenDataRequest(state, {
        type: 'callback',
        action: action.payload,
      });
      return state;
    },

    setSelectData(state: any, action: any) {
      state.select = [...action.payload];
      return state;
    },

    setScaleData(state: any, action: any) {
      set(state, 'scale', action.payload);
      return state;
    },

    setComponentData(state: any, action: any) {
      const {
        payload: { value, enqueue },
      } = action;
      const prevComponents = cloneDeep(get(state, 'components') || []);
      const history = get(state, 'history.value');

      // ! 先看看其他会不会有问题再说
      // const newState = (Array.isArray(value) ? value : [value]).reduce(
      //   (state, value) => {
      //     const newComponents = ComponentUtil.setComponent(state, {
      //       ...action,
      //       payload: value,
      //     });
      //     set(state, 'components', newComponents);

      //     return state;
      //   },
      //   {
      //     ...state,
      //   },
      // );

      const newComponents = ComponentUtil.setComponent(state, {
        ...action,
        payload: value,
      });
      set(state, 'components', newComponents);

      if (enqueue) {
        // * history enqueue
        return history.enqueue(state, state.components, prevComponents);
      }

      return state;
    },

    setComponentDataAll(state: any, action: any) {
      // * history enqueue
      const history = get(state, 'history.value');
      const components = cloneDeep(get(state, 'components') || []);
      let { value: newComponents, enqueue = true } = action.payload;

      newComponents =
        typeof newComponents === 'function'
          ? newComponents(components)
          : newComponents;

      // ! 使用这种方法强制刷新
      newComponents = arrayMove(newComponents, 0, 0);

      set(state, 'components', newComponents);

      if (!enqueue) return state;

      return history.enqueue(state, action.payload, components);
    },
  },
};
