import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Share2,
  History,
  Info,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string[];
  prevention: string[];
  imageUrl: string;
}

const CropHealth = () => {
  console.log('CropHealth component rendered'); // Debug log
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<DiagnosisResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock CNN model response - in real implementation, this would call your CNN API
  const mockCNNAnalysis = async (imageFile: File): Promise<DiagnosisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock results - replace with actual CNN model predictions
    const mockResults = [
      {
        disease: 'Early Blight',
        confidence: 94.5,
        severity: 'medium' as const,
        description: 'Early blight is a common fungal disease affecting tomato plants, characterized by dark brown spots with concentric rings.',
        treatment: [
          'Remove infected leaves immediately',
          'Apply copper-based fungicide',
          'Improve air circulation around plants',
          'Avoid overhead watering'
        ],
        prevention: [
          'Plant resistant varieties',
          'Maintain proper spacing between plants',
          'Use mulch to prevent soil splash',
          'Rotate crops annually'
        ],
        imageUrl: URL.createObjectURL(imageFile)
      },
      {
        disease: 'Healthy Plant',
        confidence: 98.2,
        severity: 'low' as const,
        description: 'Your plant appears to be healthy with no visible signs of disease or pest damage.',
        treatment: [
          'Continue current care routine',
          'Monitor for any changes',
          'Maintain optimal growing conditions'
        ],
        prevention: [
          'Regular inspection',
          'Proper watering schedule',
          'Balanced fertilization',
          'Good garden hygiene'
        ],
        imageUrl: URL.createObjectURL(imageFile)
      },
      {
        disease: 'Powdery Mildew',
        confidence: 87.3,
        severity: 'high' as const,
        description: 'Powdery mildew is a fungal disease that creates white powdery spots on leaves and stems.',
        treatment: [
          'Apply neem oil solution',
          'Use sulfur-based fungicide',
          'Remove severely infected parts',
          'Increase plant spacing'
        ],
        prevention: [
          'Choose resistant varieties',
          'Avoid overhead irrigation',
          'Maintain good air circulation',
          'Apply preventive fungicides'
        ],
        imageUrl: URL.createObjectURL(imageFile)
      }
    ];
    
    // Return random result for demo
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setDiagnosisResult(null);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select or capture an image first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await mockCNNAnalysis(selectedImage);
      setDiagnosisResult(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.disease} (${result.confidence.toFixed(1)}% confidence)`,
        variant: result.severity === 'high' ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setDiagnosisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  const supportedCrops = [
    'Tomato', 'Potato', 'Corn', 'Wheat', 'Rice', 'Cotton', 
    'Soybean', 'Pepper', 'Cucumber', 'Lettuce', 'Spinach'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Debug Header */}
      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <h2 className="text-green-800 font-bold">DEBUG: CropHealth Page Loaded Successfully!</h2>
        <p className="text-green-700">If you can see this, the routing is working correctly.</p>
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Crop Health Diagnosis</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered crop disease detection using advanced CNN models
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">
            CNN Model v2.1
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload & Analysis */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Upload Plant Image</span>
            </CardTitle>
            <CardDescription>
              Capture or upload a clear image of the affected plant part
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview */}
            {previewUrl && (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Plant preview" 
                  className="w-full h-64 object-cover rounded-lg border-2 border-dashed border-primary/20"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCameraCapture}
                className="flex-1 gradient-primary"
                disabled={isAnalyzing}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Analysis Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className="w-full gradient-accent"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing with CNN...
                </>
              ) : (
                <>
                  <Leaf className="h-4 w-4 mr-2" />
                  Analyze Plant Health
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              <span className="font-semibold">Note:</span> Disease detection is powered by a Convolutional Neural Network (CNN) model.
            </p>

            {/* Supported Crops */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Supported Crops:</p>
              <div className="flex flex-wrap gap-1">
                {supportedCrops.map((crop) => (
                  <Badge key={crop} variant="secondary" className="text-xs">
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-6">
          {diagnosisResult && (
            <Card className="agri-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Diagnosis Results</span>
                </CardTitle>
                <CardDescription>
                  AI analysis completed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Disease Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{diagnosisResult.disease}</h3>
                    <Badge className={getSeverityColor(diagnosisResult.severity)}>
                      {diagnosisResult.severity} severity
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                    <Progress value={diagnosisResult.confidence} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {diagnosisResult.confidence.toFixed(1)}% accuracy
                    </p>
                  </div>

                  <p className="text-sm">{diagnosisResult.description}</p>
                </div>

                {/* Treatment */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>Recommended Treatment</span>
                  </h4>
                  <ul className="space-y-1">
                    {diagnosisResult.treatment.map((item, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Prevention Tips</span>
                  </h4>
                  <ul className="space-y-1">
                    {diagnosisResult.prevention.map((item, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Save Report
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis History */}
          {analysisHistory.length > 0 && (
            <Card className="agri-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Recent Analysis</span>
                </CardTitle>
                <CardDescription>
                  Your previous crop health checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisHistory.slice(1).map((result, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                      <img 
                        src={result.imageUrl} 
                        alt="Plant" 
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.disease}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.confidence.toFixed(1)}% confidence
                        </p>
                      </div>
                      <Badge className={getSeverityColor(result.severity)}>
                        {result.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Tips for Better Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Image Quality</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use good lighting</li>
                <li>• Focus on affected areas</li>
                <li>• Avoid shadows and blur</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Plant Parts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Include leaves, stems, fruits</li>
                <li>• Show both healthy and affected parts</li>
                <li>• Multiple angles if possible</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Regular monitoring</li>
                <li>• Early detection is key</li>
                <li>• Follow treatment recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Features Section */}
      <Card className="agri-card border-2 border-dashed border-blue-500 mt-8 bg-transparent backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-white" />
            <span className="text-white font-bold">Future Features (Coming Soon)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-white font-semibold text-base md:text-lg">
            <li>
              <span className="font-bold">Drone-based Disease Detection:</span> <span className="font-medium">Detect crop diseases over large fields using drone imagery and AI for faster, large-scale monitoring.</span>
            </li>
            <li>
              <span className="font-bold">Automated Pesticide Spraying:</span> <span className="font-medium">Use drones to precisely spray pesticides only where needed, reducing chemical use and improving crop health.</span>
            </li>
            <li>
              <span className="font-bold">Smart Plant Watering:</span> <span className="font-medium">Enable drones to water plants based on real-time crop health and soil moisture data, optimizing water usage.</span>
            </li>
          </ul>
          <p className="mt-4 text-sm md:text-base font-semibold text-white">
            These features are under development and will be available in future updates to further empower farmers with advanced drone technology.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropHealth; 
