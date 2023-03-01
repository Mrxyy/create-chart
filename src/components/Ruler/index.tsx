import { createRef, Component } from 'react';
import ReactRuler, { RulerProps as BaseRulerProps } from '@scena/react-ruler';
import { observer } from 'mobx-react-lite';
import { useMobxContext } from '@/hooks';
import ColorSelect from '@/components/ColorSelect';
import ThemeUtil from '@/utils/Assist/Theme';

export type RulerProps = Partial<BaseRulerProps>;

const { getRgbaString } = ColorSelect;

type Props = RulerProps;
class Ruler extends Component<
  Props & {
    theme: ComponentData.TScreenTheme;
  }
> {
  rulerRef = createRef<any>();

  resize = () => {
    this.rulerRef.current?.resize();
  };

  componentDidUpdate = (prevProps: Props) => {
    if (
      this.props.height !== prevProps.height ||
      this.props.width !== prevProps.width
    ) {
      this.resize();
    }
  };

  componentDidMount = () => {
    window.addEventListener('resize', this.resize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.resize);
  };

  render() {
    return (
      <>
        <ReactRuler
          backgroundColor={getRgbaString(
            ThemeUtil.generateNextColor4CurrentTheme(0),
          )}
          lineColor={'rgb(255, 255, 255)'}
          textColor={'rgb(255, 255, 255)'}
          type="vertical"
          {...this.props}
          ref={this.rulerRef}
        />
      </>
    );
  }
}

export default observer((props: Props) => {
  const {
    global: {
      screenData: {
        config: {
          attr: { theme },
        },
      },
    },
  } = useMobxContext();

  return <Ruler {...props} theme={theme} />;
});
