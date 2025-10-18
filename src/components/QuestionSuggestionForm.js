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
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [customCategory, setCustomCategory] = useState("")
    const [showCustomCategory, setShowCustomCategory] = useState(false)
    const [success, setSuccess] = useState(false)

    // Lấy danh mục có sẵn từ danh sách câu hỏi
    const existingCategories = useMemo(() => {
        return [...new Set(questions.map((q) => q.category))].sort()
    }, [questions])

    // Khi mở modal từ Dashboard, reset form khi showModal chuyển từ false -> true
    // Sử dụng useEffect để reset form khi showModal=true
    useEffect(() => {
        if (showModal) {
            setError("")
            setSuccess(false)
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
    }, [showModal])

    const handleCloseModal = () => {
        setShowModal(false)
        setError("")
        setSuccess(false)
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
        setSuccess(false)
        try {
            // Định dạng lại options thành object nếu cần
            const options = formData.options.map((content, idx) => ({ id: idx, content }))
            const user = JSON.parse(localStorage.getItem("user"))
            await axios.post(`${API_BASE_URL}/suggestedQuestions`, {
                ...formData,
                options,
                userId: user?.id,
                status: "pending"
            })
            setSuccess(true)
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
        } catch (error) {
            setError("Có lỗi xảy ra khi gửi đề xuất câu hỏi")
        } finally {
            setLoading(false)
        }
    }
