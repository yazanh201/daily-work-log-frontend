import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaClipboardList, FaHome, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/apiService';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up polling for notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Daily Work Log System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <>
              <Nav className="me-auto">
                {user.role === 'Team Leader' && (
                  <>
                    <Nav.Link as={Link} to="/"><FaHome className="me-1" /> Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/create-log"><FaClipboardList className="me-1" /> Create Log</Nav.Link>
                  </>
                )}
                
                {user.role === 'Manager' && (
                  <>
                    <Nav.Link as={Link} to="/manager"><FaHome className="me-1" /> Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/all-logs"><FaClipboardList className="me-1" /> All Logs</Nav.Link>
                  </>
                )}
              </Nav>
              
              <Nav>
                <NavDropdown 
                  title={
                    <span>
                      <FaBell className="me-1" /> 
                      Notifications
                      {unreadCount > 0 && (
                        <Badge bg="danger" pill className="ms-1">
                          {unreadCount}
                        </Badge>
                      )}
                    </span>
                  } 
                  id="notification-dropdown"
                >
                  {notifications.length === 0 ? (
                    <NavDropdown.Item disabled>No notifications</NavDropdown.Item>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map(notification => (
                        <NavDropdown.Item 
                          key={notification._id}
                          onClick={() => handleMarkAsRead(notification._id)}
                          className={notification.isRead ? '' : 'fw-bold'}
                        >
                          {notification.message}
                        </NavDropdown.Item>
                      ))}
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={handleMarkAllAsRead}>
                        Mark all as read
                      </NavDropdown.Item>
                    </>
                  )}
                </NavDropdown>
                
                <NavDropdown 
                  title={
                    <span>
                      <FaUser className="me-1" /> {user.fullName || 'User'}
                    </span>
                  } 
                  id="user-dropdown"
                >
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-1" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
