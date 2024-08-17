import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import FormsModal from './modal';


const socket = io('http://localhost:3000');

function Messages() {
    const [modalShow, setModalShow] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [group, setGroup] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [groupId, setGroupId] = useState('');
    const [showMessage, setShowMessage] = useState(false)
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    const sendMessage = (groupId) => {
        const messageData = {
            content: input,
            gtoupId: groupId,
            userId: userId
        }
        socket.emit('message', messageData);
        setInput('');
    }


    useEffect(() => {
        socket.on('message', (messageData) => {
            const { content, groupId, userId } = messageData;
            setMessages(prevMessages => [...prevMessages, message]);
        });
        return () => {
            socket.off('message');
        };
    }, []);


    useEffect(() => {
        fetch('http://localhost:3000/api/get_group', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setGroup(data.groups);
                    console.log(group);
                } else {
                    setError(data.message || 'Error fetching group data. Please try again.');
                }
            })
            .catch(error => {
                setError('Error fetching group data. Please try again.');
                console.error('Error fetching group data:', error);
            })
    }, []);


    const handleMessage = () => {
        setLoading(true);
        setError('');
        setGroupId(groupId);

        fetch('http://localhost:3000/api/showmessage?groupId=${groupId}', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ groupId })
        })
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setLoading(false);
                if (data.success) {
                    setMessage(data.messages);
                    setShowMessage(true);
                } else {
                    setError(data.message || 'Message Fetch failed. Please try again.');
                    console.error('Message Fetch error:', data);
                }
            })
            .catch(error => {
                setLoading(false);
                setError('Error during Message Fetch. Please try again.');
                console.error('Error during Message Fetch:', error);
            });
    };

    return (
        <div style={{ display: 'flex', width: '90%', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '30%', height: '40vh', }}>
                <div>
                    <a className="btn btn-info" href="#" onClick={() => setModalShow(true)}>Create Group</a>

                </div>
                <div>
                    <ul style={{ listStyleType: 'none' }}>
                        {group.map(group => (
                            <li key={group.id}
                                onClick={() => handleMessage(group.id)}>
                                <strong> {group.groupName} <br /></strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div style={{ width: '30%', height: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                <div style={{ display: 'flex' }}>
                    {showMessage ? (
                        <div>
                            <div>
                        {messages.map((msg, index) => (
                            <div key={index}>{msg.content}</div>
                                ))}

                            </div>
                                    <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={sendMessage}>Send</button>

                        </div>

                    ) : (
                        <h1>No Message Yet</h1>
                    )}


                </div>

            </div>



            <FormsModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />

        </div>
    );
}

export default Messages;
