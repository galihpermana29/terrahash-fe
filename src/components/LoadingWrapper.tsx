import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const LoadingHandler = ({
  children,
  isLoading,
  fullscreen,
  classname,
  loadingComponent,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  classname?: string;
  fullscreen?: boolean;
  loadingComponent?: React.ReactNode;
}) => {
  if (isLoading) {
    return loadingComponent !== undefined ? (
      loadingComponent
    ) : (
      <div className={`flex items-center justify-center w-full ${classname}`}>
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 24, color: '#F76A8B' }} spin />
          }
          fullscreen={fullscreen}
        />
      </div>
    );
  }
  return children;
};

export default LoadingHandler;
