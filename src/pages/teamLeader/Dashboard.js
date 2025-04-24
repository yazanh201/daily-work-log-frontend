import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { logService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import moment from 'moment';

const TeamLeaderDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.getTeamLeaderLogs();
      setLogs(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load your daily logs. Please try again.');
      toast.error('Failed to load your daily logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await logService.deleteLog(id);
        toast.success('Log deleted successfully');
        fetchLogs(); // Refresh the list
      } catch (err) {
        console.error('Error deleting log:', err);
        toast.error('Failed to delete log');
      }
    }
  };

  const handleSubmitLog = async (id) => {
    try {
      await logService.submitLog(id);
      toast.success('Log submitted successfully');
      fetchLogs(); // Refresh the list
    } catch (err) {
      console.error('Error submitting log:', err);
      toast.error('Failed to submit log');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge bg="secondary">Draft</Badge>;
      case 'submitted':
        return <Badge bg="primary">Submitted</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Team Leader Dashboard</h2>
          <p className="text-muted">Welcome back, {user?.fullName}</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/create-log" variant="primary">
            <FaPlus className="me-1" /> Create New Log
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Your Recent Daily Logs</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p className="text-center">Loading your logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center">No logs found. Create your first daily log!</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{moment(log.date).format('MMM DD, YYYY')}</td>
                    <td>{log.project.name}</td>
                    <td>
                      {moment(log.startTime).format('HH:mm')} - {moment(log.endTime).format('HH:mm')}
                    </td>
                    <td>{getStatusBadge(log.status)}</td>
                    <td>
                      <Button
                        as={Link}
                        to={`/view-log/${log._id}`}
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                      >
                        <FaEye />
                      </Button>
                      
                      {log.status === 'draft' && (
                        <>
                          <Button
                            as={Link}
                            to={`/edit-log/${log._id}`}
                            variant="outline-secondary"
                            size="sm"
                            className="me-1"
                          >
                            <FaEdit />
                          </Button>
                          
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-1"
                            onClick={() => handleSubmitLog(log._id)}
                          >
                            Submit
                          </Button>
                          
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteLog(log._id)}
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeamLeaderDashboard;
