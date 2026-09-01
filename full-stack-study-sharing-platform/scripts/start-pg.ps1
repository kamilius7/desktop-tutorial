$pgRoot = Join-Path $env:LOCALAPPDATA "PostgreSQL"
$bin = Join-Path $pgRoot "pgsql\bin\postgres.exe"
$data = Join-Path $pgRoot "data"
& $bin -D $data -p 5432 -h 127.0.0.1

