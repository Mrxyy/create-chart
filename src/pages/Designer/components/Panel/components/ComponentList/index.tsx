import { connect } from 'dva';
import RenderComponent from '@/components/RenderComponent';
import { mapStateToProps, mapDispatchToProps } from './connect';

const ComponentList = (props: {
  components?: ComponentData.TComponentData[];
}) => {
  const { components = [] } = props;

  return (
    <>
      {components.map((item, index) => {
        return <RenderComponent value={item} key={item.id} index={index} />;
      })}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentList);