# ============================================================
# ServiceConnect - Master Startup Script
# ============================================================
# Usage: .\start-all.ps1
# Starts all microservices in the correct order.
# ============================================================

$ROOT = "d:\SeriviceConnect-main\Back-End-Services"

# ---- Environment Variables ----
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"
$env:JWT_SECRET  = "ServiceConnectSecretKeyForJwtAuthentication2026MinLength32Bytes!"
$env:JWT_ISSUER  = "serviceconnect-auth"
$env:EUREKA_SERVER_URL = "http://localhost:8761/eureka/"
$env:BREVO_API_KEY = "PLACEHOLDER"
$env:BREVO_SENDER_EMAIL = "no-reply@serviceconnect.local"
$env:SPRING_PROFILES_ACTIVE = "dev"

# Per-service DB URLs (port 5433 = local cluster)
$DB = @{
    "auth-service"     = "jdbc:postgresql://localhost:5433/auth_db"
    "user-service"     = "jdbc:postgresql://localhost:5433/user_db"
    "provider-service" = "jdbc:postgresql://localhost:5433/provider_db"
    "catalog-service"  = "jdbc:postgresql://localhost:5433/catalog_db"
    "booking-service"  = "jdbc:postgresql://localhost:5433/booking_db"
    "payment-service"  = "jdbc:postgresql://localhost:5433/payment_db"
    "review-service"   = "jdbc:postgresql://localhost:5433/review_db"
    "admin-service"    = "jdbc:postgresql://localhost:5433/admin_db"
}

function Wait-ForPort($port, $name, $maxSeconds = 120) {
    Write-Host "  Waiting for $name on port $port..." -ForegroundColor Yellow
    $deadline = (Get-Date).AddSeconds($maxSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("localhost", $port)
            $tcp.Close()
            Write-Host "  OK $name is UP on port $port" -ForegroundColor Green
            return $true
        } catch { Start-Sleep -Seconds 2 }
    }
    Write-Host "  TIMEOUT waiting for $name on port $port" -ForegroundColor Red
    return $false
}

function Start-Service($name, $port, $jar) {
    $dbUrl = $DB[$name]
    Write-Host ""
    Write-Host "Starting $name (port $port)..." -ForegroundColor Cyan
    $jargs = @(
        "-jar", $jar,
        "--spring.datasource.url=$dbUrl",
        "--spring.datasource.username=$env:DB_USERNAME",
        "--spring.datasource.password=$env:DB_PASSWORD",
        "--app.jwt.secret=$env:JWT_SECRET",
        "--jwt.secret=$env:JWT_SECRET",
        "--brevo.api-key=$env:BREVO_API_KEY",
        "--brevo.sender.email=$env:BREVO_SENDER_EMAIL",
        "--eureka.client.service-url.defaultZone=$env:EUREKA_SERVER_URL",
        "--spring.profiles.active=dev"
    )
    Start-Process java -ArgumentList $jargs -WindowStyle Minimized
    Wait-ForPort $port $name
}

Write-Host "=================================================="
Write-Host " ServiceConnect Startup"
Write-Host "=================================================="

# ---- 1. PostgreSQL ----
Write-Host ""
Write-Host "[1] Checking PostgreSQL on port 5433..."
$pgRunning = (Wait-ForPort 5433 "PostgreSQL" 5)
if (-not $pgRunning) {
    Write-Host "Starting local PostgreSQL cluster..." -ForegroundColor Yellow
    $pgCtl = Get-Command pg_ctl -ErrorAction SilentlyContinue
    if ($pgCtl) {
        & pg_ctl start -D "d:\SeriviceConnect-main\.pgdata" -l "d:\SeriviceConnect-main\.pgdata\logfile.log" -o "-p 5433"
    }
    Wait-ForPort 5433 "PostgreSQL" 30
}

# ---- 2. Eureka ----
Write-Host ""
Write-Host "[2] Starting service-discovery (Eureka)..."
$eurekaJar = "$ROOT\service-discovery\target\service-discovery-0.0.1-SNAPSHOT.jar"
if (Test-Path $eurekaJar) {
    $eurekaRunning = $false
    try {
        $r = Invoke-WebRequest "http://localhost:8761/actuator/health" -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $eurekaRunning = $true }
    } catch {}
    if (-not $eurekaRunning) {
        Start-Process java -ArgumentList "-jar", $eurekaJar -WindowStyle Minimized
    } else {
        Write-Host "  Eureka already running" -ForegroundColor Green
    }
    Wait-ForPort 8761 "Eureka" 90
} else {
    Write-Host "  WARNING: Eureka JAR not found" -ForegroundColor Red
}

# ---- Services ----
$jar = "$ROOT\auth-service\target\auth-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "auth-service" 8081 $jar }

$jar = "$ROOT\user-service\target\user-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "user-service" 8082 $jar }

$jar = "$ROOT\provider-service\target\provider-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "provider-service" 8084 $jar }

$jar = "$ROOT\catalog-service\target\catalog-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "catalog-service" 8086 $jar }

$jar = "$ROOT\booking-service\target\booking-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "booking-service" 8085 $jar }

$jar = "$ROOT\payment-service\target\payment-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "payment-service" 8088 $jar }

$jar = "$ROOT\review-service\target\review-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "review-service" 8087 $jar }

$jar = "$ROOT\admin-service\target\admin-service-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) { Start-Service "admin-service" 8083 $jar }

# ---- API Gateway ----
Write-Host ""
Write-Host "[+] Starting api-gateway..."
$jar = "$ROOT\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"
if (Test-Path $jar) {
    Start-Process java -ArgumentList @(
        "-jar", $jar,
        "--eureka.client.service-url.defaultZone=$env:EUREKA_SERVER_URL",
        "--spring.profiles.active=dev"
    ) -WindowStyle Minimized
    Wait-ForPort 8080 "api-gateway" 90
} else { Write-Host "  WARNING: api-gateway JAR missing" -ForegroundColor Red }

Write-Host ""
Write-Host "=================================================="
Write-Host " All services started!"
Write-Host " Eureka Dashboard: http://localhost:8761"
Write-Host " API Gateway:      http://localhost:8080"
Write-Host " Auth Service:     http://localhost:8081"
Write-Host " Frontend (npm):   http://localhost:5173"
Write-Host "=================================================="
