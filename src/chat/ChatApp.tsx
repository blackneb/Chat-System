import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Input, Button, List, Tag, Typography } from 'antd';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

interface User {
  id: number;
  username: string;
  // Add more properties as needed
}

interface Message {
  id: number;
  sender: string;
  receiver: string;
  messageBody: string;
  sendAt: string;
  deletedAt?: string;
}

const ChatApp: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatUserProfile, setChatUserProfile] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('http://127.0.0.1:8000/auth/users/');
        if (response.status === 200) {
          setUsers(response.data);
          // Automatically select the first user when the user list is loaded
          if (response.data.length > 0) {
            setSelectedUser(response.data[0]);
          }
        } else {
          console.error('Error fetching users:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Get userProfile from localStorage
    const cachedUserProfile = localStorage.getItem('chatuserprofile');
    if (cachedUserProfile) {
      const parsedUserProfile: any = JSON.parse(cachedUserProfile);
      setChatUserProfile(parsedUserProfile);
    }
  }, []);

  useEffect(() => {
    if (chatUserProfile) {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/lobby/${chatUserProfile.user_id}/`);
      ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');
        // Store the WebSocket connection in the ref
        socket.current = ws;
      });
      ws.addEventListener('message', (event: any) => {
        console.log("received")
        console.log('WebSocket message received:', event.data);
        const receivedMessage: Message = JSON.parse(event.data);
        if (receivedMessage.messageBody !== "Connection established") {
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
        }
        socket.current = ws;
      });
      ws.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        // Clear the WebSocket connection from the ref
        socket.current = null;
      });
      return () => {
        // Clean up WebSocket connection on component unmount
        ws.close();
      };
    }
  }, [chatUserProfile]);

  useEffect(() => {
    // Scroll to the bottom of the list when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '' && chatUserProfile) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: chatUserProfile.username,
        receiver: selectedUser?.username || '',
        messageBody: inputValue.trim(),
        sendAt: new Date().toISOString(),
      };
      // Send the message via WebSocket
      socket.current?.send(JSON.stringify(newMessage));
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  return (
    <Layout>
      <Header className='text-white'>Chat App</Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            {loading ? (
              <Menu.Item key="loading">Loading...</Menu.Item>
            ) : (
              users.map((user) => (
                <Menu.Item key={user.id} onClick={() => setSelectedUser(user)}>
                  {user.username}
                </Menu.Item>
              ))
            )}
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div>
              <h2>Chat with {selectedUser?.username}</h2>
              <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <List
                  dataSource={messages}
                  renderItem={(item) => (
                    // Check if messageBody is not "Connection established"
                    item.messageBody !== "Connection established" && (
                      <List.Item className='w-full'>
                      {
                        item.sender === chatUserProfile.username ? (
                        <>
                          <div className='flex justify-start w-full'>
                            {item.sender && (
                              <Tag color="blue" className="rounded-full px-2 py-1 mr-2 uppercase">
                                {item.sender.charAt(0).toUpperCase()}
                              </Tag>
                            )}
                            <Tag>{item.messageBody}</Tag>
                            <Text type="secondary" style={{ fontSize: 'small' }}>{new Date(item.sendAt).toLocaleTimeString()}</Text>
                          </div>
                        </>
                        ):(
                        <>
                          <div className='flex justify-end w-full'>
                            <Text type="secondary" style={{ fontSize: 'small', paddingRight:"4px" }}>{new Date(item.sendAt).toLocaleTimeString()}</Text>
                            <Tag>{item.messageBody}</Tag>
                            {item.sender && (
                              <Tag color="blue" className="rounded-full px-2 py-1 mr-2 uppercase">
                                {item.sender.charAt(0).toUpperCase()}
                              </Tag>
                            )}
                          </div>
                        </>
                        )
                      }
                        
                      </List.Item>
                    )
                  )}
                />
                <div ref={messagesEndRef} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSendMessage}
                  style={{ marginTop: '20px', marginRight: '10px', flex: '1' }}
                />
                <Button type="primary" onClick={handleSendMessage} style={{ marginTop: '20px' }}>
                  Send
                </Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ChatApp;
