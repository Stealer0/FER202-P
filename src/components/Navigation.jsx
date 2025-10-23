import React, { useMemo } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../assets/Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (_) {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const go = (path, opts) => navigate(path, opts);

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-0 rounded-bottom">
      <Container>
        <LinkContainer to={currentUser ? '/dashboard' : '/login'}>
          <Navbar.Brand role="button">
            <span className="me-2">🚗</span>
            Hệ thống ôn luyện lái xe
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {!currentUser ? (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Đăng nhập</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Đăng ký</Nav.Link>
                </LinkContainer>
              </>
            ) : (
              <NavDropdown title={currentUser.name || currentUser.phone} id="user-dropdown" align="end">
                <NavDropdown.Item onClick={() => go('/dashboard', { replace: true })}>Về trang chủ</NavDropdown.Item>
                <NavDropdown.Item onClick={() => go('/profile')}>Thông tin người dùng</NavDropdown.Item>
                <NavDropdown.Item onClick={() => go('/settings')}>Cài đặt</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
