import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [showSignIn, setShowSignIn] = useState(false);

    const handleSignIn = () => {
        fetch('/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, userName, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Sign-in successful:', data);
                setShowSignIn(false);
            } else {
                console.error('Sign-in error:', data);
            }
        })
        .catch(error => {
            console.error('Error during sign-in:', error);
        });
    };

    const handleLogin = () => {
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login successful:', data);
            } else {
                console.error('Login error:', data);
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
        });
    };

    return (
        <div>
            {showSignIn ? (
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <div>
                        <label>Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>User Name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button onClick={handleSignIn}>Sign In</button>
                    <a href="#" onClick={() => setShowSignIn(false)}>Log In</a>
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <div>
                        <label>Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button onClick={handleLogin}>Log In</button>
                    <a href="#" onClick={() => setShowSignIn(true)}>Sign In</a>
                </div>
            )}
        </div>
    );
}

export default Home;
