import { mergeWithoutArray } from '@/utils';
import {
  BASIC_DEFAULT_CONFIG,
  BASIC_DEFAULT_DATA_CONFIG,
  BASIC_DEFAULT_INTERACTIVE_CONFIG,
  DEFAULT_LINKAGE_CONFIG,
} from '@/utils/constants/defaultComponentConfig';
import ThemeUtil from '@/utils/Assist/Theme';
import { TIconConfig } from './type';

export default () => {
  const CUSTOM_CONFIG: ComponentData.TInternalComponentConfig<TIconConfig> = {
    interactive: {
      base: [],
      linkage: [
        {
          ...DEFAULT_LINKAGE_CONFIG,
          type: 'click',
          name: '点击',
        },
      ],
    },
    data: {
      request: {
        valueType: 'object',
      },
      filter: {
        map: [],
      },
      disabled: true,
    },
    options: {
      color: ThemeUtil.generateNextColor4CurrentTheme(0),
      value: 'bi-emoji-kiss',
    },
  };

  const DefaultConfig: ComponentData.TComponentData<TIconConfig> =
    mergeWithoutArray(
      {},
      {
        data: BASIC_DEFAULT_DATA_CONFIG,
        interactive: BASIC_DEFAULT_INTERACTIVE_CONFIG,
      },
      BASIC_DEFAULT_CONFIG,
      {
        style: {
          width: 48,
          height: 48,
        },
      },
      CUSTOM_CONFIG,
    );
  return DefaultConfig;
};

export const themeConfig = {
  convert: (colorList: string[]) => {
    return {
      color: ThemeUtil.generateNextColor4CurrentTheme(0),
    };
  },
};
