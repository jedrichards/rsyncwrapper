const { execSync } = require('child_process')
const { existsSync } = require('fs')

const debugTmp = () => console.log(execSync('tree tmp', { encoding: 'utf8' }))

beforeEach(() => {
  execSync('mkdir -p ./tmp')
  execSync('mkdir -p "./tmp with spaces"')
})

afterEach(() => {
  execSync('rm -rf ./tmp')
  execSync('rm -rf "./tmp with spaces"')
})

test('errors when src does not exist', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/does-not-exist.txt',
      dest: 'tmp/does-not-exist.txt',
    },
    err => {
      expect(err).toBeDefined()
      done()
    }
  )
})

test('errors when dest does not exist', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'tmp/does-not-exist/file.txt',
    },
    err => {
      expect(err).toBeDefined()
      done()
    }
  )
})

test('syncs a single file', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'tmp/file.txt',
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/file.txt')).toBe(true)
      done()
    }
  )
})

test('syncs a single file with spaces in filename', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file with spaces.txt',
      dest: 'tmp/',
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/file with spaces.txt')).toBe(true)
      done()
    }
  )
})

test('syncs a single file with spaces in filename and dest folder', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file with spaces.txt',
      dest: 'tmp with spaces/',
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp with spaces/file with spaces.txt')).toBe(true)
      done()
    }
  )
})

test('handles pre-escaped paths', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      // prettier-ignore
      src: 'fixtures/file\ with\ spaces.txt',
      // prettier-ignore
      dest: 'tmp\ with\ spaces/'
    },
    err => {
      expect(err).toBeNull()
      // prettier-ignore
      expect(existsSync('tmp\ with\ spaces/file\ with\ spaces.txt')).toBe(true)
      done()
    }
  )
})

test('syncs multiple files', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/multiple/',
      dest: 'tmp/multiple',
      recursive: true,
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/multiple/file1.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file3.js')).toBe(true)
      done()
    }
  )
})

test('wildcard src', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/multiple/*.txt',
      dest: 'tmp/multiple',
      recursive: true,
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/multiple/file1.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file3.js')).toBe(false)
      done()
    }
  )
})

test('src as array', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: ['fixtures/multiple/file1.txt', 'fixtures/multiple/file3.js'],
      dest: 'tmp/multiple',
      recursive: true,
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/multiple/file1.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file3.js')).toBe(true)
      done()
    }
  )
})

test('exclude pattern', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/multiple/',
      dest: 'tmp/multiple',
      recursive: true,
      exclude: ['file3.js'],
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/multiple/file1.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file3.js')).toBe(false)
      done()
    }
  )
})

test('exclude all then include subdir pattern', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/',
      dest: 'tmp',
      recursive: true,
      include: ['multiple/***'],
      exclude: ['*'],
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/file.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file1.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file3.js')).toBe(true)
      done()
    }
  )
})

test('exclude first', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/',
      dest: 'tmp',
      recursive: true,
      include: ['multiple/***'],
      excludeFirst: ['file2.txt'],
      exclude: ['*'],
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/file.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file1.txt')).toBe(true)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file3.js')).toBe(true)
      done()
    }
  )
})

test('wildcard exclude pattern', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/multiple/',
      dest: 'tmp/multiple',
      recursive: true,
      exclude: ['*.txt'],
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/multiple/file1.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file3.js')).toBe(true)
      done()
    }
  )
})

test('dry run', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/multiple/',
      dest: 'tmp/multiple',
      recursive: true,
      dryRun: true,
    },
    err => {
      expect(err).toBeNull()
      expect(existsSync('tmp/multiple/file1.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file2.txt')).toBe(false)
      expect(existsSync('tmp/multiple/file3.js')).toBe(false)
      done()
    }
  )
})

test('copy file to remote host over ssh', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'user@example.com:/tmp/file.txt',
      ssh: true,
      port: '1234',
      privateKey: '~/.ssh/aws.pem',
      noExec: true,
    },
    (err, stdout, stderr, cmd) => {
      expect(err).toBeNull()
      expect(cmd).toBe(
        'rsync fixtures/file.txt user@example.com:/tmp/file.txt --rsh "ssh -p 1234 -i ~/.ssh/aws.pem"'
      )
      done()
    }
  )
})

test('copy file from remote host over ssh', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'user@example.com:/tmp/file.txt',
      dest: 'tmp',
      ssh: true,
      port: '1234',
      privateKey: '~/.ssh/aws.pem',
      noExec: true,
    },
    (err, stdout, stderr, cmd) => {
      expect(err).toBeNull()
      expect(cmd).toBe(
        'rsync user@example.com:/tmp/file.txt tmp --rsh "ssh -p 1234 -i ~/.ssh/aws.pem"'
      )
      done()
    }
  )
})

test('host option', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'tmp/file.txt',
      host: 'user@example.com',
      ssh: true,
      port: '1234',
      privateKey: '~/.ssh/aws.pem',
      noExec: true,
    },
    (err, stdout, stderr, cmd) => {
      expect(err).toBeNull()
      expect(cmd).toBe(
        'rsync fixtures/file.txt user@example.com:tmp/file.txt --rsh "ssh -p 1234 -i ~/.ssh/aws.pem"'
      )
      done()
    }
  )
})

test('extra ssh command args', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'user@example.com:/tmp/file.txt',
      ssh: true,
      port: '1234',
      privateKey: '~/.ssh/aws.pem',
      noExec: true,
      sshCmdArgs: ['-o StrictHostKeyChecking=no', '-p 22'],
    },
    (err, stdout, stderr, cmd) => {
      expect(err).toBeNull()
      expect(cmd).toBe(
        'rsync fixtures/file.txt user@example.com:/tmp/file.txt --rsh "ssh -p 1234 -i ~/.ssh/aws.pem -o StrictHostKeyChecking=no -p 22"'
      )
      done()
    }
  )
})

test('adds a chmod arg when running on windows', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'tmp/file.txt',
      platform: 'win32',
      noExec: true,
    },
    (err, stdout, stderr, cmd) => {
      expect(err).toBeNull()
      expect(cmd).toBe('rsync fixtures/file.txt tmp/file.txt --chmod=ugo=rwX')
      done()
    }
  )
})

test('does not add the chmod arg when running on windows if already present', done => {
  const rsync = require('../lib/rsyncwrapper')
  rsync(
    {
      src: 'fixtures/file.txt',
      dest: 'tmp/file.txt',
      platform: 'win32',
      noExec: true,
      args: ['--chmod=u=r'],
    },
    (err, stdout, stderr, cmd) => {
      expect(err).toBeNull()
      expect(cmd).toBe('rsync fixtures/file.txt tmp/file.txt --chmod=u=r')
      done()
    }
  )
})
