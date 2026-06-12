
try {
    $nicStats = Get-WmiObject -Class Win32_PerfFormattedData_Tcpip_NetworkInterface -ErrorAction SilentlyContinue
    if ($nicStats) {
        $totalReceived = ($nicStats | Measure-Object -Property BytesReceivedPerSec -Sum).Sum
        $totalSent = ($nicStats | Measure-Object -Property BytesSentPerSec -Sum).Sum
    } else {
        $nicStats = Get-CimInstance -ClassName Win32_PerfFormattedData_Tcpip_NetworkInterface -ErrorAction SilentlyContinue
        if ($nicStats) {
            $totalReceived = ($nicStats | Measure-Object -Property BytesReceivedPerSec -Sum).Sum
            $totalSent = ($nicStats | Measure-Object -Property BytesSentPerSec -Sum).Sum
        }
    }
    
    if ($totalReceived -eq $null) { $totalReceived = 0 }
    if ($totalSent -eq $null) { $totalSent = 0 }
    
    Write-Output ("{0},{1}" -f [math]::Round($totalReceived), [math]::Round($totalSent))
} catch {
    Write-Output "0,0"
}
