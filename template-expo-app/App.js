import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    BackHandler,
    Platform,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Get website URL from config
const WEBSITE_URL = Constants.expoConfig?.extra?.websiteUrl || process.env.WEBSITE_URL || 'https://example.com';

export default function App() {
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [canGoBack, setCanGoBack] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Initialize app
    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Check for OTA updates
            await checkForUpdates();

            // Register for push notifications
            await registerForPushNotifications();

        } catch (error) {
            console.log('Initialization error:', error);
        }
    };

    // Check for OTA updates
    const checkForUpdates = async () => {
        if (__DEV__) return;

        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            console.log('Update check failed:', error);
        }
    };

    // Register for push notifications
    const registerForPushNotifications = async () => {
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission denied');
            return;
        }

        try {
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });
            console.log('Push token:', token.data);

            // Send token to backend (optional)
            // await sendTokenToBackend(token.data);

        } catch (error) {
            console.log('Failed to get push token:', error);
        }

        // Set up notification listeners
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#6366f1',
            });
        }
    };

    // Handle Android back button
    useEffect(() => {
        if (Platform.OS === 'android') {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (canGoBack && webViewRef.current) {
                    webViewRef.current.goBack();
                    return true;
                }
                return false;
            });

            return () => backHandler.remove();
        }
    }, [canGoBack]);

    // Handle WebView load complete
    const handleLoadEnd = useCallback(async () => {
        setIsLoading(false);
        setHasError(false);

        // Fade out loading overlay
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Hide splash screen
        await SplashScreen.hideAsync();
    }, [fadeAnim]);

    // Handle WebView error
    const handleError = useCallback((syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        setHasError(true);
        setIsLoading(false);
        setErrorMessage(nativeEvent.description || 'Failed to load page');
        SplashScreen.hideAsync();
    }, []);

    // Handle navigation state change
    const handleNavigationStateChange = useCallback((navState) => {
        setCanGoBack(navState.canGoBack);
    }, []);

    // Retry loading
    const handleRetry = useCallback(() => {
        setHasError(false);
        setIsLoading(true);
        fadeAnim.setValue(1);
        webViewRef.current?.reload();
    }, [fadeAnim]);

    // Render error screen
    if (hasError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#1a1a25" />
                <View style={styles.errorContent}>
                    <Text style={styles.errorIcon}>📡</Text>
                    <Text style={styles.errorTitle}>Connection Error</Text>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                    <Text style={styles.errorHint}>Please check your internet connection and try again.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

            <WebView
                ref={webViewRef}
                source={{ uri: WEBSITE_URL }}
                style={styles.webview}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                onHttpError={handleError}
                onNavigationStateChange={handleNavigationStateChange}

                // Performance & behavior settings
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                allowsBackForwardNavigationGestures={true}

                // Security settings
                originWhitelist={['https://*']}
                mixedContentMode="never"

                // Disable bounce/zoom for native feel
                bounces={false}
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={true}

                // Enable geolocation if needed
                geolocationEnabled={true}

                // Media playback settings
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}

                // User agent customization
                userAgent={`MobixyApp/1.0 Android WebView`}

                // Pull to refresh (optional)
                pullToRefreshEnabled={true}

                // Inject CSS/JS if needed
                injectedJavaScript={`
          // Prevent zoom on double tap
          document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
          });
          
          // Send messages to React Native
          window.ReactNativeWebView = window.ReactNativeWebView || {};
          
          // Signal ready
          true;
        `}

                onMessage={(event) => {
                    // Handle messages from web content
                    console.log('WebView message:', event.nativeEvent.data);
                }}
            />

            {/* Loading overlay */}
            {isLoading && (
                <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6366f1',
    },
    webview: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#1a1a25',
    },
    errorContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    errorMessage: {
        fontSize: 14,
        color: '#ef4444',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorHint: {
        fontSize: 14,
        color: '#a1a1aa',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
