import { useState, useMemo, useEffect } from "react"
import { Card, Button, Modal, Form, Alert } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function QuestionSuggestionForm({ questions = [], showModal, setShowModal }) {
    const [formData, setFormData] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "",
        image: null,
    })