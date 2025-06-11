#!/usr/bin/env node

import { spawn } from 'child_process'

console.log('🚀 Запуск ProtekAuto CMS...')

// Функция для запуска команды
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Выполняется команда: ${command} ${args.join(' ')}`)
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Команда завершилась с кодом ${code}`))
      }
    })

    process.on('error', (error) => {
      reject(error)
    })
  })
}

async function startup() {
  try {
    console.log('🔄 Проверка переменных окружения...')
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET',
      'S3_ENDPOINT'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.error('❌ Отсутствуют обязательные переменные окружения:')
      missingVars.forEach(varName => console.error(`   - ${varName}`))
      process.exit(1)
    }

    console.log('✅ Все переменные окружения установлены')

    console.log('🔄 Выполнение миграций базы данных...')
    await runCommand('npx', ['prisma', 'migrate', 'deploy'])

    console.log('🔄 Генерация Prisma клиента...')
    await runCommand('npx', ['prisma', 'generate'])

    console.log('🚀 Запуск сервера...')
    await runCommand('npm', ['start'])

  } catch (error) {
    console.error('❌ Ошибка при запуске:', error.message)
    process.exit(1)
  }
}

startup() 