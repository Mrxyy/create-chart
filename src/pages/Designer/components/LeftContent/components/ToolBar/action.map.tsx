import { useCallback, useRef } from 'react';
import {
  RedoOutlined,
  UndoOutlined,
  BorderInnerOutlined,
  BarsOutlined,
  BlockOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
} from '@ant-design/icons';
import classnames from 'classnames';
import { connect } from 'dva';
import CallbackManage, { CallbackManageRef } from '../CallbackManage';
import LayerManage, { LayerManageRef } from '../LayerManage';
import { mapStateToProps, mapDispatchToProps } from './connect';
import styles from './index.less';

const commonClass: string = classnames(
  'ac-i-size-m',
  styles['design-left-tool-icon'],
);

// 重做
export const RedoIcon = () => {
  return <RedoOutlined className={classnames(commonClass)} />;
};

// 撤销
export const UndoIcon = () => {
  return <UndoOutlined className={classnames(commonClass)} />;
};

// 图层显示隐藏
export const LayerShowIcon = () => {
  const layerRef = useRef<LayerManageRef>(null);

  const handleOpen = useCallback(() => {
    layerRef.current?.open();
  }, []);

  return (
    <>
      <BlockOutlined className={classnames(commonClass)} onClick={handleOpen} />
      <LayerManage ref={layerRef} />
    </>
  );
};

// 图层折叠展开
export const LayerCollapseIcon = () => {
  // <ArrowsAltOutlined />
  return <ShrinkOutlined className={classnames(commonClass)} />;
};

// 辅助线显示隐藏
const InternalGuideLineIcon = (props: {
  guideLineShow?: boolean;
  setGuideLine?: (value: Partial<ComponentData.TGuideLineConfig>) => void;
}) => {
  const { guideLineShow, setGuideLine } = props;
  return (
    <BorderInnerOutlined
      className={classnames(commonClass)}
      onClick={setGuideLine?.bind(null, {
        show: !guideLineShow,
      })}
    />
  );
};
export const GuideLineIcon = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InternalGuideLineIcon);

// 回调管理
export const CallbackIcon = () => {
  const callbackRef = useRef<CallbackManageRef>(null);

  const handleOpen = useCallback(() => {
    callbackRef.current?.open();
  }, []);

  return (
    <>
      <BarsOutlined className={classnames(commonClass)} onClick={handleOpen} />
      <CallbackManage ref={callbackRef} />
    </>
  );
};