module.exports = {
  apps: [{
    name: 'damipapa-blog',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/ec2-user/damipapa-blog',
    instances: 1,
    exec_mode: 'fork', // cluster 대신 fork 사용 (메모리 절약)
    autorestart: true,
    watch: false,
    max_memory_restart: '800M', // 800MB 초과 시 재시작
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      NODE_OPTIONS: '--max-old-space-size=768' // Node.js 힙 메모리 제한 768MB
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    // 로그 로테이션 (선택사항)
    log_type: 'json',
    max_restarts: 10,
    min_uptime: '10s'
  }]
}

