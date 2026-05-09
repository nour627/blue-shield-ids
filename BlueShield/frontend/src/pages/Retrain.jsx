import { useState } from 'react'

export default function Retrain() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Retrain ML Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Train the anomaly detection algorithms with new packet capture datasets.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
        <div className="mb-8">
          <div className="inline-flex w-20 h-20 bg-blue-100 text-blue-600 rounded-full items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Retrain Models</h2>
          <p className="text-sm text-gray-500 mt-2">
            Upload a new dataset (CSV) to retrain the ML models. 
            The models will be re-evaluated and deployed automatically.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            Models are currently trained on the CICIDS2017 dataset. 
            To retrain, provide a new labeled dataset via Jupyter Notebook and replace the .pkl files.
          </p>
        </div>
      </div>
    </div>
  )
}

