module.exports = {
  apps: [{
    name: 'damipapa-blog-local',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 'max', // 모든 CPU 코어 사용
    exec_mode: 'cluster', // 클러스터 모드로 성능 최적화
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DEPLOY_ENV: 'local',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}

