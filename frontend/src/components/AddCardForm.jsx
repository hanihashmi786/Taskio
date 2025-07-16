"use client"
import { useState, useRef, useEffect } from "react"
import useCardStore from "../store/cardStore" // Assuming this path is correct

const AddCardForm = ({ listId, onCancel, onAdd }) => {
  const { addCard } = useCardStore()
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null) // Create a ref for the form container

  // Effect to handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target) && !isSubmitting) {
        onCancel && onCancel()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onCancel, isSubmitting]) // Depend on onCancel and isSubmitting

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      const cardData = {
        title: title.trim(),
        description: "", // Streamlined: no description input
        due_date: null, // Streamlined: no due date input
        labels: [], // Streamlined: no label input
        list: listId,
      }
      await addCard(cardData)
      setTitle("") // Clear input after successful creation
      onAdd && onAdd()
    } catch (error) {
      console.error("Error creating card:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent default form submission
      handleSubmit()
    } else if (e.key === "Escape") {
      onCancel && onCancel()
    }
  }

  return (
    <div
      ref={formRef} // Attach the ref to the form container
      className="p-2 bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-slate-700"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        className="w-full p-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
        required
        autoFocus
        disabled={isSubmitting}
      />
    </div>
  )
}

export default AddCardForm
