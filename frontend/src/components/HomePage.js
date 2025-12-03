import React from 'react';

const HomePage = () => {
  const user = { name: 'User' }; // Placeholder for user data

  return (
    <div>
      <h1>Bonjour, {user.name}! Let's thrive today.</h1>
      <div>
        <div>
          <h2>SPORTS</h2>
        </div>
        <div>
          <h2>NUTRITION</h2>
        </div>
        <div>
          <h2>EVERYDAY FIT</h2>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
