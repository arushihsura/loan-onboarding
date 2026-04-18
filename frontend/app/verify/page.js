'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
// import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
const TOKEN = process.env.NEXT_PUBLIC_AGORA_TOKEN || null;
const CHANNEL = process.env.NEXT_PUBLIC_AGORA_CHANNEL || 'loan-verification-demo';

const LIVE_PROMPTS = [
  'Please state your monthly income.',
  'Please confirm you consent to loan processing.'
];

function formatDuration(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function getQualityLabel(score) {
  if (score <= 0) return 'Unknown';
  if (score <= 2) return 'Excellent';
  if (score <= 3) return 'Good';
  if (score <= 4) return 'Fair';
  if (score <= 5) return 'Weak';
  return 'Very Poor';
}

export default function VerifyPage() {
  const localContainerRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const recorderRef = useRef(null);
  const recorderChunksRef = useRef([]);

  const [status, setStatus] = useState('ready');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [callSeconds, setCallSeconds] = useState(0);
  const [quality, setQuality] = useState({ uplink: 0, downlink: 0 });
  const [agentConnected, setAgentConnected] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState('');

  const qualityText = useMemo(() => {
    const up = getQualityLabel(quality.uplink);
    const down = getQualityLabel(quality.downlink);
    return `${up} uplink / ${down} downlink`;
  }, [quality]);

  useEffect(() => {
    let timerId;
    if (status === 'live') {
      timerId = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [status]);

  useEffect(() => {
    let promptTimer;
    if (status === 'live') {
      promptTimer = setInterval(() => {
        setPromptIndex((prev) => (prev + 1) % LIVE_PROMPTS.length);
      }, 12000);
    }

    return () => {
      if (promptTimer) {
        clearInterval(promptTimer);
      }
    };
  }, [status]);

  useEffect(() => {
    return () => {
      endCall();
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
    };
  }, [recordingUrl]);

  async function requestPermissions() {
    setErrorMessage('');
    setStatus('requesting-permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionsGranted(true);
      setStatus('permissions-granted');
      return true;
    } catch (error) {
      setStatus('error');
      setErrorMessage('Camera and microphone permissions are required to continue.');
      return false;
    }
  }

  async function startCall() {
    setErrorMessage('');

    if (!APP_ID) {
      setStatus('error');
      setErrorMessage('Missing NEXT_PUBLIC_AGORA_APP_ID in frontend environment settings.');
      return;
    }

    if (!permissionsGranted) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setStatus('connecting');

    try {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('network-quality', (stats) => {
        setQuality({
          uplink: stats?.uplinkNetworkQuality || 0,
          downlink: stats?.downlinkNetworkQuality || 0
        });
      });

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video' && remoteContainerRef.current) {
          remoteContainerRef.current.innerHTML = '';
          user.videoTrack.play(remoteContainerRef.current);
        }

        if (mediaType === 'audio') {
          user.audioTrack.play();
        }

        setAgentConnected(true);
      });

      client.on('user-unpublished', () => {
        setAgentConnected(false);
        if (remoteContainerRef.current) {
          remoteContainerRef.current.innerHTML = '';
        }
      });

      const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audioTrack, videoTrack };

      if (localContainerRef.current) {
        localContainerRef.current.innerHTML = '';
        videoTrack.play(localContainerRef.current);
      }

      await client.publish([audioTrack, videoTrack]);

      setCallSeconds(0);
      setPromptIndex(0);
      setStatus('live');
      setAgentConnected(client.remoteUsers.length > 0);
      return uid;
    } catch (error) {
      setStatus('error');
      setErrorMessage('Could not start the video call. Check Agora credentials and browser permissions.');
    }
  }

  async function endCall() {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }

    const { audioTrack, videoTrack } = localTracksRef.current;
    if (audioTrack) {
      audioTrack.stop();
      audioTrack.close();
    }
    if (videoTrack) {
      videoTrack.stop();
      videoTrack.close();
    }
    localTracksRef.current = { audioTrack: null, videoTrack: null };

    const client = clientRef.current;
    if (client) {
      client.removeAllListeners();
      try {
        await client.leave();
      } catch {
      }
      clientRef.current = null;
    }

    if (localContainerRef.current) {
      localContainerRef.current.innerHTML = '';
    }
    if (remoteContainerRef.current) {
      remoteContainerRef.current.innerHTML = '';
    }

    setAgentConnected(false);
    setQuality({ uplink: 0, downlink: 0 });
    setStatus('ready');
  }

  function startRecording() {
    const audioTrack = localTracksRef.current.audioTrack;
    if (!audioTrack || isRecording) return;

    setRecordingUrl('');
    recorderChunksRef.current = [];

    const streamTrack = audioTrack.getMediaStreamTrack();
    const stream = new MediaStream([streamTrack]);
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recorderChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recorderChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setRecordingUrl(url);
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }

  const callActive = status === 'live' || status === 'connecting';

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl rounded-[2rem] border border-white/50 bg-white/85 p-5 shadow-[0_25px_70px_rgba(16,42,67,0.16)] backdrop-blur-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f7b8f]">Video KYC Live Onboarding</p>
            <h1 className="title-font mt-2 text-2xl font-extrabold text-[#102a43] sm:text-3xl">AI Agent Verification Call</h1>
          </div>
          <Link href="/" className="rounded-xl border border-[#102a43]/15 px-4 py-2 font-semibold text-[#102a43] hover:bg-[#f8fafc]">
            Back to Loan Page
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-[#102a43]/10 bg-[#0b1221] p-2">
                <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-white/80">Your Video Feed</p>
                <div ref={localContainerRef} className="h-56 rounded-xl bg-black/50 sm:h-64" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#102a43]/10 bg-[#0b1221] p-2">
                <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-white/80">AI Agent Feed</p>
                <div ref={remoteContainerRef} className="h-56 rounded-xl bg-black/50 sm:h-64" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#102a43]/10 bg-[#f8fbff] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#0f7b8f]">Live Prompts</p>
              <p className="mt-2 text-lg font-semibold text-[#102a43]">{LIVE_PROMPTS[promptIndex]}</p>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-[#102a43]/10 bg-white p-4">
            <div className="rounded-xl bg-[#f7f9fc] p-3">
              <p className="text-sm text-[#486581]">Call status</p>
              <p className="mt-1 text-base font-bold text-[#102a43]">
                {status === 'live'
                  ? 'Live with AI agent'
                  : status === 'connecting'
                    ? 'Connecting to AI agent'
                    : status === 'requesting-permission'
                      ? 'Waiting for permissions'
                      : status === 'permissions-granted'
                        ? 'Permissions granted'
                        : status === 'error'
                          ? 'Error'
                          : 'Ready to start'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#627d98]">Timer</p>
                <p className="mt-1 text-xl font-extrabold text-[#102a43]">{formatDuration(callSeconds)}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#627d98]">Connection</p>
                <p className="mt-1 text-sm font-bold text-[#102a43]">{qualityText}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#f7f9fc] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#627d98]">AI Agent</p>
              <p className="mt-1 text-sm font-bold text-[#102a43]">{agentConnected ? 'Connected' : 'Awaiting remote join'}</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={startCall}
                disabled={callActive}
                className="w-full rounded-xl bg-[#d64545] px-4 py-3 font-bold text-white transition enabled:hover:bg-[#b51f1f] disabled:cursor-not-allowed disabled:opacity-55"
              >
                Click Start
              </button>
              <button
                type="button"
                onClick={endCall}
                disabled={!callActive}
                className="w-full rounded-xl border border-[#102a43]/20 px-4 py-3 font-semibold text-[#102a43] transition enabled:hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-55"
              >
                End Call
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!callActive || status !== 'live'}
                className="w-full rounded-xl border border-[#0f7b8f]/30 px-4 py-3 font-semibold text-[#0f7b8f] transition enabled:hover:bg-[#f0f9fb] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isRecording ? 'Stop Mic Recording' : 'Start Mic Recording'}
              </button>
              {recordingUrl ? (
                <audio controls src={recordingUrl} className="w-full" />
              ) : (
                <p className="text-xs text-[#627d98]">Mic recording clip appears here after you stop recording.</p>
              )}
            </div>

            {errorMessage ? <p className="text-sm font-semibold text-[#b42318]">{errorMessage}</p> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
