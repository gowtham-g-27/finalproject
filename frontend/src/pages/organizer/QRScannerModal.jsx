import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Camera, Search, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import Modal from '../../components/Modal';

export default function QRScannerModal({ isOpen, onClose, event, onCheckInSuccess }) {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setTicketInput('');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || ticketInput).trim();
    if (!code) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.checkInAttendee(event.id, code);
      setResult(res);
      setTicketInput('');

      if (!res.already_checked_in) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        if (onCheckInSuccess) onCheckInSuccess();
      }
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Check-in: ${event.title}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        
        {/* Event context info */}
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Venue:</span>{' '}
            <strong className="text-slate-800">{event.venue}</strong>
          </div>
          <div>
            <span className="text-slate-500">Checked In:</span>{' '}
            <strong className="text-orange-600 font-bold">{event.attended_count || 0}</strong>
          </div>
        </div>

        {/* Barcode / Manual Input scanner field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Scan QR Code or Enter Ticket ID
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. TKT-HACK-A1B2C3D4"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !ticketInput.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? 'Verifying...' : 'Check In'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Supports hardware barcode scanners, QR scanners, and manual code entry.
          </p>
        </div>

        {/* Verification Success Display */}
        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 animate-slide-up ${
              result.already_checked_in
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.already_checked_in ? (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>

            <div className="pt-2 border-t border-current/10 space-y-1">
              <div>Student: <strong className="font-semibold">{result.student_name}</strong></div>
              <div>Email: <strong className="font-semibold">{result.student_email}</strong></div>
              <div>Ticket: <span className="font-mono">{result.ticket_code}</span></div>
              <div>Check-in Time: <span className="font-mono">{result.attended_at}</span></div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold">Check-in Rejected</div>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            Done Scanning
          </button>
        </div>

      </div>
    </Modal>
  );
}

