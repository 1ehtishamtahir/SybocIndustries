import { spawn, execFileSync } from 'node:child_process'
import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, '.dev-mysql')
const dataPath = path.join(dataDir, 'data')
const pidFile = path.join(dataDir, 'mysqld.pid')
const logFile = path.join(dataDir, 'mysqld.log')
const PORT = Number(process.env.MYSQL_DEV_PORT || 3307)
const command = process.argv[2] || 'start'

function findMysqld() {
  if (process.env.MYSQLD_PATH) return process.env.MYSQLD_PATH
  const candidates = [
    'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqld.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqld.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 9.0\\bin\\mysqld.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 9.1\\bin\\mysqld.exe',
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  try {
    const out = execFileSync('where.exe', ['mysqld'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const first = out.split(/\r?\n/).map((s) => s.trim()).find(Boolean)
    if (first) return first
  } catch {
    /* not on PATH */
  }
  return null
}

function isUp() {
  return new Promise((resolve) => {
    let settled = false
    const socket = net.connect({ port: PORT, host: '127.0.0.1' })
    const finish = (up) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(up)
    }
    socket.setTimeout(700)
    socket.on('connect', () => finish(true))
    socket.on('timeout', () => finish(false))
    socket.on('error', () => finish(false))
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function initialize(mysqld) {
  if (fs.existsSync(path.join(dataPath, 'mysql', 'ibdata1'))) return
  fs.mkdirSync(dataPath, { recursive: true })
  const basedir = path.dirname(path.dirname(mysqld))
  console.log(`Initializing MySQL data directory at ${dataPath} ...`)
  execFileSync(mysqld, ['--initialize-insecure', `--basedir=${basedir}`, `--datadir=${dataPath}`], {
    stdio: 'inherit',
  })
}

async function start() {
  if (await isUp()) {
    console.log(`MySQL dev instance already running on 127.0.0.1:${PORT}`)
    return
  }
  const mysqld = findMysqld()
  if (!mysqld) {
    console.error('mysqld not found. Install MySQL Server or set MYSQLD_PATH.')
    process.exit(1)
  }
  initialize(mysqld)
  fs.mkdirSync(dataDir, { recursive: true })
  const child = spawn(
    mysqld,
    [
      `--basedir=${path.dirname(path.dirname(mysqld))}`,
      `--datadir=${dataPath}`,
      `--port=${PORT}`,
      '--bind-address=127.0.0.1',
      `--pid-file=${pidFile}`,
      `--log-error=${logFile}`,
    ],
    { detached: true, stdio: 'ignore', windowsHide: true },
  )
  if (child.pid) fs.writeFileSync(path.join(dataDir, 'spawn.pid'), String(child.pid))
  child.unref()

  for (let i = 0; i < 60; i++) {
    if (await isUp()) {
      console.log(`MySQL dev instance running on 127.0.0.1:${PORT} (data: ${dataPath})`)
      return
    }
    await sleep(500)
  }
  console.error(`MySQL did not come up on port ${PORT}. Check ${logFile}`)
  process.exit(1)
}

function stop() {
  const pids = new Set()
  const spawnPid = path.join(dataDir, 'spawn.pid')
  for (const f of [pidFile, spawnPid]) {
    if (fs.existsSync(f)) {
      const pid = Number(fs.readFileSync(f, 'utf8').trim())
      if (Number.isInteger(pid) && pid > 0) pids.add(pid)
    }
  }
  try {
    const out = execFileSync('netstat.exe', ['-ano'], { encoding: 'utf8' })
    for (const line of out.split(/\r?\n/)) {
      if (line.includes(`:${PORT}`) && line.includes('LISTENING')) {
        const pid = Number(line.trim().split(/\s+/).pop())
        if (Number.isInteger(pid) && pid > 0) pids.add(pid)
      }
    }
  } catch {
    /* netstat unavailable */
  }
  if (!pids.size) {
    console.log('No running dev MySQL instance found.')
    return
  }
  for (const pid of pids) {
    try {
      execFileSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
      console.log(`Stopped mysqld (PID ${pid})`)
    } catch {
      console.log(`PID ${pid} already gone`)
    }
  }
}

async function status() {
  const up = await isUp()
  console.log(`MySQL dev instance: ${up ? `running on 127.0.0.1:${PORT}` : 'stopped'}`)
  console.log(`Data directory: ${dataPath}`)
}

const runners = { start, stop, status }
const run = runners[command]
if (!run) {
  console.error(`Unknown command "${command}". Use: start | stop | status`)
  process.exit(1)
}
Promise.resolve(run()).catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
