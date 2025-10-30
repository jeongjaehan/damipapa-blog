// 컨플릭트 표식 제거 및 production 환경에 맞춰 설정 통합
module.exports = {
  apps: [{
    name: 'damipapa-blog',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork', // cluster 대신 fork 사용 (메모리 절약 목적)
    autorestart: true,
    watch: false,
    max_memory_restart: '800M', // 800MB 이상시 재시작
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DEPLOY_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=768' // Node.js 힙 메모리 제한(768MB)
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    log_type: 'json',
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
