import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import FormsModal from './modal';


const socket = io('http://localhost:3000');

function Messages() {
    const [modalShow, setModalShow] = useState(false);
    const [messages, setMessages] = useState([]);
    const [oldMessage, setOldMessage] = useState([]);
    const [input, setInput] = useState('');
    const [group, setGroup] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [showMessage, setShowMessage] = useState(false)
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    const sendMessage = () => {
        if (!input.trim()) return;
        if (!selectedGroupId) return;

        console.log('second',selectedGroupId);
        const messageData = {
            content: input,
            groupId: selectedGroupId,
            userId: userId
        }

        socket.emit('message', messageData);
        setMessages(prevMessages => [...prevMessages, messageData]);
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
    }, [token]);


    const handleMessage = (groupId) => {
        setLoading(true);
        setError('');
        setSelectedGroupId(groupId);

        console.log('hello',selectedGroupId);

        fetch(`http://localhost:3000/api/showmessage?groupId=${groupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
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
                    setOldMessage(data.messages);
                    console.log(oldMessage);
                    if(selectedGroupId>0){
                        setShowMessage(true);
                    }

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
                <div style={{ display: '' }}>
                    {showMessage ? (
                        <div >
                            <div style={{ display:'flex',
                            flexDirection: 'column',}}>

                                {oldMessage.map((msg, index) => (
                                    <div key={index}
                                        style={{
                                        float: msg.user_id === userId ? 'right' : '',
                                        backgroundColor: msg.user_id === userId ? '#d1ffd1' : '#f1f1f1',
                                        paddingRight: msg.user_id === userId ? '15px' : '0px',
                                        paddingLeft:msg.user_id === userId ? '0px' : '15px',
                                    }}>
                                        <p  style={{textAlign:msg.user_id === userId ? 'right' : '',
                                        marginTop:'0',
                                        marginBottom:'0',
                                        }}>{msg.content}</p>
                                    </div>  // Display the content of each message
                                ))}

                                {messages.map((msg, index) => (
                                    <div key={index}
                                    style={{
                                    float: msg.userId === userId ? 'right' : '',
                                    backgroundColor: msg.userId === userId ? '#d1ffd1' : '#f1f1f1',
                                    paddingRight: msg.userId === userId ? '15px' : '0px',
                                    paddingLeft:msg.userId === userId ? '0px' : '15px',
                                }}>
                                    <p  style={{textAlign:msg.userId === userId ? 'right' : '',
                                    marginTop:'0',
                                    marginBottom:'0',
                                    }}>{msg.content}</p>
                                    </div>
                                ))}

                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button onClick={sendMessage}>Send</button>
                            </div>
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
