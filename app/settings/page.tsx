"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';

const SettingsPage = () => {
  const [initialLimit, setInitialLimit] = useState('10');

  useEffect(() => {
    // Load saved initial limit
    const saved = localStorage.getItem('snusSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setInitialLimit(settings.initialLimit.toString());
    }
  }, []);

  const handleSave = () => {
    const settings = {
      initialLimit: parseInt(initialLimit)
    };
    localStorage.setItem('snusSettings', JSON.stringify(settings));
    // Optional: Show success message
  };

  const handleReset = () => {
    if (confirm('Är du säker? Detta kommer nollställa all din progress.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="container p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-4">Inställningar</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Antal snus per dag (start)</label>
            <Input
              type="number"
              value={initialLimit}
              onChange={(e) => setInitialLimit(e.target.value)}
              min="1"
              max="50"
            />
          </div>

          <Button 
            className="w-full"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Spara inställningar
          </Button>

          <div className="pt-6 border-t">
            <Button 
              variant="destructive"
              className="w-full"
              onClick={handleReset}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Nollställ progress
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 