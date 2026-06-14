import React, { useState } from 'react';
import { SynthesisOptions } from './SynthesisOptions';
import { BreakdownIndicators } from './BreakdownIndicators';
import { SynthesisSummary } from './SynthesisSummary';

interface GeneratorTabProps {
  fetchData: () => Promise<void>;
  showToast: (text: string, type?: 'success' | 'error') => void;
  setSelectedUser: (user: any) => void;
  setAiEvaluation: (evalData: any) => void;
}

const steps = [
  "Initializing identity corpus...",
  "Generating user profiles and access patterns...",
  "Injecting privilege anomalies...",
  "Simulating one year of access events...",
  "Injecting behavioral anomalies...",
  "Applying data quality issues...",
  "Writing label files...",
  "Finalizing dataset...",
];

export function GeneratorTab({ fetchData, showToast, setSelectedUser, setAiEvaluation }: GeneratorTabProps) {
  const [selectedSize, setSelectedSize] = useState<string>("medium");
  const [generatorLoading, setGeneratorLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generatorSummary, setSummary] = useState<any>(null);
  const [genStep, setGenStep] = useState<string>("");
  const [genOptions, setGenOptions] = useState({
    inject_missing_logins: true,
    inject_duplicates: true,
    inject_mixed_timezones: true,
    inject_stale_records: true,
  });

  const handleGenerateDataset = async () => {
    setGeneratorLoading(true);
    setSummary(null);
    setAiEvaluation(null);
    setSelectedUser(null);

    let stepIdx = 0;
    setGenStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setGenStep(steps[stepIdx]);
    }, 1000);

    try {
      const res = await fetch('/api/generate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: selectedSize,
          inject_missing_logins: genOptions.inject_missing_logins,
          inject_duplicates: genOptions.inject_duplicates,
          inject_mixed_timezones: genOptions.inject_mixed_timezones,
          inject_stale_records: genOptions.inject_stale_records,
        })
      });

      if (!res.ok) {
        throw new Error("Synthetic generation server error");
      }

      const summaryData = await res.json();
      setSummary(summaryData);
      showToast("Identity Sprawl Dataset successfully synthesized and stored in database!", "success");
      
      await fetchData();
    } catch (err: any) {
      showToast("Data generation failed. Verify server bindings.", "error");
    } finally {
      clearInterval(stepInterval);
      setGeneratorLoading(false);
      setGenStep("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <SynthesisOptions 
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          genOptions={genOptions}
          setGenOptions={setGenOptions}
          handleGenerateDataset={handleGenerateDataset}
          generatorLoading={generatorLoading}
          genStep={genStep}
        />
      </div>
      
      <div className="flex flex-col gap-6">
        <BreakdownIndicators />
      </div>

      {generatorSummary && (
        <div className="lg:col-span-3 transition-opacity">
          <SynthesisSummary generatorSummary={generatorSummary} />
        </div>
      )}
    </div>
  );
}
