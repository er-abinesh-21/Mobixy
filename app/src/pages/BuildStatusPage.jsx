import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Download,
    CheckCircle,
    Clock,
    Loader,
    AlertCircle,
    ExternalLink,
    Copy,
    Smartphone,
    Package,
    Globe,
    Calendar,
    FileArchive
} from 'lucide-react';
import { buildService } from '../services/api';

function BuildStatusPage() {
    const { buildId } = useParams();
    const [build, setBuild] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const logsEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // Scroll to bottom of logs
    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    // Fetch build status
    const fetchBuildStatus = async () => {
        try {
            const data = await buildService.getBuildStatus(buildId);
            setBuild(data);
            setLogs(data.logs || []);

            // Stop polling if build is finished or errored
            if (data.status === 'finished' || data.status === 'error') {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
            }
        } catch (err) {
            console.error('Failed to fetch build status:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildStatus();

        // Poll every 5 seconds
        pollIntervalRef.current = setInterval(fetchBuildStatus, 5000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [buildId]);

    // Copy build ID to clipboard
    const copyBuildId = () => {
        navigator.clipboard.writeText(buildId);
        toast.success('Build ID copied to clipboard');
    };

    // Get progress percentage based on status
    const getProgressPercentage = () => {
        switch (build?.status) {
            case 'queued': return 15;
            case 'building': return 60;
            case 'finished': return 100;
            case 'error': return 100;
            default: return 0;
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    // Format date
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="builder-card" style={{ textAlign: 'center', padding: '4rem' }}>
                <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
                <p>Loading build status...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="builder-card" style={{ textAlign: 'center', padding: '4rem' }}>
                <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                <h2>Error Loading Build</h2>
                <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>{error}</p>
                <Link to="/" className="btn btn-primary">
                    <ArrowLeft size={18} />
                    Start New Build
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Back Button */}
            <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} />
                Back to Builder
            </Link>

            {/* Build Status Card */}
            <div className="builder-card">
                <div className="builder-header">
                    <h2 className="builder-title">
                        {build?.status === 'finished' ? '🎉' : build?.status === 'error' ? '❌' : '⚙️'} Build Status
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <code style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>{buildId}</code>
                        <button
                            onClick={copyBuildId}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#a1a1aa',
                                padding: '4px'
                            }}
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="build-progress">
                    <div className="progress-header">
                        <span className="progress-title">
                            {build?.status === 'queued' && <><Clock size={18} /> Waiting in queue...</>}
                            {build?.status === 'building' && <><Loader size={18} className="spin" /> Building your app...</>}
                            {build?.status === 'finished' && <><CheckCircle size={18} style={{ color: '#10b981' }} /> Build complete!</>}
                            {build?.status === 'error' && <><AlertCircle size={18} style={{ color: '#ef4444' }} /> Build failed</>}
                        </span>
                        <span className={`progress-status ${build?.status}`}>
                            {build?.status?.toUpperCase()}
                        </span>
                    </div>

                    <div className="progress-bar">
                        <div
                            className={`progress-bar-fill ${build?.status === 'building' ? 'animated' : ''}`}
                            style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                    </div>
                </div>

                {/* Build Metadata */}
                {build && (
                    <div className="build-meta" style={{ margin: '1.5rem 0' }}>
                        <div className="build-meta-item">
                            <div className="build-meta-label">
                                <Smartphone size={14} style={{ marginRight: '4px' }} />
                                App Name
                            </div>
                            <div className="build-meta-value">{build.appName || 'N/A'}</div>
                        </div>
                        <div className="build-meta-item">
                            <div className="build-meta-label">
                                <Package size={14} style={{ marginRight: '4px' }} />
                                Package
                            </div>
                            <div className="build-meta-value">{build.packageName || 'N/A'}</div>
                        </div>
                        <div className="build-meta-item">
                            <div className="build-meta-label">
                                <FileArchive size={14} style={{ marginRight: '4px' }} />
                                Build Type
                            </div>
                            <div className="build-meta-value">{build.buildType?.toUpperCase() || 'N/A'}</div>
                        </div>
                        <div className="build-meta-item">
                            <div className="build-meta-label">
                                <Globe size={14} style={{ marginRight: '4px' }} />
                                Website
                            </div>
                            <div className="build-meta-value" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                {build.websiteUrl || 'N/A'}
                            </div>
                        </div>
                        <div className="build-meta-item">
                            <div className="build-meta-label">
                                <Calendar size={14} style={{ marginRight: '4px' }} />
                                Started
                            </div>
                            <div className="build-meta-value">{build.startedAt ? formatDate(build.startedAt) : 'N/A'}</div>
                        </div>
                        <div className="build-meta-item">
                            <div className="build-meta-label">
                                <Clock size={14} style={{ marginRight: '4px' }} />
                                Duration
                            </div>
                            <div className="build-meta-value">{build.duration || 'In progress...'}</div>
                        </div>
                    </div>
                )}

                {/* Build Logs */}
                <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code size={18} />
                    Build Logs
                </h4>
                <div className="build-logs">
                    {logs.length === 0 ? (
                        <div className="log-entry">
                            <span className="log-message">Waiting for logs...</span>
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="log-entry">
                                <span className="log-timestamp">[{formatTime(log.timestamp)}]</span>
                                <span className={`log-message ${log.type || ''}`}>{log.message}</span>
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>

                {/* Success State */}
                {build?.status === 'finished' && (
                    <motion.div
                        className="build-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="build-success-icon">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="build-success-title">Your App is Ready! 🎉</h3>
                        <p className="build-success-subtitle">
                            Download your {build.buildType?.toUpperCase()} file below
                        </p>

                        <div className="download-buttons">
                            <a
                                href={build.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-success btn-lg"
                            >
                                <Download size={20} />
                                Download {build.buildType?.toUpperCase()}
                            </a>

                            {build.expoUrl && (
                                <a
                                    href={build.expoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                >
                                    <ExternalLink size={18} />
                                    View Build Details
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Error State */}
                {build?.status === 'error' && (
                    <motion.div
                        style={{
                            textAlign: 'center',
                            padding: '2rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '1rem',
                            marginTop: '1.5rem'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Build Failed</h3>
                        <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
                            {build.errorMessage || 'An error occurred during the build process. Please check the logs for details.'}
                        </p>
                        <Link to="/" className="btn btn-primary">
                            Try Again
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Add spinning animation for loader */}
            <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </motion.div>
    );
}

// Code icon component
function Code({ size }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    );
}

export default BuildStatusPage;
