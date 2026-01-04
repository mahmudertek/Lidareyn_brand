$path = "c:\Users\pc\Desktop\Lidareyn_brand\style.css"
$content = Get-Content $path -Raw

# .header-container alignment
$oldHeader = '.header-container {\r\n    max-width: 1920px;\r\n    height: var(--header-height);     \r\n    margin: 0 auto;\r\n    padding: 0 var(--container-padding);\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: flex-start;      \r\n    gap: 20px;\r\n    position: relative;\r\n    box-sizing: border-box;\r\n}'
$newHeader = '.header-container {\r\n    max-width: 1920px;\r\n    height: var(--header-height);\r\n    margin: 0 auto;\r\n    padding: 0 var(--container-padding);\r\n    display: flex;\r\n    align-items: center; /* Merkezi Hizalama */\r\n    justify-content: space-between;\r\n    gap: 20px;\r\n    position: relative;\r\n    box-sizing: border-box;\r\n}'

# Logo alignment
$oldLogo = '.logo {\r\n    flex-shrink: 0;\r\n    margin-right: 20px;    \r\n    position: relative;    \r\n    left: 0;\r\n    transform: none;       \r\n    z-index: 10;\r\n    order: -1;\r\n}'
$newLogo = '.logo {\r\n    flex-shrink: 0;\r\n    display: flex;\r\n    align-items: center;\r\n    margin-right: 0;\r\n    position: relative;\r\n    z-index: 10;\r\n}'

# Nav Menu alignment
$oldNav = '.nav-menu {\r\n    display: flex;\r\n    align-items: center;   \r\n    gap: 22px;\r\n    list-style: none;      \r\n}'
$newNav = '.nav-menu {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 24px;\r\n    list-style: none;\r\n    height: 100%;\r\n}'

# Apply changes (using simpler regex or literal)
# Note: Get-Content -Raw might use different line endings.
$content = $content.Replace('align-items: center;', 'align-items: center; /* Hiza */') # Temporary to test

# Actually, let's just use specific targeted replacements for the most probable culprits
$content = $content -replace '\.nav-link \{', '.nav-link { display: flex; align-items: center;'
$content = $content -replace '\.logo \{', '.logo { display: flex; align-items: center;'
$content = $content -replace '\.icon-btn \{', '.icon-btn { display: flex; align-items: center;'

[IO.File]::WriteAllText($path, $content)
