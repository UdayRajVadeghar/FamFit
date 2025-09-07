"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [familyId, setFamilyId] = useState("538ce443-d36e-4cbc-82d9-b82c0de3dcd2");

  const testStatusApi = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/family/progress/status?familyId=${familyId}&period=30d`
      );
      
      const data = await response.json();
      
      setResult({
        status: response.status,
        ok: response.ok,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testDebugApi = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/family/progress/status/debug?familyId=${familyId}`
      );
      
      const data = await response.json();
      
      setResult({
        status: response.status,
        ok: response.ok,
        data,
        timestamp: new Date().toISOString(),
        type: "debug"
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        type: "debug"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family ID:
            </label>
            <input
              type="text"
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter family ID"
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={testStatusApi} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Testing..." : "Test Status API"}
            </Button>
            
            <Button 
              onClick={testDebugApi} 
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testing..." : "Test Debug API"}
            </Button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              API Test Results {result.type === "debug" && "(Debug Mode)"}
            </h2>
            
            <div className="mb-4">
              <span className="text-sm text-gray-600">Timestamp: </span>
              <span className="text-sm font-mono">{result.timestamp}</span>
            </div>
            
            {result.status && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">HTTP Status: </span>
                <span 
                  className={`text-sm font-mono px-2 py-1 rounded ${
                    result.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status}
                </span>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-md p-4 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}