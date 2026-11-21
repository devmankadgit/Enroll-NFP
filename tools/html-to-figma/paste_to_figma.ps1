param(
  [Parameter(Mandatory = $true)][string]$HtmlPath,
  [int]$WaitMs = 1500
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class NativeFocus {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
}
"@

if (-not (Test-Path -LiteralPath $HtmlPath)) {
  throw "Missing file: $HtmlPath"
}

$html = [System.IO.File]::ReadAllText($HtmlPath)
$fragment = $html
$prefixTemplate = "Version:0.9`r`nStartHTML:{0}`r`nEndHTML:{1}`r`nStartFragment:{2}`r`nEndFragment:{3}`r`n"
$dummy = [string]::Format($prefixTemplate, "00000000", "00000000", "00000000", "00000000")
$startHtml = $dummy.Length
$startFragment = $startHtml
$endFragment = $startFragment + $fragment.Length
$endHtml = $endFragment
$header = [string]::Format(
  $prefixTemplate,
  $startHtml.ToString("D8"),
  $endHtml.ToString("D8"),
  $startFragment.ToString("D8"),
  $endFragment.ToString("D8")
)
$cfHtml = $header + $fragment

$data = New-Object System.Windows.Forms.DataObject
$data.SetData([System.Windows.Forms.DataFormats]::Html, $cfHtml)
$data.SetData([System.Windows.Forms.DataFormats]::UnicodeText, "figma-html-to-figma-paste")
[System.Windows.Forms.Clipboard]::SetDataObject($data, $true)

$proc = Get-Process |
  Where-Object { $_.ProcessName -eq "Figma" -and $_.MainWindowHandle -ne [IntPtr]::Zero } |
  Select-Object -First 1

if (-not $proc) {
  Write-Output "CLIPBOARD_SET_NO_FIGMA_WINDOW"
  exit 2
}

$hwnd = $proc.MainWindowHandle
if ([NativeFocus]::IsIconic($hwnd)) {
  [NativeFocus]::ShowWindow($hwnd, 9) | Out-Null
}
[NativeFocus]::SetForegroundWindow($hwnd) | Out-Null
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds $WaitMs
Write-Output "PASTED Id=$($proc.Id) File=$HtmlPath"
