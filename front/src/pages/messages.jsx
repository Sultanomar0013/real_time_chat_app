import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { FormModal } from "./modal";


const socket = io('http://localhost:3000');

function Messages() {
    const [modalShow, setModalShow] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [group, setGroup] = useState([]);

    useEffect(() => {
        socket.on('message', message => {
            setMessages(prevMessages => [...prevMessages, message]);
        });
        return () => {
            socket.off('message');
        };
    }, []);
    const sendMessage = () => {
        socket.emit('message', input);
        setInput('');
    };

    useEffect(() => {
        axios.get('http://localhost:3001/api/group')
            .then(response => {
                setGroup(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);


    return (
        <div>
            <div>
                <div>
                    <a href="#" onClick={() => setModalShow(true)}>Create Group</a>

                </div>
                <div>
                    <ul>
                        {group.map((item, index) => (
                            <li key={index}>{item.group_name}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <div>
                    {messages.map((msg, index) => (
                        <div key={index}>{msg}</div>
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


            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />

        </div>
    );
}

export default Messages;
