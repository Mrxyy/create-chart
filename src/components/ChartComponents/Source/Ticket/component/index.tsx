import { useMemo, useRef } from 'react';
import { uniqueId, merge } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useMobxContext } from '@/hooks';
import ColorSelect from '@/components/ColorSelect';
import { useComponentSize } from '@/components/ChartComponents/Common/Component/hook';
import { TTicketConfig } from '../type';
import { CHART_ID } from '../id';
import styles from './index.less';

const { getRgbaString } = ColorSelect;

const Ticket = observer(
  (props: ComponentData.CommonComponentProps<TTicketConfig>) => {
    const {
      className,
      style,
      value,
      children,
      global,
      wrapper: Wrapper,
    } = props;

    const {
      global: {
        screenData: {
          config: {
            attr: {
              componentBorder: { width: borderWidth, padding },
            },
          },
        },
      },
    } = useMobxContext();

    const {
      config: {
        options,
        style: { border, width, height },
      },
    } = value;
    const {
      dashed: { show, color },
      length,
      radius,
      shadow,
      color: backgroundColor,
    } = options;
    const realBackgroundColor = getRgbaString(backgroundColor);

    const chartId = useRef<string>(uniqueId(CHART_ID));

    const { width: componentWidth, height: componentHeight } = useComponentSize(
      `.${chartId.current}`,
      { width, height },
      [width, height, borderWidth, padding],
    );

    const componentClassName = useMemo(() => {
      return classnames(
        className,
        'dis-flex',
        styles['component-source-ticket'],
      );
    }, [className]);

    return (
      <div
        className={componentClassName}
        style={merge(
          {
            width: '100%',
            height: '100%',
          },
          style,
        )}
        id={chartId.current}
      >
        <Wrapper border={border}>
          {children}
          <div
            className={classnames(
              'w-100 h-100',
              styles['component-source-ticket-main'],
              {
                [styles['component-source-ticket-main-with-line']]: show,
              },
              chartId.current,
            )}
            style={{
              // @ts-ignore
              '--component-source-ticket-line-size':
                componentHeight - radius * 2 + 'px',
              '--component-source-ticket-line-color': getRgbaString(color),
              '--component-source-ticket-line-left': length + 'px',
              ...(shadow.show
                ? {
                    filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,.2))',
                  }
                : {}),
              background: `radial-gradient(circle at right top, transparent ${radius}px, ${realBackgroundColor} 0) top left / ${length}px 51% no-repeat,
            radial-gradient(circle at right bottom, transparent ${radius}px, ${realBackgroundColor} 0) bottom left /${length}px 51% no-repeat,
            radial-gradient(circle at left top, transparent ${radius}px, ${realBackgroundColor} 0) top right /${
                componentWidth - length
              }px 51% no-repeat,
            radial-gradient(circle at left bottom, transparent ${radius}px, ${realBackgroundColor} 0) bottom right /${
                componentWidth - length
              }px 51% no-repeat`,
            }}
          ></div>
        </Wrapper>
      </div>
    );
  },
);

const WrapperTicket: typeof Ticket & {
  id: ComponentData.TComponentSelfType;
} = Ticket as any;

WrapperTicket.id = CHART_ID;

export default WrapperTicket;
