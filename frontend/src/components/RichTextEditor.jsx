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
  ImageIcon,
  Smile,
  Code,
  AtSign,
  X,
  Loader2,
  MoreHorizontal,
  HelpCircle,
  Trash2,
} from "lucide-react"

// Mock users data - replace with your actual user data
const MOCK_USERS = [
  { id: 1, name: "John Doe", username: "johndoe", avatar: "/placeholder.svg" },
  { id: 2, name: "Jane Smith", username: "janesmith", avatar: "/placeholder.svg" },
  { id: 3, name: "Mike Johnson", username: "mikejohnson", avatar: "/placeholder.svg" },
  { id: 4, name: "Sarah Wilson", username: "sarahwilson", avatar: "/placeholder.svg" },
]

// Common emojis
const EMOJI_CATEGORIES = {
  "Frequently Used": ["😀", "😊", "😂", "❤️", "👍", "👎", "🔥", "💯", "🎉", "👏"],
  "Smileys & People": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
  ],
  "Animals & Nature": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
  ],
  "Food & Drink": [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
  ],
  Activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
  ],
  Objects: [
    "⌚",
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
  ],
}

// Programming languages for code snippets
const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "bash", label: "Bash" },
  { value: "powershell", label: "PowerShell" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Plain Text" },
]

