const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                dns: false,
                child_process: false,
                perf_hooks: false,
                async_hooks: false,
                canvas: false,
            };
        }
        return config;
    },
};

export default nextConfig;
