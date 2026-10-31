import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle2, ShieldCheck, Search, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CertificatesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    if (user) {
      loadCertificates();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await api.getMyCertificates();
      setCertificates(data);
    } catch (err) {
      addToast('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert) => {
    try {
      const blob = await api.downloadCertificatePdf(cert.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Certificate PDF downloaded!', 'success');
    } catch (err) {
      addToast('Failed to download certificate PDF', 'error');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;

    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const res = await api.verifyCertificate(verifyCode.trim());
      setVerifyResult(res);
    } catch (err) {
      setVerifyError(err.message || 'Certificate verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12 text-left">
      
      {/* 1. Header (Minimalist Editorial Style from Image 2) */}
      <div className="text-center space-y-2 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
          INSTITUTIONAL ACCREDITATION & RECORDS
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Certificate Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Verify tamper-proof credentials issued by the VIT-AP University Directorate of Student Welfare.
        </p>
      </div>

      {/* 2. Verification Box (Clean Soft Gray Container from Image 2) */}
      <div className="max-w-xl mx-auto rounded-3xl bg-[#F8F9FA] border border-slate-200/80 p-8 space-y-5 text-center">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Public Certificate Audit</span>
          </div>
          <p className="text-xs text-slate-500">
            Enter any Certificate ID below to verify authenticity and activity credits.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="text"
            required
            placeholder="e.g. CERT-2026-A1B2C3D4"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-mono uppercase text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={verifying}
            className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            {verifying ? 'Checking...' : 'Verify'}
          </button>
        </form>

        {/* Verification Success Box */}
        {verifyResult && (
          <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-xs text-left space-y-2 animate-slide-up shadow-sm">
            <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Authentic VIT-AP Certificate</span>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-700">
              <div>Certificate ID: <strong className="font-mono text-slate-900">{verifyResult.certificate_number}</strong></div>
              <div>Recipient: <strong className="text-slate-900">{verifyResult.student_name}</strong></div>
              <div>Event: <strong className="text-slate-900">{verifyResult.event_title}</strong></div>
              <div>Issue Date: <span>{verifyResult.issue_date}</span></div>
              <div>Authority: <span>{verifyResult.issued_by}</span></div>
            </div>
          </div>
        )}

        {/* Verification Error Box */}
        {verifyError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2 text-left animate-slide-up">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold">Verification Failed</div>
              <p className="text-xs">{verifyError}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. User's Certificates Section */}
      <div className="space-y-6 pt-4">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
            MY CREDENTIALS
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Earned Certificates
          </h2>
        </div>

        {!user ? (
          <div className="p-12 text-center bg-[#F8F9FA] rounded-3xl border border-slate-200 text-xs text-slate-500 max-w-md mx-auto">
            Please log in with your student credentials to view and download your earned certificates.
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-16 text-center bg-[#F8F9FA] rounded-3xl border border-dashed border-slate-200 space-y-2 max-w-lg mx-auto">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">No certificates issued yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Certificates are automatically generated when an organizer scans your pass at the entrance!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-[#F8F9FA] rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-sm transition-shadow space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 text-[11px]">
                    <span className="font-mono text-slate-500 font-semibold">{cert.certificate_number}</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">Verified</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-3 line-clamp-2">
                    {cert.event_title}
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issued: {cert.issue_date}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70">
                  <button
                    onClick={() => handleDownload(cert)}
                    className="w-full py-2.5 px-4 rounded-none bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Download Official PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
