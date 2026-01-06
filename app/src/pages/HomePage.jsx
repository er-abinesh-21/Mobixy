import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Globe,
    Package,
    Upload,
    Smartphone,
    FileArchive,
    Rocket,
    Check,
    AlertCircle,
    X,
    Bell,
    RefreshCw,
    Shield,
    Zap,
    Cloud
} from 'lucide-react';
import { buildService } from '../services/api';

function HomePage() {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        websiteUrl: '',
        appName: '',
        packageName: '',
        buildType: 'apk',
    });
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Icon dropzone
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, icon: null }));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxFiles: 1,
    });

    const removeIcon = () => {
        setIconFile(null);
        setIconPreview(null);
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        // Website URL validation
        if (!formData.websiteUrl.trim()) {
            newErrors.websiteUrl = 'Website URL is required';
        } else {
            try {
                const url = new URL(formData.websiteUrl);
                if (url.protocol !== 'https:') {
                    newErrors.websiteUrl = 'URL must use HTTPS for security';
                }
            } catch {
                newErrors.websiteUrl = 'Please enter a valid URL';
            }
        }

        // App name validation
        if (!formData.appName.trim()) {
            newErrors.appName = 'App name is required';
        } else if (formData.appName.length > 30) {
            newErrors.appName = 'App name must be 30 characters or less';
        }

        // Package name validation
        if (!formData.packageName.trim()) {
            newErrors.packageName = 'Package name is required';
        } else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(formData.packageName)) {
            newErrors.packageName = 'Invalid format. Use: com.company.appname';
        }

        // Icon validation
        if (!iconFile) {
            newErrors.icon = 'App icon is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            // Send as JSON (Icon upload temporarily disabled for serverless compatibility)
            // To enable icon upload, we'd need to upload to blob storage first or use a multipart parser
            const submitData = {
                websiteUrl: formData.websiteUrl,
                appName: formData.appName,
                packageName: formData.packageName,
                buildType: formData.buildType
            };

            const response = await buildService.startBuild(submitData);

            toast.success('Build started successfully!');
            // Use EAS Build ID if available (real build), otherwise local ID (simulation)
            navigate(`/build/${response.easBuildId || response.buildId}`);
        } catch (error) {
            console.error('Build error:', error);
            toast.error(error.message || 'Failed to start build. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="hero-badge">
                        <span className="hero-badge-dot"></span>
                        Powered by Mobixy Cloud
                    </div>
                </motion.div>

                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Convert Any Website to<br />
                    <span className="hero-title-gradient">Android App</span>
                </motion.h1>

                <motion.p
                    className="hero-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Transform your website into a native Android APK or Play Store-ready AAB in minutes.
                    No coding required. 100% Cloud-built.
                </motion.p>

                <motion.div
                    className="hero-features"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="hero-feature">
                        <Check className="hero-feature-icon" size={18} />
                        <span>Push Notifications</span>
                    </div>
                    <div className="hero-feature">
                        <Check className="hero-feature-icon" size={18} />
                        <span>OTA Updates</span>
                    </div>
                    <div className="hero-feature">
                        <Check className="hero-feature-icon" size={18} />
                        <span>No Android Studio</span>
                    </div>
                    <div className="hero-feature">
                        <Check className="hero-feature-icon" size={18} />
                        <span>Play Store Ready</span>
                    </div>
                </motion.div>
            </section>

            {/* Builder Form */}
            <motion.div
                className="builder-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="builder-header">
                    <h2 className="builder-title">🚀 Build Your App</h2>
                    <p className="builder-subtitle">Fill in the details below to generate your Android app</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Website URL */}
                    <div className="form-group">
                        <label className="form-label">
                            <Globe size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            Website URL
                        </label>
                        <input
                            type="url"
                            name="websiteUrl"
                            className={`form-input ${errors.websiteUrl ? 'error' : ''}`}
                            placeholder="https://your-website.com"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                        />
                        {errors.websiteUrl && (
                            <div className="form-error">
                                <AlertCircle size={14} />
                                {errors.websiteUrl}
                            </div>
                        )}
                        <p className="form-hint">Must be a secure HTTPS URL</p>
                    </div>

                    {/* App Name & Package Name */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Smartphone size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                App Name
                            </label>
                            <input
                                type="text"
                                name="appName"
                                className={`form-input ${errors.appName ? 'error' : ''}`}
                                placeholder="My Awesome App"
                                value={formData.appName}
                                onChange={handleInputChange}
                            />
                            {errors.appName && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    {errors.appName}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Package size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                Package Name
                            </label>
                            <input
                                type="text"
                                name="packageName"
                                className={`form-input ${errors.packageName ? 'error' : ''}`}
                                placeholder="com.company.appname"
                                value={formData.packageName}
                                onChange={handleInputChange}
                            />
                            {errors.packageName && (
                                <div className="form-error">
                                    <AlertCircle size={14} />
                                    {errors.packageName}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* App Icon Upload */}
                    <div className="form-group">
                        <label className="form-label">
                            <Upload size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            App Icon
                        </label>

                        {!iconPreview ? (
                            <div
                                {...getRootProps()}
                                className={`dropzone ${isDragActive ? 'active' : ''} ${errors.icon ? 'error' : ''}`}
                                style={errors.icon ? { borderColor: '#ef4444' } : {}}
                            >
                                <input {...getInputProps()} />
                                <Upload className="dropzone-icon" size={48} />
                                <p className="dropzone-text">
                                    {isDragActive ? 'Drop your icon here...' : 'Drag & drop your app icon here'}
                                </p>
                                <p className="dropzone-hint">PNG or JPG, at least 1024x1024px recommended</p>
                            </div>
                        ) : (
                            <div className="dropzone">
                                <div className="dropzone-preview">
                                    <img src={iconPreview} alt="App icon preview" className="dropzone-preview-image" />
                                    <div className="dropzone-preview-info">
                                        <p className="dropzone-preview-name">{iconFile.name}</p>
                                        <p className="dropzone-preview-size">
                                            {(iconFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeIcon}
                                        className="dropzone-preview-remove"
                                    >
                                        <X size={16} style={{ marginRight: '4px' }} />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}

                        {errors.icon && (
                            <div className="form-error">
                                <AlertCircle size={14} />
                                {errors.icon}
                            </div>
                        )}
                    </div>

                    {/* Build Type Selector */}
                    <div className="form-group">
                        <label className="form-label">Build Type</label>
                        <div className="build-type-selector">
                            <div className="build-type-option">
                                <input
                                    type="radio"
                                    id="buildTypeApk"
                                    name="buildType"
                                    value="apk"
                                    checked={formData.buildType === 'apk'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="buildTypeApk" className="build-type-label">
                                    <div className="build-type-icon">
                                        <FileArchive size={20} />
                                    </div>
                                    <span className="build-type-name">APK</span>
                                    <span className="build-type-desc">For testing & sideloading</span>
                                </label>
                            </div>

                            <div className="build-type-option">
                                <input
                                    type="radio"
                                    id="buildTypeAab"
                                    name="buildType"
                                    value="aab"
                                    checked={formData.buildType === 'aab'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="buildTypeAab" className="build-type-label">
                                    <div className="build-type-icon">
                                        <Rocket size={20} />
                                    </div>
                                    <span className="build-type-name">AAB</span>
                                    <span className="build-type-desc">For Google Play Store</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Building Your App...
                            </>
                        ) : (
                            <>
                                <Rocket size={20} />
                                Generate App
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Features Section */}
            <section id="features" className="features-section">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Powerful Features
                </motion.h2>
                <motion.p
                    className="section-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Everything you need to transform your website into a fully-featured Android app
                </motion.p>

                <div className="features-grid">
                    {[
                        {
                            icon: <Bell size={24} />,
                            title: 'Push Notifications',
                            description: 'Engage users with push notifications. Send targeted messages directly to their devices instantly.'
                        },
                        {
                            icon: <RefreshCw size={24} />,
                            title: 'OTA Updates',
                            description: 'Push updates instantly without Play Store review. Update your app\'s JavaScript and assets over-the-air.'
                        },
                        {
                            icon: <Shield size={24} />,
                            title: 'HTTPS Enforcement',
                            description: 'Secure connections guaranteed. Only HTTPS URLs are accepted to protect your users\' data.'
                        },
                        {
                            icon: <Zap size={24} />,
                            title: 'Native Performance',
                            description: 'Built with React Native WebView for smooth, native-like performance. Hardware back button support included.'
                        },
                        {
                            icon: <Cloud size={24} />,
                            title: 'Cloud Builds',
                            description: 'No Android Studio required. All builds happen in Mobixy\'s powerful cloud infrastructure.'
                        },
                        {
                            icon: <Rocket size={24} />,
                            title: 'Play Store Ready',
                            description: 'Generate AAB bundles ready for Google Play Store submission. Includes managed signing.'
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default HomePage;
