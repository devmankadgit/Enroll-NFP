param(
  [string[]]$Files,
  [int]$DelayMs = 2800
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic

$dir = Join-Path $PSScriptRoot "out\agent-onboarding"
if (-not $Files -or $Files.Count -eq 0) {
  $Files = @(
    "02-Personal-Business-Info.figma.html",
    "03-W9-Tax-Payment.figma.html",
    "04-AHIP-License-Verification.figma.html",
    "05-Training-Certification.figma.html",
    "06-Background-Check.figma.html",
    "07-Contract-Execution.figma.html",
    "08-Ready-to-Sell.figma.html"
  )
}

foreach ($name in $Files) {
  $path = Join-Path $dir $name
  if (-not (Test-Path -LiteralPath $path)) {
    Write-Output "MISSING $path"
    continue
  }
  $html = Get-Content -Raw -LiteralPath $path
  Set-Clipboard -AsHtml -Value $html
  Start-Sleep -Milliseconds 200
  [Microsoft.VisualBasic.Interaction]::AppActivate("EnrollAxis")
  Start-Sleep -Milliseconds 700
  [System.Windows.Forms.SendKeys]::SendWait("^v")
  Start-Sleep -Milliseconds $DelayMs
  Write-Output "PASTED $name"
}

Write-Output "DONE"
