import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

interface LoginPageProps {
  onLoginSuccess: () => void; // Function to handle successful login
}

const setCookie = (name: string, value: string, hours: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Convert hours to milliseconds
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/token/', values);
      
      // Save tokens to cookies
      setCookie('access_token', response.data.access, 1); // 1 hour expiration
      setCookie('refresh_token', response.data.refresh, 1); // 1 hour expiration
      
      message.success('Login successful');
      onLoginSuccess(); // Notify parent component about successful login
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login failed');
    }
    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className="w-96"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
