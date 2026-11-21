param(
  [Parameter(Mandatory = $true)][string]$HtmlPath,
  [switch]$TryPaste
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic

if (-not (Test-Path -LiteralPath $HtmlPath)) {
  throw "Missing file: $HtmlPath"
}

# Raw Figit envelope (no Windows CF_HTML header). Figma reads <!--(figma)...--> markers.
$html = [System.IO.File]::ReadAllText($HtmlPath)

# Windows CF_HTML clipboard payload
$prefixTemplate = "Version:0.9`r`nStartHTML:{0}`r`nEndHTML:{1}`r`nStartFragment:{2}`r`nEndFragment:{3}`r`n"
$dummy = [string]::Format($prefixTemplate, "00000000", "00000000", "00000000", "00000000")
$startHtml = $dummy.Length
$startFragment = $startHtml
$endFragment = $startFragment + $html.Length
$endHtml = $endFragment
$header = [string]::Format(
  $prefixTemplate,
  $startHtml.ToString("D8"),
  $endHtml.ToString("D8"),
  $startFragment.ToString("D8"),
  $endFragment.ToString("D8")
)
$cfHtml = $header + $html

$data = New-Object System.Windows.Forms.DataObject
# HTML only - do not set UnicodeText or Figma pastes plain text instead of scene data
$data.SetData([System.Windows.Forms.DataFormats]::Html, $true, $cfHtml)
[System.Windows.Forms.Clipboard]::Clear()
[System.Windows.Forms.Clipboard]::SetDataObject($data, $true)

$hasHtml = [System.Windows.Forms.Clipboard]::ContainsData([System.Windows.Forms.DataFormats]::Html)
$hasText = [System.Windows.Forms.Clipboard]::ContainsText()
Write-Output "CLIPBOARD_SET hasHtml=$hasHtml hasText=$hasText file=$HtmlPath bytes=$($html.Length)"

if (-not $TryPaste) { exit 0 }

$titles = @("EnrollAxis", "Figma")
foreach ($title in $titles) {
  try {
    [Microsoft.VisualBasic.Interaction]::AppActivate($title)
    Start-Sleep -Milliseconds 800
    [System.Windows.Forms.SendKeys]::SendWait("^v")
    Start-Sleep -Milliseconds 2500
    Write-Output "PASTED title=$title"
    exit 0
  } catch {
    Write-Output "ACTIVATE_FAIL title=$title err=$($_.Exception.Message)"
  }
}
Write-Output "CLIPBOARD_READY_NO_PASTE"
exit 3
