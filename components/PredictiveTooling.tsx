import React, { useState } from 'react';
import type { Tool } from '../types';
import { predictToolsForJob } from '../services/geminiService';
import { BrainIcon } from './icons/BrainIcon';

interface PredictiveToolingProps {
  onToolsPredicted: (tools: Tool[]) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PredictiveTooling: React.FC<PredictiveToolingProps> = ({ onToolsPredicted, addToast }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      addToast('Please enter a job description.', 'error');
      return;
    }

    setIsPredicting(true);
    try {
      const predictedTools = await predictToolsForJob(jobDescription);
      if (predictedTools.length > 0) {
        onToolsPredicted(predictedTools);
        addToast(`AI predicted ${predictedTools.length} tools for the job.`, 'success');
        setJobDescription('');
      } else {
        addToast('The AI could not determine a tool list for that description.', 'info');
      }
    } catch (error) {
      console.error(error);
      addToast('An error occurred while predicting the tool list.', 'error');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-5 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <BrainIcon className="w-6 h-6 text-cyan-400" />
        Predictive Tooling
      </h3>
      <p className="text-sm text-gray-400 mb-4">Describe a maintenance job and let AI generate a probable list of needed tools.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-300 mb-1">
            Maintenance Job Description
          </label>
          <textarea
            id="job-description"
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="e.g., Perform a 500-hour inspection on a Cessna Citation X"
            disabled={isPredicting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPredicting || !jobDescription.trim()}
            className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isPredicting ? 'Generating...' : 'Generate Tool List'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictiveTooling;
