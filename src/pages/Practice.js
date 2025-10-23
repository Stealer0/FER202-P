import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import Practice from '../components/Practice';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';

export default function PracticePage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE}/questions`);
                if (mounted) setQuestions(normalizeQuestions(data));
            } catch (e) {
                if (mounted) setError('Không thể tải câu hỏi. Hãy kiểm tra json-server (port 9999).');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Đang tải câu hỏi...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                    <span>{error}</span>
                    <Button variant="outline-light" onClick={() => navigate('/dashboard', { replace: true })}>Về trang chủ</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Luyện tập</h3>
                <Button variant="outline-secondary" onClick={() => navigate('/dashboard', { replace: true })}>Về trang chủ</Button>
            </div>
            <Practice questions={questions} />
        </Container>
    );
}

// Ensure options have numeric ids (0..n-1)
function normalizeQuestions(items) {
    return items.map(q => ({
        ...q,
        options: (q.options || []).map((opt, idx) => ({ id: idx, ...opt }))
    }));
}
