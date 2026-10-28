(function(window, document) {
    'use strict';

    function supportsCssBaseline() {
        if (!window.getComputedStyle || !document.documentElement) {
            return false;
        }

        return window.getComputedStyle(document.documentElement)
            .getPropertyValue('--legacy-browser-css-baseline')
            .replace(/\s/g, '') === '1';
    }

    function supportsJavaScriptBaseline() {
        return typeof window.Promise === 'function' &&
            typeof window.Symbol === 'function' &&
            typeof Object.assign === 'function' &&
            typeof Array.prototype.includes === 'function' &&
            typeof Array.from === 'function' &&
            typeof document.documentElement.closest === 'function';
    }

    function supportsNetworkBaseline() {
        return typeof window.fetch === 'function' &&
            typeof window.URL === 'function' &&
            typeof window.AbortController === 'function';
    }

    function supportsObserverBaseline() {
        return typeof window.IntersectionObserver === 'function' &&
            typeof window.ResizeObserver === 'function';
    }

    window.isLegacyBrowser = function() {
        return !(
            supportsJavaScriptBaseline() &&
            supportsNetworkBaseline() &&
            supportsObserverBaseline() &&
            supportsCssBaseline()
        );
    };
})(window, document);
