
import React, { useState, useRef } from 'react';
import { AnalysisResult } from './types';
import { analyzeResumeMatch } from './services/geminiService';
import ResultSection from './components/ResultSection';

// Declare global pdfjsLib for TypeScript environment
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const App: React.FC = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isDraggingJD, setIsDraggingJD] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!resume || !jobDescription) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeResumeMatch(resume, jobDescription);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    setParsingProgress(0);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
      setParsingProgress(Math.round((i / pdf.numPages) * 100));
    }
    
    return fullText.trim();
  };

  const handleFile = async (file: File, setter: (val: string) => void, isResume: boolean) => {
    if (isResume) {
      setIsParsingResume(true);
      setResumeFileName(file.name);
    } else {
      setIsParsingJD(true);
      setJdFileName(file.name);
    }
    setParsingProgress(0);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const text = await parsePDF(file);
        if (!text) throw new Error('No readable text found in PDF');
        setter(text);
      } else if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === 'string') {
            setter(text);
            setParsingProgress(100);
          }
        };
        reader.readAsText(file);
      } else {
        throw new Error('Unsupported file type. Please use .txt or .pdf');
      }
    } catch (err: any) {
      console.error('File processing error:', err);
      setError(err.message || 'Failed to process file.');
      if (isResume) setResumeFileName(null);
      else setJdFileName(null);
    } finally {
      setTimeout(() => {
        setIsParsingResume(false);
        setIsParsingJD(false);
      }, 300);
    }
  };

  const handleDragOver = (e: React.DragEvent, isResume: boolean) => {
    e.preventDefault();
    if (isResume) setIsDraggingResume(true);
    else setIsDraggingJD(true);
  };

  const handleDragLeave = (isResume: boolean) => {
    if (isResume) setIsDraggingResume(false);
    else setIsDraggingJD(false);
  };

  const onDrop = (e: React.DragEvent, setter: (val: string) => void, isResume: boolean) => {
    e.preventDefault();
    setIsDraggingResume(false);
    setIsDraggingJD(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file, setter, isResume);
  };

  const handleClear = (isResume: boolean) => {
    if (isResume) {
      setResume('');
      setResumeFileName(null);
    } else {
      setJobDescription('');
      setJdFileName(null);
    }
    setResult(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">MatchAI</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase ml-2 tracking-wider">Engine v2.1</span>
          </div>
          <div className="text-sm text-gray-500 font-medium">Recruitment Matching Platform</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Intelligent Talent Matching.</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Upload candidate materials to perform deep semantic alignment against any job description.
            Our engine evaluates role fit, skill gaps, and experience seniority using advanced NLP.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Resume Input Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Candidate Resume</label>
                {resumeFileName && !isParsingResume && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded flex items-center gap-1 border border-blue-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    {resumeFileName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {resume && !isParsingResume && (
                  <button 
                    onClick={() => handleClear(true)}
                    className="text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors px-2"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={isParsingResume}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 
                    bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all shadow-sm
                    active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                  `}
                >
                  {isParsingResume ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  {isParsingResume ? `Parsing ${parsingProgress}%` : 'Upload Resume'}
                </button>
                <input 
                  ref={resumeInputRef}
                  type="file" 
                  accept=".txt,.pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, setResume, true);
                    e.target.value = '';
                  }} 
                />
              </div>
            </div>
            <div 
              onDragOver={(e) => handleDragOver(e, true)}
              onDragLeave={() => handleDragLeave(true)}
              onDrop={(e) => onDrop(e, setResume, true)}
              className="relative group h-full"
            >
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                readOnly={isParsingResume}
                placeholder="Paste candidate resume text or drop a file here for preview..."
                className={`
                  w-full h-80 p-5 rounded-2xl border transition-all outline-none resize-none text-sm leading-relaxed
                  ${isDraggingResume ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400'}
                `}
              />
              
              {/* Drag Overlay */}
              {isDraggingResume && !isParsingResume && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-blue-600/10 backdrop-blur-[2px] border-2 border-dashed border-blue-500 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                  <div className="bg-white p-4 rounded-full shadow-lg mb-4 text-blue-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-blue-700 font-bold text-lg">Drop Resume Here</p>
                  <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest mt-1">Supports PDF & TXT</p>
                </div>
              )}

              {isParsingResume && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-2xl animate-in fade-in">
                  <div className="w-12 h-12 relative mb-3">
                    <svg className="animate-spin w-full h-full text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-800">
                      {parsingProgress}%
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-700 tracking-wide uppercase">Extracting Text...</span>
                </div>
              )}
            </div>
          </div>

          {/* JD Input Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Job Description</label>
                {jdFileName && !isParsingJD && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded flex items-center gap-1 border border-gray-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    {jdFileName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {jobDescription && !isParsingJD && (
                  <button 
                    onClick={() => handleClear(false)}
                    className="text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors px-2"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => jdInputRef.current?.click()}
                  disabled={isParsingJD}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 
                    bg-gray-50 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all shadow-sm active:scale-95
                    disabled:opacity-70 disabled:cursor-not-allowed
                  `}
                >
                  {isParsingJD ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-gray-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {isParsingJD ? 'Importing...' : 'Upload JD'}
                </button>
                <input 
                  ref={jdInputRef}
                  type="file" 
                  accept=".txt" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, setJobDescription, false);
                    e.target.value = '';
                  }} 
                />
              </div>
            </div>
            <div 
              onDragOver={(e) => handleDragOver(e, false)}
              onDragLeave={() => handleDragLeave(false)}
              onDrop={(e) => onDrop(e, setJobDescription, false)}
              className="relative group h-full"
            >
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                readOnly={isParsingJD}
                placeholder="Paste job description requirements here..."
                className={`
                  w-full h-80 p-5 rounded-2xl border transition-all outline-none resize-none text-sm leading-relaxed
                  ${isDraggingJD ? 'border-gray-500 ring-2 ring-gray-400/20 bg-gray-50' : 'border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400'}
                `}
              />
              
              {/* Drag Overlay */}
              {isDraggingJD && !isParsingJD && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-gray-600/10 backdrop-blur-[2px] border-2 border-dashed border-gray-400 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                  <div className="bg-white p-4 rounded-full shadow-lg mb-4 text-gray-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-bold text-lg">Drop Job Description</p>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mt-1">Supports TXT</p>
                </div>
              )}

              {isParsingJD && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-2xl animate-in fade-in">
                  <svg className="animate-spin h-8 w-8 text-gray-400 mb-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reading Document...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mb-16">
          <button
            onClick={handleAnalyze}
            disabled={loading || isParsingResume || isParsingJD || !resume || !jobDescription}
            className={`
              px-10 py-5 rounded-2xl font-bold text-white shadow-xl transform transition-all active:scale-95
              flex items-center gap-3 text-lg
              ${loading || isParsingResume || isParsingJD || !resume || !jobDescription 
                ? 'bg-gray-300 cursor-not-allowed grayscale' 
                : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200'
              }
            `}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing NLP Models...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Calculate Match Score
              </>
            )}
          </button>
          {error && <p className="text-rose-600 text-sm font-medium bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">{error}</p>}
        </div>

        {result && <ResultSection result={result} />}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl opacity-60">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-gray-400 font-medium tracking-wide">Enter materials above to begin matching</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-2 font-medium">Developed for High-Precision Talent Matching</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Semantic Engine v2.1 • Multi-Modal Embeddings • Pro Logic</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
