import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Card, Form, Nav, Spinner } from 'react-bootstrap';
import { API_BASE } from '../config/api';
import '../assets/Auth.css';

// Auth component: Login/Register using json-server users collection
// Props: onLogin(user) -> called when login/register succeeds
export default function Auth({ onLogin }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // login form state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // register form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // If user is already logged in, call onLogin immediately
        try {
            const u = JSON.parse(localStorage.getItem('currentUser'));
            if (u && onLogin) onLogin(u);
        } catch { }
    }, [onLogin]);

    const canLogin = useMemo(() => loginUsername.trim() && loginPassword.trim(), [loginUsername, loginPassword]);
    const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);
    const canRegister = useMemo(
        () => name.trim() && phone.trim() && password.trim() && confirmPassword.trim() && passwordsMatch,
        [name, phone, password, confirmPassword, passwordsMatch]
    );

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!canLogin) return;
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/users`, {
                params: { username: loginUsername, password: loginPassword },
            });
            if (Array.isArray(data) && data.length > 0) {
                const user = data[0];
                localStorage.setItem('currentUser', JSON.stringify(user));
                if (onLogin) onLogin(user);
            } else {
                setError('Sai tên đăng nhập hoặc mật khẩu.');
            }
        } catch (err) {
            setError('Không thể kết nối máy chủ. Hãy bật json-server (port 9999).');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!canRegister) return;
        setError('');
        setLoading(true);
        try {
            // Use phone as username; check duplicate by username (phone)
            const registerUsername = phone;
            const exist = await axios.get(`${API_BASE}/users`, { params: { username: registerUsername } });
            if (Array.isArray(exist.data) && exist.data.length > 0) {
                setError('Tên đăng nhập đã tồn tại.');
            } else {
                const payload = { name, phone, username: registerUsername, password, role: 'user' };
                const { data: user } = await axios.post(`${API_BASE}/users`, payload);
                localStorage.setItem('currentUser', JSON.stringify(user));
                if (onLogin) onLogin(user);
            }
        } catch (err) {
            setError('Không thể đăng ký lúc này.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <Card.Header>
                    <h5 className="auth-title">Hệ thống ôn luyện lái xe</h5>
                </Card.Header>
                <Card.Body className="auth-body">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="auth-tabs mb-3">
                        <Nav.Item>
                            <Nav.Link eventKey="login">Đăng nhập</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="register">Đăng ký</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {error && (
                        <Alert variant="danger" className="auth-alert">
                            {error}
                        </Alert>
                    )}

                    {activeTab === 'login' ? (
                        <Form onSubmit={handleLogin} className="auth-form">
                            <Form.Group className="mb-3" controlId="login-username">
                                <Form.Label>Tên đăng nhập</Form.Label>
                                <Form.Control value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Nhập tên đăng nhập" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="login-password">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Nhập mật khẩu" />
                            </Form.Group>
                            <Button type="submit" className="btn-auth-primary" disabled={!canLogin || loading}>
                                {loading ? <Spinner size="sm" animation="border" /> : 'Đăng nhập'}
                            </Button>
                        </Form>
                    ) : (
                        <Form onSubmit={handleRegister} className="auth-form">
                            <Form.Group className="mb-3" controlId="reg-name">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn A" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="reg-phone">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 09xxxxxx" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="reg-password">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tạo mật khẩu" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="reg-password-confirm">
                                <Form.Label>Nhập lại mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    isInvalid={!!confirmPassword && !passwordsMatch}
                                />
                                <Form.Control.Feedback type="invalid">Mật khẩu nhập lại không trùng khớp.</Form.Control.Feedback>
                            </Form.Group>
                            <Button type="submit" className="btn-auth-success" disabled={!canRegister || loading}>
                                {loading ? <Spinner size="sm" animation="border" /> : 'Tạo tài khoản'}
                            </Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}