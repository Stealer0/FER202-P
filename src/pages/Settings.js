import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Cài đặt</h3>
  <Button variant="outline-primary" size="sm" onClick={() => navigate('/dashboard', { replace: true })}>Về trang chủ</Button>
      </div>
      <p className="text-muted">Tính năng cài đặt sẽ được bổ sung sau.</p>
    </div>
  );
};

export default Settings;
