import { useCallback, ReactNode, useMemo, useRef } from 'react';
import classnames from 'classnames';
import { useSize } from 'ahooks';
import { useMobxContext } from '@/hooks';
import { BackgroundConfigRender } from '@/components/DesignerBackground';
import { mergeWithoutArray } from '@/utils/tool';
import ClipboardComponent from '../Clipboard';
import AbsorbGuideLine from './components/AbsorbGuideLine';
import Ruler from './components/Ruler';
import GuideLineButton from './components/GuideLineButton';
import { wrapperId, subWrapperId } from './constants';
import styles from './index.less';

const RIGHT_BOTTOM_PADDING = 200;

const PanelWrapper = (props: { children: ReactNode }) => {
  const { children } = props;

  const {
    global: {
      setGuideLine,
      setSelect,
      guideLine: { value: guideLineList = [], show: guideLineShow },
      scale: originScale,
      screenData: {
        config: {
          style: { width, height },
          flag: { type: flag },
        },
      },
    },
  } = useMobxContext();

  // const [size, setSize] = useState({ width: 0, height: 0 });

  const clickPosition = useRef<number>(0);
  const panelRef = useRef(null);

  const { width: panelWidth, height: panelHeight } = useSize(panelRef) || {
    width: 0,
    height: 0,
  };

  const scale = useMemo(() => {
    return originScale / 100;
  }, [originScale]);

  const onMouseMove = () => {
    clickPosition.current++;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (clickPosition.current < 2) {
      setSelect([]);
    }
  };

  const onMouseDown = (e: any) => {
    if (e.target.id !== subWrapperId) return;
    clickPosition.current = 0;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const wrapperSetGuideLine = useCallback(
    (value: Partial<ComponentData.TGuideLineConfig>) => {
      const newValue = mergeWithoutArray(
        {},
        {
          show: guideLineShow,
          value: guideLineList,
        },
        value,
      ) as ComponentData.TGuideLineConfig;

      setGuideLine?.(newValue);
    },
    [setGuideLine, guideLineList, guideLineShow],
  );

  const size = useMemo(() => {
    let pw = width * scale + RIGHT_BOTTOM_PADDING;
    let ph = height * scale + RIGHT_BOTTOM_PADDING;
    const newWidth = Math.max(panelWidth, pw);
    const newHeight = Math.max(panelHeight, ph);
    return {
      width: newWidth,
      height: newHeight,
    };
  }, [panelWidth, panelHeight]);

  // const resize = () => {
  //   const dom = document.querySelector(`#${wrapperId}`);
  //   if (!dom) return;
  //   let dw = dom.clientWidth;
  //   let dh = dom.clientHeight;
  //   let pw = width * scale + RIGHT_BOTTOM_PADDING;
  //   let ph = height * scale + RIGHT_BOTTOM_PADDING;
  //   const newWidth = Math.max(dw, pw);
  //   const newHeight = Math.max(dh, ph);
  //   setSize({ width: newWidth, height: newHeight });
  // };

  // useEventListener('resize', resize, {
  //   target: () => document.querySelector(`#${wrapperId}`),
  // });

  // useEffect(() => {
  //   resize();
  // }, [flag, height, scale]);

  return (
    <div
      className={classnames(
        styles['designer-page-main'],
        'box-sizing-border',
        'pos-re',
      )}
    >
      {/* background */}
      <BackgroundConfigRender />
      <div id={wrapperId} ref={panelRef} className="w-100 h-100 pos-re">
        <div
          id={subWrapperId}
          className={classnames(styles['designer-page-main-sub'], 'pos-re')}
          style={{
            width: width * scale,
            height: height * scale,
          }}
          onMouseDown={onMouseDown}
        >
          <Ruler
            size={size}
            wrapperSetGuideLine={wrapperSetGuideLine}
            scale={scale}
            width={width}
            height={height}
          />
          <GuideLineButton
            onClick={wrapperSetGuideLine.bind(null, { show: !guideLineShow })}
            show={!!guideLineShow}
            setGuideLine={setGuideLine}
          />

          {/* <AbsorbGuideLine size={size} /> */}
          <ClipboardComponent>{children}</ClipboardComponent>
        </div>
      </div>
    </div>
  );
};

export default PanelWrapper;
