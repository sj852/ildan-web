# Opens the ildan page at the given times every day. Run again to change the times.
# Example: .\schedule.ps1 -Times 14:00,18:00,21:00
# Remove:  .\schedule.ps1 -Remove
param(
    [string[]]$Times = @('14:00', '18:00', '21:00'),
    [switch]$Remove,
    [string]$Url = 'https://sj852.github.io/ildan-web/'
)

Get-ScheduledTask -TaskName 'ildan-*' -ErrorAction SilentlyContinue |
    Unregister-ScheduledTask -Confirm:$false

if ($Remove) {
    Write-Output 'Removed all ildan schedules.'
    return
}

$action = New-ScheduledTaskAction -Execute 'explorer.exe' -Argument $Url
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
foreach ($time in $Times) {
    $trigger = New-ScheduledTaskTrigger -Daily -At $time
    $name = 'ildan-' + ($time -replace ':', '')
    Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
    Write-Output "Scheduled $time"
}
