import React from 'react';

// /src/app/issued/page.tsx


const IssuedCertificationPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <svg
                    className="mx-auto mb-4 h-16 w-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
                    <path
                        d="M8 13l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <h1 className="text-2xl font-bold text-green-600 mb-2">Certification Issued!</h1>
                <p className="text-gray-700 mb-6">
                    Your certification is <span className="font-medium text-green-700">authenticated</span>.
                </p>
            </div>
        </div>
    );
};

export default IssuedCertificationPage;