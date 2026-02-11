$body = @{
    name = "Siddhant"
    regno = "24E110A78"
    email = "siddhant@example.com"
    password = "siddhant"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/students' -Method Post -ContentType 'application/json' -Body $body
    Write-Host "Registration Successful:"
    $response | Format-List
} catch {
    Write-Host "Registration Failed:"
    $_.Exception.Response
    # Read response stream if available
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.ReadToEnd()
    }
}
