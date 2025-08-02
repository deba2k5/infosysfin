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
import { groqService, DiagnosisResult } from '@/services/groqService';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';
import ReadPageButton from '@/components/ReadPageButton';

const CropHealth = () => {
  console.log('CropHealth component rendered'); // Debug log
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<DiagnosisResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Real-time crop analysis using Groq VLM
  const analyzeCropImage = async (imageFile: File): Promise<DiagnosisResult> => {
    return await groqService.analyzeCropImage(imageFile);
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
        title: t('invalidFile'),
        description: t('pleaseSelectImageFile'),
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
        title: t('noImageSelected'),
        description: t('pleaseSelectOrCaptureImage'),
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeCropImage(selectedImage);
      setDiagnosisResult(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      
      toast({
        title: t('analysisComplete'),
        description: t('detectedWithConfidence', { disease: result.disease, confidence: result.confidence.toFixed(1) }),
        variant: result.severity === 'high' ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: t('analysisFailed'),
        description: t('failedToAnalyzeImage'),
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
        <h2 className="text-green-800 font-bold">DEBUG: CropHealth Page with Groq VLM Integration!</h2>
        <p className="text-green-700">Real-time crop disease analysis using Groq's Vision Language Model is now active.</p>
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text flex items-center gap-2">
            {t('cropHealth')}
            <SpeakButton textKey="cropHealth" />
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('uploadImageForDiagnosis')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ReadPageButton text={t('cropHealthPageReadout')} />
          <Leaf className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">
            Groq VLM Model
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload & Analysis */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>{t('uploadPlantImage')}</span>
            </CardTitle>
            <CardDescription>
              {t('captureOrUploadImage')}
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
                {t('capturePhoto')}
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('uploadImage')}
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
                  {t('analyzingWithGroq')}
                </>
              ) : (
                <>
                  <Leaf className="h-4 w-4 mr-2" />
                  {t('analyzePlantHealth')}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              <span className="font-semibold">Note:</span> {t('diseaseDetectionNote')}
            </p>

            {/* Supported Crops */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">{t('supportedCrops')}</p>
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
                <span>{t('diagnosisResults')}</span>
              </CardTitle>
              <CardDescription>
                {t('aiAnalysisCompleted')}
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
                    <p className="text-sm text-muted-foreground">{t('confidenceScore')}</p>
                    <Progress value={diagnosisResult.confidence} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {diagnosisResult.confidence.toFixed(1)}% {t('accuracy')}
                    </p>
                  </div>

                  <p className="text-sm">{diagnosisResult.description}</p>
                </div>

                {/* Treatment */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>{t('recommendedTreatment')}</span>
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
                    <span>{t('preventionTips')}</span>
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
                    {t('saveReport')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    {t('share')}
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
                <span>{t('recentAnalysis')}</span>
              </CardTitle>
              <CardDescription>
                {t('previousCropHealthChecks')}
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
                          {result.confidence.toFixed(1)}% {t('confidence')}
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
          <span>{t('tipsForBetterAnalysis')}</span>
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">{t('imageQuality')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('useGoodLighting')}</li>
                <li>• {t('focusOnAffectedAreas')}</li>
                <li>• {t('avoidShadowsAndBlur')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t('plantParts')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('includeLeavesStemsFruits')}</li>
                <li>• {t('showHealthyAndAffectedParts')}</li>
                <li>• {t('multipleAnglesIfPossible')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t('bestPractices')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('regularMonitoring')}</li>
                <li>• {t('earlyDetectionIsKey')}</li>
                <li>• {t('followTreatmentRecommendations')}</li>
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
          <span className="text-white font-bold">{t('futureFeatures')}</span>
        </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-white font-semibold text-base md:text-lg">
            <li>
              <span className="font-bold">{t('droneBasedDiseaseDetection')}</span> <span className="font-medium">{t('droneDiseaseDetectionDesc')}</span>
            </li>
            <li>
              <span className="font-bold">{t('automatedPesticideSpraying')}</span> <span className="font-medium">{t('automatedPesticideSprayingDesc')}</span>
            </li>
            <li>
              <span className="font-bold">{t('smartPlantWatering')}</span> <span className="font-medium">{t('smartPlantWateringDesc')}</span>
            </li>
          </ul>
          <p className="mt-4 text-sm md:text-base font-semibold text-white">
            {t('futureFeaturesNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropHealth; 
