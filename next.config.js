/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
