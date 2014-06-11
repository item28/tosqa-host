# JeeBus development mode: re-compiles Go and CS/Jade/Stylus as needed
# -jcw, 2014-02-19

fs = require 'fs'
path = require 'path'
{execFile,spawn} = require 'child_process'

# look for modules relative to the current directory, not relative to this file
moduleDir = (s) -> path.resolve 'node_modules', s

fatal = (s) ->
  console.error '\n[node] fatal error:', s
  process.exit 1

main = undefined
pid = undefined

# interrupts don't quit us, just the child process, see the explanation below
process.on 'SIGINT', ->
  console.log ' (interrupt)'

# launch the main app by compiling all its .go files via "go get"
runMain = ->
  args = ['run']
  for f in fs.readdirSync '.'
    if /\.go$/i.test(f) and not /_test\./i.test(f)
      args.push f
      fs.watch f, recompileGoFiles
  args = args.concat process.argv.slice(2)
  console.log '[node] go', args.join ' '
  main = spawn 'go', args, stdio: ['ipc', process.stdout, process.stderr]
  
  # There's some nastiness involved in managing the "main" child process:
  #
  # Node.js launches "go run ...", which compiles and runs a *sub* process, so
  # all in all there are three processes running in dev mode: node.js, the "go"
  # wrapper, and the compiled target (server) app. For live reload, when the
  # app itself needs to be restarted, we need to figure out the app's PID, not
  # just the pid of the "main" child process. This is handled by having the
  # server report its pid over the message channel set up by node.js's "ipc".
  # Once the app's pid is known, recompileGoFiles() can use that when it wants
  # to force a restart. This involves sending SIGHUP to the server app, which
  # then (cleans up and) exits, causing "go" to report "exit status 2" and then
  # in turn exits. At this point, the ipc channel gets disconnected and node.js
  # itself will exit. There's a dummy "process.on 'SIGINT', -> ..." above, so
  # that this node.js script doesn't exit before all the child cleanup is done.

  main.on 'error', (err) ->
    fatal 'cannot launch "go"'
  main.on 'message', (msg) ->
    console.log '[node] pid message:', msg, '\n'
    pid = msg | 0 # this is only > 0 when a plain number is received
  main.on 'close', (code) ->
    fatal 'unexpected termination of "main", code: ' + code  if code > 0
  main.on 'exit', ->
    fatal 'main exited'
  main.on 'disconnect', ->
    console.log '[node] child disconnected'
    process.exit 0
  main.send null

# re-compile when a .go files changes, if the running process is known
recompileGoFiles = ->
  if pid > 0
    main.removeAllListeners() # prevent triggering on the 'exit' event
    process.kill pid, 'SIGHUP'
    pid = 0
    runMain()

compileCoffeeScriptWithMap = (sourceCode, filename) ->
  coffee = require moduleDir 'coffee-script'
  compiled = coffee.compile sourceCode,
    filename: filename
    sourceMap: true
    inline: true
    literate: path.extname(filename) isnt '.coffee'
  convert = require moduleDir 'convert-source-map'
  comment = convert
    .fromJSON(compiled.v3SourceMap)
    .setProperty('sources', [filename]) 
    .toComment()
  "#{compiled.js}\n#{comment}\n"
  
compileIfNeeded = (srcFile) ->
  if /\.(coffee|coffee\.md|litcoffee|jade|styl)$/i.test srcFile
    srcExt = path.extname srcFile
    destExt = switch srcExt
      when '.jade' then '.html'
      when '.styl' then '.css'
      else              '.js'
    destFile = srcFile.slice(0, - srcExt.length) + destExt

    t = Date.now()
    saveResult = (data) ->
      n = data.length
      ms = Date.now() - t
      console.log "[node] compile #{srcFile} -> #{destExt} #{n}b #{ms} ms"
      fs.writeFileSync destFile, data

    try
      srcStat = fs.statSync srcFile
      destStat = fs.statSync destFile  if fs.existsSync destFile
      unless destStat?.mtime >= srcStat.mtime
        src = fs.readFileSync srcFile, encoding: 'utf8'
        switch srcExt
          when '.jade'
            jade = require moduleDir 'jade'
            saveResult do jade.compile src, filename: srcFile, pretty: true
          when '.styl'
            stylus = require moduleDir 'stylus'
            stylus.render src, { filename: srcFile }, (err, css) ->
              if err
                console.log '[node] stylus error', srcFile, err
              else
                saveResult css
          else
            saveResult compileCoffeeScriptWithMap src, path.basename srcFile
    catch err
      console.log '[node] cannot compile', srcFile, err
  else if pid > 0
    if /\.(html|js)$/i.test srcFile
      main.send true # request a full page reload
    else if /\.(css)$/i.test srcFile
      main.send false # request a stylesheet reload
    else if /\.(go)$/i.test srcFile
      console.log '[node] changed', srcFile
      recompileGoFiles()

traverseDirs = (dir, cb) -> # recursive directory traversal
  stats = fs.statSync dir
  if stats.isDirectory()
    cb dir
    for f in fs.readdirSync dir
      traverseDirs path.join(dir, f), cb

watchDir = (root, cb) -> # recursive directory watcher
  traverseDirs root, (dir) ->
    fs.watch dir, (event, filename) ->
      file = path.join dir, filename
      cb event, file

createWatcher = (root) ->
  if fs.existsSync root
    console.log ' ', root
    traverseDirs root, (dir) ->
      for f in fs.readdirSync dir
        compileIfNeeded path.join dir, f
      fs.watch dir, (event, filename) ->
        file = path.join dir, filename
        if fs.existsSync file
          compileIfNeeded file
        else
          # TODO: delete compiled file

parseConfig = (fn) ->
  map = {}
  if fs.existsSync fn
    for line in fs.readFileSync(fn, 'utf8').split '\n'
      i = line.indexOf('=')
      if i > 0 and line.trim()[0] isnt '#'
        k = line.slice(0, i).trim()
        v = line.slice(i+1).trim()
        map[k] = v
  map

# Start of devmode application code --------------------------------------------

console.log '[node] watching for file changes in:'

config = parseConfig './config.txt'
createWatcher process.env.APP_DIR or config.APP_DIR or './app'
createWatcher process.env.BASE_DIR or config.BASE_DIR or './base'
createWatcher process.env.GADGETS_DIR or config.GADGETS_DIR or './gadgets'

# if the convert-source-map package is present, then others probably also are
# don't load the others in yet, jade in particular takes too much time
# packages will be loaded on first detected file change which needs them
try ok = require moduleDir 'convert-source-map'
if ok
  runMain()
else
  packages = ['coffee-script', 'convert-source-map', 'jade', 'stylus']
  console.log '[node] installing npm packages:', packages.join ', '
  npmExe = if process.platform == 'win32' then 'npm.cmd' else 'npm'
  execFile npmExe, ['install', packages...], {env:process.env}, (err, o, e) ->
    fatal err  if err?
    runMain()
