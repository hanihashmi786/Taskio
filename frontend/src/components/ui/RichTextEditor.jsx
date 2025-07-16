"use client"

import { useState, useRef, useEffect } from "react"
import { Bold, Italic, List, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const RichTextEditor = ({ initialContent, onChange, onAttachmentsChange, attachments = [] }) => {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [content, setContent] = useState(initialContent || "")
  const [currentAttachments, setCurrentAttachments] = useState(attachments)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || ""
    }
  }, [initialContent])

  useEffect(() => {
    setCurrentAttachments(attachments)
  }, [attachments])

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange(newContent)
    }
  }

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value)
    handleInput() // Update state after command
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
      // Simulate attachment upload
      const newAttachments = files.map((file) => ({
        id: Date.now() + Math.random(), // Unique ID
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // Create a temporary URL for preview
      }))
      const updatedAttachments = [...currentAttachments, ...newAttachments]
      setCurrentAttachments(updatedAttachments)
      onAttachmentsChange(updatedAttachments)
    }
    event.target.value = null // Clear the input so same file can be selected again
  }

  const handleRemoveAttachment = (id) => {
    const updatedAttachments = currentAttachments.filter((att) => att.id !== id)
    setCurrentAttachments(updatedAttachments)
    onAttachmentsChange(updatedAttachments)
  }

  return (
    <div className="border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-700">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("bold")}
          title="Bold"
          className="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("italic")}
          title="Italic"
          className="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("insertUnorderedList")}
          title="Unordered List"
          className="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
        >
          <List className="w-4 h-4" />
        </Button>
        <div className="ml-auto">
          <Input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach File"
            className="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[120px] p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-transparent prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: initialContent }}
      />
      {currentAttachments.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50">
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Attachments:</h4>
          <div className="space-y-2">
            {currentAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-md border border-gray-200 dark:border-slate-600"
              >
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  <span className="text-sm text-gray-800 dark:text-slate-200 truncate">{att.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
