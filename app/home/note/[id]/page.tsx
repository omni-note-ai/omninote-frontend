"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PenLine, Camera, Sparkles, Copy, Check, Trash2, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List as ListIcon, ListOrdered, Code, Quote, Link as LinkIcon, Undo, Redo, Eye, Columns, FileText, FileDown, Star, Pin, BarChart3, HelpCircle, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { noteAPI, imageAPI, aiAPI } from "@/lib/api";
import { useToast } from "@/components/common/ToastProvider";

type Tab = "text" | "captures";
type EditorMode = "edit" | "preview" | "split";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateNote, isLoggedIn, isAuthLoading } = useApp();
  const { toast } = useToast();
  
  const [tab, setTab] = useState<Tab>("text");
  const [editorMode, setEditorMode] = useState<EditorMode>("split");
  const [note, setNote] = useState<any>(null);
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);

  // Undo/Redo history states
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // AI & OCR States
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  const [ocrLoadingId, setOcrLoadingId] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [showOcrModal, setShowOcrModal] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  // Client-side visual note states
  const [noteEmoji, setNoteEmoji] = useState("📝");
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load emojis and favorites on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNoteEmoji(localStorage.getItem(`note_emoji_${id}`) || "📝");
      setIsStarred(localStorage.getItem(`note_starred_${id}`) === "true");
      setIsPinned(localStorage.getItem(`note_pinned_${id}`) === "true");
    }
  }, [id]);

  // Fetch complete details on render
  const fetchNoteDetails = useCallback(async () => {
    if (isAuthLoading || !isLoggedIn) return;
    try {
      setLoading(true);
      const res = await noteAPI.get(id);
      if (res.success && res.data) {
        setNote(res.data);
        setContent(res.data.content || "");
        setAttachments(res.data.images || []);
        // Seed history
        setHistory([res.data.content || ""]);
        setHistoryIdx(0);
      }
    } catch (e) {
      console.error("Error loading note detail:", e);
    } finally {
      setLoading(true); // Wait, should be false! Let's correct it to false.
      setLoading(false);
    }
  }, [id, isAuthLoading, isLoggedIn]);

  useEffect(() => {
    fetchNoteDetails();
  }, [fetchNoteDetails]);

  // Debounced autosave
  const save = useCallback(async () => {
    if (!note) return;
    try {
      await updateNote(id, content);
      setSaved(true);
    } catch (e) {
      console.error("Autosave failed:", e);
    }
  }, [id, content, note, updateNote]);

  useEffect(() => {
    if (saved) return;
    const timer = setTimeout(save, 2000);
    return () => clearTimeout(timer);
  }, [content, saved, save]);

  const handleChange = (val: string) => {
    setContent(val);
    setSaved(false);

    // Save history state
    const newHist = history.slice(0, historyIdx + 1);
    setHistory([...newHist, val]);
    setHistoryIdx(newHist.length);
  };

  // 1. Emoji toggle handlers
  const handleEmojiSelect = (emoji: string) => {
    setNoteEmoji(emoji);
    localStorage.setItem(`note_emoji_${id}`, emoji);
    setShowEmojiPicker(false);
    toast("Note icon updated", "success");
  };

  const toggleStar = () => {
    const next = !isStarred;
    setIsStarred(next);
    localStorage.setItem(`note_starred_${id}`, String(next));
    toast(next ? "Added note to favorites" : "Removed note from favorites", "info");
  };

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    localStorage.setItem(`note_pinned_${id}`, String(next));
    toast(next ? "Note pinned to top of command palette" : "Note unpinned", "info");
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const res = await imageAPI.upload(id, file);
      if (res.success && res.data) {
        toast("Screenshot uploaded successfully", "success");
        await fetchNoteDetails();
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast("Failed to upload screenshot", "error");
    } finally {
      setUploading(false);
    }
  };

  // Delete attachment image handler
  const handleImageDelete = async (imageId: string) => {
    try {
      const res = await imageAPI.delete(imageId);
      if (res.success) {
        setAttachments(prev => prev.filter(img => img.id !== imageId));
        toast("Attachment removed", "info");
      }
    } catch (err) {
      console.error("Delete image error:", err);
    }
  };

  // Gemini AI text summarizer trigger
  const handleSummarize = async () => {
    if (!content.trim()) {
      toast("Please write some notes first before summarizing.", "error");
      return;
    }
    
    try {
      setAiLoading(true);
      setShowSummaryModal(true);
      const res = await aiAPI.summarize(content);
      if (res.success && res.data) {
        let rawSummary = res.data.summary;
        // Map technical rate limit or timeout errors to user-friendly messages
        if (rawSummary.includes("Google's AI service is currently unavailable") || rawSummary.includes("429")) {
          rawSummary = [
            "**Summarization is temporarily unavailable.**",
            "• The AI helper is a bit busy right now due to high demand.",
            "• Don't worry! Your note content has been saved successfully.",
            "• Please wait a moment and try again!"
          ].join("\n");
        } else if (rawSummary.includes("Summarization temporarily unavailable")) {
          rawSummary = [
            "**Summarization is temporarily unavailable.**",
            "• We're having trouble connecting to the AI helper at the moment.",
            "• Don't worry! Your note content has been saved successfully.",
            "• Please try again in a few seconds."
          ].join("\n");
        }

        // Increment local AI summarize statistics count
        const count = parseInt(localStorage.getItem("omninote_ai_use") || "0", 10);
        localStorage.setItem("omninote_ai_use", String(count + 1));

        setSummary(rawSummary);
      }
    } catch (err) {
      console.error("Summary error:", err);
      setSummary("Failed to generate summary. Please check your backend connections.");
    } finally {
      setAiLoading(false);
    }
  };

  // Gemini OCR trigger
  const handleRunOCR = async (imageId: string) => {
    try {
      setOcrLoadingId(imageId);
      setShowOcrModal(true);
      setOcrText("");
      const res = await imageAPI.runOCR(imageId);
      if (res.success && res.data) {
        let rawOcr = res.data.extractedText;
        if (rawOcr.includes("OCR temporarily unavailable") || rawOcr.includes("429")) {
          const isRateLimit = rawOcr.includes("429");
          const friendly = isRateLimit 
            ? "The AI helper is a bit busy right now. Please wait a moment and try scanning again!"
            : "We're having trouble reaching the AI helper at the moment. Please wait a few seconds and try scanning again!";
          rawOcr = [
            "**Text extraction is temporarily unavailable.**",
            `• ${friendly}`,
            "• Please try scanning the image again in a few moments."
          ].join("\n");
        }
        setOcrText(rawOcr);
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setOcrText("OCR text extraction failed. Please try again.");
    } finally {
      setOcrLoadingId(null);
    }
  };

  // Insert extracted text into notes
  const handleInsertText = (textToInsert: string) => {
    const divider = "\n\n--- Extracted Text ---\n";
    const nextText = content + divider + textToInsert + "\n";
    setContent(nextText);
    setSaved(false);
    toast("Extracted text appended to notes", "success");
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    toast("Copied to clipboard", "success");
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Download summary as PDF using native browser print interface on a hidden frame
  const handleDownloadPDF = () => {
    if (!summary) return;
    try {
      const printIframe = document.createElement("iframe");
      printIframe.style.position = "absolute";
      printIframe.style.width = "0px";
      printIframe.style.height = "0px";
      printIframe.style.border = "none";
      document.body.appendChild(printIframe);
      
      const doc = printIframe.contentWindow?.document;
      if (!doc) {
        toast("Unable to generate PDF preview", "error");
        return;
      }

      doc.open();
      doc.write(`
        <html>
          <head>
            <title>AI Study Summary - ${note?.title || 'Note'}</title>
            <style>
              body {
                font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
                color: #111827;
                padding: 40px;
                line-height: 1.6;
                font-size: 14px;
              }
              h1 {
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 8px;
                color: #111827;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 12px;
              }
              .meta {
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                margin-bottom: 30px;
              }
              h2 {
                font-size: 18px;
                margin-top: 24px;
                margin-bottom: 12px;
                border-bottom: 1px solid #f3f4f6;
                padding-bottom: 6px;
              }
              h3 {
                font-size: 15px;
                margin-top: 20px;
                margin-bottom: 8px;
              }
              p, ul, ol {
                margin-bottom: 16px;
              }
              ul, ol {
                padding-left: 20px;
              }
              code {
                font-family: monospace;
                background-color: #f3f4f6;
                padding: 2px 4px;
                border-radius: 4px;
                font-size: 12px;
              }
              pre {
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                margin-bottom: 16px;
              }
              blockquote {
                border-left: 4px solid #e5e7eb;
                padding-left: 16px;
                color: #4b5563;
                font-style: italic;
                margin: 16px 0;
              }
            </style>
          </head>
          <body>
            <h1>AI Study Summary</h1>
            <div class="meta">Generated for: ${note?.title || 'Untitled Note'} &bull; ${new Date().toLocaleDateString()}</div>
            <div>${renderMarkdown(summary)}</div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.frameElement.remove();
                }, 100);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
      toast("Preparing print preview...", "success");
    } catch (err) {
      console.error("PDF Print Error:", err);
      toast("Failed to open print dialog", "error");
    }
  };

  // Download summary as Markdown file
  const handleDownloadMarkdown = () => {
    if (!summary) return;
    try {
      const element = document.createElement("a");
      const file = new Blob([summary], { type: "text/markdown" });
      element.href = URL.createObjectURL(file);
      element.download = `${note?.title || "Note"}_AI_Summary.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast("Downloaded AI Summary Markdown", "success");
    } catch (err) {
      console.error("Markdown Download Error:", err);
      toast("Failed to download Markdown file", "error");
    }
  };

  // Download summary as Word Document (.doc) file
  const handleDownloadWord = () => {
    if (!summary) return;
    try {
      const htmlContent = renderMarkdown(summary);
      const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>AI Study Summary - ${note?.title || 'Note'}</title>
          <!--[if gte mso 9]>
          <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #111827; }
            h1 { font-size: 20pt; font-weight: bold; margin-bottom: 8pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 12pt; }
            .meta { font-size: 9pt; color: #6b7280; text-transform: uppercase; margin-bottom: 24pt; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 1px solid #f3f4f6; padding-bottom: 4pt; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; }
            p, ul, ol { margin-bottom: 10pt; }
            ul, ol { margin-left: 20pt; }
            code { font-family: monospace; background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-size: 10pt; }
            pre { background-color: #f3f4f6; padding: 12pt; border-radius: 8px; margin-bottom: 12pt; }
            blockquote { border-left: 4px solid #e5e7eb; padding-left: 12pt; color: #4b5563; font-style: italic; margin: 12pt 0; }
          </style>
        </head>
        <body>
          <h1>AI Study Summary</h1>
          <div class="meta">Generated for: ${note?.title || 'Untitled Note'} &bull; ${new Date().toLocaleDateString()}</div>
          <div>${htmlContent}</div>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `${note?.title || "Note"}_AI_Summary.doc`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast("Downloaded as Word Document", "success");
    } catch (err) {
      console.error("Word Download Error:", err);
      toast("Failed to download Word document", "error");
    }
  };

  // 2. WYSIWYG / Pro Markdown Formatter Helper
  const insertFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const formatted = prefix + (selection || "text") + suffix;
    const nextContent = text.substring(0, start) + formatted + text.substring(end);
    
    handleChange(nextContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selection || "text").length);
    }, 50);
  };

  // 3. Undo / Redo action methods
  const handleUndo = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1;
      setHistoryIdx(idx);
      setContent(history[idx]);
      setSaved(false);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const idx = historyIdx + 1;
      setHistoryIdx(idx);
      setContent(history[idx]);
      setSaved(false);
    }
  };

  // Keyboard shortcut listeners
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        insertFormat("**", "**");
      } else if (e.key === "i") {
        e.preventDefault();
        insertFormat("*", "*");
      } else if (e.key === "u") {
        e.preventDefault();
        insertFormat("<u>", "</u>");
      } else if (e.key === "h") {
        e.preventDefault();
        insertFormat("<mark>", "</mark>");
      } else if (e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  // Compute Word & Character counts
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Check if current summary is an error state
  const isSummaryError = summary.includes("temporarily unavailable") || summary.includes("Failed to generate summary");

  // Quick helper to render HTML from Markdown
  const renderMarkdown = (md: string) => {
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-extrabold my-2 text-gray-900 dark:text-white">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-black my-3 text-gray-950 dark:text-white border-b border-gray-100/50 dark:border-gray-800/80 pb-1">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-black my-4 text-gray-950 dark:text-white border-b border-gray-200/50 dark:border-gray-800 pb-1.5">$1</h1>');

    // Bold, Italic, Strike, Underline, Highlight
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");
    html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, "<u>$1</u>");
    html = html.replace(/&lt;mark&gt;(.*?)&lt;\/mark&gt;/g, '<span class="bg-yellow-100 dark:bg-yellow-950/60 px-1 py-0.5 rounded text-gray-850 dark:text-gray-150">$1</span>');

    // Code blocks and Inline code
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="code-block my-4 text-xs overflow-x-auto"><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 text-xs font-mono">$1</code>');

    // Blockquote
    html = html.replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1.5 my-3 italic text-gray-600 dark:text-gray-400 bg-gray-50/40 dark:bg-gray-900 rounded-r-lg">$1</blockquote>');

    // Bullet & Number lists
    html = html.replace(/^\- (.*?)$/gm, '<li class="my-1 text-xs.5 text-gray-700 dark:text-gray-300">$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li class="my-1 text-xs.5 text-gray-700 dark:text-gray-300">$1</li>');
    html = html.replace(/^\d+\. (.*?)$/gm, '<li class="my-1 text-xs.5 text-gray-700 dark:text-gray-300 list-decimal">$1</li>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>');

    // Double returns
    html = html.replace(/\n\n/g, '<div class="h-3"></div>');
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm gap-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="font-semibold">Loading note details...</span>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm font-semibold">
        Note not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors">
      
      {/* Premium Editor Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-150/30 dark:border-gray-850 bg-white dark:bg-gray-900/60 backdrop-blur-md sticky top-0 z-30 transition">
        
        {/* Navigation & Emoji/Title */}
        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { save(); router.back(); }}
              className="p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-650 transition shrink-0 cursor-pointer"
              title="Save and exit"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Emoji selector Trigger */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-lg w-9 h-9 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center cursor-pointer border border-transparent hover:border-gray-150/50"
              >
                {noteEmoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-11 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5 rounded-2xl shadow-xl z-50 flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                  {["📝", "💡", "📘", "💻", "🧠", "🔥", "🎯", "🔬"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-base p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-base font-extrabold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2 pr-4">
              {note.title}
              {!saved && (
                <span className="flex items-center gap-1.5 shrink-0 text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-950 border border-gray-150/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Saving Changes...
                </span>
              )}
              {saved && (
                <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider bg-gray-50 dark:bg-gray-950 border border-gray-150/10 px-2 py-0.5 rounded-full">
                  Saved
                </span>
              )}
            </h1>
          </div>

          {tab === "text" && (
            <div className="flex items-center flex-wrap gap-3 pl-1 sm:pl-12 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider select-none">
              <span className="flex items-center gap-1 shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                {wordCount} Words
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-250/50 dark:bg-gray-800 shrink-0" />
              <span className="shrink-0">{charCount} Characters</span>
              <span className="w-1 h-1 rounded-full bg-gray-250/50 dark:bg-gray-800 shrink-0" />
              <span className="shrink-0">{readTime} Min read</span>
              <span className="w-1 h-1 rounded-full bg-gray-250/50 dark:bg-gray-800 shrink-0" />
              <span className="text-indigo-500 dark:text-indigo-400 shrink-0">Markdown Hybrid Active</span>
              <span className="w-1 h-1 rounded-full bg-gray-250/50 dark:bg-gray-800 shrink-0" />
              <span title="Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+H (Highlight)" className="flex items-center cursor-help shrink-0">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </span>
            </div>
          )}
        </div>

        {/* Workspace Toolbar Tabs */}
        <div className="flex items-center gap-3.5 mt-3 sm:mt-0 shrink-0">
          
          {/* Note Pinning / Favorites actions */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 border border-gray-200/50 dark:border-gray-850 p-0.5 rounded-xl shrink-0">
            <button
              onClick={toggleStar}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isStarred ? "text-yellow-400" : "text-gray-400 hover:text-gray-600"
              }`}
              title={isStarred ? "Starred note" : "Add to favorites"}
            >
              <Star className="w-3.5 h-3.5" fill={isStarred ? "currentColor" : "none"} />
            </button>
            <button
              onClick={togglePin}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPinned ? "text-indigo-500" : "text-gray-400 hover:text-gray-600"
              }`}
              title={isPinned ? "Pinned note" : "Pin to top"}
            >
              <Pin className="w-3.5 h-3.5" fill={isPinned ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 shrink-0" />

          {/* Editor Mode Tabs */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setTab("text")}
              className={
                tab === "text"
                  ? "flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-full border border-gray-250/50 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white transition cursor-pointer"
                  : "flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border border-transparent text-gray-450 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition cursor-pointer"
              }
            >
              <PenLine className="w-3.5 h-3.5 text-gray-400" />
              Notes Editor
            </button>
            <button
              onClick={() => setTab("captures")}
              className={
                tab === "captures"
                  ? "flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-full border border-gray-250/50 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white transition cursor-pointer"
                  : "flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border border-transparent text-gray-450 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition cursor-pointer"
              }
            >
              <Camera className="w-3.5 h-3.5 text-gray-400" />
              Captures ({attachments.length})
            </button>
          </div>

        </div>
      </div>

      {/* Editor & Sidebar Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Editor Screen Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-gray-950/20 overflow-hidden relative">
          
          {/* 1. Pro Formatting Toolbar Row */}
          {tab === "text" && (
            <div className="flex items-center justify-between border-b border-gray-150/40 dark:border-gray-850 bg-white dark:bg-gray-900/60 backdrop-blur-md px-6 py-2.5 shrink-0 select-none overflow-x-auto">
              
              {/* Text formatting actions */}
              <div className="flex items-center gap-1 select-none">
                <button
                  onClick={() => insertFormat("**", "**")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("*", "*")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("<u>", "</u>")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("~~", "~~")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("<mark>", "</mark>")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Highlight Text (Ctrl+H)"
                >
                  <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
                </button>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1 shrink-0" />

                {/* Headings */}
                <button
                  onClick={() => insertFormat("# ", "")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Heading H1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("## ", "")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Heading H2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("### ", "")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Heading H3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1 shrink-0" />

                {/* Lists & Quotes */}
                <button
                  onClick={() => insertFormat("- ", "")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Bullet List"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("1. ", "")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("> ", "")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("```\n", "\n```")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertFormat("[", "](url)")}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Insert Hyperlink"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1 shrink-0" />

                {/* Undo / Redo */}
                <button
                  onClick={handleUndo}
                  disabled={historyIdx <= 0}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIdx >= history.length - 1}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* View Split Toggles */}
              <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-0.5 rounded-xl flex items-center shrink-0 shadow-inner">
                <button
                  onClick={() => setEditorMode("edit")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                    editorMode === "edit"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-650"
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  onClick={() => setEditorMode("split")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                    editorMode === "split"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-650"
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  Split
                </button>
                <button
                  onClick={() => setEditorMode("preview")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                    editorMode === "preview"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-650"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>

            </div>
          )}

          {/* 2. Workspace View Tabs Panels */}
          <div className="flex-1 flex overflow-hidden p-3 sm:p-6 gap-6 relative min-h-0">
            
            {/* Text Editor Tab canvas */}
            {tab === "text" ? (
              <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
                
                {/* 2.1 Raw Text Area Input Editor */}
                {(editorMode === "edit" || editorMode === "split") && (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={save}
                    placeholder="Type your notes in Markdown here... Use formatting buttons or keyboard shortcuts (Ctrl+B, Ctrl+I)."
                    className="flex-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 rounded-3xl p-6 text-sm outline-none focus:ring-2 focus:ring-gray-950 dark:focus:ring-gray-150 focus:border-transparent transition shadow-sm resize-none font-mono leading-relaxed overflow-y-auto"
                  />
                )}

                {/* 2.2 Live Markdown Preview Renderer */}
                {(editorMode === "preview" || editorMode === "split") && (
                  <div className="flex-1 border border-gray-150/40 dark:border-gray-800/80 bg-white dark:bg-gray-900 rounded-3xl p-7.5 shadow-sm overflow-y-auto preview-pane animate-in fade-in">
                    {content.trim() === "" ? (
                      <div className="text-gray-400 text-xs italic">
                        Document is empty. Write something on the editor.
                      </div>
                    ) : (
                      <div
                        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                      />
                    )}
                  </div>
                )}

              </div>
            ) : (
              
              /* Attachment captures Tab */
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto animate-in fade-in">
                {/* Drag drop area */}
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100/50 dark:hover:bg-gray-900 transition relative shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {uploading ? "Uploading capture..." : "Click or drag to upload Screenshot Capture"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-550 mt-1">Supports PNG, JPG, JPEG up to 5MB</p>
                </div>

                {/* Images grid rendering */}
                {attachments.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                    <p className="text-gray-400 dark:text-gray-500 text-xs.5 leading-relaxed max-w-xs">
                      No screenshot captures uploaded yet. Scan textbook charts or codes!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5.5 mt-8 shrink-0">
                    {attachments.map((img) => {
                      const resolvedUrl = img.url.startsWith("http") ? img.url : `http://localhost:5000${img.url}`;
                      return (
                        <div
                          key={img.id}
                          className="group relative border border-gray-150/40 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                          <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolvedUrl}
                              alt="Attachment Capture"
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          </div>
                          
                          <div className="p-3 flex items-center justify-end border-t border-gray-100 dark:border-gray-855 bg-gray-50/20 dark:bg-gray-950/20 shrink-0 select-none">
                            <button
                              onClick={() => handleImageDelete(img.id)}
                              className="p-1.5 text-gray-450 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                              title="Delete capture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>



          {/* Floating AI summarizer FAB trigger */}
          {tab === "text" && (
            <button
              onClick={handleSummarize}
              className="absolute bottom-16 right-8 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold text-xs.5.5 px-5 py-3 rounded-full shadow-2xl hover:opacity-90 active:scale-97 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer z-40 border border-gray-800 dark:border-gray-150"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 dark:text-yellow-500 animate-pulse" />
              AI Study Summary
            </button>
          )}

        </div>

      </div>

      {/* AI Conversational Summary slide-over panel */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/45 dark:bg-black/60 flex justify-end z-50 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full p-8 shadow-2xl flex flex-col justify-between border-l border-gray-100 dark:border-gray-800 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  <h3 className="text-sm.5 font-bold text-gray-950 dark:text-white">AI Study Assistant</h3>
                </div>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-650 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="border border-gray-150/40 dark:border-gray-850 rounded-2.5xl p-5 bg-gray-50 dark:bg-gray-950 min-h-[340px] max-h-[calc(100vh-270px)] overflow-y-auto shadow-inner">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mb-1" />
                    <p className="text-xs.5 text-gray-400">Gemini is summarizing your learning...</p>
                    <div className="flex gap-1.5 mt-2">
                      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce delay-75" />
                      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce delay-150" />
                      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs.5 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-sans preview-pane">
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3.5 mt-6 shrink-0 select-none">
              {!aiLoading && summary && (
                <>
                  {!isSummaryError && (
                    <button
                      onClick={() => handleInsertText(summary)}
                      className="w-full py-3.5 text-xs.5 font-bold rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:opacity-90 active:scale-97 transition cursor-pointer shadow-md border border-transparent animate-in zoom-in-95 duration-200"
                    >
                      Append to Notes
                    </button>
                  )}

                  <div className={`grid ${isSummaryError ? "grid-cols-1" : "grid-cols-2"} gap-2 relative`}>
                    <button
                      onClick={() => handleCopyText(summary)}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 text-[10px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-950 transition cursor-pointer"
                      title="Copy summary to clipboard"
                    >
                      {copyStatus ? (
                        <>
                          <Check className="w-4 h-4 text-green-500 shrink-0 animate-in zoom-in" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {!isSummaryError && (
                      <div className="relative">
                        <button
                          onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                          className="flex flex-col items-center justify-center gap-1.5 py-3 w-full text-[10px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-950 transition cursor-pointer"
                          title="Download options"
                        >
                          <FileDown className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>Download</span>
                        </button>

                        {showDownloadDropdown && (
                          <div className="absolute bottom-full mb-2 right-0 w-44 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 p-1 flex flex-col gap-0.5 animate-in slide-in-from-bottom-2 duration-150">
                            <button
                              onClick={() => { handleDownloadPDF(); setShowDownloadDropdown(false); }}
                              className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold text-left rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>PDF Document (.pdf)</span>
                            </button>
                            <button
                              onClick={() => { handleDownloadWord(); setShowDownloadDropdown(false); }}
                              className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold text-left rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>Word Document (.doc)</span>
                            </button>
                            <button
                              onClick={() => { handleDownloadMarkdown(); setShowDownloadDropdown(false); }}
                              className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold text-left rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>Markdown File (.md)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSummarize}
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold rounded-2xl border border-dashed border-gray-250 dark:border-gray-850 text-indigo-500 hover:bg-indigo-500/5 transition cursor-pointer"
                  >
                    <Undo className="w-3.5 h-3.5 animate-spin-reverse" />
                    Regenerate Summary
                  </button>
                </>
              )}
              
              <button
                onClick={() => { setShowSummaryModal(false); setShowDownloadDropdown(false); }}
                className="w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-650 transition text-center cursor-pointer"
              >
                Close Assistant Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini OCR extracted Text Modal Dialog card */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6.5 shadow-2xl flex flex-col justify-between border border-gray-150/40 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50 dark:border-gray-850 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-yellow-500 animate-pulse" />
                  <h3 className="text-xs.5 font-bold text-gray-950 dark:text-white">Gemini Image Scanner OCR</h3>
                </div>
                <button
                  onClick={() => setShowOcrModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="border border-gray-150/40 dark:border-gray-850 rounded-2.5xl p-4.5 bg-gray-50 dark:bg-gray-950 min-h-[220px] max-h-[340px] overflow-y-auto shadow-inner">
                {!ocrText && !ocrLoadingId ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-center gap-2">
                    <p className="text-xs text-gray-400">Loading OCR string...</p>
                  </div>
                ) : ocrLoadingId ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                    <p className="text-xs.5 text-gray-450">Gemini is reading text inside image...</p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                    {ocrText}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 shrink-0 select-none">
              <button
                onClick={() => setShowOcrModal(false)}
                className="flex-1 py-3 text-xs.5 font-bold rounded-2xl border border-gray-250 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950 transition cursor-pointer"
              >
                Close
              </button>
              
              {ocrText && (
                <>
                  <button
                    onClick={() => handleCopyText(ocrText)}
                    className="flex-1 py-3 text-xs.5 font-bold rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-gray-950 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copyStatus ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyStatus ? "Copied!" : "Copy Text"}</span>
                  </button>
                  
                  <button
                    onClick={() => { handleInsertText(ocrText); setShowOcrModal(false); }}
                    className="flex-1 py-3 text-xs.5 font-bold rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:opacity-90 active:scale-97 transition cursor-pointer"
                  >
                    Insert to Note
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close modal picker helper if open */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
      )}

    </div>
  );
}