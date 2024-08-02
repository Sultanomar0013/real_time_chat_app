import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function FormModal(props) {
  const [ groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlegroupName = () => {
    setLoading(true);
    setError('');

    fetch('/api/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupName })
    })
    .then(response => response.json())
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

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label>Group Name :</label>
        <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
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
export default FormModal;
