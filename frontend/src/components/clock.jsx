import React, { useEffect, useState } from 'react';
const Clock = () => {
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            setCurrentDateTime(now);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return <p className="text-gray-400 text-sm m-0">{currentDateTime}</p>;
};

export default Clock;
