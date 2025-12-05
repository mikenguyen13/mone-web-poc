$path = $PSScriptRoot
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on http://localhost:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContextAsync().Result
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        
        $filePath = Join-Path $path $localPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Simple MIME types
            if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
            elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { $response.ContentType = "image/jpeg" }
            elseif ($filePath.EndsWith(".gif")) { $response.ContentType = "image/gif" }
            elseif ($filePath.EndsWith(".svg")) { $response.ContentType = "image/svg+xml" }
            elseif ($filePath.EndsWith(".ico")) { $response.ContentType = "image/x-icon" }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        }
        else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
}
catch {
    Write-Host "Server stopped."
}
finally {
    $listener.Stop()
}
