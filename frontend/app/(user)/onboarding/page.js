'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Phone, Check, AlertCircle, Loader, Volume2, CheckCircle2 } from 'lucide-react';
import apiClient from '../../lib/api';

export default function OnboardingPage() {
  const { user } = useAuth();
  const localContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('ready'); // ready, connecting, live, processing, completed
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [fraudScore, setFraudScore] = useState(0);
  const [decision, setDecision] = useState(null);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  // Initialize session on mount
  useEffect(() => {
    if (user && status === 'ready') {
      initializeSession();
    }
  }, [user]);

  async function initializeSession() {
    try {
      setLoading(true);
      const data = await apiClient.initVideoSession(user.phone, user.name);

      if (data.ok) {
        setSessionId(data.session_id);
        setCurrentStep(data.current_step);
        setTotalSteps(data.total_steps);
        setPrompt(data.prompt);
        setStatus('connecting');
        await requestPermissions();
      } else {
        setErrorMessage(data.detail || 'Failed to initialize session');
      }
    } catch (error) {
      console.error('Init error:', error);
      setErrorMessage('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function requestPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Display video
      if (localContainerRef.current) {
        localContainerRef.current.srcObject = stream;
      }

      setStatus('live');
      startRecording(stream);
    } catch (error) {
      setErrorMessage('Camera/microphone access denied');
      setStatus('ready');
    }
  }

  function startRecording(stream) {
    try {
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // You can process audio here - send to backend for STT
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  }

  async function submitAnswer(userAnswer) {
    if (!sessionId) return;

    try {
      setLoading(true);
      const data = await apiClient.submitAnswer(user.phone, sessionId, currentStep, userAnswer, transcript);

      if (data.ok) {
        setAnswers({ ...answers, [`step_${currentStep}`]: userAnswer });

        if (data.session_complete) {
          // All steps done, process session
          await finalizeSession();
        } else {
          // Move to next step
          setCurrentStep(data.current_step);
          setPrompt(data.prompt);
          setTranscript('');
          setFaceConfidence(Math.random() * 20 + 80); // Mock face confidence
        }
      } else {
        setErrorMessage(data.detail || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage('Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function finalizeSession() {
    try {
      setStatus('processing');
      setLoading(true);

      // Mock risk scoring - in production, this comes from backend analysis
      const mockFraudScore = Math.random() * 30;
      const mockFaceConfidence = faceConfidence || 85;

      const data = await apiClient.completeSession(user.phone, sessionId, mockFaceConfidence, mockFraudScore, transcript);

      if (data.ok) {
        setFraudScore(data.fraud_score);
        setDecision(data);
        setStatus('completed');
      } else {
        setErrorMessage('Processing failed');
      }
    } catch (error) {
      console.error('Finalize error:', error);
      setErrorMessage('Failed to process verification');
    } finally {
      setLoading(false);
    }
  }

  // Early return for loading/redirect states
  if (!user) {
    return (
      <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto w-full max-w-2xl text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-[#2f66c9]" />
        </div>
      </main>
    );
  }

  // Completed state
  if (status === 'completed' && decision) {
    const isApproved = decision.decision === 'approved';
    return (
      <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <section className="mx-auto w-full max-w-2xl space-y-6">
          <div className={`rounded-3xl p-8 text-center ${isApproved ? 'bg-green-50' : 'bg-yellow-50'}`}>
            {isApproved ? (
              <>
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h1 className="text-3xl font-bold text-green-900">Verification Successful!</h1>
                <p className="mt-2 text-green-700">{decision.message}</p>
                <p className="mt-1 text-sm text-green-600">Risk Score: {decision.risk_score}/100</p>
                {isApproved && decision.offer_id && (
                  <Link
                    href="/offer"
                    className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
                  >
                    View Your Offer
                  </Link>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto h-16 w-16 text-yellow-600 mb-4" />
                <h1 className="text-3xl font-bold text-yellow-900">{decision.message}</h1>
                <p className="mt-2 text-yellow-700">Risk Score: {decision.risk_score}/100</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="mt-6 rounded-lg bg-yellow-600 px-6 py-3 font-bold text-white hover:bg-yellow-700"
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  // Live/recording state
  return (
    <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl card-clean px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4a7be0]">Video KYC Verification</p>
            <h1 className="title-font mt-1 text-2xl font-bold text-[#1b3155] sm:text-3xl">Identity Verification</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-[#1f4378]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#1f4378] hover:border-[#1f4378]/45">
            Back to Dashboard
          </Link>
        </header>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1b3155]">Progress</h3>
              <span className="text-xs font-semibold text-[#6e81a0]">{currentStep} of {totalSteps}</span>
            </div>
            <div className="w-full bg-[#e5ecf8] rounded-full h-2">
              <div
                className="bg-[#2f66c9] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Video Feed */}
          <div className="rounded-[1.8rem] blue-gradient p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-3">Your Video Feed</p>
            <video
              ref={localContainerRef}
              autoPlay
              muted
              playsInline
              className="w-full h-80 rounded-xl bg-black/40 object-cover"
            />
          </div>

          {/* Prompt & Response */}
          <div className="rounded-2xl border border-[#d7e3f8] bg-white p-6">
            <div className="flex items-start gap-3 mb-4">
              <Volume2 className="h-5 w-5 text-[#2f66c9] mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6e81a0]">Step {currentStep}</p>
                <p className="mt-2 text-lg font-semibold text-[#1b3155]">{prompt}</p>
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-4">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your response will appear here or type your answer..."
                className="w-full rounded-lg border border-[#d7e3f8] p-3 text-sm focus:border-[#2f66c9] focus:outline-none"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Status Indicators */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                {faceConfidence > 70 ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs text-[#6e81a0]">Face Detected {faceConfidence ? `(${faceConfidence.toFixed(0)}%)` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                ) : (
                  <div className="h-2 w-2 bg-gray-300 rounded-full" />
                )}
                <span className="text-xs text-[#6e81a0]">{isRecording ? 'Recording...' : 'Ready'}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => submitAnswer(transcript)}
              disabled={loading || !transcript.trim()}
              className="mt-6 w-full rounded-lg bg-[#2f66c9] px-4 py-3 text-sm font-bold text-white transition enabled:hover:bg-[#224f9f] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? (
                <>
                  <Loader className="inline h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : currentStep === totalSteps ? (
                'Complete Verification'
              ) : (
                'Next Step'
              )}
            </button>

            {errorMessage && (
              <p className="mt-3 text-sm font-semibold text-[#b42318]">{errorMessage}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
