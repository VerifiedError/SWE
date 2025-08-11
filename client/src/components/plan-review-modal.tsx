import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PlanStep {
  step: number;
  title: string;
  description: string;
  estimatedTime: string;
  files: string[];
}

interface CodeChange {
  file: string;
  type: 'create' | 'modify' | 'delete';
  description: string;
  diff?: string;
}

interface ExecutionPlan {
  title: string;
  summary: string;
  steps: PlanStep[];
  estimatedTotalTime: string;
  risksAndConsiderations: string[];
  codeChanges: CodeChange[];
}

interface PlanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ExecutionPlan | null;
  taskTitle: string;
  onApprove: () => void;
  onRequestChanges: (feedback: string) => void;
}

export function PlanReviewModal({
  isOpen,
  onClose,
  plan,
  taskTitle,
  onApprove,
  onRequestChanges,
}: PlanReviewModalProps) {
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleRequestChanges = () => {
    if (feedback.trim()) {
      onRequestChanges(feedback.trim());
      setFeedback("");
      setShowFeedbackForm(false);
      onClose();
    }
  };

  const handleApprove = () => {
    onApprove();
    onClose();
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Plan Review: {taskTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-96 space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Execution Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">{plan.summary}</p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge className="bg-blue-100 text-blue-800">
                  Estimated Time: {plan.estimatedTotalTime}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {plan.steps.length} Steps
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Execution Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Implementation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.steps.map((step) => (
                  <div key={step.step} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {step.estimatedTime}
                        </Badge>
                        {step.files.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {step.files.map((file, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {file}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code Changes */}
          {plan.codeChanges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Proposed Code Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.codeChanges.map((change, idx) => (
                    <div key={idx} className="border border-gray-200 rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          className={`text-xs ${
                            change.type === 'create' ? 'bg-green-100 text-green-800' :
                            change.type === 'modify' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {change.type.toUpperCase()}
                        </Badge>
                        <code className="text-sm font-mono text-gray-800">{change.file}</code>
                      </div>
                      <p className="text-sm text-gray-600">{change.description}</p>
                      {change.diff && (
                        <div className="mt-2 bg-gray-50 rounded p-2 font-mono text-xs overflow-x-auto">
                          <pre>{change.diff}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risks and Considerations */}
          {plan.risksAndConsiderations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Risks & Considerations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1">
                  {plan.risksAndConsiderations.map((risk, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-500 mt-0.5"></i>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Feedback Form */}
          {showFeedbackForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Request Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe what changes you'd like to see in the plan..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {showFeedbackForm ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowFeedbackForm(false)}
              >
                Back
              </Button>
              <Button
                onClick={handleRequestChanges}
                disabled={!feedback.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Submit Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowFeedbackForm(true)}
                className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
              >
                Request Changes
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve & Execute
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
