import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { API_BASE } from '../config/api';

function PracticeMode({ questions }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(-1);
    const [showAnswer, setShowAnswer] = useState(false);
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Build categories and counts once per questions change
    const { categories, countsByCategory } = useMemo(() => {
        const counts = new Map();
        for (const q of questions) {
            const key = q.category ?? 'Khác';
            counts.set(key, (counts.get(key) || 0) + 1);
        }
        return {
            categories: ['all', ...Array.from(counts.keys())],
            countsByCategory: counts,
        };
    }, [questions]);

    // Filtered list by category
    const filteredQuestions = useMemo(() => {
        if (selectedCategory === 'all') return questions;
        return questions.filter((q) => (q.category ?? 'Khác') === selectedCategory);
    }, [questions, selectedCategory]);

    // Keep currentQuestion in bounds if filter changes
    useEffect(() => {
        if (currentQuestion >= filteredQuestions.length && filteredQuestions.length > 0) {
            setCurrentQuestion(0);
            setSelectedAnswer(-1);
            setShowAnswer(false);
        }
    }, [filteredQuestions, currentQuestion]);

    if (!questions || questions.length === 0) {
        return <Alert variant="warning">Chưa có câu hỏi nào trong hệ thống. Vui lòng liên hệ quản trị viên.</Alert>;
    }

    if (filteredQuestions.length === 0) {
        return <Alert variant="info">Không có câu hỏi nào trong chủ đề này.</Alert>;
    }

    const currentQ = filteredQuestions[currentQuestion] ?? filteredQuestions[0];

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentQuestion(0);
        setSelectedAnswer(-1);
        setShowAnswer(false);
    };

    const handleAnswerSelect = (answerIndex) => {
        if (showAnswer) return; // prevent change after reveal
        setSelectedAnswer(answerIndex);
    };

    const handleCheckAnswer = () => {
        if (selectedAnswer === -1) return;
        setShowAnswer(true);
        const isCorrect = selectedAnswer === currentQ.correctAnswer;
        setStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
        }));

        // Persist attempt: try server endpoint if available, otherwise store locally in localStorage
        try {
            const user = JSON.parse(localStorage.getItem('currentUser')) || {};
            const userId = user?.id;
            const attempt = {
                questionId: currentQ.id,
                category: currentQ.category ?? 'Khác',
                selected: selectedAnswer,
                correctAnswer: currentQ.correctAnswer,
                isCorrect,
                timestamp: new Date().toISOString(),
            };
            if (userId) {
                (async () => {
                    try {
                        // Optional: try POST to json-server if a collection exists
                        await fetch(`${API_BASE}/practiceAttempts`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, ...attempt }),
                        });
                    } catch (_) {
                        // fallback to localStorage per-user
                        const key = `practiceAttempts:${userId}`;
                        const arr = (() => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } })();
                        arr.push(attempt);
                        localStorage.setItem(key, JSON.stringify(arr));
                    }
                })();
            }
        } catch { }
    };

    const handleNextQuestion = () => {
        const nextIndex = currentQuestion < filteredQuestions.length - 1 ? currentQuestion + 1 : 0;
        setCurrentQuestion(nextIndex);
        setSelectedAnswer(-1);
        setShowAnswer(false);
    };

    const handlePrevQuestion = () => {
        if (currentQuestion === 0) return;
        setCurrentQuestion(currentQuestion - 1);
        setSelectedAnswer(-1);
        setShowAnswer(false);
    };

    const resetStats = () => setStats({ correct: 0, total: 0 });

    const ratio = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Ôn luyện thi bằng lái xe máy</h2>
                <div className="text-end">
                    <div>
                        <Badge bg="success" className="me-2">Đúng: {stats.correct}</Badge>
                        <Badge bg="secondary" className="me-2">Tổng: {stats.total}</Badge>
                        {stats.total > 0 && <Badge bg="info">Tỷ lệ: {ratio}%</Badge>}
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={resetStats} className="mt-2">
                        Reset thống kê
                    </Button>
                </div>
            </div>

            <Card className="mb-4 category-filter">
                <Card.Body>
                    <h6>Chọn chủ đề:</h6>
                    <Row>
                        {categories.map((category) => (
                            <Col key={category} xs="auto" className="mb-2">
                                <Button
                                    variant={selectedCategory === category ? 'primary' : 'outline-primary'}
                                    size="sm"
                                    onClick={() => handleCategoryChange(category)}
                                >
                                    {category === 'all' ? 'Tất cả' : category}
                                    {category !== 'all' && (
                                        <Badge bg="light" text="dark" className="ms-1">
                                            {countsByCategory.get(category) ?? 0}
                                        </Badge>
                                    )}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>
                            Câu {currentQuestion + 1}/{filteredQuestions.length}
                        </span>
                        <Badge bg="secondary">{currentQ.category ?? 'Khác'}</Badge>
                    </div>
                </Card.Header>
                <Card.Body>
                    <h5 className="mb-4">{currentQ.question}</h5>

                    {currentQ.image && (
                        <div className="text-center mb-3">
                            <img
                                src={currentQ.image || '/placeholder.svg'}
                                alt="Câu hỏi"
                                className="img-fluid rounded"
                                style={{ maxHeight: 280 }}
                            />
                        </div>
                    )}

                    <Form>
                        {(currentQ.options || []).map((option) => (
                            <Form.Check
                                key={option.id}
                                type="radio"
                                id={`option-${option.id}`}
                                name="answer"
                                label={`${(option.id ?? 0) + 1}. ${option.content}`}
                                checked={selectedAnswer === option.id}
                                onChange={() => handleAnswerSelect(option.id)}
                                className="mb-3"
                                disabled={showAnswer}
                            />
                        ))}
                    </Form>

                    {showAnswer && (
                        <Alert variant={selectedAnswer === currentQ.correctAnswer ? 'success' : 'danger'}>
                            <div className="d-flex align-items-center">
                                <div className="me-3">{selectedAnswer === currentQ.correctAnswer ? '✅' : '❌'}</div>
                                <div>
                                    <strong>{selectedAnswer === currentQ.correctAnswer ? 'Chính xác!' : 'Sai rồi!'}</strong>
                                    <br />
                                    Đáp án đúng là: {(currentQ.correctAnswer ?? 0) + 1}. {
                                        (currentQ.options || []).find((o) => o.id === currentQ.correctAnswer)?.content
                                    }
                                </div>
                            </div>
                        </Alert>
                    )}
                </Card.Body>
                <Card.Footer>
                    <div className="d-flex justify-content-between">
                        <Button variant="outline-secondary" disabled={currentQuestion === 0} onClick={handlePrevQuestion}>
                            ← Câu trước
                        </Button>

                        {!showAnswer ? (
                            <Button variant="primary" onClick={handleCheckAnswer} disabled={selectedAnswer === -1}>
                                Kiểm tra đáp án
                            </Button>
                        ) : (
                            <Button variant="success" onClick={handleNextQuestion}>
                                {currentQuestion < filteredQuestions.length - 1 ? 'Câu tiếp →' : 'Quay lại đầu'}
                            </Button>
                        )}
                    </div>
                </Card.Footer>
            </Card>
        </div>
    );
}

export default PracticeMode;
