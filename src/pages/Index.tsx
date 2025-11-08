import { Hero } from "@/components/Hero";
import { OCRUpload } from "@/components/OCRUpload";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Hero />
        <OCRUpload />
      </div>
    </div>
  );
};

export default Index;
