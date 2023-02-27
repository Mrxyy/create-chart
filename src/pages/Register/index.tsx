import { useCallback, useMemo, useState } from 'react';
import { Button, message } from 'antd';
import { mobxStore } from '@/hooks';
import { Mobile, Email, Password, Captcha } from '../Login';
import CommonBackground from '../Login/components/Background';

const Register = () => {
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [captcha, setCaptcha] = useState<string>('');
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);

  const handleRegister = useCallback(async () => {
    if (fetchLoading) return;
    const realMobile = mobile.trim();
    const realEmail = email.trim();
    const realCaptcha = captcha.trim();
    if (!realMobile) {
      return message.info('请输入手机号');
    }
    if (!password) {
      return message.info('请输入密码');
    }
    if (!realEmail) {
      return message.info('请输入邮箱');
    }
    if (!realCaptcha) {
      return message.info('请输入验证码');
    }

    setFetchLoading(true);
    try {
      await mobxStore.user.register({
        mobile: realMobile,
        password,
        captcha: realCaptcha,
        email: realEmail,
      });
    } catch (err) {
      message.info('提交错误');
    } finally {
      setFetchLoading(false);
    }
  }, [mobile, password, captcha, email]);

  const action = useMemo(() => {
    return (
      <Button
        style={{ marginTop: 4 }}
        loading={fetchLoading}
        type="primary"
        block
        onClick={handleRegister}
      >
        注册
      </Button>
    );
  }, [handleRegister]);

  return (
    <CommonBackground title="注册" action={action} onSubmit={handleRegister}>
      <Mobile value={mobile} onChange={setMobile} />
      <Password value={password} onChange={setPassword} />
      <Email value={email} onChange={setEmail} />
      <Captcha
        email={email}
        value={captcha}
        onChange={setCaptcha}
        status="register"
      />
    </CommonBackground>
  );
};

export default Register;
