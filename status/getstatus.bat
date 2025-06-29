chcp 65001
@echo off
:start
vpncmd localhost /server /hub:vpn /cmd statusget > "D:\web\web\Student-Catalog\status\session.txt"
vpncmd localhost /server /hub:vpn /cmd sessionlist > "D:\web\web\Student-Catalog\status\sessionlst.txt"
echo 时间^| %date% %time% >> "D:\web\web\Student-Catalog\status\sessionlst.txt"

choice /t 10 /d y /n >nul
goto start