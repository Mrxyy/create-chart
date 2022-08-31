import { Component } from 'react';
import { Tabs, Select, Switch } from 'antd';
import ComponentOptionConfig, {
  Tab,
} from '@/components/ChartComponents/Common/ComponentOptionConfig';
import InputNumber from '@/components/ChartComponents/Common/InputNumber';
import ConfigList from '@/components/ChartComponents/Common/Structure/ConfigList';
import FullForm from '@/components/ChartComponents/Common/Structure/FullForm';
import ParamsSelect from '@/components/ParamsSelect';
import { PostMessageTooltip } from '../component/MessageTooltip';
import { TIFrameConfig } from '../type';

const { TabPane } = Tabs;
const { Item } = ConfigList;

class Config extends Component<
  ComponentData.ComponentConfigProps<TIFrameConfig>
> {
  onKeyChange = (key: keyof TIFrameConfig, value: any) => {
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
        options: { scale, scrolling, pointEvent, relationParams },
      },
    } = value;

    return (
      <ComponentOptionConfig>
        <TabPane key={'1'} tab={<Tab>全局配置</Tab>}>
          <ConfigList level={1}>
            <Item label="点击事件">
              <FullForm>
                <Switch
                  checked={pointEvent}
                  onChange={this.onKeyChange.bind(this, 'pointEvent')}
                />
              </FullForm>
            </Item>
            <Item label="关联参数" placeholder={<PostMessageTooltip />}>
              <FullForm>
                <ParamsSelect
                  value={relationParams}
                  onChange={this.onKeyChange.bind(this, 'relationParams')}
                />
              </FullForm>
            </Item>
            <Item label="滚动条">
              <FullForm>
                <Select
                  className="w-100"
                  value={scrolling}
                  onChange={this.onKeyChange.bind(this, 'scrolling')}
                />
              </FullForm>
            </Item>
            <Item label="放大">
              <FullForm>
                <InputNumber
                  value={scale}
                  onChange={this.onKeyChange.bind(this, 'scale')}
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
