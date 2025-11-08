import { Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <div className="text-center space-y-6 mb-12 px-4">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          Powered by Advanced OCR Technology
        </span>
      </div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
        Extract Text from Images
      </h1>

      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Upload photos of books, handwritten notes, or documents and instantly
        convert them to editable text using AI-powered OCR
      </p>

      <div className="flex flex-wrap gap-8 justify-center pt-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Instant Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>100% Browser-Based</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>No Data Upload</span>
        </div>
      </div>
    </div>
  );
};
