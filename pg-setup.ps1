$ErrorActionPreference = "Stop"
$log = "pg-setup.log"
Start-Transcript -Path $log -Force | Out-Null

$pgRoot = Join-Path $env:LOCALAPPDATA "PostgreSQL"
$bin = Join-Path $pgRoot "pgsql\bin"
$data = Join-Path $pgRoot "data"
$port = 5432

New-Item -ItemType Directory -Force -Path $pgRoot | Out-Null

# 1. Download + extract portable PostgreSQL binaries (no admin) if missing
if (-not (Test-Path (Join-Path $bin "initdb.exe"))) {
  $urls = @(
    "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip",
    "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64-binaries.zip",
    "https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip",
    "https://get.enterprisedb.com/postgresql/postgresql-15.8-1-windows-x64-binaries.zip"
  )
  $zip = Join-Path $env:TEMP "pg-binaries.zip"
  $downloaded = $false
  foreach ($u in $urls) {
    try {
      Write-Host "Downloading $u"
      Invoke-WebRequest -Uri $u -OutFile $zip -UseBasicParsing
      $downloaded = $true
      break
    } catch {
      Write-Host "Download failed: $($_.Exception.Message)"
    }
  }
  if (-not $downloaded) { throw "Could not download PostgreSQL binaries" }
  Write-Host "Extracting to $pgRoot"
  Expand-Archive -Path $zip -DestinationPath $pgRoot -Force
}

# 2. initdb with superuser postgres / password postgres
if (-not (Test-Path (Join-Path $data "PG_VERSION"))) {
  Write-Host "Running initdb..."
  $pwFile = Join-Path $env:TEMP "pgpw.txt"
  Set-Content -Path $pwFile -Value "postgres" -NoNewline
  & (Join-Path $bin "initdb.exe") -D $data -U postgres -A scram-sha-256 --pwfile=$pwFile -E UTF8 --locale=C
  Remove-Item -LiteralPath $pwFile -Force -ErrorAction SilentlyContinue
}

# 3. Start postgres on 127.0.0.1:5432 if not already listening
$running = $false
try {
  $c = New-Object System.Net.Sockets.TcpClient
  $c.Connect("127.0.0.1", $port)
  $c.Close()
  $running = $true
} catch { $running = $false }

if (-not $running) {
  Write-Host "Starting postgres..."
  & (Join-Path $bin "pg_ctl.exe") -D $data -l (Join-Path $pgRoot "pg.log") -o "-p $port -h 127.0.0.1" start
  Start-Sleep -Seconds 4
}

# 4. Create app_db if missing
$env:PGPASSWORD = "postgres"
$dbCheck = (& (Join-Path $bin "psql.exe") -h 127.0.0.1 -p $port -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='app_db'") 2>&1
if (($dbCheck | Out-String).Trim() -ne "1") {
  Write-Host "Creating app_db..."
  & (Join-Path $bin "createdb.exe") -h 127.0.0.1 -p $port -U postgres app_db
}

# 5. Health check
$test = (& (Join-Path $bin "psql.exe") -h 127.0.0.1 -p $port -U postgres -d app_db -tAc "SELECT 'DB_READY ' || version();") 2>&1
Write-Host $test

Stop-Transcript