const EnhancedRichTextEditor = ({
  value, // keep for compatibility
  defaultValue = "",
  onChange,
  onBlur,
  placeholder = "Start typing...",
  className = "",
  disabled = false,
  onImageUpload,
  users = MOCK_USERS,
}) => {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [content, setContent] = useState(defaultValue)
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

  // UI States
  const [fontSize, setFontSize] = useState("14")
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 })
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("Frequently Used")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Code snippet states
  const [codeContent, setCodeContent] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [showCodePreview, setShowCodePreview] = useState(false)

  // URL modal states
  const [urlText, setUrlText] = useState("")
  const [urlLink, setUrlLink] = useState("")

  // Selection range for restoring after modal
  const savedSelectionRef = useRef(null)

  // Helper to save selection
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0)
    }
  }

  // Helper to restore selection
  const restoreSelection = () => {
    const sel = window.getSelection()
    if (savedSelectionRef.current && editorRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }

  const fontSizes = [
    { value: "12", label: "Small" },
    { value: "14", label: "Normal" },
    { value: "16", label: "Medium" },
    { value: "18", label: "Large" },
    { value: "24", label: "Extra Large" },
  ]

  // Initialize editor content (uncontrolled mode)
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ""
    }
  }, [content])

  // If defaultValue changes (e.g. when switching cards), update content
  useEffect(() => {
    setContent(defaultValue)
  }, [defaultValue])

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
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      setContent(html)
      if (onChange) onChange(html)
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
      executeCommand("fontSize", "3")
      executeCommand("fontSize", size)
      setFontSize(size)
      setShowFontSizeDropdown(false)
    },
    [executeCommand],
  )

  // Handle mention detection
  const handleMentionDetection = useCallback(
    (e) => {
      const selection = window.getSelection()
      if (!selection.rangeCount) return

      const range = selection.getRangeAt(0)
      const textContent = range.startContainer.textContent || ""
      const cursorPosition = range.startOffset

      // Look for @ symbol before cursor
      const textBeforeCursor = textContent.substring(0, cursorPosition)
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

      if (mentionMatch) {
        const query = mentionMatch[1]
        setMentionQuery(query)

        // Filter users based on query
        const filtered = users.filter(
          (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase()),
        )
        setFilteredUsers(filtered)

        // Calculate position for dropdown
        const rect = range.getBoundingClientRect()
        const editorRect = editorRef.current.getBoundingClientRect()
        setMentionPosition({
          x: rect.left - editorRect.left,
          y: rect.bottom - editorRect.top + 5,
        })

        setShowMentionDropdown(true)
      } else {
        setShowMentionDropdown(false)
      }
    },
    [users],
  )

  // Insert mention
  const insertMention = useCallback(
    (user) => {
      const selection = window.getSelection()
      if (!selection.rangeCount) return

      const range = selection.getRangeAt(0)
      const textContent = range.startContainer.textContent || ""
      const cursorPosition = range.startOffset

      // Find the @ symbol position
      const textBeforeCursor = textContent.substring(0, cursorPosition)
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

      if (mentionMatch) {
        const mentionStart = cursorPosition - mentionMatch[0].length

        // Create mention element
        const mentionElement = document.createElement("span")
        mentionElement.className =
          "mention bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-medium"
        mentionElement.setAttribute("data-user-id", user.id)
        mentionElement.setAttribute("contenteditable", "false")
        mentionElement.textContent = `@${user.username}`

        // Replace the @ query with the mention element
        const textNode = range.startContainer
        const beforeText = textContent.substring(0, mentionStart)
        const afterText = textContent.substring(cursorPosition)

        // Create new text nodes
        const beforeNode = document.createTextNode(beforeText)
        const afterNode = document.createTextNode(" " + afterText)

        // Replace the original text node
        const parent = textNode.parentNode
        parent.insertBefore(beforeNode, textNode)
        parent.insertBefore(mentionElement, textNode)
        parent.insertBefore(afterNode, textNode)
        parent.removeChild(textNode)

        // Set cursor after mention
        const newRange = document.createRange()
        newRange.setStartAfter(mentionElement)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)

        setShowMentionDropdown(false)
        handleInput()
      }
    },
    [handleInput],
  )

  // Insert emoji (restore selection first)
  const insertEmoji = useCallback(
    (emoji) => {
      restoreSelection()
      const selection = window.getSelection()
      if (!selection.rangeCount) return
      const range = selection.getRangeAt(0)
      const emojiNode = document.createTextNode(emoji)
      range.insertNode(emojiNode)
      range.setStartAfter(emojiNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      setShowEmojiPicker(false)
      setShowMoreDropdown(false)
      handleInput()
      editorRef.current?.focus()
    },
    [handleInput],
  )

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith("image/")) return

      setUploadingImage(true)
      try {
        let imageUrl

        if (onImageUpload) {
          // Use custom upload handler
          imageUrl = await onImageUpload(file)
        } else {
          // Create local URL for preview (you should implement actual upload)
          imageUrl = URL.createObjectURL(file)
        }

        // Insert image into editor
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const imgElement = document.createElement("img")
          imgElement.src = imageUrl
          imgElement.alt = file.name
          imgElement.className = "max-w-full h-auto rounded-lg border border-gray-200 dark:border-slate-600 my-2"
          imgElement.style.maxWidth = "100%"
          imgElement.style.height = "auto"

          range.insertNode(imgElement)
          range.setStartAfter(imgElement)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)

          handleInput()
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      } finally {
        setUploadingImage(false)
        setShowMoreDropdown(false)
      }
    },
    [onImageUpload, handleInput],
  )

  // Insert code snippet inline (restore selection first)
  const insertCodeSnippet = useCallback(() => {
    restoreSelection()
    if (!codeContent.trim()) return
    const selection = window.getSelection()
    if (!selection.rangeCount) return
    const range = selection.getRangeAt(0)

    // Create inline code element
    const codeElement = document.createElement("code")
    codeElement.className =
      "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 px-2 py-1 rounded font-mono text-sm border border-gray-200 dark:border-slate-600"
    codeElement.textContent = codeContent
    codeElement.setAttribute("data-language", selectedLanguage)

    range.insertNode(codeElement)
    range.setStartAfter(codeElement)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

    setShowCodeEditor(false)
    setCodeContent("")
    setShowMoreDropdown(false)
    handleInput()
    editorRef.current?.focus()
  }, [codeContent, selectedLanguage, handleInput])

  // Insert URL link (restore selection first)
  const insertUrlLink = useCallback(() => {
    restoreSelection()
    if (!urlLink.trim()) return
    const selection = window.getSelection()
    if (!selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const linkElement = document.createElement("a")
    linkElement.href = urlLink
    linkElement.target = "_blank"
    linkElement.rel = "noopener noreferrer"
    linkElement.className = "text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
    linkElement.textContent = urlText || urlLink

    range.insertNode(linkElement)
    range.setStartAfter(linkElement)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

    setShowUrlModal(false)
    setUrlText("")
    setUrlLink("")
    handleInput()
    editorRef.current?.focus()
  }, [urlText, urlLink, handleInput])

  // Handle key shortcuts and mention detection
  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return

      // Handle mention dropdown navigation
      if (showMentionDropdown) {
        if (e.key === "Escape") {
          setShowMentionDropdown(false)
          return
        }
        if (e.key === "Enter" && filteredUsers.length > 0) {
          e.preventDefault()
          insertMention(filteredUsers[0])
          return
        }
      }

      // Regular keyboard shortcuts
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

      // Detect mentions on input
      setTimeout(() => handleMentionDetection(e), 0)
    },
    [disabled, executeCommand, showMentionDropdown, filteredUsers, insertMention, handleMentionDetection],
  )

  // Handle blur event
  const handleBlur = () => {
    if (editorRef.current && onBlur) {
      onBlur(editorRef.current.innerHTML)
    }
  }

  // Setup event listeners
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [handleSelectionChange])

  // Toolbar button component
  const ToolbarButton = ({ command, icon: Icon, title, onClick, isActive: active, disabled: buttonDisabled }) => (
    <button
      type="button"
      onClick={onClick || (() => executeCommand(command))}
      className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${
        active
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-slate-400"
      } ${buttonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title}
      disabled={disabled || buttonDisabled}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className={`border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden ${className}`}>
      {/* Enhanced Toolbar */}
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
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-20 min-w-[120px]">
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

          {/* URL Link */}
          <ToolbarButton icon={Link} title="Insert Link" onClick={() => { saveSelection(); setShowUrlModal(true); }} />

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-400 transition-colors"
              title="More options"
              disabled={disabled}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-20 min-w-[180px]">
                <button
                  onClick={() => {
                    editorRef.current?.focus()
                    document.execCommand("insertText", false, "@")
                    setShowMoreDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <AtSign className="w-4 h-4" />
                  Mention User
                </button>

                <button
                  onClick={() => {
                    saveSelection()
                    setShowEmojiPicker(true)
                    setShowMoreDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <Smile className="w-4 h-4" />
                  Insert Emoji
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowMoreDropdown(false)
                  }}
                  disabled={uploadingImage}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  {uploadingImage ? "Uploading..." : "Insert Image"}
                </button>

                <button
                  onClick={() => {
                    saveSelection()
                    setShowCodeEditor(true)
                    setShowMoreDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white text-sm"
                >
                  <Code className="w-4 h-4" />
                  Insert Code
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <ToolbarButton command="undo" icon={Undo} title="Undo (Ctrl+Z)" />
          <ToolbarButton command="redo" icon={Redo} title="Redo (Ctrl+Shift+Z)" />
        </div>
      </div>

      {/* Editor Container */}
      <div className="relative">
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
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

        {/* Mention Dropdown */}
        {showMentionDropdown && (
          <div
            className="absolute bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto min-w-[200px]"
            style={{
              left: `${mentionPosition.x}px`,
              top: `${mentionPosition.y}px`,
            }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">@{user.username}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">No users found</div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
          }
          e.target.value = ""
        }}
        className="hidden"
      />

      {/* URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insert Link</h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={urlText}
                  onChange={(e) => setUrlText(e.target.value)}
                  placeholder="Enter display text..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">URL *</label>
                <input
                  type="url"
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-slate-600">
              <button
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertUrlLink}
                disabled={!urlLink.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor Modal */}
      {showCodeEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insert Code Snippet</h3>
              <button
                onClick={() => setShowCodeEditor(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col h-full max-h-[calc(80vh-120px)]">
              {/* Code Editor */}
              <div className="flex-1 bg-gray-900 text-gray-100 font-mono text-sm overflow-hidden">
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="// Enter your code here..."
                  className="w-full h-full p-4 bg-transparent border-none outline-none resize-none text-gray-100 placeholder-gray-400"
                  style={{ minHeight: "300px" }}
                />
              </div>

              {/* Bottom Toolbar - Matching the provided image */}
              <div className="flex items-center justify-between p-3 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <button
                    onClick={insertCodeSnippet}
                    disabled={!codeContent.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setCodeContent("")
                      setShowCodeEditor(false)
                    }}
                    className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    Discard
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select language</option>
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      window.open(
                        "https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks",
                        "_blank",
                      )
                    }
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    title="Formatting help"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setCodeContent("")
                      setShowCodeEditor(false)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insert Emoji</h3>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-1 mb-3 overflow-x-auto">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedEmojiCategory(category)}
                    className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                      selectedEmojiCategory === category
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {showFontSizeDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowFontSizeDropdown(false)} />}
      {showMoreDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowMoreDropdown(false)} />}

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
        
        .mention {
          display: inline-block;
          cursor: pointer;
        }
        
        .mention:hover {
          background-color: rgba(59, 130, 246, 0.2);
        }
        
        [contenteditable] code {
          display: inline-block;
          margin: 0 2px;
        }
      `}</style>
    </div>
  )
}

export default EnhancedRichTextEditor
