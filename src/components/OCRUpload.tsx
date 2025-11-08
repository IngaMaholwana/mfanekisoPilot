import { useState, useCallback } from "react";
import { Upload, Loader2, Copy, CheckCircle2, Camera, Download, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Tesseract from "tesseract.js";
import { ImagePreprocessor } from "./ImagePreprocessor";
import { CameraCapture } from "./CameraCapture";
import { jsPDF } from "jspdf";

interface QAPair {
  question: string;
  answer: string;
  timestamp: number;
}

export const OCRUpload = () => {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreprocessor, setShowPreprocessor] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const { toast } = useToast();

  const processOCR = useCallback(
    async (imageDataUrl: string) => {
      setIsProcessing(true);
      setProgress(0);
      setShowPreprocessor(false);

      // 🤖 AI ENHANCEMENT POINT #0: Pre-processing with AI
      // Before OCR, optionally use AI to enhance image quality:
      // - Auto-rotate and deskew the image
      // - Enhance contrast and remove noise
      // - Detect and crop to text regions
      // Example: const enhancedImage = await callAI({ task: "enhance-image", image: imageDataUrl });

      try {
        const result = await Tesseract.recognize(imageDataUrl, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });

        setExtractedText(result.data.text);
        setImage(null); // Clear image after processing
        
        // 🤖 AI ENHANCEMENT POINT #1: Post-OCR Text Processing
        // After extracting text, call AI to:
        // - Fix OCR errors and improve accuracy
        // - Format and structure the text better
        // - Remove noise and artifacts from extraction
        // Example: const improvedText = await callAI({ task: "clean", text: result.data.text });
        
        toast({
          title: "Text extracted successfully!",
          description: "Your text is ready to copy or use",
        });
      } catch (error) {
        console.error("OCR Error:", error);
        toast({
          title: "Extraction failed",
          description: "Could not extract text from the image",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    },
    [toast]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        setImage(imageDataUrl);
        setExtractedText("");
        setShowPreprocessor(true);
      };

      reader.readAsDataURL(file);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        console.log("File dropped:", file.name);
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        console.log("File selected:", file.name);
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const triggerFileInput = () => {
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Text has been copied successfully",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const saveAsTxt = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Saved as TXT!",
      description: "File has been downloaded successfully",
    });
  };

  const saveAsPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    
    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(extractedText, maxWidth);
    
    doc.setFontSize(12);
    doc.text(lines, margin, margin);
    doc.save(`extracted-text-${Date.now()}.pdf`);
    
    toast({
      title: "Saved as PDF!",
      description: "File has been downloaded successfully",
    });
  };

  const handlePreprocessorCancel = () => {
    setShowPreprocessor(false);
    setImage(null);
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setImage(imageDataUrl);
    setExtractedText("");
    setShowCamera(false);
    setShowPreprocessor(true);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const resetUpload = () => {
    setImage(null);
    setExtractedText("");
    setShowPreprocessor(false);
    setShowCamera(false);
    setQuestion("");
    setQaHistory([]);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !extractedText) {
      toast({
        title: "Cannot ask question",
        description: "Please enter a question and ensure text is extracted",
        variant: "destructive",
      });
      return;
    }

    setIsAnswering(true);

    // 🤖 RAG INTEGRATION POINT: Question Answering
    // This is where you'll integrate RAG (Retrieval Augmented Generation):
    // 1. Embed the question using an embedding model
    // 2. Search for relevant chunks from the extracted text (vector search)
    // 3. Send question + relevant context to LLM
    // 4. Return the answer
    //
    // Example implementation:
    // const answer = await supabase.functions.invoke('rag-answer', {
    //   body: { 
    //     question: question,
    //     context: extractedText,
    //     conversationHistory: qaHistory
    //   }
    // });

    try {
      // Placeholder response - replace with RAG implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAnswer = `This is a placeholder answer. When RAG is implemented, this will analyze the extracted text and provide an intelligent answer to: "${question}"`;

      const newQA: QAPair = {
        question: question,
        answer: mockAnswer,
        timestamp: Date.now(),
      };

      setQaHistory(prev => [...prev, newQA]);
      setQuestion("");
      
      toast({
        title: "Answer generated",
        description: "RAG implementation coming soon!",
      });
    } catch (error) {
      console.error("Question answering error:", error);
      toast({
        title: "Failed to answer question",
        description: "An error occurred while processing your question",
        variant: "destructive",
      });
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
      {/* Upload Area */}
      <Card 
        className={`p-8 bg-gradient-to-b from-card to-card/50 border-2 border-dashed transition-all duration-300 ${
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary"
        }`}
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
        >
          {showCamera ? (
            <CameraCapture
              onCapture={handleCameraCapture}
              onCancel={handleCameraCancel}
            />
          ) : showPreprocessor && image ? (
            <ImagePreprocessor
              image={image}
              onProcess={processOCR}
              onCancel={handlePreprocessorCancel}
            />
          ) : !image ? (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold text-foreground">
                  {isDragging ? "Drop Your Image Here" : "Upload Your Image"}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Drag and drop an image of text, handwritten notes, or a book page
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="flex gap-3">
                <Button onClick={triggerFileInput} size="lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <Button onClick={openCamera} size="lg" variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </Card>

      {/* Results Area */}
      <Card className="p-8 bg-gradient-to-b from-card to-card/50">
        <div className="flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-foreground">
              Extracted Text
            </h3>
            {extractedText && !isProcessing && (
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveAsTxt}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  TXT
                </Button>
                <Button
                  onClick={saveAsPdf}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            )}
          </div>

          {isProcessing ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Processing image...</p>
              <div className="w-full max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {progress}%
                </p>
              </div>
            </div>
          ) : extractedText ? (
            <>
              <div className="flex-1 p-4 bg-muted/30 rounded-lg overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {extractedText}
                </pre>
              </div>
              
              {/* Q&A Section - RAG Ready */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Ask Questions About This Text</h4>
                </div>

                {/* Q&A History */}
                {qaHistory.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto p-3 bg-muted/20 rounded-lg">
                    {qaHistory.map((qa, index) => (
                      <div key={qa.timestamp} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{qa.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">{qa.answer}</p>
                          </div>
                        </div>
                        {index < qaHistory.length - 1 && (
                          <div className="border-t border-border/50" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Question Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about the extracted text..."
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                    disabled={isAnswering}
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={isAnswering || !question.trim()}
                    className="self-end"
                  >
                    {isAnswering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 RAG integration coming soon - questions will be answered using AI based on the extracted text
                </p>
              </div>

              {/* 🤖 AI ENHANCEMENT POINT #2: Generate Lessons & Study Materials
                  Additional AI-powered features to add:
                  - Button: "Generate Lesson" - creates structured lessons from text
                  - Button: "Create Flashcards" - extracts key concepts
                  - Button: "Summarize" - creates condensed version
                  - Button: "Quiz Me" - generates questions from content
              */}
              
              <div className="mt-4 flex gap-3">
                <Button onClick={resetUpload} variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Extract Another Image
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-center">
              <p>Upload an image to extract text</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};