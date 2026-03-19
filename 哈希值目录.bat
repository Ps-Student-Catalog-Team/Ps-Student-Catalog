@echo off
chcp 65001 >nul               & REM 临时切换到 UTF-8 代码页
setlocal enabledelayedexpansion

set ALGO=MD5
set OUTFILE=hash_list_%ALGO%.txt

set PREVDIR=
> "%OUTFILE%" (
  for /r %%F in (*) do (
    set "CURDIR=%%~dpF"
    if not "!CURDIR!" == "!PREVDIR!" (
      echo.
      echo Directory: !CURDIR!
      set "PREVDIR=!CURDIR!"
    )
    for /f %%H in ('certutil -hashfile "%%F" %ALGO% ^| findstr /r "^[0-9a-f][0-9a-f]*$"') do (
      echo     %%~nxF : %%H
    )
  )
)

echo Done! Results saved to %OUTFILE%
pause