// useProtectedData.js
import { useEffect } from 'react';

const useProtectedData = (token) => {
    useEffect(() => {
        if (!token) return;

        const fetchProtectedData = () => {
            fetch('/api/protected', {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Protected data:', data);
                } else {
                    console.error('Error fetching protected data:', data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        };

        fetchProtectedData();
    }, [token]);
};

export default useProtectedData;
