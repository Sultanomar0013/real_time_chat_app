import React, { useState }  from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function FormsModal(props) {
  const [ groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  const resetForm = () => {
    setGroupName('');
    setPassword('');
    setError('');
  };

  const handlegroupName = () => {
    setLoading(true);
    setError('');

    fetch('http://localhost:3000/api/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupName, password, userId})
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
            console.log('Group Created successfully:', data);
            resetForm()
            props.onHide();

        } else {
            setError(data.message || 'Group Created Failed failed. Please try again.');
            console.error('Group Creating error:', data);
        }
    })
    .catch(error => {
        setLoading(false);
        setError('Error during Group Create. Please try again.');
        console.error('Error during Group Creat:', error);
    });
};

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide = {() => {
        resetForm();
        props.onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <div>
            <label>Group Name :</label>
            <input type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
            />
        </div>
        <div>
          <label>Password</label>
            <input type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
        </div>
      </div>
      </Modal.Body>
      <Modal.Footer>
      <Button onClick={handlegroupName} disabled={loading}>
                        {loading ? 'Creating' : 'Create'}
                    </Button>
        <Button onClick={props.onHide}>Close</Button>

        {error && <div style={{ color: 'red' }}>{error}</div>}
      </Modal.Footer>
    </Modal>
  );
}
export default FormsModal;
