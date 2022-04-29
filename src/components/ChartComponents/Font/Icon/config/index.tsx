import { Component } from 'react';
import { Tabs } from 'antd';
import ComponentOptionConfig, {
  Tab,
} from '@/components/ChartComponents/Common/ComponentOptionConfig';
import ConfigList from '@/components/ChartComponents/Common/Structure/ConfigList';
import { CompatColorSelect } from '@/components/ColorSelect';
import BootstrapIconSelect from '@/components/ChartComponents/Common/BootstrapIconSelect';
import FullForm from '@/components/ChartComponents/Common/Structure/FullForm';
import { TIconConfig } from '../type';

const { TabPane } = Tabs;
const { Item } = ConfigList;

class Config extends Component<
  ComponentData.ComponentConfigProps<TIconConfig>
> {
  onKeyChange = (key: keyof TIconConfig, value: any) => {
    this.props.onChange({
      config: {
        options: {
          [key]: value,
        },
      },
    });
  };

  render() {
    const { value } = this.props;
    const {
      config: {
        options: { color, value: iconValue },
      },
    } = value;

    return (
      <ComponentOptionConfig>
        <TabPane key={'1'} tab={<Tab>基础样式</Tab>}>
          <ConfigList level={1}>
            <BootstrapIconSelect
              value={iconValue}
              onChange={this.onKeyChange.bind(this, 'value')}
            />
            <Item label="颜色">
              <FullForm>
                <CompatColorSelect
                  value={color}
                  onChange={this.onKeyChange.bind(this, 'color')}
                />
              </FullForm>
            </Item>
          </ConfigList>
        </TabPane>
      </ComponentOptionConfig>
    );
  }
}

export default Config;
