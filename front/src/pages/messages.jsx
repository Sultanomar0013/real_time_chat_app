import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { FormModal } from "./modal";


const socket = io('http://localhost:3000');

function Messages() {
    const [modalShow, setModalShow] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

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

    return (
        <div>
            <div>
                <div>
                    <a href="#" onClick={() => setModalShow(true)}>Create Group</a>

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
