import { useState, useMemo } from "react"
import { Card, Button, Table, Modal, Form, Alert, Badge } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function QuestionManager({ questions, onQuestionsChange }) {
    const [showModal, setShowModal] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [formData, setFormData] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "",
        image: null,
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [customCategory, setCustomCategory] = useState("")
    const [showCustomCategory, setShowCustomCategory] = useState(false)

    // Lay cate co san tu cau hoi
    const existingCategories = useMemo(() => {
        return [...new Set(questions.map((q) => q.category))].sort()
    }, [questions])
    const handleShowModal = (question = null) => {
        if (question) {
            setEditingQuestion(question)
            setFormData({
                question: question.question,
                options: [...question.options],
                correctAnswer: question.correctAnswer,
                category: question.category,
                image: question.image,
            })
            setImagePreview(question.image)
            // Check if category exists in existing categories
            const categoryExists = existingCategories.includes(question.category)
            if (!categoryExists && question.category) {
                setShowCustomCategory(true)
                setCustomCategory(question.category)
            } else {
                setShowCustomCategory(false)
                setCustomCategory("")
            }
        } else {
            setEditingQuestion(null)
            setFormData({
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                category: "",
                image: null,
            })
            setImagePreview(null)
            setShowCustomCategory(false)
            setCustomCategory("")
        }
        setShowModal(true)
        setError("")
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingQuestion(null)
        setError("")
        setImagePreview(null)
        setShowCustomCategory(false)
        setCustomCategory("")
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options]
        newOptions[index] = value
        setFormData({ ...formData, options: newOptions })
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const base64 = e.target.result
                setFormData({ ...formData, image: base64 })
                setImagePreview(base64)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: null })
        setImagePreview(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            if (editingQuestion) {
                await axios.put(`${API_BASE_URL}/questions/${editingQuestion.id}`, formData)
            } else {
                await axios.post(`${API_BASE_URL}/questions`, formData)
            }

            onQuestionsChange()
            handleCloseModal()
        } catch (error) {
            setError("Có lỗi xảy ra khi lưu câu hỏi")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/questions/${id}`)
                onQuestionsChange()
            } catch (error) {
                alert("Có lỗi xảy ra khi xóa câu hỏi")
            }
        }
    }