import { useEffect, ReactNode, useState, useMemo, useCallback } from 'react';
import { Empty, Layout as AntLayout, Menu, Breadcrumb } from 'antd';
import classnames from 'classnames';
import isMobileJudge from 'is-mobile';
import { history } from 'umi';
import Loading from '@/components/PageLoading';
import IntroductionButton from '@/components/IntroductionButton';
import PromptChrome from '@/components/PromptChrome';
import { dispatchLogin } from '@/utils/request';
import Avatar from './components/Avatar';
import { useMobxContext, MobxContext, mobxStore } from '../hooks';
import styles from './index.less';

const { Header, Content, Footer } = AntLayout;

const PATH_MAP: any = {
  '/model': 'model',
  '/screen': 'screen',
};

const LoginWrapper = (props: { children: ReactNode; location: any }) => {
  const {
    children,
    location: { pathname },
  } = props;

  const {
    user: { getUserInfo },
  } = useMobxContext();

  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  const fetchUserInfo = async () => {
    setFetchLoading(true);
    try {
      await getUserInfo();
    } catch (err) {
      dispatchLogin(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [pathname]);

  if (fetchLoading) return <Loading />;

  return (
    <>
      {children}
      <IntroductionButton />
    </>
  );
};

// 外部layout
const Layout = (props: { children?: ReactNode; pathname: string }) => {
  const { pathname } = props;

  const [activeKey, setActiveKey] = useState<string>(() => {
    return PATH_MAP[pathname] || 'screen';
  });

  const handleClick = useCallback(
    ({ key }) => {
      setActiveKey(key);
      let path = '';
      if (activeKey === key) return;
      switch (key) {
        case 'model':
          path = '/model';
          break;
        case 'screen':
          path = '/screen';
          break;
      }
      history.push(path);
    },
    [activeKey],
  );

  return (
    <AntLayout className={styles['screen-page']}>
      <Header>
        <div className={styles['screen-page-logo']} />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeKey]}
          onClick={handleClick}
          items={[
            {
              label: '大屏',
              key: 'screen',
            },
            {
              label: '模板',
              key: 'model',
            },
          ]}
        />
        <div className={styles['screen-page-avatar']}>
          <Avatar />
        </div>
      </Header>
      <Content
        className={styles['screen-page-content']}
        style={{ padding: '0 50px' }}
      >
        <Breadcrumb style={{ margin: '16px 0', visibility: 'hidden' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
        </Breadcrumb>
        <div
          className={classnames(
            styles['screen-page-content-main'],
            'border-r-16',
          )}
        >
          {props.children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Daniel Screen ©2022</Footer>
    </AntLayout>
  );
};

const GlobalLayout = (props: any) => {
  const {
    children,
    location: { pathname, search },
  } = props;

  const isMobile = useMemo(() => {
    return isMobileJudge();
  }, [pathname]);

  if (
    isMobile &&
    !['/', '/model-preview', '/preview', '/share'].includes(pathname)
  )
    return (
      <Empty
        description="请在电脑端使用"
        style={{
          position: 'relative',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    );

  // 分享页不用管登录
  if (['/share', '/', 'viewer', '/preview'].includes(pathname)) return children;
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forget')
  ) {
    return (
      <>
        {children}
        <IntroductionButton />
      </>
    );
  }

  if (['/screen', '/model'].includes(pathname)) {
    return (
      <LoginWrapper {...props}>
        <Layout pathname={pathname}>{children}</Layout>
      </LoginWrapper>
    );
  }

  // 设计器无id情况下返回列表
  if (pathname.includes('designer') && !search.includes('id')) {
    const path = pathname.includes('model') ? 'model' : 'screen';
    history.replace(path);
    return <div></div>;
  }

  return <LoginWrapper {...props} />;
};

// 设置document title
const DocumentTitleSetWrapper = (props: any) => {
  const { screenName, ...nextProps } = props;
  const { pathname } = nextProps.location || {};

  const reload = () => {
    let title = '大屏设计器';
    if (pathname.startsWith('/login')) {
      title = '登录';
    } else if (pathname.startsWith('/register')) {
      title = '注册';
    } else if (pathname.startsWith('/forget')) {
      title = '忘记密码';
    } else if (
      pathname.startsWith('/model-preview') ||
      pathname.startsWith('/model-designer') ||
      pathname.startsWith('/preview') ||
      pathname.startsWith('/share') ||
      pathname.startsWith('/designer')
    ) {
      title = screenName;
    } else if (pathname.startsWith('/model')) {
      title = '大屏模板';
    } else if (pathname === '/screen') {
      title = '大屏列表';
    }
    document.title = title;
  };

  const dom = useMemo(() => {
    return <GlobalLayout {...nextProps} />;
  }, [nextProps]);

  useEffect(() => {
    reload();
  }, [screenName, pathname]);

  return dom;
};

// 环境判断
const EnvironmentPrompt = (props: any) => {
  const {
    global: {
      screenData: { name },
    },
  } = useMobxContext();

  return (
    <PromptChrome>
      <DocumentTitleSetWrapper {...props} screenName={name} />
    </PromptChrome>
  );
};

// 最外层的mobx包裹层
const MobxWrapper = (props: any) => {
  return (
    <MobxContext.Provider value={mobxStore}>
      <EnvironmentPrompt {...props} />
    </MobxContext.Provider>
  );
};

export default MobxWrapper;
