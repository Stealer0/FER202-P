import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import '../assets/Auth.css';

const API_BASE_URL = 'http://localhost:9999';

// Unified Auth: login/register by phone number
export default function Auth({ onLogin }) {
  const location = useLocation();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    // Open register tab when on /register
    if (location.pathname === '/register') setTab('register');
    else setTab('login');
  }, [location.pathname]);

  const validatePhone = (phone) => /^\d{10,11}$/.test(String(phone).trim());

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePhone(loginData.phone)) return setError('Số điện thoại không hợp lệ');
    setLoading(true);
    try {
      const { data: users } = await axios.get(`${API_BASE_URL}/users`);
      const user = users.find(
        (u) => String(u.phone) === String(loginData.phone).trim() && String(u.password) === String(loginData.password).trim()
      );
      if (!user) return setError('Sai số điện thoại hoặc mật khẩu');
      onLogin({ id: user.id, phone: user.phone, role: user.role || 'user', name: user.name || 'Người dùng' });
    } catch (err) {
      setError('Không thể kết nối máy chủ. Hãy đảm bảo json-server đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!registerData.name.trim()) return setError('Vui lòng nhập họ tên');
    if (!validatePhone(registerData.phone)) return setError('Số điện thoại không hợp lệ');
    if (!registerData.password || registerData.password.length < 3) return setError('Mật khẩu tối thiểu 3 ký tự');
    if (!registerData.confirmPassword || registerData.confirmPassword !== registerData.password) {
      return setError('Xác nhận mật khẩu không khớp');
    }
    setLoading(true);
    try {
      const { data: users } = await axios.get(`${API_BASE_URL}/users`);
      const existed = users.find((u) => String(u.phone) === String(registerData.phone).trim());
      if (existed) return setError('Số điện thoại đã được đăng ký');
      const newUser = {
        phone: String(registerData.phone).trim(),
        password: String(registerData.password).trim(),
        name: registerData.name.trim(),
        role: 'user',
      };
      const { data: created } = await axios.post(`${API_BASE_URL}/users`, newUser);
      onLogin({ id: created.id, phone: created.phone, role: created.role, name: created.name });
    } catch (err) {
      setError('Không thể kết nối máy chủ. Hãy đảm bảo json-server đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
    <Row className="justify-content-center w-100">
      <Col md={6}>
        <Card className="auth-card">
          <Card.Header>
            <h4 className="text-center mb-0 auth-title">Hệ thống ôn thi bằng lái xe máy</h4>
          </Card.Header>
          <Card.Body className="auth-body">
            {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}
            <Tabs activeKey={tab} onSelect={(k) => setTab(k || 'login')} className="mb-3 auth-tabs">
              <Tab eventKey="login" title="Đăng nhập">
                <Form onSubmit={handleLogin} className="auth-form">
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      inputMode="numeric"
                      value={loginData.phone}
                      onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                      placeholder="Ví dụ: 0987654321"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 btn-auth-primary" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Form>
              </Tab>
              <Tab eventKey="register" title="Đăng ký">
                <Form onSubmit={handleRegister} className="auth-form">
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Họ tên</Form.Label>
                    <Form.Control
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      inputMode="numeric"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="10-11 số"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Xác nhận mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button variant="success" type="submit" className="w-100 btn-auth-success" disabled={loading}>
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    </div>
  );
}
