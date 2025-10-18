import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('currentUser'));
  } catch (_) {}
  const navigate = useNavigate();
  if (!user) return <div className="container mt-4">Không tìm thấy người dùng.</div>;
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Thông tin người dùng</h3>
  <Button variant="outline-primary" size="sm" onClick={() => navigate('/dashboard', { replace: true })}>Về trang chủ</Button>
      </div>
      <ul className="list-unstyled mt-3">
        <li><strong>Họ tên:</strong> {user.name || '—'}</li>
        <li><strong>Số điện thoại:</strong> {user.phone}</li>
        <li><strong>Vai trò:</strong> {user.role}</li>
      </ul>
    </div>
  );
};

export default Profile;
