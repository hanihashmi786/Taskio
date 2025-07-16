"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  ChevronDown,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react"

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className = "",
  disabled = false,
}) => {
  const editorRef = useRef(null)
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  })
  const [fontSize, setFontSize] = useState("14")
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false)

  const fontSizes = [
    { value: "12", label: "Small" },
    { value: "14", label: "Normal" },
    { value: "16", label: "Medium" },
    { value: "18", label: "Large" },
    { value: "24", label: "Extra Large" },
  ]

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  // Update active states based on current selection
  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return

    const newActiveStates = {}
    const commands = [
      "bold",
      "italic",
      "underline",
      "insertUnorderedList",
      "insertOrderedList",
      "justifyLeft",
      "justifyCenter",
      "justifyRight",
    ]

    commands.forEach((command) => {
      newActiveStates[command] = document.queryCommandState(command)
    })

    setIsActive(newActiveStates)

    // Update font size
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const parentElement =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement
          : range.commonAncestorContainer

      const computedStyle = window.getComputedStyle(parentElement)
      const currentFontSize = Number.parseInt(computedStyle.fontSize)
      setFontSize(currentFontSize.toString())
    }
  }, [])

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveStates()
  }, [onChange, updateActiveStates])

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    updateActiveStates()
  }, [updateActiveStates])

  // Execute formatting command
  const executeCommand = useCallback(
    (command, value = null) => {
      if (disabled) return

      document.execCommand(command, false, value)
      editorRef.current?.focus()
      updateActiveStates()
      handleInput()
    },
    [disabled, updateActiveStates, handleInput],
  )

  // Handle font size change
  const handleFontSizeChange = useCallback(
    (size) => {
      executeCommand("fontSize", "3") // Reset to default first
      executeCommand("fontSize", size)
      setFontSize(size)
      setShowFontSizeDropdown(false)
    },
    [executeCommand],
  )

  // Handle link insertion
  const handleLinkInsertion = useCallback(() => {
    const url = prompt("Enter URL:")
    if (url) {
      executeCommand("createLink", url)
    }
  }, [executeCommand])

  // Handle key shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            executeCommand("bold")
            break
          case "i":
            e.preventDefault()
            executeCommand("italic")
            break
          case "u":
            e.preventDefault()
            executeCommand("underline")
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              executeCommand("redo")
            } else {
              executeCommand("undo")
            }
            break
          default:
            break
        }
      }
    },
    [disabled, executeCommand],
  )

  // Setup event listeners
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [handleSelectionChange])

  // Toolbar button component
  const ToolbarButton = ({ command, icon: Icon, title, onClick, isActive: active }) => (
    <button
      type="button"
      onClick={onClick || (() => executeCommand(command))}
      className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${
        active
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-slate-400"
      }`}
      title={title}
      disabled={disabled}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className={`border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-900 border-b border-gray-300 dark:border-slate-600 p-2 flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Font Size Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
              className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-400 min-w-[80px]"
              disabled={disabled}
            >
              <Type className="w-4 h-4" />
              <span className="text-sm">{fontSizes.find((f) => f.value === fontSize)?.label || "Normal"}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showFontSizeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-10 min-w-[120px]">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => handleFontSizeChange(size.value)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white text-sm"
                    style={{ fontSize: `${size.value}px` }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

          {/* Text Formatting */}
          <ToolbarButton command="bold" icon={Bold} title="Bold (Ctrl+B)" isActive={isActive.bold} />
          <ToolbarButton command="italic" icon={Italic} title="Italic (Ctrl+I)" isActive={isActive.italic} />
          <ToolbarButton
            command="underline"
            icon={Underline}
            title="Underline (Ctrl+U)"
            isActive={isActive.underline}
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

          {/* Lists */}
          <ToolbarButton
            command="insertUnorderedList"
            icon={List}
            title="Bullet List"
            isActive={isActive.insertUnorderedList}
          />
          <ToolbarButton
            command="insertOrderedList"
            icon={ListOrdered}
            title="Numbered List"
            isActive={isActive.insertOrderedList}
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

          {/* Alignment */}
          <ToolbarButton command="justifyLeft" icon={AlignLeft} title="Align Left" isActive={isActive.justifyLeft} />
          <ToolbarButton
            command="justifyCenter"
            icon={AlignCenter}
            title="Align Center"
            isActive={isActive.justifyCenter}
          />
          <ToolbarButton
            command="justifyRight"
            icon={AlignRight}
            title="Align Right"
            isActive={isActive.justifyRight}
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

          {/* Link */}
          <ToolbarButton icon={Link} title="Insert Link" onClick={handleLinkInsertion} />
        </div>

        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <ToolbarButton command="undo" icon={Undo} title="Undo (Ctrl+Z)" />
          <ToolbarButton command="redo" icon={Redo} title="Redo (Ctrl+Shift+Z)" />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`w-full p-4 focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white min-h-[150px] ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-text"
        }`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.5",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Click outside handler for font size dropdown */}
      {showFontSizeDropdown && <div className="fixed inset-0 z-0" onClick={() => setShowFontSizeDropdown(false)} />}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 20px;
          padding-left: 10px;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
          margin-left: 20px;
          padding-left: 10px;
        }
        
        [contenteditable] li {
          margin: 4px 0;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor
