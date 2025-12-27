// Site Analytics - Basit ziyaretçi takip sistemi
// Bu script tüm sayfalarda çalışarak ziyaretçi verilerini toplar

(function () {
    'use strict';

    const ANALYTICS_KEY = 'site_analytics';
    const SESSION_KEY = 'analytics_session';

    // Get or create session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem(SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    // Get analytics data from localStorage
    function getAnalytics() {
        try {
            const data = localStorage.getItem(ANALYTICS_KEY);
            return data ? JSON.parse(data) : getDefaultAnalytics();
        } catch (e) {
            return getDefaultAnalytics();
        }
    }

    // Default analytics structure
    function getDefaultAnalytics() {
        return {
            totalVisitors: 0,
            totalPageViews: 0,
            uniqueVisitors: [],
            sessions: {},
            dailyStats: {},
            pages: {},
            referrers: {},
            devices: { mobile: 0, tablet: 0, desktop: 0 },
            browsers: {},
            countries: { 'TR': 0 },
            lastUpdated: Date.now()
        };
    }

    // Save analytics data
    function saveAnalytics(data) {
        try {
            data.lastUpdated = Date.now();
            localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Analytics save error:', e);
        }
    }

    // Detect device type
    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // Detect browser
    function getBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        return 'Other';
    }

    // Get today's date key
    function getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    // Track page view
    function trackPageView() {
        const analytics = getAnalytics();
        const sessionId = getSessionId();
        const today = getTodayKey();
        const currentPage = window.location.pathname;
        const device = getDeviceType();
        const browser = getBrowser();

        // Initialize daily stats if needed
        if (!analytics.dailyStats[today]) {
            analytics.dailyStats[today] = {
                visitors: 0,
                pageViews: 0,
                uniqueVisitors: [],
                sessions: []
            };
        }

        // Track page view
        analytics.totalPageViews++;
        analytics.dailyStats[today].pageViews++;

        // Track page
        if (!analytics.pages[currentPage]) {
            analytics.pages[currentPage] = 0;
        }
        analytics.pages[currentPage]++;

        // Track new session/visitor
        if (!analytics.sessions[sessionId]) {
            analytics.sessions[sessionId] = {
                startTime: Date.now(),
                pages: [],
                device: device,
                browser: browser
            };

            analytics.totalVisitors++;
            analytics.dailyStats[today].visitors++;

            // Track device
            analytics.devices[device]++;

            // Track browser
            if (!analytics.browsers[browser]) {
                analytics.browsers[browser] = 0;
            }
            analytics.browsers[browser]++;

            // Track country (default to TR for local)
            analytics.countries['TR']++;
        }

        // Add page to session
        analytics.sessions[sessionId].pages.push({
            page: currentPage,
            time: Date.now()
        });
        analytics.sessions[sessionId].lastActivity = Date.now();

        // Clean old sessions (older than 24 hours)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        Object.keys(analytics.sessions).forEach(sid => {
            if (analytics.sessions[sid].lastActivity < oneDayAgo) {
                delete analytics.sessions[sid];
            }
        });

        // Clean old daily stats (keep last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
        Object.keys(analytics.dailyStats).forEach(date => {
            if (date < cutoffDate) {
                delete analytics.dailyStats[date];
            }
        });

        saveAnalytics(analytics);
    }

    // Get analytics summary for dashboard
    window.getAnalyticsSummary = function () {
        const analytics = getAnalytics();
        const today = getTodayKey();
        const todayStats = analytics.dailyStats[today] || { visitors: 0, pageViews: 0 };

        // Calculate averages
        const days = Object.keys(analytics.dailyStats);
        const last7Days = days.slice(-7);

        let avgVisitors = 0;
        let avgPageViews = 0;
        if (last7Days.length > 0) {
            avgVisitors = last7Days.reduce((sum, d) => sum + (analytics.dailyStats[d]?.visitors || 0), 0) / last7Days.length;
            avgPageViews = last7Days.reduce((sum, d) => sum + (analytics.dailyStats[d]?.pageViews || 0), 0) / last7Days.length;
        }

        // Calculate bounce rate (sessions with only 1 page)
        const sessions = Object.values(analytics.sessions);
        const bouncedSessions = sessions.filter(s => s.pages && s.pages.length === 1).length;
        const bounceRate = sessions.length > 0 ? (bouncedSessions / sessions.length * 100).toFixed(1) : 0;

        // Calculate average session duration
        let avgSessionDuration = 0;
        const sessionsWithMultiplePages = sessions.filter(s => s.pages && s.pages.length > 1);
        if (sessionsWithMultiplePages.length > 0) {
            const totalDuration = sessionsWithMultiplePages.reduce((sum, s) => {
                const duration = s.pages[s.pages.length - 1].time - s.pages[0].time;
                return sum + duration;
            }, 0);
            avgSessionDuration = totalDuration / sessionsWithMultiplePages.length / 1000; // in seconds
        }

        // Format session duration
        const minutes = Math.floor(avgSessionDuration / 60);
        const seconds = Math.floor(avgSessionDuration % 60);
        const avgDurationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Device breakdown
        const totalDevices = analytics.devices.mobile + analytics.devices.tablet + analytics.devices.desktop;
        const deviceBreakdown = {
            mobile: totalDevices > 0 ? Math.round(analytics.devices.mobile / totalDevices * 100) : 0,
            tablet: totalDevices > 0 ? Math.round(analytics.devices.tablet / totalDevices * 100) : 0,
            desktop: totalDevices > 0 ? Math.round(analytics.devices.desktop / totalDevices * 100) : 0
        };

        // Browser breakdown
        const totalBrowsers = Object.values(analytics.browsers).reduce((a, b) => a + b, 0);
        const browserBreakdown = {};
        Object.keys(analytics.browsers).forEach(b => {
            browserBreakdown[b] = totalBrowsers > 0 ? Math.round(analytics.browsers[b] / totalBrowsers * 100) : 0;
        });

        // Trends (compare today to yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        const yesterdayStats = analytics.dailyStats[yesterdayKey] || { visitors: 0, pageViews: 0 };

        const visitorTrend = yesterdayStats.visitors > 0
            ? ((todayStats.visitors - yesterdayStats.visitors) / yesterdayStats.visitors * 100).toFixed(1)
            : 0;
        const pageViewTrend = yesterdayStats.pageViews > 0
            ? ((todayStats.pageViews - yesterdayStats.pageViews) / yesterdayStats.pageViews * 100).toFixed(1)
            : 0;

        return {
            today: {
                visitors: todayStats.visitors,
                pageViews: todayStats.pageViews,
                visitorTrend: parseFloat(visitorTrend),
                pageViewTrend: parseFloat(pageViewTrend)
            },
            total: {
                visitors: analytics.totalVisitors,
                pageViews: analytics.totalPageViews
            },
            averages: {
                visitors: Math.round(avgVisitors),
                pageViews: Math.round(avgPageViews)
            },
            bounceRate: parseFloat(bounceRate),
            avgSessionDuration: avgDurationFormatted,
            devices: deviceBreakdown,
            browsers: browserBreakdown,
            topPages: Object.entries(analytics.pages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([page, views]) => ({ page, views })),
            dailyStats: Object.entries(analytics.dailyStats)
                .slice(-7)
                .map(([date, stats]) => ({
                    date,
                    visitors: stats.visitors,
                    pageViews: stats.pageViews
                }))
        };
    };

    // Reset analytics (for testing)
    window.resetAnalytics = function () {
        localStorage.removeItem(ANALYTICS_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        console.log('Analytics reset!');
    };

    // Don't track admin pages
    if (!window.location.pathname.includes('/admin/')) {
        // Track this page view
        trackPageView();
        console.log('📊 Analytics: Page view tracked');
    }

})();
