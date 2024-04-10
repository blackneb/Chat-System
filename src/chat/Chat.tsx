import React, { useState, useEffect } from 'react';
import { Descriptions } from 'antd';
import axios from 'axios'; // Import axios

const Chat: React.FC = () => {
  interface UserProfile {
    user_id: number;
    username: string;
    email: string;
    location: string;
    phone_number: string;
    user_type: string;
  }

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = getCookie('access_token');

      if (!accessToken) {
        console.error('Access token not found in cookies');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<UserProfile>('http://127.0.0.1:8000/auth/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (response.status === 200) {
          setUserProfile(response.data);
        } else {
          console.error('Error fetching profile:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getCookie = (name: any) => {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : null;
  };

  return (
    <div>
      <h1>Chat System</h1>
      {loading ? (
        <p>Loading...</p>
      ) : userProfile ? (
        <Descriptions title="User Profile">
          <Descriptions.Item label="Username">{userProfile.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
          <Descriptions.Item label="Location">{userProfile.location}</Descriptions.Item>
          <Descriptions.Item label="Phone Number">{userProfile.phone_number}</Descriptions.Item>
          <Descriptions.Item label="User Type">{userProfile.user_type}</Descriptions.Item>
          {/* Add more fields as needed */}
        </Descriptions>
      ) : (
        <p>No profile found</p>
      )}
    </div>
  );
};

export default Chat;
