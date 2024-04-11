import React, { useState, useEffect } from 'react';
import { ChatFeed, Message } from 'react-chat-ui';
import { Input } from 'antd';

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'User 1', text: 'Hello!' },
    { id: 2, sender: 'User 2', text: 'Hi there!' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'You', text: newMessage }]);
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000); // Simulate typing for 1 second
  };

  return (
    <div className="chat-app">
      <ChatFeed
        messages={messages}
        isTyping={isTyping}
        showSenderName
        bubblesCentered={false}
        onKeyPress={handleTyping}
      />
      <CustomInput
        message={newMessage}
        onMessageChange={(text:any) => setNewMessage(text)} // Update state in ChatApp
        onTyping={handleTyping}
        onSubmit={sendMessage}
      />
    </div>
  );
};

const CustomInput = (props:any) => {
  return (
    <Input.TextArea
      placeholder="Type a message..."
      value={props.message}
      onChange={(e) => props.onMessageChange(e.target.value)}
      onPressEnter={props.onSubmit}
      onKeyDown={props.onTyping} // Trigger typing indicator on key press
      autoSize={{ minRows: 1, maxRows: 5 }} // Optional: Allow multi-line input
    />
  );
};

export default ChatApp;
