@echo off
echo Starting MongoDB...
echo.

REM Try common MongoDB installation paths
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    echo Found MongoDB at C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\Program Files\MongoDB\Server\7.0\data"
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    echo Found MongoDB at C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\Program Files\MongoDB\Server\6.0\data"
) else if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    echo Found MongoDB at C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe
    "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath "C:\Program Files\MongoDB\Server\5.0\data"
) else (
    echo MongoDB not found in common installation paths.
    echo Please check your MongoDB installation directory.
    echo Common locations:
    echo - C:\Program Files\MongoDB\Server\[version]\bin\mongod.exe
    echo - C:\MongoDB\bin\mongod.exe
    pause
)

pause
