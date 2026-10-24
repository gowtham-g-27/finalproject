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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 mb-2">
          Official Credentials
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Participation Certificates & Credential Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Download tamper-evident academic participation certificates or verify credential authenticity.
        </p>
      </div>

      {/* Public Verification Box */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-orange-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-900 uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          Public Certificate Verification Portal
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
          Enter any university event Certificate Number to instantly verify recipient identity, event completion, and institutional authenticity.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. CERT-2026-A1B2C3D4"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors shrink-0"
          >
            {verifying ? 'Verifying...' : 'Verify Credential'}
          </button>
        </form>

        {/* Verification Success Box */}
        {verifyResult && (
          <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-950 space-y-2 max-w-xl animate-slide-up shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              Verified Authentic University Certificate
            </div>
            <div className="pt-2 border-t border-emerald-100 space-y-1">
              <div>Certificate ID: <strong className="font-mono text-slate-900">{verifyResult.certificate_number}</strong></div>
              <div>Recipient: <strong className="text-slate-900">{verifyResult.student_name}</strong></div>
              <div>Event: <strong className="text-slate-900">{verifyResult.event_title}</strong></div>
              <div>Issue Date: <span className="text-slate-700">{verifyResult.issue_date}</span></div>
              <div>Issuing Authority: <span className="text-slate-700">{verifyResult.issued_by}</span></div>
            </div>
          </div>
        )}

        {verifyError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2 max-w-xl animate-slide-up">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold">Verification Failed</div>
              <p>{verifyError}</p>
            </div>
          </div>
        )}
      </div>

      {/* User's Certificates Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">My Earned Certificates</h2>

        {!user ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-orange-100 text-xs text-slate-500">
            Please log in to view and download your participation certificates.
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-orange-50/50 animate-pulse border border-orange-100" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-orange-200 space-y-2">
            <Award className="w-10 h-10 text-orange-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">No certificates issued yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Certificates are automatically unlocked upon attending approved campus events and completing QR check-in!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 inline-block px-2.5 py-0.5 rounded-full border border-orange-100">
                    {cert.certificate_number}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-2 line-clamp-2">
                    {cert.event_title}
                  </h3>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Issued on {cert.issue_date}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-orange-50">
                  <button
                    onClick={() => handleDownload(cert)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors"
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
