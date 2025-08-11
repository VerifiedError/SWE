import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SolutionPlan {
  taskType: string;
  rootCause: string;
  changes: Array<{
    file: string;
    type: 'modify' | 'add' | 'delete';
    description: string;
    location: string;
  }>;
  tests: Array<{
    name: string;
    description: string;
  }>;
  validationSteps: string[];
}

interface CodeChange {
  filePath: string;
  originalCode: string;
  modifiedCode: string;
  changeType: 'modify' | 'add' | 'delete';
  description: string;
  lineNumbers: { start: number; end: number };
}

export function SWEAgentPanel() {
  const [issueDescription, setIssueDescription] = useState("");
  const [codeContext, setCodeContext] = useState("");
  const [analysis, setAnalysis] = useState<SolutionPlan | null>(null);
  const [implementation, setImplementation] = useState<CodeChange[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async ({ issueDescription, codeContext }: { issueDescription: string; codeContext?: string }) => {
      return apiRequest('POST', '/api/swe/analyze', { issueDescription, codeContext });
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setCurrentStep(1);
      toast({
        title: "Analysis Complete",
        description: "Issue analyzed successfully by SWE Agent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze issue",
        variant: "destructive",
      });
    },
  });

  const implementMutation = useMutation({
    mutationFn: async ({ plan, codeContext }: { plan: SolutionPlan; codeContext?: string }) => {
      return apiRequest('POST', '/api/swe/implement', { plan, codeContext });
    },
    onSuccess: (data) => {
      setImplementation(data.implementation);
      setCurrentStep(2);
      toast({
        title: "Implementation Complete",
        description: "Code implementation generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Implementation Failed",
        description: error.message || "Failed to implement solution",
        variant: "destructive",
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ originalIssue, plan, codeChanges }: { originalIssue: string; plan: SolutionPlan; codeChanges: CodeChange[] }) => {
      return apiRequest('POST', '/api/swe/validate', { originalIssue, plan, codeChanges });
    },
    onSuccess: (data) => {
      setValidation(data.validation);
      setCurrentStep(3);
      toast({
        title: "Validation Complete",
        description: `Solution validated with score: ${data.validation.score}/10`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate solution",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide an issue description",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate({ issueDescription, codeContext: codeContext || undefined });
  };

  const handleImplement = () => {
    if (!analysis) return;
    implementMutation.mutate({ plan: analysis, codeContext: codeContext || undefined });
  };

  const handleValidate = () => {
    if (!analysis || !implementation.length) return;
    validateMutation.mutate({ 
      originalIssue: issueDescription, 
      plan: analysis, 
      codeChanges: implementation 
    });
  };

  const resetWorkflow = () => {
    setIssueDescription("");
    setCodeContext("");
    setAnalysis(null);
    setImplementation([]);
    setValidation(null);
    setCurrentStep(0);
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  const getTaskTypeColor = (taskType: string) => {
    const colors = {
      bug_fix: 'bg-red-100 text-red-800',
      feature_add: 'bg-blue-100 text-blue-800',
      refactor: 'bg-yellow-100 text-yellow-800',
      test_generation: 'bg-green-100 text-green-800',
      documentation: 'bg-purple-100 text-purple-800',
      performance: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800',
    };
    return colors[taskType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-robot text-blue-600"></i>
              <span>Advanced SWE Agent</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Autonomous code analysis, generation, and issue resolution
            </p>
          </div>
          <Button variant="outline" onClick={resetWorkflow} size="sm">
            <i className="fas fa-refresh mr-2"></i>
            Reset
          </Button>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Analyze</span>
            <span>Implement</span>
            <span>Validate</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={currentStep === 0 ? "input" : currentStep === 1 ? "analysis" : currentStep === 2 ? "implementation" : "validation"}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="input">1. Input</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysis}>2. Analysis</TabsTrigger>
            <TabsTrigger value="implementation" disabled={!implementation.length}>3. Implementation</TabsTrigger>
            <TabsTrigger value="validation" disabled={!validation}>4. Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description *
              </label>
              <Textarea
                placeholder="Describe the software issue, bug, or feature request you want to solve..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Context (Optional)
              </label>
              <Textarea
                placeholder="Provide relevant code context, error messages, or existing implementation..."
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                className="h-24"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={!issueDescription.trim() || analyzeMutation.isPending}
              className="w-full"
            >
              {analyzeMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Analyzing Issue...
                </>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Analyze Issue
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {analysis && (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={getTaskTypeColor(analysis.taskType)}>
                    {analysis.taskType.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {analysis.changes.length} changes • {analysis.tests.length} tests
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Root Cause Analysis</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {analysis.rootCause}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Planned Changes</h4>
                  <div className="space-y-2">
                    {analysis.changes.map((change, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{change.file}</span>
                          <Badge variant="outline" className="text-xs">
                            {change.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{change.description}</p>
                        {change.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {change.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleImplement} 
                  disabled={implementMutation.isPending}
                  className="w-full"
                >
                  {implementMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Implementing Solution...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-code mr-2"></i>
                      Implement Solution
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            {implementation.length > 0 && (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  Generated {implementation.length} code implementation(s)
                </div>

                <div className="space-y-4">
                  {implementation.map((change, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{change.filePath}</span>
                          <Badge variant="outline">{change.changeType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{change.description}</p>
                      </div>
                      
                      <div className="p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Code Changes:</h5>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                          <pre>{change.modifiedCode || 'No code preview available'}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleValidate} 
                  disabled={validateMutation.isPending}
                  className="w-full"
                >
                  {validateMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Validating Solution...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Validate Solution
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            {validation && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${validation.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">
                      {validation.isValid ? 'Solution Valid' : 'Solution Invalid'}
                    </span>
                  </div>
                  <Badge variant={validation.score >= 7 ? 'default' : validation.score >= 4 ? 'secondary' : 'destructive'}>
                    Score: {validation.score}/10
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Validation Feedback</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {validation.feedback}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={resetWorkflow} variant="outline" className="flex-1">
                    <i className="fas fa-redo mr-2"></i>
                    Start Over
                  </Button>
                  <Button className="flex-1" disabled={!validation.isValid}>
                    <i className="fas fa-download mr-2"></i>
                    Export Solution
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}