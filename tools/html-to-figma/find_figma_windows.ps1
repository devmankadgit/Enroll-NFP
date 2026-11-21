Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class WinEnum {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
}
"@

$pids = @(Get-Process Figma -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
$found = New-Object System.Collections.Generic.List[string]
[WinEnum]::EnumWindows({
  param($h, $l)
  $pid = 0
  [WinEnum]::GetWindowThreadProcessId($h, [ref]$pid) | Out-Null
  if ($pids -contains [int]$pid -and [WinEnum]::IsWindowVisible($h)) {
    $sb = New-Object System.Text.StringBuilder 512
    [WinEnum]::GetWindowText($h, $sb, $sb.Capacity) | Out-Null
    $t = $sb.ToString()
    if ($t) { $found.Add("$h|$pid|$t") }
  }
  return $true
}, [IntPtr]::Zero) | Out-Null

$found
Get-Process Figma -ErrorAction SilentlyContinue | ForEach-Object {
  "proc Id=$($_.Id) Handle=$([int64]$_.MainWindowHandle) Title='$($_.MainWindowTitle)'"
}
