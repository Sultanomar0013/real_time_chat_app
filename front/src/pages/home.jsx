import React, { useEffect,useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';



const socket = io('http://localhost:3000');

function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [showSignUp, setShowSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();





    const handleSignUp = () => {
        setLoading(true);
        setError('');

        fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, userName, password })
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
                console.log('Sign-up successful:', data);
                setShowSignUp(false);
            } else {
                setError(data.message || 'Sign-up failed. Please try again.');
                console.error('Sign-up error:', data);
            }
        })
        .catch(error => {
            setLoading(false);
            setError('Error during sign-up. Please try again.');
            console.error('Error during sign-up:', error);
        });
    };









    const handleLogin = () => {
        setLoading(true);
        setError('');

        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
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
                console.log('Login successful:', data);
                localStorage.setItem('token', data.token);
                navigate('/messages');
            } else {
                setError(data.message || 'Login failed. Please try again.');
                console.error('Login error:', data);
            }
        })
        .catch(error => {
            setLoading(false);
            setError('Error during login. Please try again.');
            console.error('Error during login:', error);
        });
    };



    return (
        <div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {showSignUp ? (
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <div>
                        <label>Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>User Name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button onClick={handleSignUp} disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <a href="#" onClick={() => setShowSignUp(false)}>Log In</a>
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
                    <button onClick={handleLogin} disabled={loading}>
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                    <a href="#" onClick={() => setShowSignUp(true)}>Sign Up</a>
                </div>
            )}
        </div>
    );
}

export default Home;
