export default function(mode) {
  return {
    service: {
      lan: {
        baseDir: '/home/liangyh/www',
        codeDir: '/yung/yung-vite-app',
        backupDir: '/home/liangyh/backup/yung',
        ssh: {
          host: '192.168.1.108',
          port: 22,
          username: 'liangyh',
          password: 'lyh'
        }
      },
      dev: {

      }
    }
  }
}