'use client';

import { useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    // Check browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    if ('processLocally' in recognition) {
      recognition.processLocally = true;
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        onTranscript(transcript);
        recognition.stop();
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'network') {
        setError('Voice input is temporarily unavailable. Please type your task instead.');
        return;
      }

      setError('Error: ' + event.error);
      console.warn('Speech recognition error:', event.error);
    };

    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        onClick={startListening}
        disabled={disabled || isListening}
        size="lg"
        variant={isListening ? "destructive" : "default"}
        className={`rounded-full w-14 h-14 ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      
      {isListening && (
        <p className="text-sm text-gray-600 animate-pulse">
          Listening...
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}