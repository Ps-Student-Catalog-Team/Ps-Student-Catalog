# 定义文件路径（请根据实际情况修改）
$inputFile = "同名文件列表_排除后.txt"
$outputFile = "最早同名文件_从列表.txt"

# 检查输入文件是否存在
if (-not (Test-Path $inputFile)) {
    Write-Host "文件 $inputFile 不存在，请检查路径。" -ForegroundColor Red
    exit
}

# 读取文件内容
$lines = Get-Content $inputFile

# 初始化变量
$currentFileName = $null
$fileGroups = @{}  # 用于存储每组文件的列表

# 解析文件
foreach ($line in $lines) {
    if ($line -match '^    ') {
        # 缩进行：文件路径和修改时间
        # 提取路径和时间，格式：'    路径 (修改时间: yyyy-MM-dd HH:mm:ss)'
        if ($line -match '^    (.+?) \(修改时间: ([\d\-: ]+)\)$') {
            $path = $matches[1]
            $timeStr = $matches[2]
            # 转换为DateTime对象以便比较
            $time = [datetime]::ParseExact($timeStr, 'yyyy-MM-dd HH:mm:ss', $null)
            # 添加到当前文件组
            if ($currentFileName) {
                if (-not $fileGroups.ContainsKey($currentFileName)) {
                    $fileGroups[$currentFileName] = @()
                }
                $fileGroups[$currentFileName] += [PSCustomObject]@{
                    Path = $path
                    LastWriteTime = $time
                }
            }
        }
    } elseif ($line -match '^\S') {
        # 非缩进行：新的文件名（假设不以空格开头）
        $currentFileName = $line.Trim()
    }
}

# 找出每组的最早文件
$earliestFiles = @()
foreach ($fileName in $fileGroups.Keys) {
    $files = $fileGroups[$fileName]
    # 按修改时间升序排序，取第一个
    $earliest = $files | Sort-Object LastWriteTime | Select-Object -First 1
    $earliestFiles += [PSCustomObject]@{
        FileName = $fileName
        Path = $earliest.Path
        LastWriteTime = $earliest.LastWriteTime
    }
}

# 输出到屏幕并保存到文件
$earliestFiles | Format-Table -AutoSize
$earliestFiles | Select-Object FileName, Path, @{Name='LastWriteTime';Expression={$_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')}} | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8
Write-Host "结果已保存到 $outputFile" -ForegroundColor Green