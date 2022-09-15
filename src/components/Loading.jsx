import React from 'react';
import loading from '../utils/loading.gif';

const Loading = () => {

    return (
        <div className="loading-container">
            <img src={loading} alt="loading gif"/>
        </div>
    );
};

export default Loading;