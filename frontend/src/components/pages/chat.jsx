import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useTheme } from '../../context/themeContext'; // Make sure path is correct

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      isAdmin
    }
  }
`;

const GET_MESSAGES = gql`
  query MessagesBetweenUsers($senderId: ID, $recipientId: ID!) {
    messagesBetweenUsers(senderId: $senderId, recipientId: $recipientId) {
      _id
      sender {
        _id
        name
      }
      recipient {
        _id
        name
      }
      text
      timestamp
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateMessage($senderId: ID!, $recipientId: ID!, $text: String!) {
    createMessage(senderId: $senderId, recipientId: $recipientId, text: $text) {
      _id
      sender {
        _id
        name
      }
      recipient {
        _id
        name
      }
      text
      timestamp
    }
  }
`;

const ChatPage = ({ username, isAdmin }) => {
  const { theme } = useTheme(); // Get current theme
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const chatMessagesRef = useRef(null);

  const { data: studentsData, loading: studentsLoading } = useQuery(GET_STUDENTS);
  const [fetchMessages, { data: messagesData }] = useLazyQuery(GET_MESSAGES);
  const [sendMessageMutation] = useMutation(CREATE_MESSAGE);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Initialize current user and students list
  useEffect(() => {
    if (studentsData && studentsData.students) {
      const allStudents = studentsData.students;
      const user = allStudents.find(s => s.name === username);
      setCurrentUser(user);

      // Filter students based on admin status
      let filteredStudents;
      if (user.isAdmin) {
        filteredStudents = allStudents.filter(s => s._id !== user._id);
      } else {
        filteredStudents = allStudents.filter(s => s.isAdmin && s._id !== user._id);
      }
      
      setStudents(filteredStudents);

      if (filteredStudents.length > 0) {
        setCurrentChatUser(filteredStudents[0]);
      }
    }
  }, [studentsData, username, isAdmin]);

  // Fetch messages when current chat user changes
  useEffect(() => {
    if (currentUser && currentChatUser) {
      fetchMessages({
        variables: {
          senderId: currentUser._id,
          recipientId: currentChatUser._id,
        },
      });
    }
  }, [currentUser, currentChatUser, fetchMessages]);

  // Update messages when new data arrives
  useEffect(() => {
    if (messagesData && messagesData.messagesBetweenUsers) {
      setMessages(messagesData.messagesBetweenUsers);
    }
  }, [messagesData]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !currentChatUser) return;

    try {
      const { data } = await sendMessageMutation({
        variables: {
          senderId: currentUser._id,
          recipientId: currentChatUser._id,
          text: messageText.trim(),
        },
      });

      if (data && data.createMessage) {
        setMessages(prevMessages => [...prevMessages, data.createMessage]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatUserClick = (student) => {
    setCurrentChatUser(student);
  };

  const formatTimestamp = (timestamp) => {
    try {
      const numericTimestamp = Number(timestamp);
  
      if (isNaN(numericTimestamp)) throw new Error("Timestamp is not a number");
  
      const date = new Date(numericTimestamp);
  
      return {
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString(),
      };
    } catch (error) {
      console.error('Error formatting timestamp:', error, 'Original timestamp:', timestamp);
      return {
        time: '--:--',
        date: '--/--/----',
      };
    }
  };

  if (studentsLoading) return (
    <div className={`p-10 ${theme === 'dark' ? 'bg-background-dark text-text-dark' : 'bg-background-light text-text-light'}`}>
      Loading students...
    </div>
  );

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 h-[95vh] ${
      theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'
    }`}>
      {/* Student list */}
      <div className={`student-list p-4 overflow-y-auto ${
        theme === 'dark' ? 'bg-card-dark' : 'bg-card-light'
      }`}>
        <ul id="students" className="list-none p-0 m-0">
          {students.length === 0 ? (
            <li className={`text-center py-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {isAdmin ? "No students available" : "No admin available"}
            </li>
          ) : (
            students.map(student => (
              <li
                key={student._id}
                className={`student py-2 px-4 text-center text-sm rounded-lg cursor-pointer mb-2 transition-all duration-300 ease-in-out ${
                  currentChatUser && currentChatUser._id === student._id 
                    ? (theme === 'dark' ? 'bg-primary-dark' : 'bg-primary-light') 
                    : (theme === 'dark' ? 'bg-[#484849] hover:bg-primary-dark' : 'bg-gray-200 hover:bg-primary-light')
                } hover:scale-105 ${
                  theme === 'dark' ? 'text-text-dark' : 'text-text-light'
                }`}
                onClick={() => handleChatUserClick(student)}
              >
                {student.name}
                {student.isAdmin && " (Admin)"}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Chat area */}
      <div className={`chat-area max-h-[600px] m-5 col-span-3 p-4 rounded-lg shadow-md flex flex-col ${
        theme === 'dark' ? 'bg-card-dark' : 'bg-background-light'
      }`}>
        <h2 className={`text-lg font-bold mb-2 ${
          theme === 'dark' ? 'text-text-dark' : 'text-text-light'
        }`}>
          {currentChatUser ? `Chatting with ${currentChatUser.name}${currentChatUser.isAdmin ? " (Admin)" : ""}` : 'Select a user'}
        </h2>

        {/* Chat messages */}
        <div
          className={`flex-1 overflow-y-auto rounded-lg p-4 mb-4 flex flex-col gap-2 ${
            theme === 'dark' ? 'bg-[#484849]' : 'bg-gray-100'
          }`}
          id="chat-messages"
          ref={chatMessagesRef}
        >
          {messages.length === 0 ? (
            <div className={`text-center ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentChatUser ? "No messages yet" : "Select a user to start chatting"}
            </div>
          ) : (
            messages.map((message) => {
              const isSentByCurrentUser = message.sender._id === currentUser._id;
              const { time, date } = formatTimestamp(message.timestamp);

              return (
                <div
                  key={message._id}
                  className={`message p-2 rounded-lg max-w-[70vw] break-words text-sm ${
                    isSentByCurrentUser
                      ? (theme === 'dark' ? 'bg-[#0d723a] text-white' : 'bg-green-600 text-white') + ' self-end'
                      : (theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-800') + ' self-start'
                  }`}
                >
                  <div className="font-semibold">{message.sender.name}</div>
                  <div>{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    isSentByCurrentUser 
                      ? 'text-gray-200' 
                      : (theme === 'dark' ? 'text-gray-300' : 'text-gray-600')
                  }`}>
                    {date} • {time}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message input */}
        <div className="message-input flex gap-4 mt-4">
          <input
            id="message-box"
            type="text"
            placeholder={currentChatUser ? "Type your message" : "Select a user to chat"}
            className={`flex-1 p-2 rounded-md border text-sm ${
              theme === 'dark' 
                ? 'bg-[#313131] border-gray-600 text-text-dark' 
                : 'bg-white border-gray-300 text-text-light'
            }`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={!currentChatUser}
          />
          <button
            onClick={handleSendMessage}
            className={`py-2 px-4 rounded-md text-sm transition-all duration-300 ease-in-out transform hover:scale-105 disabled:cursor-not-allowed ${
              theme === 'dark' 
                ? 'bg-primary-dark hover:bg-blue-700 text-white disabled:bg-gray-600' 
                : 'bg-primary-light hover:bg-blue-600 text-white disabled:bg-gray-400'
            }`}
            disabled={!currentChatUser || !messageText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;